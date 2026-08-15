import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const envFile = readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=\"(.*?)\"/)[1];
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=\"(.*?)\"/)[1];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
(async () => {
  const { data } = await supabase.from('cases').select('id, intended_approach_summary').eq('is_curated', true).limit(1);
  const summary = data[0].intended_approach_summary;
  console.log('Type of summary:', typeof summary);
  console.log('Length of summary (if string):', summary.length);
  if (typeof summary === 'object') {
    console.log('Summary is object, keys:', Object.keys(summary));
  }
  const summaryStr = typeof summary === 'string' ? summary : JSON.stringify(summary, null, 2);
  console.log('Summary string length:', summaryStr.length);
})();
