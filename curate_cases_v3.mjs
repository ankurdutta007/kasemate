/**
 * curate_cases_v3.mjs
 *
 * Step 1 - Relevance classification: call Gemini Flash-Lite for every eligible
 *           case (has premise_summary + opening_question) and mark RELEVANT /
 *           IRRELEVANT. Also detect subtype mismatches and fix them.
 *
 * Step 2 - Re-run clustering-based curation with relevance_check = 'RELEVANT'
 *           as a hard gate. Subtype-reassigned cases are moved before clustering.
 *
 * Step 3 - Print stats table + samples.
 *
 * NOTE: The relevance_check column must exist in the DB for the final SQL
 * query to run. If it does not yet exist, this script still applies curation
 * (is_curated) and saves all results to relevance_results.json. Run the
 * accompanying migration (add_relevance_check_col.sql) to persist the column.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { GoogleGenAI } from '@google/genai';

// --- Env ---
const envFile = readFileSync('.env', 'utf-8');
const SUPABASE_URL   = envFile.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const SUPABASE_KEY   = envFile.match(/VITE_SUPABASE_ANON_KEY="(.*?)"/)[1];
const GEMINI_API_KEY = envFile.match(/GEMINI_API_KEY="(.*?)"/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- Constants ---
const RELEVANCE_CACHE_FILE = 'relevance_results.json';

const TARGETS = {
  consulting: {
    'Profitability': 30,
    'Market Entry': 25,
    'Guesstimate': 40,
    'M&A / Growth Strategy': 15,
    'Pricing': 15,
    'Operations': 15,
  },
  product: {
    'Product Design': 30,
    'Metrics / Root-Cause': 25,
    'Product Improvement': 20,
    'Strategy / Go-to-Market': 20,
    'Guesstimate': 30,
    'Prioritization / Tradeoff': 10,
  },
};

const ALL_SUBTYPES = {
  consulting: Object.keys(TARGETS.consulting),
  product: Object.keys(TARGETS.product),
};

const INDUSTRIES = {
  'airline':          /airline|aviation|airport|flight/i,
  'coffee/restaurant':/coffee|restaurant|cafe|dining|food chain/i,
  'retail':           /retail|store|supermarket|mall/i,
  'FMCG':             /fmcg|consumer goods|beverage|snack|packaged/i,
  'tech/software':    /tech|software|saas|app|digital/i,
  'healthcare':       /health|hospital|pharma|medical|drug/i,
  'manufacturing':    /manufactur|factory|plant|industrial/i,
  'banking/finance':  /bank|finance|fintech|insurance|card/i,
  'telecom':          /telecom|mobile network|broadband/i,
  'education':        /education|school|university|edtech/i,
  'hospitality':      /hotel|hospitality|resort|tourism/i,
  'e-commerce':       /e-commerce|ecommerce|online shopping/i,
};

// --- Helpers ---
function hasContent(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// --- Step 1: Relevance classification ---
async function classifyRelevance(cases) {
  let cache = {};
  if (existsSync(RELEVANCE_CACHE_FILE)) {
    try {
      cache = JSON.parse(readFileSync(RELEVANCE_CACHE_FILE, 'utf-8'));
      console.log(`  Loaded ${Object.keys(cache).length} cached classifications from ${RELEVANCE_CACHE_FILE}`);
    } catch { /* ignore */ }
  }

  const toClassify = cases.filter(c => !cache[c.id]);
  console.log(`  ${cases.length} eligible cases total. ${toClassify.length} need classification.`);

  const CONCURRENCY = 8;
  const SAVE_EVERY  = 50;
  let done = 0;

  for (let i = 0; i < toClassify.length; i += CONCURRENCY) {
    const batch = toClassify.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (c) => {
      const trackSubtypes = ALL_SUBTYPES[c.track] || [];
      const prompt = [
        'You are a case-interview quality-control classifier.',
        '',
        'TASK 1 - RELEVANCE: Determine if this is a legitimate business / management case interview question',
        '(a company, product, or market scenario a candidate would be asked to structure and solve)',
        'versus something else entirely - a coding / algorithm / DSA / LeetCode problem,',
        'a math problem with no business context, a trivia question, a riddle, or other irrelevant content.',
        '',
        'Reply with EXACTLY one word on the FIRST line: RELEVANT or IRRELEVANT.',
        '',
        'TASK 2 - SUBTYPE FIT (only if RELEVANT): The case is labelled with the subtype "' + c.subtype + '"',
        'within the "' + c.track + '" track. The valid subtypes for this track are: ' + trackSubtypes.join(', ') + '.',
        'If the case genuinely fits "' + c.subtype + '", reply with SUBTYPE_OK on the SECOND line.',
        'If it fits a DIFFERENT subtype better, reply with that subtype name (exactly as spelled above) on the SECOND line.',
        '',
        '--- CASE ---',
        'Title: ' + c.title,
        'Subtype: ' + c.subtype,
        'Premise: ' + c.premise_summary,
        'Opening Question: ' + c.opening_question,
        '--- END CASE ---',
        '',
        'Your entire response must be 1 or 2 lines only. No explanation.',
      ].join('\n');

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
          });
          const lines = (res.text || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
          const relevance = lines[0]?.toUpperCase().startsWith('IRRELEVANT') ? 'IRRELEVANT' : 'RELEVANT';
          let subtypeFit = 'SUBTYPE_OK';
          if (relevance === 'RELEVANT' && lines[1] && lines[1] !== 'SUBTYPE_OK') {
            const suggested = lines[1].trim();
            if (trackSubtypes.includes(suggested)) {
              subtypeFit = suggested;
            }
          }
          cache[c.id] = { relevance, subtypeFit };
          break;
        } catch (err) {
          if (err.status === 429 || (err.message || '').includes('429')) {
            await sleep(3000 * (attempt + 1));
          } else {
            console.warn(`  Failed to classify ${c.id}: ${err.message}`);
            cache[c.id] = { relevance: 'RELEVANT', subtypeFit: 'SUBTYPE_OK' };
            break;
          }
        }
      }
    }));

    done += batch.length;
    if (done % SAVE_EVERY < CONCURRENCY || done >= toClassify.length) {
      writeFileSync(RELEVANCE_CACHE_FILE, JSON.stringify(cache, null, 2));
      console.log(`  Progress: ${done}/${toClassify.length} classified (checkpoint saved)`);
    }

    if (i + CONCURRENCY < toClassify.length) await sleep(200);
  }

  writeFileSync(RELEVANCE_CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`  Classification complete. Results in ${RELEVANCE_CACHE_FILE}`);
  return cache;
}

