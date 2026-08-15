import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import OnboardingRole from './OnboardingRole'
import PlanReveal from '../features/roadmap/PlanReveal'
import RoadmapDashboard from '../features/roadmap/RoadmapDashboard'

export default function Roadmap() {
  const [searchParams] = useSearchParams()
  const preview = searchParams.get('preview')
  const showReveal = searchParams.get('reveal') === 'true'
  const { user } = useAuth()
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showingReveal, setShowingReveal] = useState(false)

  // TEMP DEV BYPASS — remove before shipping
  if (preview === 'onboarding') {
    return <OnboardingRole />
  }

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('rm_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
      .then(({ data }) => {
        setPlan(data)
        // Show reveal screen if coming fresh from onboarding
        if (data && showReveal) {
          setShowingReveal(true)
        }
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Building your plan...</p>
      </div>
    )
  }

  if (!plan) {
    return <OnboardingRole />
  }

  if (showingReveal) {
    return (
      <PlanReveal 
        plan={plan} 
        onStart={() => setShowingReveal(false)} 
      />
    )
  }

  return <RoadmapDashboard />
}
