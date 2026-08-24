import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { CONSULTING_SUBTYPES, PRODUCT_SUBTYPES, type Case, getCaseCompany, getCasePremise, getCaseTime, getMockHistory } from '../data/cases'
import { useTheme } from '../context/ThemeContext'
import { useCases } from '../context/CasesContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { usePostHog } from '@posthog/react'
import { getTargetedNextCase, getWeakestDimension } from '../lib/utils'
import { HistoryItem } from '../components/HistoryItem'
import imgHubHero from '@/imports/hub-hero-new.webp'
import img12 from '@/imports/image-12.webp'
import img13 from '@/imports/image-13.webp'
import img14 from '@/imports/image-14.webp'
import imgEmptyCases from '@/imports/no-cases-empty.webp'

// v2, renamed to "Learn by Doing", SVG icons, illustration avatars

const CONSULTING_RESOURCES = [
  { n: 'Harvard', c: '#A51C30', darkC: '#FF6B81', font: 'Georgia, serif' },
  { n: 'Wharton', c: '#990000', darkC: '#FF6666', font: 'Georgia, serif' },
  { n: 'IIM Ahmedabad', c: '#7b1113', darkC: '#FF7A7F', font: 'Georgia, serif' },
  { n: 'IIM Bangalore', c: '#003366', darkC: '#66B2FF', font: '"Inter", sans-serif' },
  { n: 'IIM Calcutta', c: '#800000', darkC: '#FF6666', font: 'Georgia, serif' },
  { n: 'ISB', c: '#1b4e9b', darkC: '#5C9DFF', font: '"Inter", sans-serif' },
  { n: 'XLRI Jamshedpur', c: '#003366', darkC: '#66B2FF', font: 'Georgia, serif' },
  { n: 'MDI Gurgaon', c: '#2b2b2b', darkC: '#e0e0e0', font: '"Inter", sans-serif' },
  { n: 'IIT Bombay', c: '#004080', darkC: '#66B2FF', font: '"Inter", sans-serif' },
  { n: 'Case in Point', c: '#2b2b2b', darkC: '#e0e0e0', font: 'Georgia, serif' }
]

const PRODUCT_RESOURCES = [
  { n: 'FMS Delhi', c: '#c0392b', darkC: '#FF8A7A', font: 'Georgia, serif' },
  { n: 'IIT Kanpur', c: '#002058', darkC: '#7AA3FF', font: '"Inter", sans-serif' },
  { n: 'IIT BHU', c: '#004080', darkC: '#66B2FF', font: 'Georgia, serif' },
  { n: 'The Product Folks', c: '#4a154b', darkC: '#D77EE1', font: '"Inter", sans-serif' },
  { n: 'Product School', c: '#d32f2f', darkC: '#FF6B6B', font: '"Inter", sans-serif' },
  { n: 'PM School', c: '#0077b5', darkC: '#4DB8FF', font: '"Inter", sans-serif' },
  { n: 'Decode & Conquer', c: '#2b2b2b', darkC: '#e0e0e0', font: '"Inter", sans-serif' },
  { n: 'Cracking the PM Interview', c: '#2b2b2b', darkC: '#e0e0e0', font: '"Inter", sans-serif' }
]

const MALE_AVATARS = [img13]
const FEMALE_AVATARS = [img12, img14]

// Simple deterministic gender pick by first name
function avatarFor(name: string): string {
  const female = ['Priya', 'Sneha', 'Ananya', 'Neha', 'Riya', 'Pooja', 'Divya', 'Meera']
  const firstName = name.split(' ')[0]
  if (female.includes(firstName)) {
    const idx = female.indexOf(firstName) % FEMALE_AVATARS.length
    return FEMALE_AVATARS[idx]
  }
  return MALE_AVATARS[0]
}

function DiffDots({ difficulty }: { difficulty: Case['difficulty'] }) {
  const filled = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3
  const color = difficulty === 'Easy' ? 'var(--teal)' : difficulty === 'Medium' ? 'var(--amber)' : 'var(--coral)'
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: i < filled ? color : 'var(--bg4)' }} />
      ))}
    </div>
  )
}

