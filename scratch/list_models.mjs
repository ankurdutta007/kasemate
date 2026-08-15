import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

async function run() {
  try {
    const response = await ai.models.list()
    for await (const model of response) {
      console.log(`- ${model.name} (displayName: ${model.displayName})`)
    }
  } catch (e) {
    console.error('Error listing models:', e)
  }
}

run()
