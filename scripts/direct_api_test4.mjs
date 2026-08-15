// Check what the .env key actually is - it starts with AQ. which is an OAuth token, not an API key
// API keys typically start with AIza
import { readFileSync } from 'fs';
const envFile = readFileSync('.env', 'utf-8');
const KEY = envFile.match(/GEMINI_API_KEY="(.*?)"/)[1];
console.log('Key prefix:', KEY.substring(0, 30));
console.log('Key type analysis:');
console.log('  Starts with AIza (API key):', KEY.startsWith('AIza'));
console.log('  Starts with AQ. (OAuth token):', KEY.startsWith('AQ.'));
console.log('  Key length:', KEY.length);

// AQ. tokens are short-lived OAuth 2.0 access tokens - they expire
// They CANNOT be used as ?key= query param - they need Authorization: Bearer header
// But the script generate_solutions.mjs reads the same key and passes it to GoogleGenAI SDK
// The SDK knows to use Bearer when it sees an AQ. token? Let's check.
console.log('\nAttempting with Bearer header instead of ?key= param...');
const MODEL = 'gemini-3.6-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const resp = await fetch(url, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${KEY}`
  },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Say OK.' }] }],
    generationConfig: { temperature: 0 }
  })
});
const body = await resp.json();
console.log(`With Bearer header: ${resp.status} - ${resp.ok ? 'SUCCESS' : JSON.stringify(body.error)}`);
if (resp.ok) console.log('Reply:', body.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
