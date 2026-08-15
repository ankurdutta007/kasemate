import { useState, useEffect } from 'react'
import Illus10 from '@/imports/10'
import img10 from '@/imports/image-10.webp'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useCases } from '../context/CasesContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { HistoryItem } from '../components/HistoryItem'
import imgStreakEmpty from '@/imports/streak-empty.webp'
import { getScoreColor, getTargetedNextCase } from '../lib/utils'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts'

const BarTip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: 'var(--bg2)', border: '1px solid var(--border-strong)', borderRadius: 7, padding: '6px 10px', boxShadow: 'var(--card-shadow)', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, color: '#A855F7', fontFamily: 'JetBrains Mono, monospace' }}>{payload[0].value}</div>
    </div>
  )
}

function StreakCalendar({ isDark, streakCount, weeklyCount, sessions }: { isDark: boolean, streakCount: number, weeklyCount: number, sessions: any[] }) {
  const today = new Date()
  today.setHours(0,0,0,0)
  const rollingDays = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    rollingDays.push(d)
  }

  const sessionDates = new Set(
    sessions.map(s => {
      const d = new Date(s.ended_at)
      d.setHours(0,0,0,0)
      return d.getTime()
    })
  )

  const WEEK_DAYS = rollingDays.map((d, index) => {
    const isToday = index === 6
    const done = sessionDates.has(d.getTime())
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return {
      label: labels[d.getDay()],
      done,
      today: isToday
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Streak</div>
      </div>

      {/* Week row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {WEEK_DAYS.map((d, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {/* Day circle */}
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: d.done
                ? '#F59E0B'
                : d.today
                  ? 'transparent'
                  : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              border: d.today
                ? '2px dashed #F59E0B'
                : d.done
                  ? 'none'
                  : `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              transition: 'all 0.15s',
              boxShadow: d.done ? '0 2px 8px rgba(245,158,11,0.28)' : 'none',
            }}>
              {d.done ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : d.today ? (
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              ) : (
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }} />
              )}
            </div>
            {/* Day label */}
            <span style={{
              fontSize: 9,
              fontWeight: d.today ? 700 : 500,
              color: d.today ? '#F59E0B' : d.done ? 'var(--text-secondary)' : 'var(--text-muted)',
              letterSpacing: '0.02em',
            }}>{d.label}</span>
          </div>
        ))}
      </div>

      {/* Big Streak text in middle */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
        {streakCount === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '12px 24px', borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px dashed var(--border)' }}>
            <img src={imgStreakEmpty} alt="Start Streak" style={{ width: 72, height: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.4 }}>
              Start a new<br />
              <span style={{ color: 'var(--coral)', fontWeight: 700 }}>Streak Today!</span>
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderRadius: 20, backgroundColor: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(255,248,220,0.6)', border: '1px dashed rgba(245,158,11,0.25)' }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>🔥</span>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#F59E0B', letterSpacing: '-0.02em', lineHeight: 1, marginRight: 8 }}>
                {streakCount}
              </span>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Day Streak
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Goal line */}
      <div style={{ padding: '8px 12px', borderRadius: 8, backgroundColor: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weekly goal</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ width: 16, height: 6, borderRadius: 3, backgroundColor: i < weeklyCount ? '#F59E0B' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
          ))}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>{Math.min(weeklyCount, 5)}/5</span>
      </div>
    </div>
  )
}
let cachedSessions: any[] = []

export let dashboardCacheValid = false
export function invalidateDashboardCache() {
  dashboardCacheValid = false
}

export default function Dashboard() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { cases } = useCases()
  const navigate = useNavigate()
  const isDark = theme === 'dark'
  
  const [sessions, setSessions] = useState<any[]>(cachedSessions)
  const [loading, setLoading] = useState(!dashboardCacheValid)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    if (dashboardCacheValid) {
      setLoading(false)
      return
    }
    supabase.from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('ended_at', { ascending: true })
      .then(async ({ data, error }) => {
        if (!error && data) {
          const caseIds = [...new Set(data.map(s => s.case_id))]
          
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

          const populatedData = data.map(s => ({
            ...s,
            cases: casesMap[s.case_id] || null
          })).filter(s => s.grading_result)
          
          cachedSessions = populatedData
          dashboardCacheValid = true
          setSessions(populatedData)
        }
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: 'var(--text-muted)' }}>Loading...</div></div>
  }

  const reps = sessions.length
  const isCold = reps < 3

  const recent10 = sessions.slice(-10)
  const recentReps = recent10.length

  const TREND = recent10.map((s, i) => {
    return { rep: `R${i + 1}`, score: s.grading_result.overall }
  })

  let sumStruct = 0, sumQuant = 0, sumBiz = 0, sumComm = 0
  recent10.forEach(s => {
    sumStruct += s.grading_result.structuring?.score || 0
    sumQuant += s.grading_result.quant_reasoning?.score || 0
    sumBiz += s.grading_result.business_judgment?.score || 0
    sumComm += s.grading_result.communication?.score || 0
  })

  const RADAR_DATA = recentReps > 0 ? [
    { subject: 'Structure', score: Math.round(sumStruct / recentReps) },
    { subject: 'Quant', score: Math.round(sumQuant / recentReps) },
    { subject: 'Judgment', score: Math.round(sumBiz / recentReps) },
    { subject: 'Comms', score: Math.round(sumComm / recentReps) },
  ] : [
    { subject: 'Structure', score: 0 },
    { subject: 'Quant', score: 0 },
    { subject: 'Judgment', score: 0 },
    { subject: 'Comms', score: 0 },
  ]
  
  const avgScore = recentReps > 0 ? Math.round(TREND.reduce((s, d) => s + d.score, 0) / recentReps) : 0
  const lastScore = TREND[recentReps - 1]?.score ?? 0
  const prevScore = TREND[recentReps - 2]?.score ?? 0
  const delta = lastScore - prevScore
  const weakest = recentReps > 0 ? RADAR_DATA.reduce((a, b) => a.score < b.score ? a : b) : RADAR_DATA[0]

  let STREAK_COUNT = 0
  if (reps > 0) {
     const dates = Array.from(new Set(sessions.map(s => new Date(s.ended_at).toDateString()))).map(d => new Date(d))
     dates.sort((a,b) => b.getTime() - a.getTime())
     const today = new Date()
     today.setHours(0,0,0,0)
     const yesterday = new Date(today)
     yesterday.setDate(yesterday.getDate() - 1)
     
     if (dates[0].getTime() === today.getTime() || dates[0].getTime() === yesterday.getTime()) {
       STREAK_COUNT = 1
       let curr = dates[0]
       for (let i = 1; i < dates.length; i++) {
         const expected = new Date(curr)
         expected.setDate(expected.getDate() - 1)
         if (dates[i].getTime() === expected.getTime()) {
           STREAK_COUNT++
           curr = dates[i]
         } else {
           break
         }
       }
     }
  }

  const today = new Date()
  const day = today.getDay()
  const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today)
  monday.setDate(diffToMonday)
  monday.setHours(0,0,0,0)
  
  const thisWeekSessions = sessions.filter(s => new Date(s.ended_at).getTime() >= monday.getTime())
  const distinctDaysThisWeek = new Set(thisWeekSessions.map(s => new Date(s.ended_at).toDateString())).size
  const weeklyCount = Math.min(distinctDaysThisWeek, 5)

  const recentHistory = [...sessions].reverse().slice(0, 3).map(s => ({
    id: s.id,
    title: s.cases?.title || 'Practice Case',
    subtype: s.subtype || 'Case',
    track: s.cases?.track || 'consulting',
    name: user?.user_metadata?.full_name || 'Candidate',
    date: s.ended_at,
    score: s.grading_result.overall
  }))

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Inter, sans-serif', padding: '140px 20px 40px' }}>
      <div className="dashboard-cold" style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center', maxWidth: 600, padding: '48px 56px', backgroundColor: isDark ? 'var(--bg2)' : '#ffffff', border: '1px solid var(--border)', borderRadius: 24, boxShadow: 'var(--card-shadow)', width: '100%' }}>
        <img src="/coming-soon.jpg" alt="Coming Soon" style={{ width: 260, height: 'auto', display: 'block', borderRadius: 12, marginBottom: 8 }} />
        <div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 36, fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Performance
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', margin: '0 auto 28px', lineHeight: 1.5, maxWidth: 400 }}>
            Performance tracking unlocks once live practice is live, coming soon.
          </p>
          <button onClick={() => navigate('/hub')}
            style={{ padding: '13px 34px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
            Browse cases →
          </button>
        </div>
      </div>
    </div>
  )
}