function CaseCard({ c, completed, onStart }: { c: Case; completed?: boolean; onStart: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onStart}
      style={{ backgroundColor: hover ? 'var(--surface)' : 'var(--bg2)', border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border)'}`, borderRadius: 14, padding: '18px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: hover ? 'var(--card-shadow)' : 'none' }}
    >
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700, backgroundColor: c.track === 'consulting' ? 'var(--coral-subtle)' : 'var(--primary-subtle)', color: c.track === 'consulting' ? 'var(--coral)' : 'var(--primary-bright)' }}>
          {c.track === 'consulting' ? 'Consulting' : 'Product'}
        </span>
        <span style={{ padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500, backgroundColor: 'var(--bg3)', color: 'var(--text-muted)' }}>
          {c.subtype}
        </span>
        {completed && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginLeft: 'auto' }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ color: '#7C3AED' }}>
              <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Done
          </span>
        )}
      </div>
      <div>
        <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 17, fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 5px', lineHeight: 1.3 }}>{c.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{getCasePremise(c)}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DiffDots difficulty={c.difficulty} />
          <span style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{getCaseTime(c)}m</span>
        </div>
      </div>
    </div>
  )
}

// Reusable SVG icons
function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 2.5L13 8L3 13.5V2.5Z" fill="currentColor" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

// Module-level cache to persist across navigations
let cachedCompletedCases = new Map<string, string>()
let cachedPopulatedData: any[] = []
let cachedRecentHistory: any[] = []
let cachedNextCaseId: string | null = null
let cachedCompletedCount: number = -1
let cachedDifficultyLevel: string | undefined = undefined
let cachedUserTracks: string | undefined = undefined

