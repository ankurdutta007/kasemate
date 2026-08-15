import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=\"(.*?)\"/)[1];
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=\"(.*?)\"/)[1];
const GEMINI_API_KEY = envFile.match(/GEMINI_API_KEY=\"(.*?)\"/)[1];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TARGETS = {
  consulting: {
    'Profitability': 30,
    'Market Entry': 25,
    'Guesstimate': 40,
    'M&A / Growth Strategy': 15,
    'Pricing': 15,
    'Operations': 15
  },
  product: {
    'Product Design': 30,
    'Metrics / Root-Cause': 25,
    'Product Improvement': 20,
    'Strategy / Go-to-Market': 20,
    'Guesstimate': 30,
    'Prioritization / Tradeoff': 10
  }
};

const INDUSTRIES = {
  'airline': /airline|aviation|airport|flight/i,
  'coffee/restaurant': /coffee|restaurant|cafe|dining|food chain/i,
  'retail': /retail|store|supermarket|mall/i,
  'FMCG': /fmcg|consumer goods|beverage|snack|packaged/i,
  'tech/software': /tech|software|saas|app|digital/i,
  'healthcare': /health|hospital|pharma|medical|drug/i,
  'manufacturing': /manufactur|factory|plant|industrial/i,
  'banking/finance': /bank|finance|fintech|insurance|card/i,
  'telecom': /telecom|mobile network|broadband/i,
  'education': /education|school|university|edtech/i,
  'hospitality': /hotel|hospitality|resort|tourism/i,
  'e-commerce': /e-commerce|ecommerce|online shopping/i
};

function getIndustryTag(title) {
  for (const [tag, regex] of Object.entries(INDUSTRIES)) {
    if (regex.test(title)) return tag;
  }
  return 'other/unclear';
}

function hasContent(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function getEmbeddings(texts) {
  const CONCURRENCY = 10;
  let allEmbeddings = new Array(texts.length).fill(null);
  
  for (let i = 0; i < texts.length; i += CONCURRENCY) {
    const batch = texts.slice(i, i + CONCURRENCY);
    const promises = batch.map(async (text, idx) => {
      let success = false;
      let attempts = 0;
      while (!success && attempts < 3) {
        attempts++;
        try {
          const response = await ai.models.embedContent({
            model: 'gemini-embedding-2',
            contents: text
          });
          // Ensure we got an embedding
          if (response.embeddings && response.embeddings.length > 0) {
            allEmbeddings[i + idx] = response.embeddings[0].values;
          }
          success = true;
        } catch (err) {
          if (err.status === 429) {
            console.warn(`Retry ${attempts} for idx ${i + idx}: Rate limit`);
            await new Promise(r => setTimeout(r, 2000));
          } else {
            console.warn(`Failed to embed idx ${i + idx}: ${err.message}`);
            success = true; // Stop retrying on safety or other permanent errors
          }
        }
      }
    });
    await Promise.all(promises);
  }
  return allEmbeddings;
}

function kmeans(embeddings, k, maxIter = 50) {
  const n = embeddings.length;
  const d = embeddings[0].length;
  if (k >= n) {
    // If K >= cases, every case gets its own cluster
    return Array.from({ length: n }, (_, i) => i);
  }
  
  // Initialize centroids (k-means++)
  const centroids = [embeddings[Math.floor(Math.random() * n)]];
  for (let i = 1; i < k; i++) {
    const distSq = embeddings.map(e => {
      return Math.min(...centroids.map(c => 
        e.reduce((sum, val, idx) => sum + Math.pow(val - c[idx], 2), 0)
      ));
    });
    const sumDist = distSq.reduce((a, b) => a + b, 0);
    let r = Math.random() * sumDist;
    let chosen = -1;
    for (let j = 0; j < n; j++) {
      r -= distSq[j];
      if (r <= 0) { chosen = j; break; }
    }
    if (chosen === -1) chosen = Math.floor(Math.random() * n);
    centroids.push(embeddings[chosen]);
  }
  
  let assignments = new Array(n).fill(-1);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    
    // Assign to nearest
    for (let i = 0; i < n; i++) {
      const e = embeddings[i];
      let minDist = Infinity;
      let bestC = -1;
      for (let j = 0; j < k; j++) {
        const c = centroids[j];
        let dist = 0;
        for (let dim = 0; dim < d; dim++) dist += Math.pow(e[dim] - c[dim], 2);
        if (dist < minDist) { minDist = dist; bestC = j; }
      }
      if (assignments[i] !== bestC) {
        assignments[i] = bestC;
        changed = true;
      }
    }
    if (!changed) break;
    
    // Recompute centroids
    const newCentroids = Array(k).fill(0).map(() => Array(d).fill(0));
    const counts = Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const cIdx = assignments[i];
      counts[cIdx]++;
      for (let dim = 0; dim < d; dim++) newCentroids[cIdx][dim] += embeddings[i][dim];
    }
    
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        for (let dim = 0; dim < d; dim++) centroids[j][dim] = newCentroids[j][dim] / counts[j];
      }
    }
  }
  return assignments;
}

