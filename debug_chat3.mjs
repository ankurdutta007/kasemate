import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Clear Google credentials from env for this process
    delete process.env.GOOGLE_CREDENTIALS;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    const ai = new GoogleGenAI({ apiKey });
    
    console.log("Calling generateContent...");
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Caught error:", e);
  }
}
test();
