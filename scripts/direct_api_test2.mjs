// Test with the exact model used in api/chat.ts
import { readFileSync } from 'fs';
const envFile = readFileSync('.env', 'utf-8');
const KEY_FROM_FILE = envFile.match(/GEMINI_API_KEY="(.*?)"/)[1];

const MODEL = 'gemini-3.6-flash';

async function testKey(label, key) {
  if (!key) { console.log(`${label}: undefined, skipping`); return; }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Say OK.' }] }],
      generationConfig: { temperature: 0 }
    })
  });
  const body = await resp.json();
  if (resp.ok) {
    console.log(`${label}: SUCCESS - reply="${body.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}"`);
  } else {
    console.log(`${label}: FAILED (${resp.status}) - ${JSON.stringify(body.error)}`);
  }
}

await testKey('.env file key with gemini-3.6-flash', KEY_FROM_FILE);
