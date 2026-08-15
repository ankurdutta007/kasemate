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
  const { data, error } = await supabase.rpc('get_schema_info'); // if exists, but we can just query pg_catalog if exposed, or just query common table names
  if (error) {
    const { data: d1, error: e1 } = await supabase.from('users').select('*').limit(1);
    console.log('users table:', e1 ? e1.message : 'exists');
    const { data: d2, error: e2 } = await supabase.from('profiles').select('*').limit(1);
    console.log('profiles table:', e2 ? e2.message : 'exists');
  }
})();
