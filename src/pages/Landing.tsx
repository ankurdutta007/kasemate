import { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import FeedbackModal from '../components/FeedbackModal'
import img2 from '@/imports/image-2.webp'
import img3 from '@/imports/image-3.webp'
import img4 from '@/imports/image-4.webp'
import img6 from '@/imports/image-6.webp'
import imgRoadmapStep from '@/imports/roadmap-step.png'
import imgStudyStep from '@/imports/study-step.png'
import imgTrackStep from '@/imports/track-step.png'
import img10 from '@/imports/image-10.webp'
import logo from '@/imports/logo.webp'
import imgConsultingRole from '@/imports/consulting.webp'
import imgProductRole from '@/imports/product.webp'
import ctaHero from '@/imports/cta-hero.png'
import heroIllustration from '@/imports/hero-illustration-new.png'

import logoMckinsey from '@/imports/logos/mckinsey.png'
import logoAccenture from '@/imports/logos/accenture.png'
import logoDeloitte from '@/imports/logos/deloitte.png'
import logoPwc from '@/imports/logos/pwc.png'
import logoFlipkart from '@/imports/logos/flipkart.png'
import logoZomato from '@/imports/logos/zomato.png'
import logoJpmorgan from '@/imports/logos/jpmorgan.png'
import logoCapitalone from '@/imports/logos/capitalone.png'
import logoAmex from '@/imports/logos/amex.png'
import logoItc from '@/imports/logos/itc.png'
import logoIcici from '@/imports/logos/icici.png'
import logoSwiggy from '@/imports/logos/swiggy.png'
import logoTata from '@/imports/logos/tata.png'
import logoJio from '@/imports/logos/jio.png'

/* ─── Decorative swirl (kept for hero only) ──────────────────────── */
function Swirl({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" style={{ overflow: 'visible', ...style }}>
      <path d="M340 60 C260 20 100 140 120 300 C180 360 300 340 340 260 C380 180 360 100 280 80 C200 60 120 100 100 180" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.2" />
      <path d="M300 40 C200 0 40 120 80 300 C140 380 280 380 340 300 C400 220 380 100 300 60" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.1" />
    </svg>
  )
}

/* ─── Reveal on scroll ───────────────────────────────────────────── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ transition: `opacity 0.6s ${delay}ms, transform 0.6s ${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(22px)' }}>
      {children}
    </div>
  )
}

/* ─── Data ───────────────────────────────────────────────────────── */
const TARGET_COMPANIES = [
  { n: 'McKinsey & Co', logo: logoMckinsey },
  { n: 'Accenture S&C', logo: logoAccenture },
  { n: 'Deloitte', logo: logoDeloitte },
  { n: 'PwC', logo: logoPwc },
  { n: 'Flipkart', logo: logoFlipkart },
  { n: 'Zomato', logo: logoZomato },
  { n: 'JPMorganChase', logo: logoJpmorgan },
  { n: 'Capital One', logo: logoCapitalone },
  { n: 'American Express', logo: logoAmex },
  { n: 'ITC Limited', logo: logoItc },
  { n: 'ICICI Bank', logo: logoIcici },
  { n: 'Swiggy', logo: logoSwiggy },
  { n: 'Tata Steel', logo: logoTata },
  { n: 'Jio Financial Services', logo: logoJio },
]

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
  { n: 'Product School', c: '#d32f2f', darkC: '#FF6B6B', font: 'Georgia, serif' },
  { n: 'PM School', c: '#0077b5', darkC: '#4DB8FF', font: '"Inter", sans-serif' },
  { n: 'Decode & Conquer', c: '#2b2b2b', darkC: '#e0e0e0', font: 'Georgia, serif' },
  { n: 'Cracking the PM Interview', c: '#2b2b2b', darkC: '#e0e0e0', font: 'Georgia, serif' }
]

