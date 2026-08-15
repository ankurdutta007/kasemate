import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
        let [k, ...v] = line.split('=');
        return [k, v.join('=').replace(/^"|"$/g, '')];
    })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testInsert() {
  console.log('Attempting to insert into interview_sessions...');
  const { data, error } = await supabase.from('interview_sessions').insert({
    case_id: 'test-case-id',
    conversation_history: [],
    status: 'active'
  }).select('id').single();

  if (error) {
    console.error('SUPABASE ERROR:', error);
  } else {
    console.log('SUCCESS:', data);
  }
}

testInsert();
