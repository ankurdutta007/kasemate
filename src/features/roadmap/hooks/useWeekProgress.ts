import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'

export type ProgressEvent = {
  id: string
  user_id: string
  created_at: string
  type: string
  module_id: string
  minutes_spent?: number
  score?: number
  source?: string
}

export function useWeekProgress() {
  const { user } = useAuth()
  const [events, setEvents] = useState<ProgressEvent[]>([])
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function fetchProgress() {
      try {
        const { data, error } = await supabase
          .from('rm_progress_events')
          .select('*')
          .eq('user_id', user!.id)

        if (error) throw error

        const evs = data || []
        setEvents(evs)
        
        const completed = new Set<string>()
        evs.forEach(ev => {
          if (ev.type === 'module_done' && ev.module_id) {
            completed.add(ev.module_id)
          }
        })
        setCompletedModuleIds(completed)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user])

  return { events, completedModuleIds, loading, setCompletedModuleIds }
}
