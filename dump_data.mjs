import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

async function run() {
  const { data: users, error: userError } = await supabase.from('interview_sessions').select('user_id').eq('status', 'completed').order('ended_at', { ascending: false }).limit(1)
  if (userError || !users.length) {
    console.error('Failed to get user', userError)
    process.exit(1)
  }
  const userId = users[0].user_id

  const { data: sessions, error } = await supabase.from('interview_sessions').select('id, ended_at, grading_result, case_id').eq('user_id', userId).eq('status', 'completed').order('ended_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching sessions', error)
    process.exit(1)
  }
  
  console.log('USER ID:', userId)
  console.log(`TOTAL COMPLETED SESSIONS: ${sessions.length}`)
  
  sessions.forEach((s, i) => {
    console.log(`[${i+1}] ID: ${s.id}, Date: ${s.ended_at}`)
    if (s.grading_result) {
        console.log(`    Score: ${s.grading_result.overall}, Quant: ${s.grading_result.quant_reasoning?.score}, Struct: ${s.grading_result.structuring?.score}, Biz: ${s.grading_result.business_judgment?.score}, Comms: ${s.grading_result.communication?.score}`)
    }
  })
}

run()