/* ─── Updated "How it works" steps ──────────────────────────────── */
const STEPS = [
  {
    n: '01', title: 'Build your roadmap',
    body: 'Choose your track(s) and a 4/8/12-week timeline. KaseMate compiles a week-by-week plan from real curated resources, with no generic filler and no hardcoded template.',
    color: '#7C3AED', bg: '#f4f0ff', darkBg: 'rgba(124,58,237,0.08)',
    img: imgRoadmapStep, side: 'right' as const,
    tag: 'Roadmap', contain: true,
  },
  {
    n: '02', title: 'Study or go live',
    body: "Open any case's full breakdown (framework, structure, sample reasoning) before you ever speak. When you're ready, enter a live case and get pushed the way a real interviewer would push you.",
    color: '#0891b2', bg: '#e0f7fa', darkBg: 'rgba(8,145,178,0.08)',
    img: imgStudyStep, side: 'left' as const,
    tag: 'Live practice', contain: true,
  },
  {
    n: '03', title: "Track what's actually improving",
    body: "Every scored response feeds your Performance dashboard (skill radar, score trend, streak) so your next case targets exactly what you're weakest at.",
    color: '#d97706', bg: '#fef3c7', darkBg: 'rgba(217,119,6,0.08)',
    img: imgTrackStep, side: 'right' as const,
    tag: 'Performance', contain: true,
  },
]

/* ─── Track cards — 4 tracks, 2 practice-enabled + 2 roadmap-only ── */
// Subtype names verified against live DB (is_curated=true), 2026-08-15
const TRACK_CARDS = [
  {
    title: 'Consulting Track',
    sub: '6 subtypes · Live AI practice',
    desc: 'Master Profitability, Market Entry, M&A, and more — with cases targeting McKinsey, Accenture Strategy & Consulting, Deloitte, and PwC.',
    color: '#f43f5e', lightBg: '#ffe4e6', darkBg: 'rgba(244,63,94,0.1)',
    tags: ['Profitability', 'Market Entry', 'M&A', 'Guesstimate'],
    iconNode: <img src={imgConsultingRole} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  },
  {
    title: 'Product Track',
    sub: '6 subtypes · Live AI practice',
    desc: 'Master Product Design, Metrics, GTM, and Prioritization — with cases targeting Flipkart, Zomato, Ola, and Blinkit.',
    color: '#7C3AED', lightBg: '#f4f0ff', darkBg: 'rgba(124,58,237,0.1)',
    tags: ['Product Design', 'Metrics', 'GTM', 'Prioritization'],
    iconNode: <img src={imgProductRole} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  },
  {
    title: 'Data & Business Analyst',
    sub: 'Roadmap · Curated external resources',
    desc: 'Learn quant reasoning, SQL, and case-based business analysis — targeting roles at JPMorgan Chase, Capital One, American Express, and Kotak Mahindra Bank.',
    color: '#3b82f6', lightBg: '#eff6ff', darkBg: 'rgba(59,130,246,0.1)',
    tags: ['Quant Reasoning', 'SQL', 'Business Analysis'],
    iconNode: <img src={img3} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  },
  {
    title: 'General Management',
    sub: 'Roadmap · Curated external resources',
    desc: 'Learn company research, case fundamentals, and role-specific prep — targeting roles at ITC, ICICI Bank, Swiggy, Tata Steel, and Jio Financial Services.',
    color: '#10b981', lightBg: '#ecfdf5', darkBg: 'rgba(16,185,129,0.1)',
    tags: ['Banking', 'Operations', 'MT Roles'],
    iconNode: <img src={img2} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  },
]

/* ─── Validator cards — 4 tracks, all placeholders for Ankur to fill ─ */
// TODO: Ankur — replace all placeholder fields below with real names/companies/photos
const SENIOR_VALIDATORS = [
  {
    track: 'Consulting',
    trackColor: '#f43f5e',
    trackBg: 'rgba(244,63,94,0.08)',
    /* TODO: Ankur to replace with real name */
    name: '[Name]',
    /* TODO: Ankur to replace with real company and role */
    company: 'Placed at [Company Name]',
    /* TODO: Ankur to replace with real batch year */
    batch: 'IIT KGP, Batch of 20XX',
    note: 'Confirmed the Profitability and Guesstimate cases match what he was actually asked in his interviews.',
  },
  {
    track: 'Product',
    trackColor: '#7C3AED',
    trackBg: 'rgba(124,58,237,0.08)',
    /* TODO: Ankur to replace with real name */
    name: '[Name]',
    /* TODO: Ankur to replace with real company and role */
    company: 'Placed at [Company Name]',
    /* TODO: Ankur to replace with real batch year */
    batch: 'IIT KGP, Batch of 20XX',
    note: 'Checked the Metrics/Root-Cause cases against real PM interview rounds before they went live.',
  },
  {
    track: 'Data & BA',
    trackColor: '#3b82f6',
    trackBg: 'rgba(59,130,246,0.08)',
    /* TODO: Ankur to replace with real name */
    name: '[Name]',
    /* TODO: Ankur to replace with real company and role */
    company: 'Placed at [Company Name]',
    /* TODO: Ankur to replace with real batch year */
    batch: 'IIT KGP, Batch of 20XX',
    /* TODO: Ankur to replace with real one-line validation note for Data/BA track */
    note: 'Reviewed the Data & Business Analyst roadmap modules against real BA placement rounds.',
  },
  {
    track: 'General Management',
    trackColor: '#10b981',
    trackBg: 'rgba(16,185,129,0.08)',
    /* TODO: Ankur to replace with real name */
    name: '[Name]',
    /* TODO: Ankur to replace with real company and role */
    company: 'Placed at [Company Name]',
    /* TODO: Ankur to replace with real batch year */
    batch: 'IIT KGP, Batch of 20XX',
    /* TODO: Ankur to replace with real one-line validation note for GM track */
    note: 'Checked the General Management roadmap against banking and MT placement experience.',
  },
]

