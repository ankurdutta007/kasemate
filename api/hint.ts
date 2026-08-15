import { VercelRequest, VercelResponse } from '@vercel/node'
import * as https from 'node:https'
import * as fs from 'node:fs'
import { GEMINI_MODEL } from './config'
import { createClient } from '@supabase/supabase-js'
import { parseApproachSummary } from './util'

const HINT_PROMPT_TEMPLATE = `The candidate has requested a hint for the case below. Look at
what they've actually done so far in the transcript, and write ONE hint
appropriate to where they specifically are stuck — not a generic tip for this case type in the abstract.

CASE CONTEXT:
Opening question: {opening_question}
Premise: {premise_summary}
Intended approach: {intended_approach_summary}
Hidden data available (if any): {hidden_data}

TRANSCRIPT SO FAR:
{full_transcript}

HINT GUIDANCE (max 3 points):
- Give the single most useful nudge for where they currently are in the conversation.
- If they just need a gentle pointer, give 1 point.
- If they are completely stuck on structure, give up to 3 points to outline the missing pieces explicitly.
- Never hand over the full answer outright.
- Acknowledge what they have already done correctly (don't repeat it as if new).

OUTPUT FORMAT (CRITICAL — you MUST return valid JSON, nothing else):
Return a JSON object with a single key "points" containing an array.
Each element has two keys:
- "lead": a short key phrase (3-6 words) that captures the core idea
- "detail": one brief supporting sentence or clause expanding on it

Example (do NOT copy this content, only follow the shape):
{"points":[{"lead":"Break down order value first","detail":"split total order value into volume, AOV, and conversion rate before going further."}]}

RULES:
- Return ONLY the JSON object. No preamble, no markdown fences, no labels.
- Never exceed the point cap for the tier (1 / 2 / 3 points max).
- Do NOT use Markdown in the lead or detail: no bold, no asterisks, no headers.
- Write in the interviewer's warm, in-character voice.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || (req as any).env?.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || (req as any).env?.SUPABASE_SERVICE_ROLE_KEY || (req as any).env?.VITE_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl!, supabaseKey!)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { case_id, conversation_history } = req.body
  
  let apiKey = ''
  try {
    const envFile = fs.readFileSync('/Users/ankurdutta/Downloads/code/.env', 'utf-8')
    const match = envFile.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/)
    if (match) apiKey = match[1]
  } catch(e) {
    console.error('Failed to read .env:', e)
  }
  
  if (!apiKey) {
    apiKey = process.env.GEMINI_API_KEY || (req as any).env?.GEMINI_API_KEY || process.env['GEMINI_API_KEY'] || ''
  }
  if (apiKey) {
    apiKey = apiKey.replace(/^["']|["']$/g, '').trim()
  }

  if (!case_id || !conversation_history) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const { data: caseData, error: dbError } = await supabase
      .from('cases')
      .select('opening_question, premise_summary, hidden_data, intended_approach_summary')
      .eq('id', case_id)
      .single()

    if (dbError || !caseData) {
      console.error('Database error fetching case for hint:', dbError)
      return res.json({ 
        points: [{ lead: "Having trouble right now", detail: "try again in a moment." }]
      })
    }

    const formatTranscript = (history: any[]) => {
      return history.map(turn => 
        `${turn.role === 'user' ? 'Candidate' : 'Interviewer'}: ${turn.text}`
      ).join('\n\n')
    }

    const transcriptText = formatTranscript(conversation_history)
    
    let prompt = HINT_PROMPT_TEMPLATE
      .replace('{opening_question}', caseData.opening_question || 'N/A')
      .replace('{premise_summary}', caseData.premise_summary || 'N/A')
      .replace('{hidden_data}', JSON.stringify(caseData.hidden_data, null, 2))
      .replace('{intended_approach_summary}', parseApproachSummary(caseData.intended_approach_summary) || 'N/A')
      .replace('{full_transcript}', transcriptText)

    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing from environment variables!')
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`
    const postData = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    });

    const data = await new Promise<any>((resolve, reject) => {
      const reqConfig = new URL(url);
      const request = https.request({
        hostname: reqConfig.hostname,
        path: reqConfig.pathname + reqConfig.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(JSON.stringify(parsed.error || parsed)));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      request.on('error', reject);
      request.write(postData);
      request.end();
    });

    let rawText = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()
    
    // Strip markdown code fences if the model wraps the JSON
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

    try {
      const parsed = JSON.parse(rawText)
      // Validate and sanitize the structured response
      const points = (parsed.points || [])
        .slice(0, 3) // Hard cap at 3 points
        .map((p: any) => ({
          lead: String(p.lead || '').replace(/[*_#]/g, '').trim(),
          detail: String(p.detail || '').replace(/[*_#]/g, '').trim()
        }))
        .filter((p: any) => p.lead.length > 0)

      return res.json({ points })
    } catch {
      // Fallback: model returned non-JSON text — split into bullet lines
      const cleanText = rawText.replace(/[*_#]/g, '')
      const lines = cleanText.split('\n')
        .map((l: string) => l.replace(/^[-•]\s*/, '').trim())
        .filter((l: string) => l.length > 0)
        .slice(0, 3)
      
      const points = lines.map((line: string) => {
        // Try to split at first dash, colon, or em-dash as a lead/detail separator
        const sepMatch = line.match(/^(.{10,60}?)\s*[—:\-–]\s+(.+)$/)
        if (sepMatch) {
          return { lead: sepMatch[1], detail: sepMatch[2] }
        }
        // If no natural separator, use the first ~6 words as lead
        const words = line.split(' ')
        const lead = words.slice(0, 6).join(' ')
        const detail = words.slice(6).join(' ')
        return { lead, detail }
      })

      return res.json({ points })
    }
  } catch (e: any) {
    console.error('Error generating hint response:', e)
    return res.json({ 
      points: [{ lead: "Having trouble right now", detail: "try again in a moment." }]
    })
  }
}
