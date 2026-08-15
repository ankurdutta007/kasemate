import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    
    console.log("Calling generateContent...");
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Caught error:", e);
  }
}
test();
