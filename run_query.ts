import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase
    .from('cases')
    .select('id, title, track, subtype, premise_summary, opening_question')
    .eq('is_curated', true)
    
  if (error) {
    console.error("Error fetching cases:", error)
    return
  }
  
  const flagged = data.filter(c => {
    return !c.premise_summary || 
           !c.opening_question || 
           !c.opening_question.includes('?')
  })
  
  console.log(JSON.stringify(flagged, null, 2))
}

run()
