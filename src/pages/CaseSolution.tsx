import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useCases } from '../context/CasesContext'
import { getCaseTime } from '../data/cases'
import imgCaseAvatar from '../imports/case-avatar.webp'
import imgClarifyingQuestions from '../imports/clarifying-questions.webp'
import imgStructureCase from '../imports/structure-case.webp'
import imgSampleExchange from '../imports/sample-exchange.webp'
import imgStrongAnswer from '../imports/strong-answer.webp'
import imgCommonPitfall from '../imports/common-pitfall.webp'

// ─── Solution content types ───────────────────────────────────────────────────
interface SolutionContent {
  clarifying_questions: string[]
  framework_name: string
  framework_steps: string[]
  sample_exchange: Array<{ ask: string; learn: string }>
  strong_answer: string
  common_pitfall: string
}

function parseSolutionContent(raw: string | null | undefined): SolutionContent | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && parsed.clarifying_questions && parsed.framework_name) return parsed as SolutionContent
  } catch {
    // not JSON, it's the old plain-text format
  }
  return null
}

// ─── Hidden data renderer (fallback for old format) ──────────────────────────
function renderHiddenData(hidden_data: any): string {
  if (!hidden_data) return ''
  if (typeof hidden_data === 'string') {
    // Try to parse if it looks like JSON
    try {
      const parsed = JSON.parse(hidden_data)
      return renderHiddenData(parsed)
    } catch {
      return hidden_data
    }
  }
  if (Array.isArray(hidden_data)) {
    return hidden_data
      .map((item: any) => {
        if (typeof item === 'string') return item
        if (item && item.trigger_topic && item.data_summary) {
          return `• If asked about "${item.trigger_topic}": ${item.data_summary}`
        }
        return JSON.stringify(item)
      })
      .join('\n')
  }
  if (typeof hidden_data === 'object') {
    return Object.entries(hidden_data)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n')
  }
  return String(hidden_data)
}

// ─── Image Placeholders ──────────────────────────────────────────────────────────
function ImagePlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: 200,
      backgroundColor: 'var(--bg3)',
      borderRadius: 12,
      marginBottom: 20,
    }} />
  )
}

// ─── Formatting Helpers ───────────────────────────────────────────────────────
function highlightNumbers(text: string, accentColor: string = 'var(--text-primary)') {
  const parts = text.split(/((?:Rs\.?\s*|\$\s*)?\d+(?:,\d{3})*(?:\.\d+)?\s*(?:%|k|K|m|M|b|B|L|Cr)?)/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} style={{ color: accentColor }}>{part}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function formatProse(text: string, accentColor: string = 'var(--text-primary)') {
  // Strip any existing markdown bold markers just to be safe
  const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');
  
  const colonIndex = cleanText.indexOf(':');
  if (colonIndex !== -1) {
    const beforeColon = cleanText.substring(0, colonIndex);
    const wordCount = beforeColon.trim().split(/\s+/).length;
    
    // If the colon appears within the first ~8 words, treat it as a lead phrase
    if (wordCount <= 8) {
      return (
        <>
          <strong style={{ color: accentColor, fontWeight: 600 }}>{beforeColon}:</strong>
          {cleanText.substring(colonIndex + 1)}
        </>
      );
    }
  }
  
  return cleanText;
}

// ─── New structured solution renderer ─────────────────────────────────────────
function StructuredSolution({ sol }: { sol: SolutionContent }) {
  return (
    <div>
      {/* 2. Clarifying questions */}
      <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'var(--teal)' }}>Clarifying Questions to Ask First</h2>
        <img src={imgClarifyingQuestions} alt="Clarifying Questions" className="case-section-illus" />
        <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc' }}>
          {sol.clarifying_questions.map((q, i) => (
            <li key={i} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 8 }}>{q}</li>
          ))}
        </ul>
      </div>

      {/* 3. Framework */}
      <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'var(--primary-bright)' }}>How to Structure This Case</h2>
        <img src={imgStructureCase} alt="How to Structure This Case" className="case-section-illus" />
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          {sol.framework_name}
        </p>
        <ol style={{ margin: 0, paddingLeft: 22, listStyleType: 'decimal' }}>
          {sol.framework_steps.map((step, i) => (
            <li key={i} style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: 10 }}>{formatProse(step, 'var(--primary-bright)')}</li>
          ))}
        </ol>
      </div>

      {/* 4. Sample exchange */}
      <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'var(--blue)' }}>What You'd Uncover by Asking</h2>
        <img src={imgSampleExchange} alt="" className="case-section-illus" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sol.sample_exchange.map((ex, i) => (
            <div key={i} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <strong style={{ fontWeight: 600, color: 'var(--blue)' }}>If you ask about {ex.ask}: </strong>
              {highlightNumbers(ex.learn, 'var(--blue)')}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Strong answer */}
      <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: '#10B981' }}>What a Strong Answer Sounds Like</h2>
        <img src={imgStrongAnswer} alt="Strong Answer" className="case-section-illus" />
        <div style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          {sol.strong_answer.split('\n').filter(Boolean).map((para, i, arr) => (
            <p key={i} style={{ margin: 0, marginBottom: i === arr.length - 1 ? 0 : 12 }}>
              {formatProse(para, '#10B981')}
            </p>
          ))}
        </div>
      </div>

      {/* 6. Common pitfall */}
      <div style={{ paddingTop: 24, marginTop: 32, borderTop: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber)', marginBottom: 8 }}>Common Pitfall</h3>
        <img src={imgCommonPitfall} alt="Common Pitfall" className="case-section-illus" />
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
          {formatProse(sol.common_pitfall, 'var(--amber)')}
        </p>
      </div>
    </div>
  )
}

