import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY="(.*?)"/)[1];

const supabase = createClient(url, key);

async function run() {
  console.log('Attempting to submit feedback as anonymous user...');
  const { data, error } = await supabase.from('feedback').insert({
    message: 'Automated test feedback from backend script',
    user_id: null,
    page_url: 'http://localhost:8444/test'
  }).select();
  
  if (error) {
    console.error('FAILED!', error.message, error.details, error.hint);
  } else {
    console.log('SUCCESS! Feedback recorded:', data);
  }
}
run();
