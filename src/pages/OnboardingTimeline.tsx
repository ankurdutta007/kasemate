import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import imgLevelHero from '@/imports/onboarding-level-hero.webp'

const OPTIONS = [
  {
    weeks: 4,
    label: '4 Weeks',
    tag: 'Triage mode',
    desc: 'Placement is close. Cover only the highest-impact topics.'
  },
  {
    weeks: 8,
    label: '8 Weeks',
    tag: 'Balanced',
    desc: 'Build real depth across OA prep and case interviews.'
  },
  {
    weeks: 12,
    label: '12 Weeks',
    tag: 'Full prep',
    desc: 'Complete coverage — OA, cases, CV, and company-specific prep.'
  }
]

export default function OnboardingTimeline() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedWeeks, setSelectedWeeks] = useState<number>(8)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleContinue = async () => {
    if (!user) return
    setIsSubmitting(true)
    setErrorMsg('')
    
    try {
      const storedTracks = localStorage.getItem('rm-tracks')
      let selectedTracks = ['consulting']
      if (storedTracks) {
        try {
          const parsed = JSON.parse(storedTracks)
          if (Array.isArray(parsed) && parsed.length > 0) {
            selectedTracks = parsed
          }
        } catch (e) {
          console.warn('Failed to parse rm-tracks', e)
        }
      }
      
      const { error: err1 } = await supabase.from('rm_onboarding').upsert({
        user_id: user.id,
        role: 'multi',
        level: 'some',
        tracks: selectedTracks,
        weeks: selectedWeeks,
        completed: true
      }, { onConflict: 'user_id' })
      if (err1) throw err1

      const { error: err2 } = await supabase.from('rm_plans').upsert({
        user_id: user.id,
        status: 'active',
        tracks: selectedTracks,
        total_weeks: selectedWeeks,
        week_plan: []
      }, { onConflict: 'user_id' })
      if (err2) throw err2

      await supabase.auth.updateUser({ 
        data: { onboarded: true, difficulty_level: 'some' } 
      })

      navigate('/roadmap?reveal=true')
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6vh', paddingBottom: 48, paddingLeft: 24, paddingRight: 24, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Step 2 of 2</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Setup</span>
          </div>
          <div style={{ height: 3, backgroundColor: 'var(--bg3)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: '100%', borderRadius: 2, background: 'linear-gradient(90deg, var(--primary-mid), var(--primary))' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <img src={imgLevelHero} alt="Timeline" style={{ width: '100%', maxWidth: 480, height: 180, objectFit: 'cover', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }} />
        </div>

        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 34, fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em', textAlign: 'center' }}>
          How long is your runway?
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.6, textAlign: 'center' }}>
          Pick your prep timeline. You can always change this later.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {OPTIONS.map(opt => {
            const isSelected = selectedWeeks === opt.weeks
            return (
              <button key={opt.weeks} onClick={() => setSelectedWeeks(opt.weeks)}
                style={{ textAlign: 'left', padding: '16px 20px', borderRadius: 14, border: `2px solid ${isSelected ? 'var(--primary-bright)' : 'var(--border)'}`, backgroundColor: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s', fontFamily: 'Inter, sans-serif', boxShadow: isSelected ? 'var(--card-shadow)' : 'none' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 100, flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{opt.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--primary-bright)', fontWeight: 600 }}>{opt.tag}</span>
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--text-muted)' }}>
                    {opt.desc}
                  </div>
                </div>
                {isSelected && (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--primary-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</div>
                )}
              </button>
            )
          })}
        </div>

        <button disabled={isSubmitting} onClick={handleContinue}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--primary-mid), var(--primary))', color: '#fff', fontSize: 16, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(66,16,61,0.4)', transition: 'all 0.2s', opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Building...' : 'Build my roadmap →'}
        </button>
        
        {errorMsg && (
          <div style={{ marginTop: 16, color: 'var(--coral, #f43f5e)', fontSize: 13, textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  )
}