function scoreCaseForTiebreak(c) {
  let score = 0;
  
  // a) Completeness bonus
  if (hasContent(c.hidden_data) && hasContent(c.intended_approach_summary)) {
    score += 100; // Big bonus for completeness
  } else if (hasContent(c.hidden_data) || hasContent(c.intended_approach_summary)) {
    score += 40; // Partial bonus
  }
  
  // b) Specificity/Concreteness
  const specifics = ['million', 'billion', '%', 'revenue', 'cost', 'market', 'competitor', 'users', 'growth', 'margin', 'acquisition', 'price'];
  const textLower = ((c.premise_summary || '') + ' ' + (c.opening_question || '')).toLowerCase();
  const specificCount = specifics.filter(s => textLower.includes(s)).length;
  score += specificCount * 2;
  
  // c) Length
  const len = textLower.length;
  if (len > 100 && len < 800) score += 10;
  else if (len >= 800) score -= 5;
  else if (len <= 100) score -= 10;
  
  return score + Math.random(); // tie-breaker
}

async function run() {
  console.log('Fetching cases...');
  const { data: cases, error } = await supabase.from('cases').select('*');
  if (error) { console.error(error); return; }
  
  let ineligibleTotal = 0;
  const report = {};
  const backfillList = [];
  const selectedIds = new Set();
  
  for (const track of Object.keys(TARGETS)) {
    for (const [subtype, targetCount] of Object.entries(TARGETS[track])) {
      const groupCases = cases.filter(c => c.track === track && c.subtype === subtype);
      if (groupCases.length === 0) continue;
      
      const eligibleCases = groupCases.filter(c => hasContent(c.premise_summary) && hasContent(c.opening_question));
      const ineligible = groupCases.length - eligibleCases.length;
      ineligibleTotal += ineligible;
      
      const K = Math.min(targetCount, eligibleCases.length);
      
      let finalSelected = [];
      if (K > 0) {
        console.log(`Embedding ${eligibleCases.length} cases for ${track} - ${subtype}...`);
        const texts = eligibleCases.map(c => `Title: ${c.title}\nPremise: ${c.premise_summary}\nQuestion: ${c.opening_question}`);
        const embeddings = await getEmbeddings(texts);
        
        const validIndices = embeddings.map((e, idx) => e !== null ? idx : -1).filter(idx => idx !== -1);
        const validEmbeddings = validIndices.map(idx => embeddings[idx]);
        const validEligibleCases = validIndices.map(idx => eligibleCases[idx]);
        
        console.log(`Successfully embedded ${validEmbeddings.length}/${eligibleCases.length} cases.`);
        const actualK = Math.min(K, validEmbeddings.length);
        
        if (actualK > 0) {
          console.log(`Clustering ${track} - ${subtype} into ${actualK} clusters...`);
          const assignments = kmeans(validEmbeddings, actualK);
          
          // Group by cluster
          const clusters = Array.from({ length: actualK }, () => []);
          for (let i = 0; i < validEligibleCases.length; i++) {
            clusters[assignments[i]].push(validEligibleCases[i]);
          }
          
          // Select one from each cluster
          for (let j = 0; j < actualK; j++) {
            if (clusters[j].length > 0) {
              clusters[j].sort((a, b) => scoreCaseForTiebreak(b) - scoreCaseForTiebreak(a));
              finalSelected.push(clusters[j][0]);
            }
          }
        }
      }
      
      const industrySpread = {};
      finalSelected.forEach(c => {
        const tag = getIndustryTag(c.title);
        industrySpread[tag] = (industrySpread[tag] || 0) + 1;
        selectedIds.add(c.id);
        
        if (!hasContent(c.hidden_data) || !hasContent(c.intended_approach_summary)) {
          backfillList.push({
            id: c.id,
            track,
            subtype,
            title: c.title,
            missing: [!hasContent(c.hidden_data) ? 'hidden_data' : null, !hasContent(c.intended_approach_summary) ? 'intended_approach' : null].filter(Boolean).join(' and ')
          });
        }
      });
      
      report[`${track} - ${subtype}`] = {
        total: groupCases.length,
        ineligible,
        eligible: eligibleCases.length,
        target: targetCount,
        selected: finalSelected.length,
        metTarget: finalSelected.length === targetCount,
        industrySpread
      };
    }
  }
  
  console.log('--- CURATION REPORT ---');
  console.log(JSON.stringify(report, null, 2));
  
  console.log(`\nTotal Ineligible across all categories: ${ineligibleTotal}`);
  console.log(`Total Backfill Cases needed: ${backfillList.length}`);
  writeFileSync('backfill_cases.json', JSON.stringify(backfillList, null, 2));
  
  const idsToUpdate = Array.from(selectedIds);
  console.log(`Writing ${idsToUpdate.length} selected IDs to DB...`);
  
  // First, set all to false
  await supabase.from('cases').update({ is_curated: false }).neq('id', 'dummy');
  
  const BATCH_SIZE = 100;
  for (let i = 0; i < idsToUpdate.length; i += BATCH_SIZE) {
    const batch = idsToUpdate.slice(i, i + BATCH_SIZE);
    const { error: updateError } = await supabase
      .from('cases')
      .update({ is_curated: true })
      .in('id', batch);
      
    if (updateError) {
      console.error('Error updating batch:', updateError);
    }
  }
  
  console.log('Done.');
}

run();
