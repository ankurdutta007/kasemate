import { VercelRequest, VercelResponse } from '@vercel/node'
import * as https from 'node:https'
import * as fs from 'node:fs'
import { GEMINI_MODEL } from './config'
import { createClient } from '@supabase/supabase-js'
import { METHODOLOGY_INSERTS, getMethodologyKey } from '../src/lib/methodologyInserts'
import { parseApproachSummary } from './util'

const MASTER_GRADING_PROMPT = `You are a strict but fair senior interviewer grading a candidate's case interview performance.
You must evaluate the transcript based on four dimensions: Structuring, Quant Reasoning, Business Judgment, and Communication.
You will be provided with the case methodology, case data (premise, intended approach), and the candidate's transcript.

### GRADING INSTRUCTIONS
1. Score each of the 4 dimensions on a scale of 0 to 100.
2. **MINIMUM ENGAGEMENT PENALTY:** If the transcript is extremely short (e.g., 0-1 candidate turns) or the candidate provided no substantive response, you MUST score all dimensions extremely low (e.g., 0-15). Do NOT give a default "neutral" score of 50 for empty or aborted sessions.
3. For each dimension, write a brief, constructive note (1-3 sentences) justifying the score.
4. **CRITICAL:** Your note MUST cite a specific moment, quote, or action from the transcript. Do not write generic feedback. Refer to specific turns or phrases (e.g., "At T3, when you said...").
5. Identify the 'weakest_dimension' (the string name of the lowest-scoring dimension).
6. Calculate the 'overall' score as the average of the 4 dimensions.

### HINT PENALTY
{hint_instruction}

### OUTPUT FORMAT
You MUST return ONLY valid JSON matching this schema exactly:
{
  "structuring": { "score": number, "note": "string" },
  "quant_reasoning": { "score": number, "note": "string" },
  "business_judgment": { "score": number, "note": "string" },
  "communication": { "score": number, "note": "string" },
  "overall": number,
  "weakest_dimension": "string" // one of: "Structuring", "Quant reasoning", "Business judgment", "Communication"
}
Do not use Markdown formatting in the output, just raw JSON.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || (req as any).env?.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || (req as any).env?.SUPABASE_SERVICE_ROLE_KEY || (req as any).env?.VITE_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl!, supabaseKey!)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { session_id } = req.body
  
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

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' })
  }
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' })
  }

  try {
    // 1. Fetch session
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('conversation_history, case_id, subtype, hints_used')
      .eq('id', session_id)
      .single()

    if (sessionError || !sessionData) {
      console.error('Database error fetching session:', sessionError)
      return res.status(500).json({ error: 'Session not found' })
    }

    // 2. Fetch case data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('track, subtype, opening_question, premise_summary, intended_approach_summary')
      .eq('id', sessionData.case_id)
      .single()

    if (caseError || !caseData) {
      console.error('Database error fetching case data:', caseError)
      return res.status(500).json({ error: 'Case not found' })
    }

    const transcriptText = (sessionData.conversation_history || []).map((turn: any, i: number) => {
      const turnLabel = turn.role === 'user' ? `Candidate (T${turn.turnNum})` : 'Interviewer'
      return `${turnLabel}: ${turn.text}`
    }).join('\n\n')

    const hintsUsed = sessionData.hints_used || 0
    let hintInstruction = "The candidate used NO hints. Grade them normally."
    if (hintsUsed > 0) {
      hintInstruction = `The candidate used ${hintsUsed} hints during this session. Factor this into your Structuring and Business/Product Judgment scores — a candidate who reached strong structure or insights with heavy hint usage should generally score somewhat lower on those dimensions than a candidate who reached the same quality unaided. Do not penalize Quant Reasoning or Communication for hint usage unless the hints directly related to those dimensions specifically.`
    }

    const prompt = MASTER_GRADING_PROMPT.replace('{hint_instruction}', hintInstruction)
    const methodologyKey = getMethodologyKey(caseData.track, sessionData.subtype || caseData.subtype)
    const methodologyInsert = METHODOLOGY_INSERTS[methodologyKey] || METHODOLOGY_INSERTS['profitability']
    
    let contentText = `CASE METHODOLOGY INSTRUCTIONS:\n${methodologyInsert}\n\n`
    contentText += `CASE DATA:\n`
    contentText += `Opening Question: ${caseData.opening_question}\n`
    contentText += `Premise Summary: ${caseData.premise_summary}\n`
    contentText += `Intended Approach Summary: ${parseApproachSummary(caseData.intended_approach_summary)}\n\n`
    contentText += `TRANSCRIPT:\n${transcriptText}`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`
    const postData = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: contentText }] }],
      systemInstruction: { parts: [{ text: prompt }] },
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      }
    });

    const responseText = await new Promise<string>((resolve, reject) => {
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
              resolve(parsed.candidates?.[0]?.content?.parts?.[0]?.text || '');
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

    let rawText = responseText.trim()
    rawText = rawText.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '')
    
    let parsed: any = null
    try {
      parsed = JSON.parse(rawText)
    } catch (e) {
      console.error('Failed to parse grading JSON:', rawText)
      return res.status(500).json({ error: 'Failed to generate valid grading' })
    }

    return res.json({ grading_result: parsed })
  } catch (e: any) {
    console.error('Error generating grading:', e)
    return res.status(500).json({ error: 'Grading failed' })
  }
}
