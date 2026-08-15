import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k) env[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
});

(async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    });
    console.log('Success:', response.text);
  } catch (e) {
    console.error('Error:', e);
  }
})();
