import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('cases').select('id').limit(1).single();
  if (error || !data) {
    console.error("DB error:", error);
    return;
  }
  
  console.log("Using case ID:", data.id);
  
  try {
    const res = await fetch('http://127.0.0.1:8443/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: data.id,
        is_initialization: true,
        persona_bio: "Former consultant and engagement manager.",
        interviewer_name: "Arjun V."
      })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
