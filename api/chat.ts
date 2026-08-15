import { VercelRequest, VercelResponse } from '@vercel/node'
import * as https from 'node:https'
import * as fs from 'node:fs'
import { GEMINI_MODEL } from './config'
import { createClient } from '@supabase/supabase-js'
import { MASTER_BEHAVIOR_CONTRACT } from '../src/lib/promptLibrary'
import { METHODOLOGY_INSERTS, getMethodologyKey } from '../src/lib/methodologyInserts'
import { parseApproachSummary } from './util'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || (req as any).env?.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || (req as any).env?.SUPABASE_SERVICE_ROLE_KEY || (req as any).env?.VITE_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl!, supabaseKey!)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { case_id, conversation_history, latest_user_message, is_initialization, persona_bio, interviewer_name } = req.body
  
  // Read the API key securely. In local dev, Vite SSR isolates process.env, so we read from req.env injected by our middleware.
  // In Vercel production, process.env.GEMINI_API_KEY will be natively available.
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

  if (!case_id) {
    return res.status(400).json({ error: 'Missing case_id' })
  }
  
  if (!is_initialization && (!conversation_history || !latest_user_message)) {
    return res.status(400).json({ error: 'Missing required fields for chat' })
  }

  try {
    const { data: caseData, error: dbError } = await supabase
      .from('cases')
      .select('track, subtype, opening_question, premise_summary, hidden_data, intended_approach_summary, difficulty')
      .eq('id', case_id)
      .single()

    if (dbError || !caseData) {
      console.error('Database error:', dbError)
      return res.json({ reply: "Sorry, I'm having trouble pulling up the case file. Could you say that again?" })
    }

    const methodologyKey = getMethodologyKey(caseData.track, caseData.subtype)
    
    const interviewContext = parseApproachSummary(caseData.intended_approach_summary);

    const methodologyInsert = METHODOLOGY_INSERTS[methodologyKey] || METHODOLOGY_INSERTS['profitability']

    const systemInstruction = `${MASTER_BEHAVIOR_CONTRACT}

## FORMATTING INSTRUCTIONS
Never use Markdown formatting (no asterisks, bullet points, or headers) — your output is spoken aloud and shown as plain text, so write in plain natural sentences only.

## CASE METHODOLOGY INSTRUCTIONS
${methodologyInsert}
${persona_bio ? `
## YOUR PERSONA BACKGROUND
${persona_bio}
(When opening the case, you may briefly and naturally mention your professional background if it fits, but do NOT explicitly justify why you're a good fit for this case or state enthusiasm caused by your background (avoid patterns like "X, so I'm excited/this is right up my alley"). A senior interviewer doesn't explain their own qualifications — mention your background only in passing, if at all, the way someone would drop it casually into conversation, not as a setup for the case. It's also completely fine to skip mentioning your background in the opening entirely sometimes — don't force it into every single case.)
` : ''}
${interviewer_name ? `
## YOUR NAME
Your name is ${interviewer_name}. If you introduce yourself by name, you MUST use this exact name. Do not invent a different name.
` : ''}

## CURRENT CASE DATA
[The following is the specific case you are conducting. Do NOT reveal hidden_data unless the candidate asks for it specifically.]

**Opening Question:**
${caseData.opening_question}

**Premise Summary:**
${caseData.premise_summary}

**Hidden Data:**
${JSON.stringify(caseData.hidden_data, null, 2)}

**Intended Approach Summary:**
${interviewContext}

**Difficulty:** ${caseData.difficulty} (Adjust your tone calibration accordingly as per the Master Contract)`

    const contents = []
    
    if (is_initialization) {
      contents.push({
        role: 'user',
        parts: [{ text: "Let's start the case interview now. Please introduce yourself and ask the opening question." }]
      })
    } else {
      const formattedHistory = conversation_history.map((turn: any) => ({
        role: turn.role === 'model' || turn.role === 'interviewer' ? 'model' : 'user',
        parts: [{ text: turn.text }]
      }))
      contents.push(...formattedHistory)
      contents.push({
        role: 'user',
        parts: [{ text: latest_user_message }]
      })
    }

    console.log('--- DIAGNOSTIC LOG ---');
    console.log('process.env.GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 'undefined');
    console.log('req.env.GEMINI_API_KEY length:', (req as any).env?.GEMINI_API_KEY ? (req as any).env.GEMINI_API_KEY.length : 'undefined');
    console.log('Final apiKey length passed to GoogleGenAI:', apiKey ? apiKey.length : 'undefined');
    console.log('Initializing new GoogleGenAI({ apiKey: apiKey }) ...');
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing from environment variables!')
    }
    
    let url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const postData = JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.5 }
    });

    const data = await new Promise<any>((resolve, reject) => {
      const reqConfig = new URL(url);
      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      };
      console.log('--- DEBUG HTTPS REQUEST ---');
      console.log('URL:', reqConfig.toString());
      console.log('Headers:', JSON.stringify(headers));

      const request = https.request({
        hostname: reqConfig.hostname,
        path: reqConfig.pathname + reqConfig.search,
        method: 'POST',
        headers
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

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I missed that."

    return res.json({ reply: text })
    } catch (e: any) {
      console.error('Error generating chat response:', e)
      
      const status = e.status || (e.response && e.response.status) || 500
      const errorMessage = e.message || String(e)

      if (status === 401 || status === 403 || errorMessage.includes('UNAUTHENTICATED')) {
         console.error('CRITICAL: Gemini API Auth Error:', errorMessage)
         return res.status(500).json({ error: 'API_ERROR_AUTH', details: errorMessage })
      }
      
      if (status === 429 || errorMessage.includes('RESOURCE_EXHAUSTED')) {
         console.error('CRITICAL: Gemini API Billing/Quota Error:', errorMessage)
         return res.status(500).json({ error: 'API_ERROR_QUOTA', details: errorMessage })
      }
      
      // Fallback error messages for generic transient failures
      const fallbackMsgs = [
        "Sorry, lost my train of thought \u2014 where were we?",
        "One sec, let me pick that back up \u2014 go ahead."
      ]
      const msg = fallbackMsgs[Math.floor(Math.random() * fallbackMsgs.length)]
      return res.json({ reply: msg })
    }
}
