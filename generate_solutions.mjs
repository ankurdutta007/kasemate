/**
 * generate_solutions.mjs
 *
 * Generates the 7-part structured solution for all 271 curated cases.
 * Stores results as JSON in intended_approach_summary (replaces old plain text).
 *
 * Usage: node generate_solutions.mjs [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { GoogleGenAI } from '@google/genai';

const envFile = readFileSync('.env', 'utf-8');
const SUPABASE_URL   = envFile.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const SUPABASE_KEY   = envFile.match(/VITE_SUPABASE_ANON_KEY="(.*?)"/)[1];
const GEMINI_API_KEY = envFile.match(/GEMINI_API_KEY="(.*?)"/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const DRY_RUN = process.argv.includes('--dry-run');
const CACHE_FILE = 'solution_generation_cache.json';

// ─── Framework picker ─────────────────────────────────────────────────────────
function frameworkHint(track, subtype) {
  if (track === 'consulting') {
    if (subtype === 'Profitability')           return 'Revenue-Cost Tree (Revenue = Price × Volume; Costs = Fixed + Variable)';
    if (subtype === 'Market Entry')            return 'Market Entry Framework (Market Attractiveness → Competitive Landscape → Entry Mode → Go/No-Go)';
    if (subtype === 'Guesstimate')             return 'Top-Down or Bottom-Up Estimation (state which at the start)';
    if (subtype === 'M&A / Growth Strategy')   return 'Growth Strategy Framework (Strategic Fit → Synergies → Integration Risk → Recommendation)';
    if (subtype === 'Pricing')                 return 'Pricing Framework (Cost-based floor → Value-based ceiling → Competitor anchoring → Final price)';
    if (subtype === 'Operations')              return 'Operations Framework (Identify bottleneck → Root-cause → Short/long-term levers → Prioritize)';
  }
  if (track === 'product') {
    if (subtype === 'Product Design')          return 'CIRCLES Method (Comprehend → Identify user → Report needs → Cut through prioritization → List solutions → Evaluate trade-offs → Summarize recommendation)';
    if (subtype === 'Metrics / Root-Cause')    return 'RCA Decomposition (Define metric → Segment (platform/geo/cohort) → Hypothesize driver → Validate → Recommend)';
    if (subtype === 'Product Improvement')     return 'Goal → User → Pain → Solution → Prioritize → Measure (6-step improvement framework)';
    if (subtype === 'Strategy / Go-to-Market') return 'GTM Framework (Target segment → Value proposition → Channel → Pricing → Launch sequencing → Success metrics)';
    if (subtype === 'Guesstimate')             return 'Top-Down or Bottom-Up Estimation (state which at the start)';
    if (subtype === 'Prioritization / Tradeoff') return 'RICE Framework (Reach × Impact × Confidence ÷ Effort) or Impact-Effort Matrix';
  }
  return 'Structured framework appropriate to the case type';
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLAR CASES (hand-crafted, used as few-shot examples in the prompt)
// ═══════════════════════════════════════════════════════════════════════════════

const EXEMPLAR_PROFITABILITY = {
  id: 'EXEMPLAR-PROFITABILITY',
  title: 'Starbucks India Profitability Decline',
  track: 'consulting',
  subtype: 'Profitability',
  difficulty: 'Medium',
  premise_summary: 'Starbucks India has seen a 15% decline in net profit over the last two quarters despite flat revenue. The India CEO has hired your firm to diagnose the issue and recommend a path to recovery.',
  opening_question: 'Why has Starbucks India\'s profitability declined, and what should they do about it?',
  intended_approach_summary: 'Use the Revenue-Cost Tree: break revenue into volume x price, and costs into COGS, store operating costs, and G&A. Start with whether the problem is revenue-side or cost-side.',
  hidden_data: [
    { trigger_topic: 'Revenue breakdown', data_summary: 'Revenue is flat; drink volumes fell 8% but were offset by a 9% price hike in premium lines.' },
    { trigger_topic: 'Cost structure', data_summary: 'Rent costs jumped 22% due to new tier-1 city store openings; dairy costs up 18% due to supply chain issues.' },
    { trigger_topic: 'Competitor context', data_summary: 'Third Wave Coffee and Blue Tokai growing fast; Starbucks losing 18-30 year olds to local artisanal brands.' },
  ]
};

const EXEMPLAR_PRODUCT_DESIGN = {
  id: 'EXEMPLAR-PRODUCT-DESIGN',
  title: 'Design a Feature for LinkedIn to Help New Graduates Find Their First Job',
  track: 'product',
  subtype: 'Product Design',
  difficulty: 'Medium',
  premise_summary: 'LinkedIn wants to improve job outcomes for recent graduates (0-2 years of experience), who currently have lower offer acceptance rates than experienced professionals on the platform.',
  opening_question: 'How would you design a new LinkedIn feature to help new graduates find and land their first job?',
  intended_approach_summary: 'Use CIRCLES: Clarify goal (new graduate job outcomes), Identify user (fresh grad 22-24, minimal network, imposter syndrome), Report needs (visibility, credibility signals, structured guidance), Cut to prioritize (visibility + credibility), List solutions, Evaluate, Summarize.',
  hidden_data: [
    { trigger_topic: 'Current funnel data', data_summary: '62% of new grads apply to 5+ roles but only 8% get responses. The drop is at the application review stage, not the search stage.' },
    { trigger_topic: 'Recruiter behavior', data_summary: 'Recruiters spend <7 seconds on a profile; new grad profiles lack keywords, project descriptions, and endorsements that surface in recruiter search.' },
    { trigger_topic: 'What new grads want most', data_summary: 'User research shows #1 pain point is not knowing if their application was even seen. #2 is not knowing why they were rejected.' },
  ]
};

// ─── Build exemplar JSON structures (hand-crafted) ────────────────────────────
const EXEMPLAR_PROFITABILITY_SOL = {
  clarifying_questions: [
    'Is the 15% profit decline concentrated in certain cities or store formats (mall vs. standalone)?',
    'Has the product mix shifted — are customers ordering fewer high-margin items like blended beverages?',
    'Are these new store openings performing below expectations, or is the decline in existing same-store margins?',
    'Has there been a change in input costs — dairy, labour, or imported coffee beans?',
  ],
  framework_name: 'Revenue-Cost Tree',
  framework_steps: [
    'Clarify scope: Is this a revenue problem, a cost problem, or both? Flat revenue + declining profit → cost-side hypothesis first.',
    'Revenue deep-dive: Break into Volume × Price. Volume down 8%, but price up 9% — net flat. Ask: which SKUs lost volume? Which customer segments left?',
    'Cost deep-dive: Break into COGS (dairy, beans, packaging), Store Operating Costs (rent, labour), and G&A. Identify which line item moved most.',
    'Root-cause: Rent up 22% from new store openings + dairy up 18% = primary drivers. New stores not yet profitable (J-curve effect).',
    'Competitive context: Third Wave Coffee stealing 18-30 year old segment. Price-sensitive youth now choosing artisanal at lower price points.',
    'Recommend: Short-term — renegotiate dairy supply contracts, pause new city expansion. Medium-term — launch a sub-Rs.300 "Starbucks Lite" line to defend the youth segment.',
  ],
  sample_exchange: [
    { ask: 'revenue breakdown', learn: 'drink volumes fell 8% but were offset by a 9% price hike in premium lines, making revenue net flat — the issue is entirely cost-side.' },
    { ask: 'cost structure', learn: 'rent costs jumped 22% from new tier-1 city store openings, and dairy costs rose 18% due to a supply chain disruption — together these account for the full 15% profit drop.' },
    { ask: 'competitor context', learn: 'Third Wave Coffee and Blue Tokai are growing fast and taking the 18-30 year old segment; Starbucks is not yet losing the premium/loyalty segment, just the price-sensitive youth cohort.' },
  ],
  strong_answer: 'The profitability decline is driven by cost inflation, not a revenue problem. Rent from aggressive new store openings (up 22%) and dairy supply disruption (up 18%) together exceed the 15% margin decline. Short-term, Starbucks should renegotiate dairy contracts and pause further store openings in tier-1 cities. Medium-term, they should defend the youth segment with a sub-Rs.300 product line before artisanal brands permanently capture that cohort.',
  common_pitfall: 'Jumping to "Starbucks needs to lower prices" without first decomposing whether the problem is revenue-side or cost-side — the flat revenue data makes this a cost story, not a demand story, and solutions aimed at volume will miss the actual driver entirely.',
};

const EXEMPLAR_PRODUCT_DESIGN_SOL = {
  clarifying_questions: [
    'Are we optimizing for job offers secured, or an earlier funnel metric like recruiter response rate?',
    'Is this feature for the LinkedIn app, web, or both — and should it integrate with the Jobs tab or live in the profile?',
    'Do we have data on where new grads specifically drop off — search, application, or post-application silence?',
    'Are we targeting all new grads globally, or a specific market like India or the US first?',
  ],
  framework_name: 'CIRCLES Method',
  framework_steps: [
    'Comprehend the goal: LinkedIn wants to improve job placement outcomes for 0-2 year experience users, who have 4× lower response rates than experienced professionals.',
    'Identify the user: Recent grad aged 22-24. Minimal professional network. Experiences imposter syndrome. Uncertain about how to present academic projects as work experience. Uses mobile-first.',
    'Report needs: (a) Visibility — get their profile surfaced in recruiter searches. (b) Credibility — signal competence despite no work experience. (c) Feedback loop — know what happened to their application.',
    'Cut to prioritize: Visibility + Credibility are the highest-leverage needs. Feedback is desirable but depends on recruiter cooperation. Focus here.',
    'List solutions: (1) "First Job Mode" — guided profile builder for new grads with project prompts and keyword suggestions. (2) "Campus Verified" badge — credential verification for GPA, projects, extracurriculars. (3) Graduate Spotlight — curated recruiter feed of top new grad profiles in their field.',
    'Evaluate trade-offs: First Job Mode has broadest reach (all new grads) with lowest complexity. Campus Verified requires university data partnerships — longer to ship. Spotlight requires recruiter-side behavior change — risky. Prioritize First Job Mode.',
    'Summarize: Ship First Job Mode in Q1 as an onboarding-triggered guided setup. Measure recruiter response rate for new grads as the primary metric. Success = response rate parity with 2-5 year professionals within 6 months.',
  ],
  sample_exchange: [
    { ask: 'the current funnel data', learn: '62% of new grads apply to 5+ roles but only 8% get responses — the drop is at the application review stage, not during search, pointing to a profile quality and keyword problem rather than a discoverability or job-fit problem.' },
    { ask: 'recruiter behavior', learn: 'recruiters spend under 7 seconds reviewing a profile, and new grad profiles lack the keywords, project descriptions, and endorsements that surface in recruiter search — meaning the issue is profile quality and credibility signaling.' },
    { ask: 'new grad pain points', learn: 'the #1 pain point is not knowing if their application was even seen, and #2 is not knowing why they were rejected — suggesting a "feedback loop" feature would have very high user satisfaction, though it depends on recruiter participation.' },
  ],
  strong_answer: 'I recommend building "First Job Mode" — a guided profile builder that activates on onboarding for users with less than 2 years of experience. It walks them through turning academic projects and extracurriculars into recruiter-readable profile content, with built-in keyword suggestions per role. This directly addresses the 8% response rate problem without requiring recruiter-side behavior change. Primary success metric: recruiter response rate for new grads rising from 8% to at least 15% within 6 months of launch.',
  common_pitfall: 'Designing a solution that helps new grads find more jobs to apply to — when the data shows they\'re already applying broadly but getting no responses. The bottleneck is profile quality at the review stage, not job search discoverability, so solutions focused on job recommendations will not move the core metric.',
};

// ─── Few-shot prompt builder ──────────────────────────────────────────────────
function buildPrompt(c) {
  const hiddenDataStr = (() => {
    const hd = c.hidden_data;
    if (!hd) return 'None provided.';
    if (Array.isArray(hd)) {
      return hd.map(item => {
        if (item && item.trigger_topic && item.data_summary) {
          return `- Topic: "${item.trigger_topic}"\n  Data: ${item.data_summary}`;
        }
        return JSON.stringify(item);
      }).join('\n');
    }
    if (typeof hd === 'object') {
      return Object.entries(hd).map(([k,v]) => `- ${k}: ${v}`).join('\n');
    }
    return String(hd);
  })();

  return `You are a world-class case interview coach generating structured solution guides for a case interview practice platform.

You will be given a case and must produce a JSON object with exactly these 6 keys:
- clarifying_questions: array of 3-5 strings (specific, case-tailored questions the candidate should ask)
- framework_name: string (the named framework that fits this case best, e.g. "${frameworkHint(c.track, c.subtype)}")
- framework_steps: array of 5-8 strings (numbered step-by-step structure using the framework)
- sample_exchange: array of 2-4 objects each with keys "ask" (topic the candidate asks about) and "learn" (what they would discover, written as readable prose from the hidden data provided)
- strong_answer: string (2-4 sentence synthesized recommendation that a top candidate would give)
- common_pitfall: string (one sentence, tied to THIS case's specific content, not a generic trap)

CRITICAL RULES:
1. sample_exchange MUST be built from the "Source hidden data" provided. Rewrite it as readable prose — never show JSON, brackets, or field names.
2. common_pitfall must reference something specific about this case, not a generic warning.
3. framework_name must be the exact named framework (e.g. "Revenue-Cost Tree", "CIRCLES Method", "RCA Decomposition").
4. Output ONLY the raw JSON object. No markdown, no explanation, no code fences.

===== FEW-SHOT EXAMPLE 1: Consulting / Profitability =====

Case:
Title: ${EXEMPLAR_PROFITABILITY.title}
Track: ${EXEMPLAR_PROFITABILITY.track} | Subtype: ${EXEMPLAR_PROFITABILITY.subtype} | Difficulty: ${EXEMPLAR_PROFITABILITY.difficulty}
Premise: ${EXEMPLAR_PROFITABILITY.premise_summary}
Opening Question: ${EXEMPLAR_PROFITABILITY.opening_question}
Source intended approach: ${EXEMPLAR_PROFITABILITY.intended_approach_summary}
Source hidden data:
- Topic: "Revenue breakdown"
  Data: Revenue is flat; drink volumes fell 8% but were offset by a 9% price hike in premium lines.
- Topic: "Cost structure"
  Data: Rent costs jumped 22% due to new tier-1 city store openings; dairy costs up 18% due to supply chain issues.
- Topic: "Competitor context"
  Data: Third Wave Coffee and Blue Tokai growing fast; Starbucks losing 18-30 year olds to local artisanal brands.

Output:
${JSON.stringify(EXEMPLAR_PROFITABILITY_SOL, null, 2)}

===== FEW-SHOT EXAMPLE 2: Product / Product Design =====

Case:
Title: ${EXEMPLAR_PRODUCT_DESIGN.title}
Track: ${EXEMPLAR_PRODUCT_DESIGN.track} | Subtype: ${EXEMPLAR_PRODUCT_DESIGN.subtype} | Difficulty: ${EXEMPLAR_PRODUCT_DESIGN.difficulty}
Premise: ${EXEMPLAR_PRODUCT_DESIGN.premise_summary}
Opening Question: ${EXEMPLAR_PRODUCT_DESIGN.opening_question}
Source intended approach: ${EXEMPLAR_PRODUCT_DESIGN.intended_approach_summary}
Source hidden data:
- Topic: "Current funnel data"
  Data: 62% of new grads apply to 5+ roles but only 8% get responses. The drop is at the application review stage.
- Topic: "Recruiter behavior"
  Data: Recruiters spend <7 seconds on a profile; new grad profiles lack keywords, project descriptions, and endorsements.
- Topic: "What new grads want most"
  Data: User research shows #1 pain point is not knowing if their application was seen. #2 is not knowing why they were rejected.

Output:
${JSON.stringify(EXEMPLAR_PRODUCT_DESIGN_SOL, null, 2)}

===== NOW GENERATE FOR THIS CASE =====

Case:
Title: ${c.title}
Track: ${c.track} | Subtype: ${c.subtype} | Difficulty: ${c.difficulty}
Premise: ${c.premise_summary}
Opening Question: ${c.opening_question}
Source intended approach: ${c.intended_approach_summary || 'None provided.'}
Source hidden data:
${hiddenDataStr}

Output:`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('Fetching curated cases...');
  const { data: cases, error } = await supabase
    .from('cases')
    .select('id, track, subtype, title, difficulty, premise_summary, opening_question, intended_approach_summary, hidden_data')
    .eq('is_curated', true);

  if (error) { console.error(error); process.exit(1); }
  console.log(`Found ${cases.length} curated cases.`);

  // Load cache
  let cache = {};
  if (existsSync(CACHE_FILE)) {
    try { cache = JSON.parse(readFileSync(CACHE_FILE, 'utf-8')); } catch {}
    console.log(`Loaded ${Object.keys(cache).length} cached results.`);
  }

  const toGenerate = cases.filter(c => {
    if (cache[c.id]) return false;
    // Already has structured JSON? Skip.
    try {
      const p = JSON.parse(c.intended_approach_summary || '');
      if (p && p.clarifying_questions && p.framework_name) { cache[c.id] = { success: true, skipped: true }; return false; }
    } catch {}
    return true;
  });

  console.log(`${toGenerate.length} cases need generation.`);

  if (DRY_RUN) {
    console.log('\n=== DRY RUN: showing 2 exemplar cases ===\n');
    console.log('--- EXEMPLAR 1: Consulting / Profitability ---');
    console.log(JSON.stringify(EXEMPLAR_PROFITABILITY_SOL, null, 2));
    console.log('\n--- EXEMPLAR 2: Product / Product Design ---');
    console.log(JSON.stringify(EXEMPLAR_PRODUCT_DESIGN_SOL, null, 2));
    return;
  }

  const CONCURRENCY = 5;
  let successCount = 0;
  let failCount = 0;
  const failures = [];
  const samples = [];

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  for (let i = 0; i < toGenerate.length; i += CONCURRENCY) {
    const batch = toGenerate.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (c) => {
      const prompt = buildPrompt(c);
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
          });
          const text = (res.text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
          const parsed = JSON.parse(text);

          // Validate required keys
          if (!parsed.clarifying_questions || !parsed.framework_name || !parsed.framework_steps ||
              !parsed.sample_exchange || !parsed.strong_answer || !parsed.common_pitfall) {
            throw new Error('Missing required keys in response');
          }

          cache[c.id] = { success: true, data: parsed };

          // Update DB
          const { error: updErr } = await supabase
            .from('cases')
            .update({ intended_approach_summary: JSON.stringify(parsed) })
            .eq('id', c.id);

          if (updErr) {
            console.warn(`DB update failed for ${c.id}: ${updErr.message}`);
          } else {
            successCount++;
            if (samples.length < 5) {
              samples.push({ ...c, sol: parsed });
            }
          }
          break;
        } catch (err) {
          if (err.status === 429 || (err.message || '').includes('429')) {
            await sleep(3000 * (attempt + 1));
          } else if (attempt === 2) {
            failCount++;
            failures.push({ id: c.id, title: c.title, reason: err.message?.slice(0, 100) });
            cache[c.id] = { success: false, reason: err.message };
            break;
          } else {
            await sleep(1000);
          }
        }
      }
    }));

    // Checkpoint
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    if ((i + CONCURRENCY) % 50 < CONCURRENCY || i + CONCURRENCY >= toGenerate.length) {
      console.log(`Progress: ${Math.min(i + CONCURRENCY, toGenerate.length)}/${toGenerate.length} | Success: ${successCount} | Fail: ${failCount}`);
    }

    if (i + CONCURRENCY < toGenerate.length) await sleep(300);
  }

  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

  // Print results
  console.log('\n=== GENERATION COMPLETE ===');
  console.log(`Success: ${successCount}`);
  console.log(`Failed/Skipped: ${failCount}`);
  if (failures.length > 0) {
    console.log('\nFailed cases:');
    failures.forEach(f => console.log(`  [${f.id}] ${f.title}: ${f.reason}`));
  }

  console.log('\n=== SAMPLE OUTPUTS (5 cases) ===\n');
  for (const s of samples) {
    console.log(`--- [${s.track}/${s.subtype}] ${s.title} ---`);
    console.log(`Framework: ${s.sol.framework_name}`);
    console.log(`Clarifying Questions:`);
    s.sol.clarifying_questions.forEach((q, i) => console.log(`  ${i+1}. ${q}`));
    console.log(`Steps (${s.sol.framework_steps.length} total):`);
    s.sol.framework_steps.slice(0, 3).forEach((st, i) => console.log(`  ${i+1}. ${st}`));
    if (s.sol.framework_steps.length > 3) console.log(`  ... (${s.sol.framework_steps.length - 3} more steps)`);
    console.log(`Sample Exchange:`);
    s.sol.sample_exchange.forEach(ex => console.log(`  If you ask about ${ex.ask}: ${ex.learn.slice(0, 100)}...`));
    console.log(`Strong Answer: ${s.sol.strong_answer.slice(0, 120)}...`);
    console.log(`Common Pitfall: ${s.sol.common_pitfall}`);
    console.log('');
  }
}

run().catch(err => { console.error(err); process.exit(1); });
