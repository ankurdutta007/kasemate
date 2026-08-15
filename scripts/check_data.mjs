import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const envFile = readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=\"(.*?)\"/)[1];
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=\"(.*?)\"/)[1];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
(async () => {
  const { data } = await supabase.from('cases').select('id, title, is_curated, intended_approach_summary, hidden_data').eq('is_curated', true);
  console.log('Curated cases count:', data?.length);
  const missing = data.filter(c => !c.intended_approach_summary || !c.hidden_data);
  console.log('Missing data count:', missing.length);
  if (missing.length === 0 && data.length > 0) {
    console.log('Example intended_approach_summary:', data[0].intended_approach_summary?.substring(0, 50));
  }
})();
