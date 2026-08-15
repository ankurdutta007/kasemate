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
    const response = await ai.models.embedContent({
      model: 'embedding-001',
      contents: ['Hello', 'World']
    });
    console.log('Success, embedding length:', response.embeddings[0].values.length);
  } catch (e) {
    console.error('Error with text-embedding-004:', e);
  }
})();
