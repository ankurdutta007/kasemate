import fs from 'fs'

const key = process.env.GEMINI_API_KEY || ''
console.log('API Key length:', key.length)

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.error) {
    console.error('API Error:', data.error)
    return
  }
  const flashModels = data.models.filter(m => m.name.includes('flash'))
  for (const m of flashModels) {
    console.log(m.name, m.displayName)
  }
}
run()
