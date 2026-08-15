const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

(async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    });
    console.log('Success:', response.text);
  } catch (e) {
    console.error('Error:', e);
  }
})();