const FAQS = [
  { q: 'What do I actually get with KaseMate?', a: "A week-by-week roadmap built around your track and timeline. Full curated solutions and structured frameworks for 271 real cases, so you can study before you ever go live. And when you're ready, a live AI interviewer that grades you on four dimensions, so you know exactly where you stand before the real thing." },
  { q: 'Is it free?', a: "Yes, completely. KaseMate is free for KGPians with a KGP email. No paywall, no premium tier, no credit card." },
  { q: 'Can I trust the grading, or is it just vibes?', a: "Every response is scored against a fixed rubric across four dimensions, and each score cites the specific moment in your transcript it's based on. It's not a vague \"good job\" or \"needs work,\" you can see exactly which answer earned or lost you points." },
]

const FOOTER_LINKS = {
  Platform: [
    { label: 'Roadmap', to: '/roadmap' },
    { label: 'Practice Hub', to: '/hub' },
    { label: 'Dashboard', to: '/dashboard' },
  ],
  Resources: [
    { label: 'How it works', to: '#how-it-works' },
    { label: 'FAQ', to: '#faq' },
  ],
  Support: [
    { label: 'Give feedback', action: 'feedback' },
    { label: 'Settings', to: '/settings' },
  ],
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  const [showFeedback, setShowFeedback] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      window.scrollTo(0, 0)
    }
  }, [])
  if (isLoading) return null
  if (user) return <Navigate to="/roadmap" replace />

  const pageBg   = isDark ? '#0d0f14' : '#ffffff'
  const altBg    = isDark ? '#141920' : '#fafafa'
  const cardBg   = isDark ? '#141920' : '#ffffff'
  const heroBg   = isDark ? 'linear-gradient(145deg,#12102a 0%,#0d0f14 100%)' : 'linear-gradient(145deg,#f3f0ff 0%,#ffffff 70%)'
  const footerBg = '#160d35'

  const text   = isDark ? '#f0ede8' : '#111827'
  const muted  = isDark ? '#8492a6' : '#6b7280'
  const soft   = isDark ? '#c4bfb8' : '#374151'
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'
  const swirl  = isDark ? '#3a4560' : '#c4b8e8'

  const V  = '#7C3AED'
  const VM = '#6D28D9'
  const VG = 'rgba(124,58,237,0.25)'
  const VS = isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)'

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: pageBg, color: text, overflowX: 'hidden' }}>

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className="landing-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? 'rgba(13,15,20,0.92)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={logo} alt="KaseMate Logo" style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover' }} />
          <span style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontSize: 18, fontWeight: 500, color: text, letterSpacing: '-0.02em' }}>KaseMate</span>
        </div>
        <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Tracks','How it works','Verified by','FAQ'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
              style={{ textDecoration: 'none', fontSize: 14, fontWeight: 500, color: muted, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = text)}
              onMouseLeave={e => (e.currentTarget.style.color = muted)}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggle} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${border}`, background: altBg, cursor: 'pointer', color: muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="4" fill="currentColor"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M17.5 11.5A7.5 7.5 0 018.5 2.5a7.5 7.5 0 100 15 7.5 7.5 0 009-6z" fill="currentColor"/></svg>
            )}
          </button>
          <button onClick={() => navigate('/auth')} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg,${V},${VM})`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: `0 3px 14px ${VG}`, fontFamily: 'Inter,sans-serif' }}>Get started →</button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ background: heroBg, paddingTop: 128, paddingBottom: 16, position: 'relative', overflow: 'visible', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
        <Swirl style={{ position: 'absolute', top: -60, right: -80, width: 500, height: 500, color: swirl, animation: 'spinSlow 50s linear infinite', transformOrigin: 'center' }} />
        <div className="landing-hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 0 0 48px', width: '100%', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 64, alignItems: 'start', position: 'relative', zIndex: 1 }}>

          {/* Text */}
          <div>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 64, fontWeight: 800, lineHeight: 1.05, color: text, margin: '0 0 22px', letterSpacing: '-0.04em' }}>
              Your placement prep,{' '}
              <em style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontWeight: 500, color: V }}>actually organized.</em>
            </h1>

            <p style={{ fontSize: 18, color: muted, lineHeight: 1.7, margin: '0 0 8px', maxWidth: 480 }}>
              Resources that worked for KGPians who got placed last year, turned into a week-by-week roadmap, structured solutions for 271 curated cases, and a live AI interviewer that grades you on four dimensions.
            </p>
            {/* KGPians attribution — visually distinct, on its own line */}
            <p style={{ fontSize: 18, color: V, fontWeight: 600, margin: '20px 0 36px' }}>
              Built by KGPians, for KGPians.
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 44 }}>
              <button onClick={() => navigate('/auth')}
                style={{ padding: '15px 38px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg,${V},${VM})`, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 28px ${VG}`, fontFamily: 'Inter,sans-serif', transition: 'transform 0.15s,opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1' }}>
                Build your roadmap →
              </button>
              <a href="#how-it-works"
                style={{ padding: '15px 28px', borderRadius: 11, border: `1.5px solid ${border}`, color: text, fontSize: 16, fontWeight: 600, cursor: 'pointer', background: 'transparent', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = V)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
                See how it works
              </a>
            </div>
            {/* Duplicate stats row removed — floating badge cards on the hero image carry this info */}
          </div>

          {/* Illustration — aligned top with headline, bottom with buttons, right toward nav edge */}
          <div id="hero-image-container" style={{ position: 'relative', animation: 'float 6s ease-in-out infinite', alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
            {/* New illustration — has built-in white BG + transparent surround, no card wrapper needed */}
            <img src={heroIllustration} alt="KaseMate placement prep illustration" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }} />

            {/* Floating stat: Cases — moved to bottom-right to stay clear of laptop body centre */}
            <div style={{ position: 'absolute', bottom: 32, left: 0, backgroundColor: isDark ? 'var(--bg2)' : '#fff', padding: '12px 16px', borderRadius: 14, boxShadow: 'var(--card-shadow-lg)', maxWidth: 200, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--coral)', lineHeight: 1, letterSpacing: '-0.03em' }}>271</div>
              <p style={{ margin: 0, fontSize: 12, color: text, fontWeight: 500, lineHeight: 1.4 }}>
                hand-curated cases, not scraped
              </p>
            </div>

            {/* Floating stat: Modules */}
            <div style={{ position: 'absolute', top: 24, right: -16, backgroundColor: isDark ? 'var(--bg2)' : '#fff', padding: '12px 16px', borderRadius: 14, boxShadow: 'var(--card-shadow-lg)', maxWidth: 200, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--primary-bright)', lineHeight: 1, letterSpacing: '-0.03em' }}>57</div>
              <p style={{ margin: 0, fontSize: 12, color: text, fontWeight: 500, lineHeight: 1.4 }}>
                roadmap modules across all tracks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FIRM TICKER ──────────────────────────────── */}
      {/* TODO: Ankur to confirm exact company list + that logos exist before finalising this section (#3) */}
      <div style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, overflow: 'hidden', padding: '20px 0', backgroundColor: isDark ? '#141920' : '#f9f9f9' }}>
        <p style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: soft, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 16px' }}>Companies our roadmap prepares you for</p>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', animation: 'ticker 24s linear infinite', width: 'max-content', gap: 60, paddingRight: 60 }}>
            {[...TARGET_COMPANIES, ...TARGET_COMPANIES].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 140, flexShrink: 0 }}>
                <img src={f.logo} alt={f.n} style={{ height: 32, maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ── CHOOSE YOUR TRACK ────────────────────────── */}
      <section id="tracks" style={{ backgroundColor: altBg, padding: '88px 48px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: VS, border: `1px solid ${VG}`, fontSize: 11, fontWeight: 700, color: V, letterSpacing: '0.07em', marginBottom: 18 }}>CHOOSE YOUR TRACK</span>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 44, fontWeight: 800, color: text, margin: '0 0 10px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Four tracks.{' '}<em style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontWeight: 400, color: V }}>One platform.</em></h2>
              <p style={{ fontSize: 15, color: muted, margin: 0, lineHeight: 1.6 }}>Consulting and Product have live AI practice. Data &amp; BA and General Management get a full roadmap with curated resources.</p>
            </div>
          </Reveal>

          {/* 2×2 grid: Consulting + Product (top row), Data & BA + GM (bottom row) */}
          <div className="multi-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {TRACK_CARDS.map((t, i) => (
              <Reveal key={i} delay={i * 70}>
                <div style={{ borderRadius: 24, padding: '40px', background: isDark ? '#141920' : '#ffffff', border: `1px solid ${border}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)', transition: 'transform 0.2s,box-shadow 0.2s,border-color 0.2s', cursor: 'pointer', height: '100%', boxSizing: 'border-box' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 56px ${t.color}18`; e.currentTarget.style.borderColor = `${t.color}50` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = border }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: isDark ? t.darkBg : t.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.color}30`, overflow: 'hidden' }}>
                      {t.iconNode}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 20, fontWeight: 800, color: text, letterSpacing: '-0.01em' }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{t.sub}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, color: soft, lineHeight: 1.7, margin: '0 0 24px' }}>{t.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                    {t.tags.map(tag => (
                      <span key={tag} style={{ padding: '4px 12px', borderRadius: 100, background: isDark ? t.darkBg : t.lightBg, color: t.color, fontSize: 12, fontWeight: 600, border: `1px solid ${t.color}25` }}>{tag}</span>
                    ))}
                  </div>
                  <button onClick={() => navigate('/auth')} style={{ marginTop: 'auto', padding: '11px 28px', borderRadius: 9, border: 'none', background: t.color, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', boxShadow: `0 4px 16px ${t.color}40` }}>
                    Start this track →
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESOURCE TICKERS ──────────────────────────────── */}
      <div style={{ overflow: 'hidden', padding: '0 0 24px 0', backgroundColor: altBg }}>
        <p style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: soft, margin: '0 0 32px' }}>
          Curated from Leading Product and Consulting Casebooks
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', animation: 'ticker 35s linear infinite', width: 'max-content', gap: 16, paddingRight: 16 }}>
              {[...CONSULTING_RESOURCES, ...CONSULTING_RESOURCES].map((f, i) => (
                <span key={i} style={{ padding: '8px 20px', borderRadius: 100, border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', fontSize: 16, fontWeight: 700, color: isDark ? (f.darkC || '#fff') : (f.c || '#000'), fontFamily: f.font || 'inherit', letterSpacing: '-0.01em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {f.n}
                </span>
              ))}
            </div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', animation: 'ticker 35s linear infinite', animationDirection: 'reverse', width: 'max-content', gap: 16, paddingRight: 16 }}>
              {[...PRODUCT_RESOURCES, ...PRODUCT_RESOURCES].map((f, i) => (
                <span key={i} style={{ padding: '8px 20px', borderRadius: 100, border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', fontSize: 16, fontWeight: 700, color: isDark ? (f.darkC || '#fff') : (f.c || '#000'), fontFamily: f.font || 'inherit', letterSpacing: '-0.01em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {f.n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section style={{ background: `linear-gradient(135deg,${VM} 0%,${V} 50%,#5B21B6 100%)`, padding: '56px 48px', position: 'relative', overflow: 'hidden' }}>
        <Swirl style={{ position: 'absolute', top: -80, right: -80, width: 480, height: 480, color: 'rgba(255,255,255,0.07)', animation: 'spinSlow 60s linear infinite' }} />
        <div className="multi-col-grid" style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'stretch' }}>
          <Reveal>
            <div>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 50, fontWeight: 800, color: '#fff', margin: '0 0 18px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                Build your prep plan{' '}
                <em style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontWeight: 400, color: '#fbbf24' }}>today.</em>
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', margin: '0 0 36px', lineHeight: 1.65 }}>Takes two minutes. Pick your track, get your plan, start practicing.</p>
              <button onClick={() => navigate('/auth')}
                style={{ padding: '16px 48px', borderRadius: 11, border: 'none', background: '#fff', color: V, fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', fontFamily: 'Inter,sans-serif', transition: 'transform 0.15s,opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.92' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1' }}>
                Get started for free →
              </button>

            </div>
          </Reveal>
          {/* CTA hero image — direct grid child so alignSelf:stretch works */}
          <div id="cta-image-container" style={{ alignSelf: 'stretch', borderRadius: 24, overflow: 'hidden', minHeight: 200 }}>
            <img src={ctaHero} alt="KaseMate placement prep" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" style={{ backgroundColor: pageBg, padding: '96px 48px 0 48px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: VS, border: `1px solid ${VG}`, fontSize: 11, fontWeight: 700, color: V, letterSpacing: '0.07em', marginBottom: 18 }}>HOW IT WORKS</span>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 48, fontWeight: 800, color: text, margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
                Practice that{' '}
                <em style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontWeight: 400, color: V }}>actually sticks.</em>
              </h2>
              <p style={{ fontSize: 16, color: muted, maxWidth: 460, margin: '0 auto', lineHeight: 1.65 }}>Three steps. Every session you get better.</p>
            </div>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map((step, i) => {
              const isRight = step.side === 'right'
              const imgEl = (
                <div style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '4/3', background: (step as any).contain ? 'transparent' : (isDark ? step.darkBg : step.bg), position: 'relative', ...(isRight ? { marginLeft: 56 } : { marginRight: 56 }) }}>
                  <img src={step.img} alt={step.title} style={{ width: '100%', height: '100%', objectFit: (step as any).contain ? 'contain' : 'cover', objectPosition: 'center', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 16, ...(isRight ? { right: 16 } : { left: 16 }), background: step.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 100, letterSpacing: '0.05em' }}>{step.tag}</div>
                </div>
              )
              return (
                <Reveal key={i} delay={i * 60}>
                  <div className="multi-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: i === STEPS.length - 1 ? '64px 0 0 0' : '64px 0', borderBottom: i < STEPS.length - 1 ? `1px solid ${border}` : 'none' }}>
                    {!isRight && imgEl}
                    <div style={{ padding: isRight ? '0 48px 0 0' : '0 0 0 48px' }}>
                      <div style={{ width: 54, height: 54, borderRadius: '50%', background: isDark ? step.darkBg : step.bg, border: `2px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono,monospace', fontSize: 16, fontWeight: 700, color: step.color, marginBottom: 24, boxShadow: `0 0 24px ${step.color}30` }}>{step.n}</div>
                      <h3 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 34, fontWeight: 800, color: text, margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>{step.title}</h3>
                      <p style={{ fontSize: 16, color: muted, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 420 }}>{step.body}</p>
                      <button onClick={() => navigate('/auth')} style={{ padding: '10px 24px', borderRadius: 9, border: `1.5px solid ${step.color}`, background: 'transparent', color: step.color, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'background 0.15s, color 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = step.color; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = step.color }}>
                        Try it free →
                      </button>
                    </div>
                    {isRight && imgEl}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── VERIFIED BY (replaces fake testimonials) ──────────── */}
      {/* TODO: Ankur — swap all placeholder cards with real data before launch */}
      <section id="verified-by" style={{ backgroundColor: pageBg, padding: '96px 48px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, fontWeight: 700, color: '#d97706', letterSpacing: '0.07em', marginBottom: 18 }}>VERIFIED, NOT GUESSED</span>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 44, fontWeight: 800, color: text, margin: '0 0 12px', letterSpacing: '-0.03em' }}>
                Built with input from{' '}
                <em style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontWeight: 400, color: V }}>KGPians who've been through it.</em>
              </h2>
              <p style={{ fontSize: 15, color: muted, margin: '0 auto', maxWidth: 520, lineHeight: 1.65 }}>
                Every roadmap and case type was checked against real placement experience, not guesswork from a textbook.
              </p>
            </div>
          </Reveal>

          {/* 2×2 grid for all 4 tracks */}
          <div className="multi-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {SENIOR_VALIDATORS.map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{ background: cardBg, borderRadius: 24, padding: '36px', border: `1px solid ${border}`, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 24, transition: 'transform 0.2s,border-color 0.2s,box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${s.trackColor}40`; e.currentTarget.style.boxShadow = `0 12px 40px ${s.trackColor}15` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,0,0,0.05)' }}>

                  {/* Track badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: s.trackBg, border: `1px solid ${s.trackColor}30`, alignSelf: 'flex-start' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.trackColor, letterSpacing: '0.05em' }}>{s.track.toUpperCase()} TRACK</span>
                  </div>

                  {/* Avatar + identity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    {/* Gray circular avatar placeholder — TODO: Ankur to swap in real photo */}
                    <div style={{ width: 64, height: 64, borderRadius: '50%', flexShrink: 0, border: `2px solid ${s.trackColor}30`, background: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke={isDark ? '#4b5563' : '#9ca3af'} strokeWidth="1.5"/>
                        <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={isDark ? '#4b5563' : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      {/* TODO: Ankur to replace with real name */}
                      <div style={{ fontSize: 16, fontWeight: 700, color: text }}>{s.name}</div>
                      {/* TODO: Ankur to replace with real company and role */}
                      <div style={{ fontSize: 13, color: s.trackColor, fontWeight: 600, marginTop: 2 }}>{s.company}</div>
                      {/* TODO: Ankur to replace with real batch year */}
                      <div style={{ fontSize: 12, color: muted, marginTop: 1 }}>{s.batch}</div>
                    </div>
                  </div>

                  {/* Validation note */}
                  <div style={{ padding: '16px 20px', borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${border}` }}>
                    <p style={{ fontSize: 14, color: soft, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>"{s.note}"</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section id="faq" style={{ backgroundColor: altBg, padding: '88px 48px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: VS, border: `1px solid ${VG}`, fontSize: 11, fontWeight: 700, color: V, letterSpacing: '0.07em', marginBottom: 18 }}>FAQ</span>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 42, fontWeight: 800, color: text, margin: 0, letterSpacing: '-0.03em' }}>
                Questions{' '}
                <em style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontWeight: 400, color: V }}>answered.</em>
              </h2>
            </div>
          </Reveal>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${border}`, ...(i === 0 ? { borderTop: `1px solid ${border}` } : {}) }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', textAlign: 'left', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 600, color: text, gap: 16 }}>
                <span>{f.q}</span>
                <span style={{ fontSize: 22, color: openFaq === i ? V : muted, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s,color 0.2s' }}>+</span>
              </button>
              {openFaq === i && <p style={{ margin: '0 0 20px', fontSize: 14, color: muted, lineHeight: 1.78 }} dangerouslySetInnerHTML={{ __html: f.a }} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{ backgroundColor: footerBg, color: '#e2d9f3', padding: '64px 48px 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="landing-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 48, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
                <img src={logo} alt="KaseMate Logo" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} />
                <span style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontSize: 20, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em' }}>KaseMate</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(226,217,243,0.6)', lineHeight: 1.72, margin: '0 0 24px', maxWidth: 260 }}>Roadmap, Practice, and Performance, all in one. Built for IIT Kharagpur.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: 'LinkedIn', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>) },
                  { label: 'Instagram', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>) },
                ].map(s => (
                  <a key={s.label} href="#" aria-label={s.label}
                    style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(226,217,243,0.6)', textDecoration: 'none', transition: 'background 0.15s,color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = V; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(226,217,243,0.6)' }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>{heading}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {links.map(l => (
                    <li key={l.label}>
                      {l.action === 'feedback' ? (
                        <button onClick={() => setShowFeedback(true)}
                          style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', fontSize: 14, color: 'rgba(226,217,243,0.55)', textDecoration: 'none', transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,217,243,0.55)')}>{l.label}</button>
                      ) : (
                        <a href={l.to} style={{ fontSize: 14, color: 'rgba(226,217,243,0.55)', textDecoration: 'none', transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,217,243,0.55)')}>{l.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(226,217,243,0.6)' }}>v1.0 · Verified by Placement Batch of 2025-26</span>
              <span style={{ fontSize: 13, color: 'rgba(226,217,243,0.7)', fontWeight: 500 }}>Made with ❤️ by Ankur Dutta for Placement Season 2026-27.</span>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'rgba(226,217,243,0.4)' }}>© 2026 KaseMate</span>
              {['Privacy Policy','Terms of Use','Contact'].map(l => (
                <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(226,217,243,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,217,243,0.4)')}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {/* ── Keyframes ────────────────────────────────── */}
      <style>{`
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
    </div>
  )
}
