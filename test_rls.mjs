import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].replace(/"/g, '').trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].replace(/"/g, '').trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Querying interview_sessions without any auth token...");
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('id, user_id, status')
    .limit(5);
  
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log(`Success! Retrieved ${data?.length} rows.`);
    console.log("Sample data:", data);
  }
}
test();
