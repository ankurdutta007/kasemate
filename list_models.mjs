import { GoogleGenAI } from '@google/genai';
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

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.list();
    const models = [];
    for await (const model of response) {
      if (model.supportedActions && model.supportedActions.includes('generateContent')) {
        models.push(model.name);
      }
    }
    console.log(JSON.stringify(models, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