// --- Embeddings ---
async function getEmbeddings(texts) {
  const CONCURRENCY = 10;
  const all = new Array(texts.length).fill(null);
  for (let i = 0; i < texts.length; i += CONCURRENCY) {
    const batch = texts.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (text, idx) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const resp = await ai.models.embedContent({
            model: 'gemini-embedding-2',
            contents: text,
          });
          if (resp.embeddings && resp.embeddings.length > 0) all[i + idx] = resp.embeddings[0].values;
          break;
        } catch (err) {
          if (err.status === 429) await sleep(2000);
          else break;
        }
      }
    }));
    if (i + CONCURRENCY < texts.length) await sleep(100);
  }
  return all;
}

// --- K-means clustering ---
function kmeans(embeddings, k, maxIter) {
  maxIter = maxIter || 50;
  const n = embeddings.length;
  const d = embeddings[0].length;
  if (k >= n) return Array.from({ length: n }, (_, i) => i);

  const centroids = [embeddings[Math.floor(Math.random() * n)]];
  for (let i = 1; i < k; i++) {
    const distSq = embeddings.map(e =>
      Math.min(...centroids.map(c => e.reduce((s, v, j) => s + Math.pow(v - c[j], 2), 0))));
    const sum = distSq.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    let chosen = -1;
    for (let j = 0; j < n; j++) {
      r -= distSq[j];
      if (r <= 0) { chosen = j; break; }
    }
    centroids.push(embeddings[chosen === -1 ? Math.floor(Math.random() * n) : chosen]);
  }

  let assignments = new Array(n).fill(-1);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      const e = embeddings[i];
      let minD = Infinity;
      let best = -1;
      for (let j = 0; j < k; j++) {
        const c = centroids[j];
        let dist = 0;
        for (let dim = 0; dim < d; dim++) dist += Math.pow(e[dim] - c[dim], 2);
        if (dist < minD) { minD = dist; best = j; }
      }
      if (assignments[i] !== best) { assignments[i] = best; changed = true; }
    }
    if (!changed) break;
    const newC = Array(k).fill(0).map(() => Array(d).fill(0));
    const cnt  = Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      cnt[assignments[i]]++;
      for (let dim = 0; dim < d; dim++) newC[assignments[i]][dim] += embeddings[i][dim];
    }
    for (let j = 0; j < k; j++) {
      if (cnt[j] > 0) for (let dim = 0; dim < d; dim++) centroids[j][dim] = newC[j][dim] / cnt[j];
    }
  }
  return assignments;
}

