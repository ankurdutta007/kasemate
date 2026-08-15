import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { HistoryItem } from '../components/HistoryItem'

export default function History() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { user } = useAuth()
  const isDark = theme === 'dark'
  
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    
    if (!user) return
    
    supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('ended_at', { ascending: false })
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

          const populatedData = data.filter(s => s.grading_result).map(s => ({
            id: s.id,
            title: casesMap[s.case_id]?.title || 'Practice Case',
            subtype: s.subtype || 'Case',
            track: casesMap[s.case_id]?.track || 'consulting',
            name: user?.user_metadata?.full_name || 'Candidate',
            date: s.ended_at,
            score: s.grading_result.overall || 0
          }))

          setHistory(populatedData)
        }
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading history...</div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: 640,
      margin: '0 auto',
      padding: '40px 20px',
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      color: 'var(--text-primary)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer', 
            marginRight: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            borderRadius: '50%',
            backgroundColor: 'var(--bg2)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 700, margin: 0 }}>Practice History</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {history.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No completed sessions yet.
          </div>
        ) : (
          history.map((r, i) => (
            <HistoryItem key={r.id} item={r} isLast={i === history.length - 1} />
          ))
        )}
      </div>
    </div>
  )
}
