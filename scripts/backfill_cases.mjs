import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=\"(.*?)\"/)[1];
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=\"(.*?)\"/)[1];
const GEMINI_API_KEY = envFile.match(/GEMINI_API_KEY=\"(.*?)\"/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const GEMINI_MODEL = 'gemini-3.6-flash';

const PROMPT_TEMPLATE = `You are an expert case interview coach for top-tier Consulting and Product Management roles.
I will give you a case prompt. Your job is to generate two pieces of missing metadata:
1. "intended_approach_summary": A structured, numbered walkthrough (starting with a framework or approach name) of how a strong candidate would structure their answer.
2. "hidden_data": A short JSON-like structure (or list of facts) representing the information the interviewer holds back and progressively reveals as the candidate asks good clarifying questions. This should contain specific numbers or facts relevant to the case premise, formatted nicely.

CASE TITLE: {title}
TRACK: {track}
SUBTYPE: {subtype}
DIFFICULTY: {difficulty}

PREMISE: {premise}
OPENING QUESTION: {question}

OUTPUT FORMAT:
Return a JSON object with exactly two keys: "intended_approach_summary" (a string) and "hidden_data" (a JSON object with key-value pairs).

Example Output:
{
  "intended_approach_summary": "1. **Profitability Framework**: Analyze revenue (Price x Volume) and costs (Fixed + Variable).\\n2. **Identify the Driver**: Pinpoint if the decline is driven by dropping prices, lower volume, or rising costs.\\n3. **Market Context**: Assess if competitors are facing similar issues.\\n4. **Brainstorm Solutions**: Propose ways to increase revenue or cut costs based on the driver.",
  "hidden_data": {
    "Revenue Trend": "Flat over the last 3 years",
    "Cost Trend": "Variable costs increased by 15%",
    "Competitors": "Competitors are not facing this issue (it is company-specific)"
  }
}

Respond ONLY with the raw JSON object. Do not wrap it in markdown code blocks.`;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Fetching curated cases missing data...');
  const { data: cases, error } = await supabase
    .from('cases')
    .select('id, title, track, subtype, difficulty, premise_summary, opening_question, intended_approach_summary, hidden_data')
    .eq('is_curated', true)
    .or('intended_approach_summary.is.null,hidden_data.is.null');

  if (error) {
    console.error('Error fetching cases:', error);
    return;
  }

  console.log(`Found ${cases.length} curated cases missing data.`);

  if (cases.length === 0) return;

  // We will do a dry run on the first 3 cases first
  const dryRun = process.argv.includes('--dry-run');
  const targetCases = dryRun ? cases.slice(0, 3) : cases;

  console.log(dryRun ? 'Running in DRY-RUN mode for 3 cases...' : 'Running backfill for ALL cases...');

  let successCount = 0;
  
  for (let i = 0; i < targetCases.length; i++) {
    const c = targetCases[i];
    console.log(`[${i+1}/${targetCases.length}] Processing case ${c.id}: ${c.title}`);

    const prompt = PROMPT_TEMPLATE
      .replace('{title}', c.title)
      .replace('{track}', c.track)
      .replace('{subtype}', c.subtype)
      .replace('{difficulty}', c.difficulty)
      .replace('{premise}', c.premise_summary)
      .replace('{question}', c.opening_question);

    try {
      const res = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = res.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(responseText);

      if (dryRun) {
        console.log(`\n--- DRY RUN RESULT FOR ${c.id} ---`);
        console.log('intended_approach_summary:\n', parsed.intended_approach_summary);
        console.log('hidden_data:\n', JSON.stringify(parsed.hidden_data, null, 2));
        console.log('---------------------------\n');
      } else {
        const { error: updateError } = await supabase
          .from('cases')
          .update({
            intended_approach_summary: parsed.intended_approach_summary,
            hidden_data: parsed.hidden_data
          })
          .eq('id', c.id);

        if (updateError) {
          console.error(`Failed to update ${c.id}:`, updateError);
        } else {
          successCount++;
        }
      }
      
      // Throttle to avoid rate limits
      await delay(500);
      
    } catch (e) {
      console.error(`Failed generation for ${c.id}:`, e.message);
    }
  }

  if (!dryRun) {
    console.log(`Successfully updated ${successCount}/${targetCases.length} cases.`);
  }
}

run();
