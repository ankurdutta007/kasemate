import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import logo from '../imports/logo.webp'
import FeedbackModal from '../components/FeedbackModal'
import { invalidateDashboardCache } from './Dashboard'

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid var(--border)', gap: 24 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: desc ? 3 : 0 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>}
      </div>
      {children}
    </div>
  )
}

function Seg({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const getColor = (o: string) => {
    if (o === 'Consulting') return 'var(--coral)'
    if (o === 'Product') return 'var(--primary-bright)'
    if (o === 'Both') return '#3B82F6' // Distinct Blue
    if (o === 'Easy') return 'var(--teal)'
    if (o === 'Medium') return '#EAB308' // Yellow
    if (o === 'Hard') return '#DC2626' // Red
    if (o === 'Voice') return 'var(--text-primary)'
    if (o === 'Text') return 'var(--text-primary)'
    return 'var(--text-primary)'
  }

  return (
    <div style={{ display: 'flex', backgroundColor: 'var(--bg3)', borderRadius: 8, padding: 3, gap: 2, flexShrink: 0 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer', backgroundColor: value === o ? getColor(o) : 'transparent', color: value === o ? 'var(--bg)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
          {o}
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { user, signOut } = useAuth()

  const trackConfig: Record<string, { label: string; bg: string; color: string; border: string; activeBg: string }> = {
    product: { label: 'Product', bg: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: 'rgba(124,58,237,0.3)', activeBg: 'rgba(124,58,237,0.15)' },
    consulting: { label: 'Consulting', bg: 'rgba(239,68,68,0.08)', color: '#EF4444', border: 'rgba(239,68,68,0.3)', activeBg: 'rgba(239,68,68,0.15)' },
    analyst: { label: 'Data & Analyst', bg: 'rgba(20,184,166,0.08)', color: '#14B8A6', border: 'rgba(20,184,166,0.3)', activeBg: 'rgba(20,184,166,0.15)' },
    general: { label: 'General Mgmt', bg: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: 'rgba(245,158,11,0.3)', activeBg: 'rgba(245,158,11,0.15)' },
  }

  const weekConfig: Record<number, { label: string; sublabel: string; color: string; bg: string; border: string }> = {
    4: { label: '4 Weeks', sublabel: 'Triage mode', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
    8: { label: '8 Weeks', sublabel: 'Balanced', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.25)' },
    12: { label: '12 Weeks', sublabel: 'Full prep', color: '#14B8A6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)' },
  }

  const [roadmapData, setRoadmapData] = useState<{ tracks: string[], weeks: number } | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('rm_onboarding')
      .select('tracks, weeks')
      .eq('user_id', user.id)
      .eq('completed', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRoadmapData(data)
      })
  }, [user])


  const [editingTracks, setEditingTracks] = useState(false)
  const [draftTracks, setDraftTracks] = useState<string[]>([])
  
  const [editingWeeks, setEditingWeeks] = useState(false)
  const [draftWeeks, setDraftWeeks] = useState<number>(4)


  
  const [saving, setSaving] = useState(false)

  const handleSaveRoadmap = async () => {
    if (!user) return
    setSaving(true)
    
    try {
      const selectedTracks = editingTracks ? draftTracks : roadmapData?.tracks || [];
      const selectedWeeks = editingWeeks ? draftWeeks : roadmapData?.weeks || 4;

      if (selectedTracks.length === 0) {
        setSaving(false)
        return;
      }

      // 1. Save new onboarding data
      await supabase
        .from('rm_onboarding')
        .upsert({
          user_id: user.id,
          tracks: selectedTracks,
          weeks: selectedWeeks,
          role: 'multi',
          level: 'some',
          completed: true
        }, { onConflict: 'user_id' })

      // 2. Delete old plan entirely (not just clear week_plan)
      await supabase
        .from('rm_plans')
        .delete()
        .eq('user_id', user.id)

      // 3. Delete all progress events — fresh start
      await supabase
        .from('rm_progress_events')
        .delete()
        .eq('user_id', user.id)

      // 4. Insert new empty plan so compiler runs fresh
      await supabase
        .from('rm_plans')
        .insert({
          user_id: user.id,
          status: 'active',
          tracks: selectedTracks,
          total_weeks: selectedWeeks,
          week_plan: []
        })

      // 5. Update roadmapData local state
      setRoadmapData({ tracks: selectedTracks, weeks: selectedWeeks })
      setEditingTracks(false)
      setEditingWeeks(false)

      // 6. Navigate to reveal screen after short delay
      setTimeout(() => navigate('/roadmap?reveal=true'), 300)

    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, minHeight: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate(-1)} style={{ width: 34, height: 34, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.15s', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg2)'} aria-label="Go back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 34, fontWeight: 400, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Settings</h1>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 32px' }}>Update your interview preferences here.</p>

        {/* Roadmap Settings */}
        <div style={{
          backgroundColor: 'var(--bg2)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)',
          marginBottom: 16
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Roadmap
            </div>
          </div>

          {/* Roadmap tracks row */}
          <div style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ marginTop: 2 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                Prep tracks
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Roles your roadmap is built around
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
              {editingTracks ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: 260 }}>
                    {['product', 'consulting', 'analyst', 'general'].map(t => {
                      const selected = draftTracks.includes(t)
                      const config = trackConfig[t.toLowerCase()] || { label: t, bg: 'var(--bg3)', color: 'var(--text-muted)', border: 'var(--border)', activeBg: 'var(--bg3)' }
                      return (
                        <button key={t} onClick={() => setDraftTracks(prev => {
                          if (prev.includes(t)) {
                            if (prev.length === 1) return prev
                            return prev.filter(x => x !== t)
                          }
                          return [...prev, t]
                        })}
                          style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                            background: selected ? config.activeBg : 'var(--bg3)',
                            color: selected ? config.color : 'var(--text-muted)',
                            border: `1.5px solid ${selected ? config.border : 'var(--border)'}`,
                            textAlign: 'center'
                          }}>
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                  {draftTracks.length === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
                      Select at least one track
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {roadmapData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, justifyContent: 'flex-end', marginLeft: 'auto' }}>
                      {roadmapData.tracks.map(track => {
                        const c = trackConfig[track.toLowerCase()] || { label: track, bg: 'var(--bg3)', color: 'var(--text-muted)', border: 'var(--border)', activeBg: 'var(--bg3)' }
                        return (
                          <div key={track} style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            background: c.bg,
                            color: c.color,
                            border: `1.5px solid ${c.border}`,
                            fontFamily: 'Inter, sans-serif',
                            textAlign: 'center'
                          }}>
                            {c.label}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Not set up</span>
                  )}
                  <button
                    onClick={() => { setDraftTracks(roadmapData?.tracks || []); setEditingTracks(true); }}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg3)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Prep timeline row */}
          <div style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16
          }}>
            <div style={{ marginTop: 2 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                Prep timeline
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                How many weeks your roadmap covers
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
              {editingWeeks ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[4, 8, 12].map(w => {
                      const selected = draftWeeks === w
                      const config = weekConfig[w as 4|8|12]
                      return (
                        <button key={w} onClick={() => setDraftWeeks(w)}
                          style={{
                            padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            background: selected ? config.bg : 'var(--bg3)',
                            border: selected ? `2px solid ${config.border}` : '1.5px solid var(--border)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 90
                          }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: selected ? config.color : 'var(--text-muted)' }}>
                            {config.label}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: selected ? config.color : 'var(--text-muted)', opacity: selected ? 0.8 : 0.6 }}>
                            {config.sublabel}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {roadmapData ? (
                    <div style={{
                      padding: '6px 18px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary-bright)',
                      border: '1.5px solid rgba(124,58,237,0.25)',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {roadmapData.weeks} weeks
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Not set up</span>
                  )}
                  <button
                    onClick={() => { setDraftWeeks(roadmapData?.weeks || 4); setEditingWeeks(true); }}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg3)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {(editingTracks || editingWeeks) && (
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, backgroundColor: 'var(--bg2)' }}>
              <button onClick={() => {
                setEditingTracks(false);
                setEditingWeeks(false);
                setDraftTracks(roadmapData?.tracks || []);
                setDraftWeeks(roadmapData?.weeks || 4);
              }} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Cancel
              </button>
              <button onClick={handleSaveRoadmap} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg, var(--primary-mid), var(--primary))', border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          )}
        </div>


        <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: '0 22px', marginBottom: 16, boxShadow: 'var(--card-shadow)' }}>
          <SettingRow label="Appearance" desc="Switch between dark and light mode">
            <button onClick={toggle}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9, border: `1.5px solid ${theme === 'dark' ? 'var(--violet)' : 'var(--border-strong)'}`, backgroundColor: theme === 'dark' ? 'var(--violet-subtle)' : 'var(--bg3)', color: theme === 'dark' ? 'var(--violet)' : 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {theme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'}
            </button>
          </SettingRow>
          <SettingRow label="Email" desc="Your college account. Cannot be changed.">
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', backgroundColor: 'var(--bg3)', padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)' }}>
              {user?.email || 'Loading...'}
            </span>
          </SettingRow>
          <SettingRow label="Give feedback" desc="Found a bug or have a suggestion? Let us know.">
            <button onClick={() => setShowFeedback(true)}
              style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Give feedback
            </button>
          </SettingRow>
          <div style={{ padding: '18px 0', textAlign: 'center' }}>
            <button onClick={async () => {
              await signOut()
              navigate('/auth')
            }}
              style={{ padding: '12px 24px', width: '100%', borderRadius: 8, border: '1px solid rgba(224,82,82,0.25)', backgroundColor: 'var(--coral-subtle)', color: 'var(--coral)', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Log out
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <img src={logo} alt="KaseMate Logo" style={{ width: 20, height: 20, borderRadius: 5, objectFit: 'cover' }} />
            <span style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>KaseMate</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>v1.0 · Verified by Placement Batch of 2025-26</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Made with ❤️ by Ankur Dutta — Placement Season 2026-27.</span>
          </div>
        </div>
      </div>
      
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  )
}
