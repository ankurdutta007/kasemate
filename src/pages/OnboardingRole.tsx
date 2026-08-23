import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import imgHeroNew from '@/imports/onboarding-hero-new.webp'

const TRACKS = [
  {
    id: 'product',
    icon: '/landing-v2/track-product-v4.webp',
    label: 'Product',
    color: '#6366f1',
    desc: 'APM, PM, Product Analyst',
    companies: 'Flipkart ₹26.8L, Ola ₹37L, Navi ₹31.3L'
  },
  {
    id: 'consulting',
    icon: '/landing-v2/track-consulting-v3.webp',
    label: 'Consulting',
    color: '#f97316',
    desc: 'Consultant, Associate roles',
    companies: 'McKinsey ₹21.5L, Accenture S&C ₹21.4L'
  },
  {
    id: 'analyst',
    icon: '/landing-v2/track-data-v4.webp',
    label: 'Data & Business Analyst',
    color: '#3b82f6',
    desc: 'BA, DA, DS roles',
    companies: 'JP Morgan ₹38.5L, Capital One ₹36.5L'
  },
  {
    id: 'general',
    icon: '/landing-v2/track-gm-v3.webp',
    label: 'General Management',
    color: '#10b981',
    desc: 'Banking, ops, MT roles',
    companies: 'ICICI ₹18L, Axis Bank ₹14.4L'
  }
]

export default function OnboardingRole() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])

  const toggleTrack = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleContinue = () => {
    if (selected.length > 0) {
      localStorage.setItem('rm-tracks', JSON.stringify(selected))
      navigate('/onboarding/weeks')
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6vh', paddingBottom: 48, paddingLeft: 24, paddingRight: 24, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Step 1 of 2</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Setup</span>
          </div>
          <div style={{ height: 3, backgroundColor: 'var(--bg3)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: '50%', borderRadius: 2, background: 'linear-gradient(90deg, var(--primary-mid), var(--primary))' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '110%', height: '140%', borderRadius: '50%', background: 'radial-gradient(ellipse, var(--primary-glow) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <img src={imgHeroNew} alt="Prepping for" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 16, position: 'relative', zIndex: 1, border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }} />
          </div>
        </div>

        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 34, fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em', textAlign: 'center' }}>
          What are you preparing for?
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.6, textAlign: 'center' }}>
          Pick all that apply — your roadmap covers everything you choose.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {TRACKS.map(t => {
            const isSelected = selected.includes(t.id)
            return (
              <button key={t.id} onClick={() => toggleTrack(t.id)}
                style={{ textAlign: 'left', padding: '16px 22px', borderRadius: 14, border: `2px solid ${isSelected ? 'var(--primary-bright)' : 'var(--border)'}`, backgroundColor: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s', fontFamily: 'Inter, sans-serif', boxShadow: isSelected ? 'var(--card-shadow)' : 'none' }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={t.icon} alt={t.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.color, marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.desc}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 2 }}>{t.companies}</div>
                </div>
                {isSelected && (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--primary-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</div>
                )}
              </button>
            )
          })}
        </div>

        <button disabled={selected.length === 0} onClick={handleContinue}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: selected.length > 0 ? 'linear-gradient(135deg, var(--primary-mid), var(--primary))' : 'var(--bg3)', color: selected.length > 0 ? '#fff' : 'var(--text-muted)', fontSize: 16, fontWeight: 700, cursor: selected.length > 0 ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', boxShadow: selected.length > 0 ? '0 4px 16px rgba(66,16,61,0.4)' : 'none', transition: 'all 0.2s' }}>
          Continue →
        </button>
      </div>
    </div>
  )
}
