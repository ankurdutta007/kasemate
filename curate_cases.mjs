import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const url = envFile.match(/VITE_SUPABASE_URL=\"(.*?)\"/)[1];
const key = envFile.match(/VITE_SUPABASE_ANON_KEY=\"(.*?)\"/)[1];
const supabase = createClient(url, key);

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

const HIGH_QUALITY_SOURCES = [
  'Harvard', 'Wharton', 'IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta',
  'ISB', 'XLRI Jamshedpur', 'MDI Gurgaon', 'IIT Bombay', 'Case in Point',
  'FMS Delhi', 'IIT Kanpur', 'IIT BHU', 'The Product Folks', 'Product School',
  'PM School', 'Decode & Conquer', 'Cracking the PM Interview'
];

function jaccardSimilarity(s1, s2) {
  const set1 = new Set(s1.toLowerCase().split(/\s+/));
  const set2 = new Set(s2.toLowerCase().split(/\s+/));
  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }
  return intersection / (set1.size + set2.size - intersection);
}

function scoreCase(c) {
  let score = 0;
  
  if (c.source_book && HIGH_QUALITY_SOURCES.some(s => c.source_book.includes(s))) {
    score += 2;
  }
  
  const textLen = (c.premise_summary || '').length + (c.opening_question || '').length;
  if (textLen > 150) score += 2;
  else if (textLen > 80) score += 1;
  
  const textLower = ((c.premise_summary || '') + ' ' + (c.opening_question || '')).toLowerCase();
  const specifics = ['million', 'billion', 'percent', '%', 'revenue', 'cost', 'market', 'users', 'growth'];
  const specificCount = specifics.filter(s => textLower.includes(s)).length;
  score += specificCount * 0.5;
  
  return score + Math.random() * 0.1; // Random tie-breaker
}

async function run() {
  console.log('Fetching all cases...');
  const { data: cases, error } = await supabase.from('cases').select('*');
  if (error) {
    console.error('Error fetching cases:', error);
    return;
  }
  
  // Merge Market Sizing into Guesstimate locally for grouping (will be updated in DB shortly)
  cases.forEach(c => {
    if (c.track === 'consulting' && c.subtype === 'Market Sizing') {
      c.subtype = 'Guesstimate';
    }
  });

  const selectedIds = new Set();
  const report = {};

  for (const track of Object.keys(TARGETS)) {
    for (const [subtype, targetCount] of Object.entries(TARGETS[track])) {
      const groupCases = cases.filter(c => c.track === track && c.subtype === subtype);
      if (groupCases.length === 0) continue;
      
      const beforeCount = groupCases.length;
      
      // Deduplicate
      const uniqueCases = [];
      for (const c of groupCases) {
        const textToMatch = c.title + ' ' + (c.opening_question || '').slice(0, 100);
        let isDuplicate = false;
        
        for (const u of uniqueCases) {
          const uText = u.title + ' ' + (u.opening_question || '').slice(0, 100);
          if (jaccardSimilarity(textToMatch, uText) > 0.45) {
            isDuplicate = true;
            // Keep the one with higher score
            if (scoreCase(c) > scoreCase(u)) {
              Object.assign(u, c); // replace
            }
            break;
          }
        }
        if (!isDuplicate) {
          uniqueCases.push(c);
        }
      }
      
      const dedupCount = uniqueCases.length;
      
      // Rank
      uniqueCases.sort((a, b) => scoreCase(b) - scoreCase(a));
      
      // Select with difficulty spread (40% Easy, 40% Medium, 20% Hard)
      const selected = [];
      const buckets = { 'Easy': [], 'Medium': [], 'Hard': [] };
      uniqueCases.forEach(c => {
        if (buckets[c.difficulty]) buckets[c.difficulty].push(c);
        else buckets['Medium'].push(c); // fallback
      });
      
      const targetEasy = Math.round(targetCount * 0.4);
      const targetMedium = Math.round(targetCount * 0.4);
      const targetHard = Math.round(targetCount * 0.2);
      
      let countEasy = 0, countMedium = 0, countHard = 0;
      
      for (const c of uniqueCases) {
        if (selected.length >= targetCount) break;
        
        let chosen = false;
        if (c.difficulty === 'Easy' && countEasy < targetEasy) { countEasy++; chosen = true; }
        else if (c.difficulty === 'Medium' && countMedium < targetMedium) { countMedium++; chosen = true; }
        else if (c.difficulty === 'Hard' && countHard < targetHard) { countHard++; chosen = true; }
        
        if (!chosen) {
          selected.push(c);
        } else {
          selected.push(c);
        }
      }
      
      selected.forEach(c => selectedIds.add(c.id));
      
      const diffSpread = { Easy: 0, Medium: 0, Hard: 0 };
      selected.forEach(c => diffSpread[c.difficulty] = (diffSpread[c.difficulty] || 0) + 1);
      
      report[`${track} - ${subtype}`] = {
        before: beforeCount,
        afterDedup: dedupCount,
        finalSelected: selected.length,
        target: targetCount,
        diffSpread
      };
    }
  }
  
  console.log('--- CURATION REPORT ---');
  console.log(JSON.stringify(report, null, 2));
  
  const idsToUpdate = Array.from(selectedIds);
  console.log(`Writing ${idsToUpdate.length} selected IDs to DB...`);
  
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
