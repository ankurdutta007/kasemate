import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

async function testGrading() {
  // 1. Get a random case
  const { data: cases } = await supabase.from('cases').select('*').limit(1)
  if (!cases || cases.length === 0) {
    console.error('No cases found in DB')
    process.exit(1)
  }
  const caseData = cases[0]

  // 2. Create a mock session
  const mockHistory = [
    { role: 'interviewer', text: caseData.opening_question, turnNum: 0 },
    { role: 'user', text: "I'd like to structure this by looking at revenues and costs. For revenues, let's look at price and volume.", turnNum: 1 },
    { role: 'interviewer', text: "Great, let's start with revenues. What do you think is driving volume down?", turnNum: 2 },
    { role: 'user', text: "Volume might be down due to increased competition or a change in consumer preferences.", turnNum: 3 }
  ]

  const { data: session, error } = await supabase.from('interview_sessions').insert({
    case_id: caseData.id,
    subtype: caseData.subtype,
    conversation_history: mockHistory,
    status: 'active'
  }).select('id').single()

  if (error || !session) {
    console.error('Failed to insert session', error)
    process.exit(1)
  }

  console.log('Created test session:', session.id)

  // 3. Call the API
  console.log('Calling /api/grade for session...')
  const res = await fetch('http://localhost:8443/api/grade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: session.id })
  })

  if (!res.ok) {
    console.error('API failed:', res.status, await res.text())
    process.exit(1)
  }

  const data = await res.json()
  console.log('Grading Result JSON:')
  console.log(JSON.stringify(data, null, 2))
}

testGrading().catch(console.error)
