import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=\"(.*?)\"/)[1];
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=\"(.*?)\"/)[1];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  const { data } = await supabase.from('cases').select('id').eq('is_curated', true).limit(1);
  const caseId = data[0].id;

  const res = await fetch('http://localhost:8443/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      case_id: caseId,
      conversation_history: [
        { role: 'user', text: "Let's start the case interview now. Please introduce yourself and ask the opening question." },
        { role: 'interviewer', text: "Hello! I am ready. What is 2+2?" }
      ],
      latest_user_message: '4',
      is_initialization: false,
    })
  });
  
  const text = await res.text();
  console.log('Response status:', res.status);
  console.log('Response body:', text);
})();
