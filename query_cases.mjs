import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k) env[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

(async () => {
  const { data } = await supabase.from('cases').select('*').limit(3);
  data.forEach(d => {
    console.log(`\n=== ${d.title} ===`);
    console.log(`Title: ${d.title}`);
    console.log(`Premise Summary: ${d.premise_summary}`);
    console.log(`Opening Question: ${d.opening_question}`);
  });
})();
