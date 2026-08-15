import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCases } from '../context/CasesContext'
import { useAuth } from '../context/AuthContext'
import img12 from '@/imports/image-12.webp'
import img13 from '@/imports/image-13.webp'
import { getScoreColor, getTargetedNextCase } from '../lib/utils'

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = getScoreColor(score)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-strong)" strokeWidth={size * 0.065} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={size * 0.065} strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: size * 0.22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.1, color: 'var(--text-muted)', marginTop: 2 }}>/100</span>
      </div>
    </div>
  )
}

function MiniRing({ score, size = 36 }: { score: number; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = getScoreColor(score)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-strong)" strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3} strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
    </svg>
  )
}

export default function Feedback() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cases } = useCases()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [prevScore, setPrevScore] = useState<number | null>(null)
  const [completedCases, setCompletedCases] = useState<Set<string>>(new Set())
  const [userTracks, setUserTracks] = useState<string[]>(['consulting', 'product'])

  useEffect(() => {
    if (user) {
      supabase
        .from('rm_onboarding')
        .select('tracks')
        .eq('user_id', user.id)
        .eq('completed', true)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.tracks) setUserTracks(data.tracks)
        })
    }
  }, [user])

  const handleStartNextCase = (dimension?: string) => {
    if (dimension) {
      navigate(`/hub?focus=${encodeURIComponent(dimension)}`)
      return
    }
    const diffPref = user?.user_metadata?.difficulty_level
    const next = getTargetedNextCase(cases, completedCases, userTracks, diffPref)
    navigate(`/case/${next.id}`)
  }

  useEffect(() => {
    const sessionId = location.state?.sessionId || location.state?.historyItem?.id
    if (!sessionId) {
      navigate('/hub')
      return
    }

    async function loadData() {
      const { data: currentSession, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
      
      if (error || !currentSession || !currentSession.grading_result) {
        console.error('Failed to load graded session', error)
        navigate('/hub')
        return
      }

      const { data: caseInfo } = await supabase
        .from('cases')
        .select('title, track, difficulty, subtype')
        .eq('id', currentSession.case_id)
        .single()
      
      currentSession.cases = caseInfo || null
      setSessionData(currentSession)

      let previousSession = null
      if (currentSession.user_id) {
        const { data: previousSessionData } = await supabase
          .from('interview_sessions')
          .select('grading_result')
          .eq('user_id', currentSession.user_id)
          .eq('status', 'completed')
          .not('grading_result', 'is', null)
          .lt('ended_at', currentSession.ended_at || new Date().toISOString())
          .order('ended_at', { ascending: false })
          .limit(1)
          .single()
        previousSession = previousSessionData
        
        // Also fetch all completed cases for next-case logic
        const { data: compData } = await supabase
          .from('interview_sessions')
          .select('case_id')
          .eq('user_id', currentSession.user_id)
          .eq('status', 'completed')
        
        if (compData) {
          setCompletedCases(new Set(compData.map(r => r.case_id)))
        }
      }
        
      if (previousSession && previousSession.grading_result) {
        setPrevScore(previousSession.grading_result.overall)
      } else {
        setPrevScore(null)
      }

      setLoading(false)
    }

    loadData()
  }, [location, navigate])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading feedback data...</div>
      </div>
    )
  }

  const { grading_result, cases: caseInfo, conversation_history, hints_used } = sessionData
  const cameFromHistory = !!location.state?.historyItem || !!location.state?.fromBrowse
  const track = caseInfo?.track || 'consulting'
  
  const turns = conversation_history?.filter((t:any) => t.role === 'user').length || 0
  const userTurns = conversation_history?.filter((t:any) => t.role === 'user').map((t:any) => t.text) || []
  
  const created = new Date(sessionData.created_at)
  const ended = new Date(sessionData.ended_at || sessionData.updated_at)
  const elapsedSeconds = Math.max(0, Math.floor((ended.getTime() - created.getTime()) / 1000))
  
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const overall = grading_result.overall || 0
  const delta = prevScore !== null ? overall - prevScore : 0

  const displayOverall = Math.round(overall)
  const displayPrev = prevScore !== null ? Math.round(prevScore) : null
  const displayDelta = Math.round(delta)
  
  const DIMENSIONS = [
    { label: 'Structuring', score: grading_result.structuring?.score || 0, icon: '◈', accent: 'var(--primary-bright)', note: grading_result.structuring?.note || '' },
    { label: 'Quant reasoning', score: grading_result.quant_reasoning?.score || 0, icon: '◉', accent: 'var(--amber)', note: grading_result.quant_reasoning?.note || '' },
    { label: 'Business judgment', score: grading_result.business_judgment?.score || 0, icon: '⬡', accent: 'var(--teal)', note: grading_result.business_judgment?.note || '' },
    { label: 'Communication', score: grading_result.communication?.score || 0, icon: '◇', accent: 'var(--violet)', note: grading_result.communication?.note || '' },
  ]

  const weakDim = DIMENSIONS.reduce((a, b) => (a.score < b.score ? a : b))
  const strongDim = DIMENSIONS.reduce((a, b) => (a.score > b.score ? a : b))
  
  const interviewer = location.state?.interviewer || (track === 'consulting'
    ? { name: 'Priya K.', role: 'Ex-McKinsey EM', image: img12 }
    : { name: 'Rahul S.', role: 'Ex-Google PM', image: img13 })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: cameFromHistory ? '24px 24px 40px' : '40px 24px' }}>

        {cameFromHistory && (
          <div style={{ marginBottom: 16 }}>
            <button 
              onClick={() => navigate(-1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px 8px 12px', borderRadius: 12, backgroundColor: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', boxShadow: 'var(--card-shadow)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>
        )}

        {/* ── HEADER ── */}
        <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 20, border: '1px solid var(--border)', padding: '28px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24, boxShadow: 'var(--card-shadow)' }}>
          <ScoreRing score={displayOverall} size={100} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, backgroundColor: track === 'consulting' ? 'var(--coral-subtle)' : 'var(--primary-subtle)', color: track === 'consulting' ? 'var(--coral)' : 'var(--primary-bright)' }}>
                {track === 'consulting' ? 'Consulting' : 'Product'}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, backgroundColor: 'var(--bg3)', color: 'var(--text-muted)' }}>
                {sessionData.subtype || caseInfo?.subtype}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, backgroundColor: 'var(--bg3)', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                ◷ {formatTime(elapsedSeconds)}
              </span>
              {hints_used > 0 && (
                <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold)' }}>
                  {hints_used} hint{hints_used > 1 ? 's' : ''} used
                </span>
              )}
              {hints_used === 0 && (
                <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, backgroundColor: 'var(--teal-subtle)', color: 'var(--teal)' }}>
                  No hints ✓
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {caseInfo?.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Overall: <strong style={{ color: displayOverall >= 75 ? 'var(--teal)' : 'var(--amber)' }}>{displayOverall}/100</strong>
              </span>
              {displayPrev !== null && (
                <span style={{ fontSize: 13, color: displayDelta >= 0 ? 'var(--teal)' : 'var(--coral)', fontWeight: 600 }}>
                  {displayDelta >= 0 ? '↑' : '↓'}{Math.abs(displayDelta)} vs last rep
                </span>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Interviewer: {interviewer.name} · {interviewer.role}</span>
            </div>
          </div>
        </div>

        {/* ── SNAPSHOT CARDS ── */}
        <div className="multi-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Best dimension', value: strongDim.label, sub: `Score: ${strongDim.score}`, color: 'var(--teal)', bg: 'var(--teal-subtle)' },
            { label: 'Focus area', value: weakDim.label, sub: `Score: ${weakDim.score}`, color: 'var(--amber)', bg: 'var(--amber-subtle)' },
            { label: 'Turns completed', value: `${turns}`, sub: `${turns >= 5 ? 'Full case' : turns >= 3 ? 'Partial' : 'Short rep'}`, color: 'var(--primary-bright)', bg: 'var(--primary-subtle)' },
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', padding: '14px 16px', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color, marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── WHAT YOU SAID ── */}
        {userTurns.length > 0 && (
          <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 22px', marginBottom: 16, boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--primary-bright)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Key moments from your session</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {userTurns.slice(0, 3).map((text: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 1, flexShrink: 0 }}>T{i + 1}</span>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic', borderLeft: `2px solid ${i === 0 ? 'var(--teal)' : i === 1 ? 'var(--primary-bright)' : 'var(--border-strong)'}`, paddingLeft: 10 }}>
                    "{text.length > 120 ? text.slice(0, 120) + '…' : text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DIMENSIONS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {DIMENSIONS.map((d, i) => (
            <div key={i} style={{ backgroundColor: 'var(--bg2)', borderRadius: 14, border: `1px solid ${d === weakDim ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`, padding: '18px 22px', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: d.accent, flexShrink: 0 }}>
                  {d.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{d.label}</span>
                      {d === weakDim && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, backgroundColor: 'var(--amber-subtle)', color: 'var(--amber)' }}>FOCUS</span>}
                      {d === strongDim && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, backgroundColor: 'var(--teal-subtle)', color: 'var(--teal)' }}>STRONG</span>}
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 17, fontWeight: 700, color: d.score >= 75 ? 'var(--teal)' : d.score >= 60 ? 'var(--amber)' : 'var(--coral)' }}>
                      {d.score}
                    </span>
                  </div>
                  <div style={{ height: 5, backgroundColor: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.score}%`, borderRadius: 3, backgroundColor: d.accent, transition: 'width 0.7s ease' }} />
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: 48 }}>{d.note}</p>
            </div>
          ))}
        </div>

        {/* ── COMPARISON ROW ── */}
        <div className="multi-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {/* Score progress */}
          <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 20px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Score trend</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Last rep</div>
                {displayPrev !== null ? (
                  <>
                    <MiniRing score={displayPrev} />
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>{displayPrev}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 16 }}>--</div>
                )}
              </div>
              <div style={{ fontSize: 20, color: displayDelta >= 0 ? 'var(--teal)' : 'var(--coral)' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>This rep</div>
                <MiniRing score={displayOverall} />
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: displayOverall >= 75 ? 'var(--teal)' : 'var(--amber)', marginTop: 4 }}>{displayOverall}</div>
              </div>
              {displayPrev !== null && (
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: displayDelta >= 0 ? 'var(--teal)' : 'var(--coral)', fontFamily: 'JetBrains Mono, monospace' }}>{displayDelta >= 0 ? '+' : ''}{displayDelta}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>pts {displayDelta >= 0 ? 'gained' : 'dropped'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Session stats */}
          <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 20px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Session stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Duration', value: formatTime(elapsedSeconds), color: 'var(--text-primary)' },
                { label: 'Turns completed', value: `${turns} user turns`, color: 'var(--text-primary)' },
                { label: 'Hints used', value: hints_used === 0 ? 'None ✓' : `${hints_used} hint${hints_used > 1 ? 's' : ''}`, color: hints_used === 0 ? 'var(--teal)' : 'var(--gold)' },
                { label: 'Difficulty', value: caseInfo?.difficulty || 'Medium', color: 'var(--text-muted)' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOCUS AREA ── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'var(--amber-subtle)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>Work on: {weakDim.label}</div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {weakDim.label === 'Quant reasoning'
                ? "Your weakest dimension this rep. Practice Guesstimates and Metrics cases, they're the fastest way to build quant muscle. Aim to always sanity-check your estimates against a reference number."
                : weakDim.label === 'Structuring'
                  ? "Practise stating your driver tree before diving in, even 10 seconds of framing changes how the rest of the answer lands. Try Back-of-Envelope cases to build the habit."
                  : `Focus on ${weakDim.label.toLowerCase()} in your next 2 reps. This tends to improve quickly with deliberate practice.`}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleStartNextCase(weakDim.label)}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--amber)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Practice {weakDim.label} →
              </button>
            </div>
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => handleStartNextCase()}
            style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--primary-mid), var(--primary))', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(66,16,61,0.4)' }}>
            Start next case →
          </button>
          <button onClick={() => navigate('/dashboard')}
            style={{ padding: '13px 22px', borderRadius: 12, border: '1px solid var(--border-strong)', backgroundColor: 'transparent', color: 'var(--text-muted)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Dashboard
          </button>
        </div>

      </div>
    </div>
  )
}
