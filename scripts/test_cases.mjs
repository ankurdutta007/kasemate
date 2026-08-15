import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const envFile = readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=\"(.*?)\"/)[1];
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=\"(.*?)\"/)[1];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
(async () => {
  const { data: oldCases } = await supabase.from('cases').select('id, intended_approach_summary').eq('is_curated', false).limit(1);
  console.log('Old case summary:', oldCases[0]?.intended_approach_summary);
})();
