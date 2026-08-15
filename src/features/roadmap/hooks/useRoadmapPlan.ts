import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { compilePlan, type CompiledPlan } from '../../../lib/roadmap-compiler'

export function useRoadmapPlan() {
  const { user } = useAuth()
  const [plan, setPlan] = useState<CompiledPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function fetchAndCompile() {
      try {
        const { data, error: fetchError } = await supabase
          .from('rm_plans')
          .select('*')
          .eq('user_id', user!.id)
          .eq('status', 'active')
          .maybeSingle()

        if (fetchError) {
          setError(fetchError.message)
          setLoading(false)
          return
        }

        if (!data) {
          setPlan(null)
          setLoading(false)
          return
        }

        // Validate total_weeks — must be 4, 8, or 12
        let weeks = data.total_weeks as number
        if (![4, 8, 12].includes(weeks)) {
          if (weeks <= 5) weeks = 4
          else if (weeks <= 10) weeks = 8
          else weeks = 12
        }

        const tracks = data.tracks || ['consulting']

        // Always recompile from the new library.
        // The DB week_plan may be stale (old shape). We keep week_plan as the
        // cache invalidation signal: if it is non-empty AND has the new shape
        // (weeks[0].moduleIds exists), skip recompile and deserialise instead.
        const weekPlan: any[] = Array.isArray(data.week_plan) ? data.week_plan : []
        const hasNewShape = weekPlan.length > 0 && Array.isArray(weekPlan[0]?.moduleIds)

        if (hasNewShape) {
          // Reconstruct a CompiledPlan from the stored weeks so we don't re-hit
          // the compiler on every navigation, but fill in derived totals.
          const compiled = compilePlan(tracks, weeks as 4 | 8 | 12)
          // Use stored weeks (preserves server-side saved order) but trust
          // compiler-derived totals for counts.
          setPlan({ ...compiled, weeks: weekPlan })
          setLoading(false)
          return
        }

        // Either empty week_plan or old shape — recompile and persist.
        const compiled = compilePlan(tracks, weeks as 4 | 8 | 12)

        console.log('Compiling plan:', tracks, weeks, '→', compiled.totalModules, 'modules')

        const { error: updateError } = await supabase
          .from('rm_plans')
          .upsert({
            id: data.id,
            user_id: data.user_id,
            status: data.status,
            tracks: data.tracks,
            total_weeks: weeks,
            week_plan: compiled.weeks,
          })

        if (updateError) {
          console.error('Upsert failed:', updateError)
          // Still set plan so the user sees something
        }

        setPlan(compiled)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAndCompile()
  }, [user])

  return { plan, loading, error }
}
