// Use the actual SDK the same way generate_solutions.mjs does,
// to see if the SDK internally handles the AQ. token differently 
import { readFileSync } from 'fs';
import { GoogleGenAI } from '@google/genai';

const envFile = readFileSync('.env', 'utf-8');
const GEMINI_API_KEY = envFile.match(/GEMINI_API_KEY="(.*?)"/)[1];
console.log('Key prefix from .env:', GEMINI_API_KEY.substring(0, 20));

try {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const result = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: 'Say OK.'
  });
  console.log('SDK SUCCESS:', result.text);
} catch(e) {
  console.log('SDK FAILED:', e.message?.substring(0, 200) || String(e));
}
