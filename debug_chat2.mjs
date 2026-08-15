import dotenv from 'dotenv';
dotenv.config();

console.log("Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "undefined");
console.log("Key first 5 chars:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0,5) : "");
console.log("Does it have newlines or spaces?", JSON.stringify(process.env.GEMINI_API_KEY));