export default function Hub() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { cases: CASES, loading } = useCases()
  const posthog = usePostHog()
  
  const { user } = useAuth()
  const tab = (searchParams.get('tab') as 'random' | 'browse') || 'random'
  const browseTrack = (searchParams.get('track') as 'consulting' | 'product' | null) || null
  const rawSubtype = searchParams.get('subtype') || null
  const browseSubtype = rawSubtype 
    ? (CONSULTING_SUBTYPES.find(s => s.toLowerCase() === rawSubtype.toLowerCase()) || 
       PRODUCT_SUBTYPES.find(s => s.toLowerCase() === rawSubtype.toLowerCase()) || 
       rawSubtype)
    : null
  const diffFilter = (searchParams.get('diff') as 'All' | 'Easy' | 'Medium' | 'Hard') || 'All'
  const focusParam = searchParams.get('focus') || null
  const completionFilter = (searchParams.get('status') as 'All' | 'Completed') || 'All'
  const [userTracks, setUserTracks] = useState<string[]>(['consulting', 'product'])

  const [completedCases, setCompletedCases] = useState<Map<string, string>>(cachedCompletedCases)
  const [recentHistory, setRecentHistory] = useState<any[]>(cachedRecentHistory)
  const [historyLoading, setHistoryLoading] = useState(cachedRecentHistory.length === 0)
  const [populatedData, setPopulatedData] = useState<any[]>(cachedPopulatedData)

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

  useEffect(() => {
    // If coming from roadmap with track+subtype params, switch to browse mode automatically
    const incomingTrack = searchParams.get('track')
    const incomingSubtype = searchParams.get('subtype')
    if (incomingTrack && incomingSubtype && tab !== 'browse') {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.set('tab', 'browse')
        return next
      })
    }

    if (user && !user.user_metadata?.onboarded) {
      navigate('/onboarding/role', { replace: true })
    }
    
    if (user) {
      supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('ended_at', { ascending: true })
        .then(async ({ data, error }) => {
          if (!error && data) {
            // Populate completedCases map
            const map = new Map<string, string>()
            data.forEach((r: any) => map.set(r.case_id, r.id))
            setCompletedCases(map)
            cachedCompletedCases = map
            
            // Fetch case data
            const caseIds = [...new Set(data.map((s: any) => s.case_id))]
            let casesMap: Record<string, any> = {}
            
            if (caseIds.length > 0) {
              const { data: casesData } = await supabase
                .from('cases')
                .select('id, title, track')
                .in('id', caseIds)
                
              if (casesData) {
                casesMap = casesData.reduce((acc: any, c: any) => {
                  acc[c.id] = c
                  return acc
                }, {})
              }
            }

            const newPopulatedData = data.map((s: any) => ({
              ...s,
              cases: casesMap[s.case_id] || null
            })).filter((s: any) => s.grading_result)
            
            setPopulatedData(newPopulatedData)
            cachedPopulatedData = newPopulatedData
            
            const formattedHistory = [...newPopulatedData].reverse().slice(0, 2).map(s => ({
              id: s.id,
              title: s.cases?.title || 'Practice Case',
              subtype: s.subtype || 'Case',
              track: s.cases?.track || 'consulting',
              name: user?.user_metadata?.full_name || 'Candidate',
              date: s.ended_at,
              score: s.grading_result?.overall || 0
            }))
            
            setRecentHistory(formattedHistory)
            cachedRecentHistory = formattedHistory
          }
          setHistoryLoading(false)
        }, () => setHistoryLoading(false))
    } else {
      setHistoryLoading(false)
    }
  }, [user, navigate])

  // session storage restoration removed so user always lands on "Learn by doing"

  const setTab = (t: string) => {
    if (t === 'browse') posthog.capture('practice_browse_viewed')
    setSearchParams(prev => { const next = new URLSearchParams(prev); next.set('tab', t); return next })
  }
  const setBrowseTrack = (t: string | null) => {
    if (t) posthog.capture('practice_track_filtered', { track: t })
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (t) next.set('track', t); else next.delete('track')
      next.delete('subtype')
      next.delete('diff')
      next.delete('status')
      return next
    })
  }
  const setBrowseSubtype = (s: string | null) => {
    if (s) posthog.capture('practice_category_filtered', { track: browseTrack || 'unknown', category: s })
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (s) next.set('subtype', s); else next.delete('subtype')
      next.delete('diff')
      next.delete('status')
      return next
    })
  }
  const setDiffFilter = (d: string) => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    if (d !== 'All') next.set('diff', d); else next.delete('diff')
    return next
  })
  const setCompletionFilter = (status: string) => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    if (status !== 'All') next.set('status', status); else next.delete('status')
    return next
  })

  const weakest = useMemo(() => getWeakestDimension(populatedData), [populatedData])
  const difficultyLevel = user?.user_metadata?.difficulty_level
  
  const nextCase = useMemo(() => {
    if (CASES.length === 0) return null
    const tracksStr = userTracks.join(',')
    if (!focusParam && cachedNextCaseId && cachedCompletedCount === completedCases.size && cachedDifficultyLevel === difficultyLevel && cachedUserTracks === tracksStr && !completedCases.has(cachedNextCaseId)) {
      const found = CASES.find(c => c.id === cachedNextCaseId)
      if (found) return found
    }
    const completedSet = new Set(Array.from(completedCases.keys()))
    // If focusParam exists, use it. Otherwise, pass undefined to make it a general/varied recommendation.
    const next = getTargetedNextCase(CASES, completedSet, userTracks, difficultyLevel, focusParam || undefined)
    if (!focusParam) {
      cachedNextCaseId = next.id
      cachedCompletedCount = completedCases.size
      cachedDifficultyLevel = difficultyLevel
      cachedUserTracks = tracksStr
    }
    return next
  }, [CASES, completedCases.size, userTracks, focusParam, difficultyLevel])
  const filtered = CASES.filter(c => {
    if (completionFilter === 'Completed' && !completedCases.has(c.id)) return false
    if (browseTrack && c.track !== browseTrack) return false
    if (browseSubtype && c.subtype !== browseSubtype) return false
    if (diffFilter !== 'All' && c.difficulty !== diffFilter) return false
    return true
  }).sort((a, b) => {
    const aComp = completedCases.has(a.id)
    const bComp = completedCases.has(b.id)
    if (aComp && !bComp) return 1
    if (!aComp && bComp) return -1
    return 0
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading practice cases...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 24 }}>
          {/* Header left side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 36, fontWeight: 400, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Practice Hub</h1>
          </div>

          {/* Header right side (Tab switcher) */}
          <div style={{ display: 'inline-flex', width: 346, backgroundColor: 'var(--bg3)', borderRadius: 10, padding: 3, boxSizing: 'border-box' }}>
            {([
              { id: 'random', label: 'Learn by Doing', Icon: IconPlay },
              { id: 'browse', label: 'Browse All', Icon: IconGrid },
            ] as const).map(({ id, label, Icon }) => (
              <button key={id} onClick={() => {
                if (id === 'browse') {
                  posthog.capture('practice_browse_viewed')
                  setSearchParams(prev => {
                    const next = new URLSearchParams(prev)
                    next.set('tab', 'browse')
                    next.delete('track')
                    next.delete('subtype')
                    return next
                  })
                } else {
                  setTab(id)
                }
              }}
                style={{ width: 170, flexShrink: 0, justifyContent: 'center', whiteSpace: 'nowrap', padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer', backgroundColor: tab === id ? 'var(--bg2)' : 'transparent', color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'background-color 0.15s, color 0.15s, box-shadow 0.15s', boxShadow: tab === id ? 'var(--card-shadow)' : 'none', display: 'flex', alignItems: 'center', gap: 7, boxSizing: 'border-box' }}>
                <Icon />
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'random' ? (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {/* Hero card */}
            <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24, boxShadow: 'var(--card-shadow)' }}>

              {/* Illustration banner */}
              <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
                <img src={imgHubHero} alt="Learn by doing" style={{ width: '100%', height: 180, objectFit: 'cover', objectPosition: 'center 60%', display: 'block' }} />
              </div>

              {/* Content */}
              <div style={{ padding: '28px 36px 20px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, backgroundColor: 'var(--primary-subtle)', border: '1px solid rgba(124,58,237,0.2)', marginBottom: 16 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="4" stroke="var(--primary-bright)" strokeWidth="1.5" />
                    <path d="M3.5 5L4.5 6L6.5 4" stroke="var(--primary-bright)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-bright)' }}>Learn by Doing</span>
                </div>

                <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.3 }}>
                  {historyLoading ? 'Loading Your Case...' : (recentHistory.length === 0 ? 'Start Your First Mock Case' : 'Your Next Learning Case Is Ready')}
                </h2>
                {historyLoading && populatedData.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.65 }}>
                    Fetching recommendations...
                  </p>
                ) : populatedData.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.65 }}>
                    We'll establish your baseline scores and adapt your future practice.
                  </p>
                ) : focusParam ? (
                  <>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.65 }}>
                      Targeting your chosen focus: <span style={{ color: 'var(--primary-bright)', fontWeight: 600 }}>{focusParam}</span>.
                    </p>
                  </>
                ) : weakest ? (
                  <>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.65 }}>
                      Your weakest dimension is <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{weakest.subject}</span>, but here is a general case to build rounded skills.
                    </p>
                  </>
                ) : null}

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 8, backgroundColor: 'var(--bg3)', marginBottom: 20, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: nextCase?.track === 'consulting' ? 'var(--coral)' : 'var(--primary-bright)' }}>{nextCase?.track === 'consulting' ? 'Consulting' : 'Product'}</span>
                  <span style={{ color: 'var(--border-strong)', fontSize: 10 }}>|</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{nextCase?.subtype}</span>
                  <span style={{ color: 'var(--border-strong)', fontSize: 10 }}>|</span>
                  <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>~{nextCase ? getCaseTime(nextCase) : 0}m</span>
                </div>

                <button onClick={() => {
                  if (nextCase) {
                    posthog.capture('practice_case_opened', { case_id: nextCase.id, track: nextCase.track })
                    navigate(`/case/${nextCase.id}?source=learn_by_doing`)
                  }
                }}
                  disabled={!nextCase}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--primary-mid), var(--primary))', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <IconPlay />
                  Start & Learn
                </button>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, color: 'var(--text-primary)', margin: '0 0 8px', fontWeight: 400, lineHeight: 1.5 }}>
                    "Candidates who complete <strong style={{ color: 'var(--primary-bright)', fontWeight: 700 }}>5 or more</strong> live practice cases<br />
                    are <strong style={{ color: 'var(--teal)', fontWeight: 700 }}>3x</strong> more likely to secure a top-tier offer."
                  </p>
                  <p style={{ fontSize: 16, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                    — <span style={{ color: '#A51C30', fontFamily: 'Georgia, serif', fontWeight: 700 }}>Harvard Business School</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Recent reps */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>Recent Reps</h3>
                {!historyLoading && recentHistory.length >= 2 && (
                  <button onClick={() => navigate('/history')} style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>See all →</button>
                )}
              </div>
              {historyLoading ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Loading recent practice...</p>
                </div>
              ) : recentHistory.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: 'var(--bg2)', borderRadius: 10, border: '1px dashed var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <img src={imgEmptyCases} alt="No cases yet" style={{ width: 44, height: 'auto', objectFit: 'contain', filter: 'var(--icon-filter)' }} />
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>No Cases Yet</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Your completed mock interviews will appear here.</p>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  {recentHistory.map((r, i) => (
                    <HistoryItem key={r.id} item={r} isLast={i === recentHistory.length - 1} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : browseTrack === null ? (
          <div>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>Choose a Track</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                <div onClick={() => setBrowseTrack('consulting')} style={{ cursor: 'pointer', backgroundColor: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, transition: 'border-color 0.15s, box-shadow 0.15s', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', height: '100%' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--coral)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <img src="/landing-v2/track-consulting-v3.webp" alt="Consulting" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 16 }} />
                      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--coral)', margin: '0 0 8px' }}>Consulting</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--coral)', lineHeight: 1, letterSpacing: '-0.03em' }}>{CASES.filter(c => c.track === 'consulting').length}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8 }}>cases, curated for you</div>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5, flexGrow: 1 }}>Master case interviews for top-tier consulting firms like McKinsey, BCG, and Bain. Includes <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Profitability</strong>, <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Market Entry</strong>, <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Pricing</strong>, and more.</p>
                  <div style={{ backgroundColor: 'var(--coral-subtle)', borderLeft: '3px solid var(--coral)', padding: '10px 14px', borderRadius: '0 8px 8px 0', marginBottom: 20, minHeight: 60, display: 'flex', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 400 }}>"Candidates who complete <strong style={{ color: 'var(--coral)', fontWeight: 700 }}>5+ live cases</strong> are <strong style={{ color: 'var(--coral)', fontWeight: 700 }}>3x</strong> more likely to secure a top-tier offer."</p>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--coral)', marginTop: 'auto' }}>View Cases &rarr;</div>
                </div>
                <div onClick={() => setBrowseTrack('product')} style={{ cursor: 'pointer', backgroundColor: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, transition: 'border-color 0.15s, box-shadow 0.15s', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', height: '100%' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-bright)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <img src="/landing-v2/track-product-v4.webp" alt="Product" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 16 }} />
                      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-bright)', margin: '0 0 8px' }}>Product Management</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary-bright)', lineHeight: 1, letterSpacing: '-0.03em' }}>{CASES.filter(c => c.track === 'product').length}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8 }}>cases, curated for you</div>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5, flexGrow: 1 }}>Tackle product design, metrics, and strategy cases for MAANG and top startups. Includes <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Product Sense</strong>, <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Root-cause Analysis</strong>, and <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Guesstimates</strong>.</p>
                  <div style={{ backgroundColor: 'var(--primary-subtle)', borderLeft: '3px solid var(--primary-bright)', padding: '10px 14px', borderRadius: '0 8px 8px 0', marginBottom: 20, minHeight: 60, display: 'flex', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 400 }}>"Practicing aloud improves PM interview performance and structural clarity by up to <strong style={{ color: 'var(--primary-bright)', fontWeight: 700 }}>60%</strong>."</p>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-bright)', marginTop: 'auto' }}>View Cases &rarr;</div>
                </div>
            </div>
            <div style={{ marginTop: 24, padding: '20px 24px', backgroundColor: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: 'var(--card-shadow)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Cases Curated From Top Sources</div>
              <div className="hub-sources-container" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <div>
                    <span style={{ color: 'var(--coral)', fontWeight: 600, marginRight: 6 }}>Consulting:</span>
                    {CONSULTING_RESOURCES.map((r, i) => (
                      <span key={r.n}>
                        <span style={{ color: isDark ? (r.darkC || '#fff') : (r.c || '#000'), fontFamily: r.font || 'inherit' }}>{r.n}</span>
                        {i < CONSULTING_RESOURCES.length - 1 ? <span style={{ marginRight: 6 }}>,</span> : ''}
                      </span>
                    ))}
                  </div>
                  <div>
                    <span style={{ color: 'var(--primary-bright)', fontWeight: 600, marginRight: 6 }}>Product:</span>
                    {PRODUCT_RESOURCES.map((r, i) => (
                      <span key={r.n}>
                        <span style={{ color: isDark ? (r.darkC || '#fff') : (r.c || '#000'), fontFamily: r.font || 'inherit' }}>{r.n}</span>
                        {i < PRODUCT_RESOURCES.length - 1 ? <span style={{ marginRight: 6 }}>,</span> : ''}
                      </span>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        ) : browseSubtype === null ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <button onClick={() => setBrowseTrack(null)} style={{ width: 34, height: 34, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.15s', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg2)'} aria-label="Go back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Select a Category</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {(browseTrack === 'consulting' ? CONSULTING_SUBTYPES : PRODUCT_SUBTYPES).filter(s => s !== 'All').map(s => {
                const count = CASES.filter(c => c.track === browseTrack && c.subtype === s).length
                return (
                  <div key={s} onClick={() => setBrowseSubtype(s)} style={{ cursor: 'pointer', backgroundColor: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, transition: 'border-color 0.15s, box-shadow 0.15s', boxShadow: 'var(--card-shadow)' }} onMouseEnter={e => e.currentTarget.style.borderColor = browseTrack === 'consulting' ? 'var(--coral)' : 'var(--primary-bright)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>{s}</h3>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{count} {count === 1 ? 'Case' : 'Cases'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setBrowseSubtype(null)} style={{ width: 34, height: 34, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.15s', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg2)'} aria-label="Go back">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{browseSubtype} Cases</h2>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden', marginRight: 32 }}>
                  <button onClick={() => setCompletionFilter('All')} style={{ padding: '6px 12px', border: 'none', background: completionFilter === 'All' ? 'var(--primary-bright)' : 'transparent', color: completionFilter === 'All' ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: completionFilter === 'All' ? 700 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>All</button>
                  <button onClick={() => setCompletionFilter('Completed')} style={{ padding: '6px 12px', border: 'none', background: completionFilter === 'Completed' ? 'var(--primary-bright)' : 'transparent', color: completionFilter === 'Completed' ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: completionFilter === 'Completed' ? 700 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Completed</button>
                </div>
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                  <button key={d} onClick={() => setDiffFilter(d)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${diffFilter === d ? 'var(--primary-bright)' : 'transparent'}`, backgroundColor: diffFilter === d ? 'var(--primary-bright)' : 'var(--bg2)', color: diffFilter === d ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: diffFilter === d ? 700 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            
            {filtered.length === 0 ? (
              (() => {
                const hasCompletedInSubtype = CASES.some(c => c.subtype === browseSubtype && completedCases.has(c.id))
                if (completionFilter === 'Completed') {
                  if (hasCompletedInSubtype && diffFilter !== 'All') {
                    return (
                      <div style={{ textAlign: 'center', padding: '72px 24px', backgroundColor: 'var(--bg2)', borderRadius: 16, border: '1px dashed var(--border)', marginTop: 24 }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 16px', opacity: 0.5 }}>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No matches for '{diffFilter}'</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.5 }}>
                          You've completed cases in this category, but none match the '{diffFilter}' filter. Try 'All' difficulty to see them.
                        </p>
                        <button onClick={() => setDiffFilter('All')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--bg3)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                          Show All Difficulties
                        </button>
                      </div>
                    )
                  } else {
                    return (
                      <div style={{ textAlign: 'center', padding: '72px 24px', backgroundColor: 'var(--bg2)', borderRadius: 16, border: '1px dashed var(--border)', marginTop: 24 }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 16px', opacity: 0.5 }}>
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No completed cases yet</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.5 }}>
                          You haven't completed any <strong style={{ color: 'var(--text-primary)' }}>{browseSubtype}</strong> cases yet. Ready to try one?
                        </p>
                        <button onClick={() => {
                            let categoryCandidates = CASES.filter(c => c.subtype === browseSubtype && !completedCases.has(c.id))
                            if (categoryCandidates.length === 0) categoryCandidates = CASES.filter(c => c.subtype === browseSubtype)
                            const targetCase = categoryCandidates.length > 0 ? categoryCandidates[Math.floor(Math.random() * categoryCandidates.length)] : null
                            if (targetCase) {
                              posthog.capture('practice_case_opened', { case_id: targetCase.id, track: targetCase.track })
                              navigate(`/case/${targetCase.id}?source=browse`)
                            }
                          }} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                          Start a {browseSubtype} case →
                        </button>
                      </div>
                    )
                  }
                } else {
                  return (
                    <div style={{ textAlign: 'center', padding: '72px 24px', backgroundColor: 'var(--bg2)', borderRadius: 16, border: '1px dashed var(--border)', marginTop: 24 }}>
                      <svg width="48" height="48" viewBox="0 0 36 36" fill="none" style={{ marginBottom: 16, opacity: 0.5, stroke: 'var(--text-muted)' }}>
                        <circle cx="18" cy="18" r="16" strokeWidth="2" />
                        <path d="M12 18h12" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No cases match</h3>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, margin: '0 auto 24px', lineHeight: 1.5 }}>Try a different difficulty filter.</p>
                      <button onClick={() => setDiffFilter('All')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--bg3)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Clear Filters
                      </button>
                    </div>
                  )
                }
              })()
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {filtered.map(c => <CaseCard key={c.id} c={c} completed={completedCases.has(c.id)} onStart={() => {
                  posthog.capture('practice_case_opened', { case_id: c.id, track: c.track })
                  navigate(`/case/${c.id}?source=browse`)
                }} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