// --- Case quality score ---
function scoreCaseForTiebreak(c) {
  let score = 0;
  if (hasContent(c.hidden_data) && hasContent(c.intended_approach_summary)) score += 100;
  else if (hasContent(c.hidden_data) || hasContent(c.intended_approach_summary)) score += 40;
  const specifics = ['million','billion','%','revenue','cost','market','competitor','users','growth','margin','acquisition','price'];
  const text = ((c.premise_summary || '') + ' ' + (c.opening_question || '')).toLowerCase();
  score += specifics.filter(s => text.includes(s)).length * 2;
  const len = text.length;
  if (len > 100 && len < 800) score += 10;
  else if (len >= 800) score -= 5;
  else score -= 10;
  return score + Math.random();
}

// --- Main ---
async function run() {
  console.log('\n=== Fetching all cases ===');
  const { data: allCases, error: fetchErr } = await supabase.from('cases').select('*');
  if (fetchErr) { console.error(fetchErr); process.exit(1); }
  console.log(`  Fetched ${allCases.length} cases.`);

  const eligibleCases = allCases.filter(c => hasContent(c.premise_summary) && hasContent(c.opening_question));
  console.log(`  Eligible (premise+question): ${eligibleCases.length}`);

  // Step 1: Relevance classification
  console.log('\n=== Step 1: Relevance Classification ===');
  const classificationCache = await classifyRelevance(eligibleCases);

  // Apply subtype corrections in-memory
  console.log('\n=== Step 1b: Applying subtype corrections ===');
  let reclassifiedCount = 0;
  const reclassifiedSamples = [];

  for (const c of eligibleCases) {
    const result = classificationCache[c.id];
    if (!result) continue;
    if (result.subtypeFit && result.subtypeFit !== 'SUBTYPE_OK') {
      const oldSubtype = c.subtype;
      c.subtype = result.subtypeFit;
      reclassifiedCount++;
      reclassifiedSamples.push({ id: c.id, title: c.title, oldSubtype, newSubtype: result.subtypeFit, track: c.track });
    }
  }
  // Also apply to allCases so stats are accurate
  for (const item of reclassifiedSamples) {
    const c = allCases.find(x => x.id === item.id);
    if (c) c.subtype = item.newSubtype;
  }
  console.log(`  Subtype corrections applied in-memory: ${reclassifiedCount}`);

  // Persist subtype corrections to DB
  if (reclassifiedSamples.length > 0) {
    console.log(`  Writing ${reclassifiedSamples.length} subtype corrections to DB...`);
    for (const item of reclassifiedSamples) {
      const { error: stErr } = await supabase
        .from('cases').update({ subtype: item.newSubtype }).eq('id', item.id);
      if (stErr) console.warn(`  Failed subtype update ${item.id}: ${stErr.message}`);
    }
  }

  // Step 1c: Persist relevance_check to DB if column exists
  console.log('\n=== Step 1c: Persisting relevance_check to DB (if column exists) ===');
  let columnExists = false;
  const testCase = eligibleCases[0];
  if (testCase) {
    const { error: colErr } = await supabase
      .from('cases')
      .update({ relevance_check: classificationCache[testCase.id]?.relevance || 'RELEVANT' })
      .eq('id', testCase.id);
    if (colErr && colErr.code === 'PGRST204') {
      console.warn('  Column relevance_check does not exist. Skipping DB persistence.');
      columnExists = false;
    } else if (colErr) {
      console.warn('  Error writing relevance_check:', colErr.message);
      columnExists = false;
    } else {
      columnExists = true;
      console.log('  Column exists. Persisting all relevance_check values...');
      const entries = Object.entries(classificationCache);
      for (let i = 0; i < entries.length; i++) {
        const [id, result] = entries[i];
        await supabase.from('cases').update({ relevance_check: result.relevance }).eq('id', id);
        if ((i + 1) % 100 === 0) console.log(`  ... ${i + 1}/${entries.length} written`);
      }
      console.log(`  Done. ${entries.length} relevance_check values written.`);
    }
  }

  // Step 2: Reset is_curated
  console.log('\n=== Step 2a: Resetting is_curated to false ===');
  const { error: resetErr } = await supabase.from('cases').update({ is_curated: false }).neq('id', '__dummy__');
  if (resetErr) console.error('  Reset error:', resetErr.message);
  else console.log('  All is_curated reset to false.');

  // Step 2b: Clustering + curation
  console.log('\n=== Step 2b: Clustering and Curation ===');
  const selectedIds = new Set();

  for (const track of Object.keys(TARGETS)) {
    for (const [subtype, targetCount] of Object.entries(TARGETS[track])) {
      const groupAll = allCases.filter(c => c.track === track && c.subtype === subtype);
      const eligibleGroup = groupAll.filter(c =>
        hasContent(c.premise_summary) && hasContent(c.opening_question));
      const relevantGroup = eligibleGroup.filter(c => {
        const result = classificationCache[c.id];
        return !result || result.relevance === 'RELEVANT';
      });

      const K = Math.min(targetCount, relevantGroup.length);
      if (K === 0) {
        console.log(`  ${track} / ${subtype}: 0 relevant cases, skipping.`);
        continue;
      }

      console.log(`  Embedding ${relevantGroup.length} relevant cases for ${track} - ${subtype}...`);
      const texts = relevantGroup.map(c =>
        'Title: ' + c.title + '\nPremise: ' + c.premise_summary + '\nQuestion: ' + c.opening_question);
      const embeddings = await getEmbeddings(texts);

      const validIdx = embeddings.map((e, i) => e !== null ? i : -1).filter(i => i !== -1);
      const validEmbed = validIdx.map(i => embeddings[i]);
      const validCases = validIdx.map(i => relevantGroup[i]);

      const actualK = Math.min(K, validEmbed.length);
      if (actualK === 0) {
        console.log(`  No valid embeddings for ${track} - ${subtype}.`);
        continue;
      }

      console.log(`  Clustering ${track} - ${subtype} into ${actualK} clusters...`);
      const assignments = kmeans(validEmbed, actualK);
      const clusters = Array.from({ length: actualK }, () => []);
      for (let i = 0; i < validCases.length; i++) clusters[assignments[i]].push(validCases[i]);

      for (let j = 0; j < actualK; j++) {
        if (clusters[j].length > 0) {
          clusters[j].sort((a, b) => scoreCaseForTiebreak(b) - scoreCaseForTiebreak(a));
          selectedIds.add(clusters[j][0].id);
        }
      }
    }
  }

  // Write is_curated = true
  console.log(`\n=== Step 2c: Writing ${selectedIds.size} curated cases to DB ===`);
  const idArr = Array.from(selectedIds);
  const BATCH_SIZE = 100;
  for (let i = 0; i < idArr.length; i += BATCH_SIZE) {
    const batch = idArr.slice(i, i + BATCH_SIZE);
    const { error: updErr } = await supabase
      .from('cases').update({ is_curated: true }).in('id', batch);
    if (updErr) console.error('  Update error:', updErr.message);
  }
  console.log('  Done writing curated flags.');

  // Step 3: Print stats
  console.log('\n=== Step 3: Results ===\n');

  // Build stats from in-memory data
  const groupKeys = new Set();
  for (const c of allCases) groupKeys.add(c.track + '|||' + c.subtype);

  const rows = [];
  for (const key of [...groupKeys].sort()) {
    const parts = key.split('|||');
    const track   = parts[0];
    const subtype = parts[1];
    const group = allCases.filter(c => c.track === track && c.subtype === subtype);
    const total      = group.length;
    const irrelevant = group.filter(c => classificationCache[c.id] && classificationCache[c.id].relevance === 'IRRELEVANT').length;
    const curated    = group.filter(c => selectedIds.has(c.id)).length;
    rows.push({ track, subtype, total, irrelevant, curated });
  }

  // Compute column widths
  const headers = ['track', 'subtype', 'total', 'irrelevant', 'curated'];
  const widths = [5, 7, 5, 10, 7];
  for (const row of rows) {
    widths[0] = Math.max(widths[0], row.track.length);
    widths[1] = Math.max(widths[1], row.subtype.length);
    widths[2] = Math.max(widths[2], String(row.total).length);
    widths[3] = Math.max(widths[3], String(row.irrelevant).length);
    widths[4] = Math.max(widths[4], String(row.curated).length);
  }

  function pad(s, w) { return String(s).padEnd(w); }
  const sep = widths.map(w => '-'.repeat(w)).join('-+-');
  console.log(widths.map((w, i) => pad(headers[i], w)).join(' | '));
  console.log(sep);
  for (const row of rows) {
    console.log([
      pad(row.track,      widths[0]),
      pad(row.subtype,    widths[1]),
      pad(row.total,      widths[2]),
      pad(row.irrelevant, widths[3]),
      pad(row.curated,    widths[4]),
    ].join(' | '));
  }
  const totalIrrelevant = rows.reduce((s, r) => s + r.irrelevant, 0);
  const totalCurated    = rows.reduce((s, r) => s + r.curated, 0);
  const totalAll        = rows.reduce((s, r) => s + r.total, 0);
  console.log(sep);
  console.log('TOTAL | ' + totalAll + ' cases | ' + totalIrrelevant + ' irrelevant | ' + totalCurated + ' curated');

  // Reclassification summary
  console.log('\n--- Subtype reclassifications ---');
  console.log('Cases reassigned to a different subtype: ' + reclassifiedCount);
  if (reclassifiedSamples.length > 0) {
    console.log('Sample reclassifications (up to 10):');
    reclassifiedSamples.slice(0, 10).forEach(s => {
      console.log('  [' + s.track + '] "' + s.title + '" :: ' + s.oldSubtype + ' -> ' + s.newSubtype);
    });
  }

  // Sample IRRELEVANT cases
  console.log('\n--- Sample IRRELEVANT cases (up to 10) ---');
  const irrelevantCases = eligibleCases.filter(c =>
    classificationCache[c.id] && classificationCache[c.id].relevance === 'IRRELEVANT');
  irrelevantCases.slice(0, 10).forEach(c => {
    console.log('  [' + c.track + ' / ' + c.subtype + '] "' + c.title + '"');
  });
  if (irrelevantCases.length > 10) {
    console.log('  ... and ' + (irrelevantCases.length - 10) + ' more.');
  }

  if (!columnExists) {
    console.log('\n=== ACTION REQUIRED ===');
    console.log('The relevance_check column does not yet exist in the DB.');
    console.log('Run the following SQL in the Supabase SQL Editor to add it:');
    console.log('');
    console.log('  ALTER TABLE cases ADD COLUMN IF NOT EXISTS relevance_check text DEFAULT \'RELEVANT\';');
    console.log('');
    console.log('Then re-run: node curate_cases_v3.mjs');
    console.log('(The cached classification results will be reused from relevance_results.json)');
  }

  console.log('\nAll done.');
}

run().catch(err => { console.error(err); process.exit(1); });
