import { GoogleGenAI } from '@google/genai'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf-8')
let apiKey = ''
for (const line of envFile.split('\n')) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    apiKey = line.split('=')[1].replace(/"/g, '').replace(/'/g, '').trim()
  }
}

console.log('Key length:', apiKey.length)

const ai = new GoogleGenAI({ apiKey })

async function run() {
  try {
    const response = await ai.models.list()
    let models = []
    for await (const model of response) {
      models.push(model.name)
    }
    console.log(models)
  } catch (e) {
    console.error('Error:', e)
  }
}

run()