// ─── Legacy fallback renderer ─────────────────────────────────────────────────
function LegacySolution({ caseData }: { caseData: any }) {
  return (
    <>
      {caseData.intended_approach_summary && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ borderLeft: '3px solid #10B981', paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              How to structure your answer
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {caseData.intended_approach_summary}
            </div>
          </div>
        </div>
      )}
      {caseData.hidden_data && (
        <div>
          <div style={{ borderLeft: '3px solid var(--primary-bright)', paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              What you should uncover
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {renderHiddenData(caseData.hidden_data)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CaseSolution() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { cases, casesLoading } = useCases()

  const caseData = cases.find(c => c.id === id)

  if (casesLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
        Loading case data...
      </div>
    )
  }

  if (!caseData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', flexDirection: 'column', gap: 16 }}>
        <div>Case not found.</div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, var(--primary-mid), var(--primary))',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Go Back
        </button>
      </div>
    )
  }

  const solContent = parseSolutionContent(caseData.intended_approach_summary)
  const hasSolutionData = !!(caseData.intended_approach_summary || caseData.hidden_data)
  const estimatedTime = getCaseTime(caseData)

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1)
    } else {
      navigate('/hub')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      color: 'var(--text-primary)',
      paddingBottom: 80
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

        {/* Back Button — Bug 2 fix: uses real back navigation */}
        <button
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-secondary)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: 14,
            marginBottom: 32,
            fontWeight: 500
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Hub
        </button>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: caseData.track === 'consulting' ? 'var(--coral)' : 'var(--primary-bright)',
              backgroundColor: caseData.track === 'consulting' ? 'var(--coral-subtle)' : 'var(--primary-subtle)',
              padding: '4px 10px', borderRadius: 20
            }}>
              {caseData.track === 'consulting' ? 'Consulting' : 'Product'}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: 'var(--text-muted)', backgroundColor: 'var(--bg3)',
              padding: '4px 10px', borderRadius: 20
            }}>
              {caseData.subtype}
            </span>
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            {caseData.title}
          </h1>

          <div style={{ display: 'flex', gap: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="8" y1="17" x2="8" y2="12"/>
                <line x1="12" y1="17" x2="12" y2="8"/><line x1="16" y1="17" x2="16" y2="14"/>
              </svg>
              <span style={{
                color: caseData.difficulty === 'Easy' ? '#10B981' : caseData.difficulty === 'Medium' ? '#F59E0B' : '#EF4444',
                fontWeight: 600
              }}>
                {caseData.difficulty}
              </span>
            </div>
            {estimatedTime > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {estimatedTime} mins
              </div>
            )}
          </div>
        </div>

        {/* 1. The Case — Bug 4 fix: renamed from "The Prompt" */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>The Case</h2>
          <div style={{
            backgroundColor: 'var(--bg2)',
            padding: 24,
            borderRadius: 16,
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}>
            <div style={{ float: 'left', width: 120, height: 120, borderRadius: 16, overflow: 'hidden', margin: '0 20px 8px 0' }}>
              <img src={imgCaseAvatar} alt="Case graphic" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div>
              {caseData.premise_summary && (
                <div style={{ fontSize: 15, lineHeight: 1.65, marginBottom: caseData.opening_question ? 14 : 0, color: 'var(--text-secondary)' }}>
                  {caseData.premise_summary}
                </div>
              )}
              {caseData.opening_question && (
                <div style={{ fontSize: 15, lineHeight: 1.65, fontWeight: 600, color: 'var(--primary-bright)' }}>
                  {caseData.opening_question}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Solution Sections */}
        <div style={{ marginBottom: 40 }}>
          {!hasSolutionData ? (
            <div style={{
              backgroundColor: 'rgba(124, 58, 237, 0.05)',
              border: '1px dashed rgba(124, 58, 237, 0.25)',
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>
                Solution write-up coming soon
              </div>
              <div style={{ fontSize: 14 }}>
                We're generating the intended approach for this case.
              </div>
            </div>
          ) : solContent ? (
            <StructuredSolution sol={solContent} />
          ) : (
            <LegacySolution caseData={caseData} />
          )}
        </div>

        {/* CTA — Gated for launch */}
        <div style={{
          marginTop: 40,
          paddingTop: 28,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}>
          <button
            disabled
            style={{
              padding: '14px 32px',
              background: 'rgba(124,58,237,0.08)',
              color: '#7C3AED',
              border: '2px solid #7C3AED',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Live Practice
          </button>
          <img src="/coming-soon.jpg" alt="Coming Soon" style={{ width: 260, height: 'auto', display: 'block', borderRadius: 12 }} />
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 680, textAlign: 'center', lineHeight: 1.5 }}>
            We're polishing it to make sure it's genuinely great before launch. In the meantime, work through the full case breakdown above.
          </div>
        </div>

      </div>
    </div>
  )
}