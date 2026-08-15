// Try multiple models with the .env file key
import { readFileSync } from 'fs';
const envFile = readFileSync('.env', 'utf-8');
const KEY = envFile.match(/GEMINI_API_KEY="(.*?)"/)[1];
console.log('Key prefix:', KEY.substring(0, 20));

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];

for (const MODEL of MODELS) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
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
    console.log(`${MODEL}: SUCCESS - reply="${body.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}"`);
    break;
  } else {
    console.log(`${MODEL}: FAILED (${resp.status}) - ${body.error?.message?.substring(0,80)}`);
  }
}
