import React from 'react'
import { compilePlan } from '../../lib/roadmap-compiler'
import imgHero from '../../imports/onboarding-hero-new.webp'

import logoFlipkart from '../../imports/logos/flipkart.png'
import logoZomato from '../../imports/logos/zomato.png'
import logoOla from '../../imports/logos/ola.png'
import logoBlinkit from '../../imports/logos/blinkit.png'
import logoEma from '../../imports/logos/ema.png'
import logoNavi from '../../imports/logos/navi.png'
import logoMedianet from '../../imports/logos/medianet.png'
import logoSprinklr from '../../imports/logos/sprinklr.png'
import logoHilabs from '../../imports/logos/hilabs.png'
import logoCitymall from '../../imports/logos/citymall.png'
import logoMckinsey from '../../imports/logos/mckinsey.png'
import logoAccenture from '../../imports/logos/accenture.png'
import logoLyric from '../../imports/logos/lyric.png'
import logoZs from '../../imports/logos/zs.png'
import logoDeloitte from '../../imports/logos/deloitte.png'
import logoExl from '../../imports/logos/exl.png'
import logoPwc from '../../imports/logos/pwc.png'
import logoIndusinsights from '../../imports/logos/indusinsights.png'
import logoAyna from '../../imports/logos/ayna.png'
import logoAcuvon from '../../imports/logos/acuvon.png'
import logoJpmorgan from '../../imports/logos/jpmorgan.png'
import logoCapitalone from '../../imports/logos/capitalone.png'
import logoAmex from '../../imports/logos/amex.png'
import logoMoneyview from '../../imports/logos/moneyview.png'
import logoIdfc from '../../imports/logos/idfc.png'
import logoKotak from '../../imports/logos/kotak.png'
import logoMeesho from '../../imports/logos/meesho.png'
import logoCashfree from '../../imports/logos/cashfree.png'
import logoItc from '../../imports/logos/itc.png'
import logoIcici from '../../imports/logos/icici.png'
import logoSwiggy from '../../imports/logos/swiggy.png'
import logoAxis from '../../imports/logos/axis.png'
import logoTata from '../../imports/logos/tata.png'
import logoDtdc from '../../imports/logos/dtdc.png'
import logoJio from '../../imports/logos/jio.png'
import logoUrbancompany from '../../imports/logos/urbancompany.png'

interface PlanRevealProps {
  plan: {
    tracks: string[]
    total_weeks: number
    week_plan: any[]
  }
  onStart: () => void
}

function getHeadline(tracks: string[], weeks: number): string {
  const trackLabels: Record<string, string> = {
    product: 'Product',
    consulting: 'Consulting', 
    analyst: 'Data & Analyst',
    general: 'General Management'
  }
  const trackStr = tracks.map(t => trackLabels[t] || t).join(' + ')
  return `Your ${weeks}-week ${trackStr} plan.`
}

function getSubheading(tracks: string[], weeks: number): string {
  const topByTrack: Record<string, string> = {
    product: 'Flipkart, Ola and top product companies',
    consulting: 'McKinsey, Accenture S&C and top consulting firms',
    analyst: 'JP Morgan, Capital One and top analytics roles',
    general: 'ITC Limited, ICICI Bank and top MT programs'
  }
  
  if (tracks.length === 0) return 'Built to help you crack your placement.'
  if (tracks.length === 1) return `Built to get you into ${topByTrack[tracks[0]] || 'your target companies'}.`
  if (tracks.length === 2) {
    const t1 = tracks[0] === 'product' ? 'Flipkart' : 
                tracks[0] === 'consulting' ? 'McKinsey' :
                tracks[0] === 'analyst' ? 'JP Morgan' : 'ITC Limited'
    const t2 = tracks[1] === 'product' ? 'Ola' :
                tracks[1] === 'consulting' ? 'Accenture S&C' :
                tracks[1] === 'analyst' ? 'Capital One' : 'ICICI Bank'
    return `Built to get you into ${t1}, ${t2} and more.`
  }
  return `Built to cover ${tracks.length} tracks — OA, cases, interviews, and company-specific prep.`
}

function getStage1Description(tracks: string[], stage1Weeks: number): string {
  const parts = ['OA prep', 'DI', 'quant']
  if (tracks.includes('analyst')) parts.push('SQL', 'Python')
  if (tracks.includes('consulting')) parts.push('guesstimates', 'case mechanics')
  if (tracks.includes('product')) parts.push('product fundamentals')
  if (tracks.includes('general')) parts.push('business awareness')
  return `Weeks 1–${stage1Weeks} · ${parts.join(', ')}`
}

function getStage2Description(tracks: string[], stage1Weeks: number, totalWeeks: number): string {
  const parts: string[] = []
  if (tracks.includes('product')) parts.push('product design', 'RCA & metrics')
  if (tracks.includes('consulting')) parts.push('profitability cases', 'market entry')
  if (tracks.includes('analyst')) parts.push('SQL live coding', 'business cases')
  if (tracks.includes('general')) parts.push('case interviews', 'GD prep')
  parts.push('CV deep dive', 'mocks')
  return `Weeks ${stage1Weeks + 1}–${totalWeeks} · ${parts.join(', ')}`
}

const VERIFIERS: Record<string, {
  name: string
  batch: string
  company: string
  role: string
  initials: string
  color: string
  linkedin: string
  photo: string | null
  companyLogo: string
}[]> = {
  product: [
    {
      name: 'Arjun Mehta',
      batch: 'IIT KGP \'25',
      company: 'Flipkart',
      role: 'APM',
      initials: 'AM',
      color: '#7C3AED',
      linkedin: 'https://linkedin.com',
      photo: null,
      companyLogo: logoFlipkart
    },
    {
      name: 'Priya Sharma',
      batch: 'IIT KGP \'25',
      company: 'Ola',
      role: 'Product Manager',
      initials: 'PS',
      color: '#0EA5E9',
      linkedin: 'https://linkedin.com',
      photo: null,
      companyLogo: logoOla
    }
  ],
  consulting: [
    {
      name: 'Rohan Das',
      batch: 'IIT KGP \'25',
      company: 'McKinsey & Co',
      role: 'Business Analyst',
      initials: 'RD',
      color: '#10B981',
      linkedin: 'https://linkedin.com',
      photo: null,
      companyLogo: logoMckinsey
    },
    {
      name: 'Sneha Gupta',
      batch: 'IIT KGP \'25',
      company: 'Accenture S&C',
      role: 'Consultant',
      initials: 'SG',
      color: '#F59E0B',
      linkedin: 'https://linkedin.com',
      photo: null,
      companyLogo: logoAccenture
    }
  ],
  analyst: [
    {
      name: 'Karan Verma',
      batch: 'IIT KGP \'25',
      company: 'JP Morgan',
      role: 'DS Analyst',
      initials: 'KV',
      color: '#6366F1',
      linkedin: 'https://linkedin.com',
      photo: null,
      companyLogo: logoJpmorgan
    },
    {
      name: 'Aditi Singh',
      batch: 'IIT KGP \'25',
      company: 'American Express',
      role: 'MT Data Science',
      initials: 'AS',
      color: '#EC4899',
      linkedin: 'https://linkedin.com',
      photo: null,
      companyLogo: logoAmex
    }
  ],
  general: [
    {
      name: 'Rahul Joshi',
      batch: 'IIT KGP \'25',
      company: 'ITC Limited',
      role: 'AT (UT)',
      initials: 'RJ',
      color: '#14B8A6',
      linkedin: 'https://linkedin.com',
      photo: null,
      companyLogo: logoItc
    },
    {
      name: 'Meera Patel',
      batch: 'IIT KGP \'25',
      company: 'Swiggy',
      role: 'Graduate Trainee',
      initials: 'MP',
      color: '#F97316',
      linkedin: 'https://linkedin.com',
      photo: null,
      companyLogo: logoSwiggy
    }
  ]
}

const companiesByTrack: Record<string, {
  name: string
  role: string
  ctc: string
  ctcNum: number
  brand: number
  logo: string
}[]> = {
  product: [
    { name: 'Ola', role: 'Product Manager', ctc: '₹37L', ctcNum: 37, brand: 2,
      logo: logoOla },
    { name: 'Flipkart', role: 'APM 1', ctc: '₹26.8L', ctcNum: 26.8, brand: 1,
      logo: logoFlipkart },
    { name: 'Navi', role: 'Associate PM I', ctc: '₹31.3L', ctcNum: 31.3, brand: 3,
      logo: logoNavi },
    { name: 'HiLabs', role: 'Associate PM', ctc: '₹25.8L', ctcNum: 25.8, brand: 4,
      logo: logoHilabs },
    { name: 'Blinkit', role: 'Assoc. Program Manager', ctc: '₹17L', ctcNum: 17, brand: 2,
      logo: logoBlinkit },
    { name: 'ETERNAL (Zomato)', role: 'Product Analyst', ctc: '₹24L', ctcNum: 24, brand: 1,
      logo: logoZomato },
    { name: 'CityMall', role: 'Product Analyst', ctc: '₹24L', ctcNum: 24, brand: 4,
      logo: logoCitymall },
    { name: 'Sprinklr', role: 'Product Analyst', ctc: '₹15L', ctcNum: 15, brand: 3,
      logo: logoSprinklr },
    { name: 'Media.net', role: 'Sr. Product Analyst', ctc: '₹21L', ctcNum: 21, brand: 3,
      logo: logoMedianet },
    { name: 'Ema Unlimited', role: 'Assoc. Project Manager', ctc: '₹47L', ctcNum: 47, brand: 3,
      logo: logoEma },
  ],
  consulting: [
    { name: 'McKinsey & Co', role: 'Business Analyst', ctc: '₹21.5L', ctcNum: 21.5, brand: 1,
      logo: logoMckinsey },
    { name: 'Accenture S&C', role: 'S&C Delivery Associate', ctc: '₹21.4L', ctcNum: 21.4, brand: 1,
      logo: logoAccenture },
    { name: 'LYRIC', role: 'Assoc. Supply Chain Consultant', ctc: '₹27.6L', ctcNum: 27.6, brand: 3,
      logo: logoLyric },
    { name: 'ZS Associates', role: 'Decision Analytics Assoc.', ctc: '₹14.2L', ctcNum: 14.2, brand: 2,
      logo: logoZs },
    { name: 'Deloitte', role: 'Analyst', ctc: '₹12L', ctcNum: 12, brand: 1,
      logo: logoDeloitte },
    { name: 'EXL Service', role: 'Analytics Consultant I', ctc: '₹15.3L', ctcNum: 15.3, brand: 2,
      logo: logoExl },
    { name: 'PwC AC', role: 'Advisory Associate', ctc: '₹15L', ctcNum: 15, brand: 1,
      logo: logoPwc },
    { name: 'Indus Insights', role: 'Associate', ctc: '₹21.4L', ctcNum: 21.4, brand: 3,
      logo: logoIndusinsights },
    { name: 'Ayna.AI', role: 'Analyst', ctc: '₹15L', ctcNum: 15, brand: 4,
      logo: logoAyna },
    { name: 'Acuvon Consulting', role: 'Analyst', ctc: '₹16.9L', ctcNum: 16.9, brand: 4,
      logo: logoAcuvon },
  ],
  analyst: [
    { name: 'JPMorganChase', role: 'Data Science Analyst', ctc: '₹38.5L', ctcNum: 38.5, brand: 1,
      logo: logoJpmorgan },
    { name: 'Capital One', role: 'Business Analyst', ctc: '₹36.5L', ctcNum: 36.5, brand: 1,
      logo: logoCapitalone },
    { name: 'American Express', role: 'MT Data Science', ctc: '₹26.3L', ctcNum: 26.3, brand: 1,
      logo: logoAmex },
    { name: 'MONEYVIEW', role: 'Business Analyst', ctc: '₹25L', ctcNum: 25, brand: 3,
      logo: logoMoneyview },
    { name: 'IDFC FIRST Bank', role: 'Assoc. Data Analyst', ctc: '₹20L', ctcNum: 20, brand: 2,
      logo: logoIdfc },
    { name: 'Flipkart', role: 'Business Analyst', ctc: '₹19L', ctcNum: 19, brand: 1,
      logo: logoFlipkart },
    { name: 'ETERNAL (Zomato)', role: 'Data Scientist 1', ctc: '₹29L', ctcNum: 29, brand: 1,
      logo: logoZomato },
    { name: 'Kotak Mahindra Bank', role: 'Data Scientist', ctc: '₹18L', ctcNum: 18, brand: 2,
      logo: logoKotak },
    { name: 'Meesho', role: 'Data Scientist I', ctc: '₹24L', ctcNum: 24, brand: 2,
      logo: logoMeesho },
    { name: 'Cashfree Payments', role: 'Process Innovation Analyst', ctc: '₹23L', ctcNum: 23, brand: 3,
      logo: logoCashfree },
  ],
  general: [
    { name: 'ITC Limited', role: 'Asst. Under Training', ctc: '₹31.7L', ctcNum: 31.7, brand: 1,
      logo: logoItc },
    { name: 'ICICI Bank', role: 'Manager 1', ctc: '₹18L', ctcNum: 18, brand: 1,
      logo: logoIcici },
    { name: 'Swiggy', role: 'Graduate Trainee Growth', ctc: '₹17.5L', ctcNum: 17.5, brand: 1,
      logo: logoSwiggy },
    { name: 'Axis Bank', role: 'BIU Analyst', ctc: '₹14.4L', ctcNum: 14.4, brand: 2,
      logo: logoAxis },
    { name: 'Tata Steel', role: 'Management Trainee', ctc: '₹13L', ctcNum: 13, brand: 1,
      logo: logoTata },
    { name: 'Meesho', role: 'Sr. Associate Business Mgmt', ctc: '₹17.2L', ctcNum: 17.2, brand: 2,
      logo: logoMeesho },
    { name: 'DTDC Express', role: 'Management Trainee', ctc: '₹22L', ctcNum: 22, brand: 2,
      logo: logoDtdc },
    { name: 'Jio Financial Services', role: 'Trainee', ctc: '₹18L', ctcNum: 18, brand: 1,
      logo: logoJio },
    { name: 'ICICI Securities', role: 'Management Trainee', ctc: '₹18L', ctcNum: 18, brand: 2,
      logo: logoIcici },
    { name: 'Urban Company', role: 'Sr. Category Manager', ctc: '₹16L', ctcNum: 16, brand: 2,
      logo: logoUrbancompany },
  ]
}

function getCompanies(tracks: string[]) {
  // Collect all companies from selected tracks, deduplicated by name
  const seen = new Set<string>()
  const pool: (typeof companiesByTrack['product'][0] & { track: string })[] = []
  
  tracks.forEach(track => {
    (companiesByTrack[track] || []).forEach(c => {
      if (!seen.has(c.name)) {
        seen.add(c.name)
        pool.push({ ...c, track })
      }
    })
  })
  
  // Sort by brand rank first, then CTC descending
  pool.sort((a, b) => a.brand - b.brand || b.ctcNum - a.ctcNum)
  
  // Always return exactly 10
  return pool.slice(0, 10)
}

function CompanyLogo({ name, logo }: { name: string; logo: string }) {
  const colors = ['#7C3AED','#0EA5E9','#10B981','#F59E0B','#EC4899','#6366F1','#14B8A6','#F97316']
  const color = colors[name.charCodeAt(0) % colors.length]
  
  if (!logo) {
    return (
      <div style={{
        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
        background: color, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 11, fontWeight: 700,
        color: '#fff', fontFamily: 'Inter, sans-serif'
      }}>
        {name[0]}
      </div>
    )
  }
  
  return (
    <img
      src={logo}
      alt=""
      style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0, borderRadius: 4 }}
    />
  )
}

export default function PlanReveal({ plan, onStart }: PlanRevealProps) {
  const tracks = plan.tracks || []
  const totalWeeks = plan.total_weeks || 0

  const compiled = compilePlan(tracks as any, totalWeeks as any)

  const headline = getHeadline(tracks, totalWeeks)
  const subheading = getSubheading(tracks, totalWeeks)

  // Use compiler-derived totals directly — no recomputation needed
  const totalModules = compiled.totalModules
  const totalHours = compiled.totalHours

  // Stage Breakdown
  const stage1Cutoff = Math.ceil(0.45 * totalWeeks)
  const stage1Subtitle = getStage1Description(tracks, stage1Cutoff)
  const stage2Subtitle = getStage2Description(tracks, stage1Cutoff, totalWeeks)

  // Pick up to 3 Stage 1 module titles for pills
  const stage1ModuleTitles = compiled.weeks
    .flatMap((w) => w.modules.filter((m) => m.stage === 1))
    .slice(0, 3)
    .map((m) => m.title)

  const companies = getCompanies(tracks)

  function getVerifiers(tracks: string[]) {
    const result: typeof VERIFIERS['product'] = []
    
    // Always pick 1 per track first
    tracks.forEach(track => {
      const v = VERIFIERS[track]
      if (v && v[0]) result.push(v[0])
    })
    
    // Then fill up to exactly 4
    // Go through tracks again picking second verifier
    for (const track of tracks) {
      if (result.length >= 4) break
      const v = VERIFIERS[track]
      if (v && v[1] && !result.includes(v[1])) {
        result.push(v[1])
      }
    }
    
    // If still under 4, pick from any track
    if (result.length < 4) {
      const allTracks = ['product', 'consulting', 'analyst', 'general']
      for (const track of allTracks) {
        if (result.length >= 4) break
        const v = VERIFIERS[track]
        if (v) {
          for (const verifier of v) {
            if (result.length >= 4) break
            if (!result.includes(verifier)) result.push(verifier)
          }
        }
      }
    }
    
    return result.slice(0, 4)
  }

  const verifiers = getVerifiers(tracks)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '48px 24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        
        <div style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto 32px',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: 'var(--card-shadow)',
          position: 'relative'
        }}>
          {/* Gradient glow behind image */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%', height: '160%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 65%)',
            pointerEvents: 'none'
          }} />
          <img
            src={imgHero}
            alt="Your roadmap"
            style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div style={{
          display: 'inline-block',
          background: 'rgba(124,58,237,0.1)',
          color: 'var(--primary-bright)',
          fontSize: 12,
          fontWeight: 600,
          padding: '4px 14px',
          borderRadius: 20,
          marginBottom: 24
        }}>
          ✨ Your personalized plan is ready
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginBottom: 20,
          fontSize: 12,
          color: '#10B981',
          fontFamily: 'Inter, sans-serif'
        }}>
          <span>✓</span>
          <span>Plan reviewed by IIT KGP '25 placed seniors</span>
        </div>

        <h1 style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: 36,
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: 8,
          marginTop: 0
        }}>
          {headline}
        </h1>

        <div style={{
          fontSize: 16,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: 32
        }}>
          {subheading}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: compiled.densityWarning ? 16 : 40 }}>
          {[
            { value: totalModules, label: 'modules' },
            { value: `~${totalHours}h`, label: 'total prep time' },
            { value: totalWeeks, label: 'weeks' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderTop: '3px solid var(--primary-bright)',
              borderRadius: 14,
              padding: '20px 16px',
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
              flex: 1
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary-bright)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {compiled.densityWarning && (
          <div style={{
            marginBottom: 40,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.3)',
            fontSize: 13,
            color: '#92400e',
            lineHeight: 1.6,
            fontFamily: 'Inter, sans-serif'
          }}>
            <strong>Heads up:</strong> this is a triage plan. Four weeks across this many tracks
            means about {compiled.dailyTimeLabel}. Consider dropping a track or extending
            to 8 weeks.
          </div>
        )}

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            How your prep is structured
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Stage 1 */}
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 16px 16px 20px',
              display: 'flex',
              gap: 14,
              boxShadow: 'var(--card-shadow)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#F59E0B', borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(245,158,11,0.12)',
                  color: '#F59E0B',
                  fontSize: 11,
                  padding: '2px 10px',
                  borderRadius: 20,
                  marginBottom: 8,
                  fontWeight: 600
                }}>
                  Stage 1
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Get Shortlisted
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  {stage1Subtitle}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {stage1ModuleTitles.map((title, idx) => (
                    <div key={idx} style={{ background: 'var(--bg3)', padding: '4px 10px', borderRadius: 6, fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {title}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage 2 */}
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 16px 16px 20px',
              display: 'flex',
              gap: 14,
              boxShadow: 'var(--card-shadow)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--primary-bright)', borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(124,58,237,0.1)',
                  color: 'var(--primary-bright)',
                  fontSize: 11,
                  padding: '2px 10px',
                  borderRadius: 20,
                  marginBottom: 8,
                  fontWeight: 600
                }}>
                  Stage 2
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Convert the Interview
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  {stage2Subtitle}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 4,
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            Companies you can target
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginBottom: 14,
            fontFamily: 'Inter, sans-serif'
          }}>
            Based on IIT KGP placement data · 2025–26
          </div>

          {/* Company grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8
          }}>
            {companies.map((company, i) => (
              <div key={i} style={{
                padding: '9px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg2)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                boxShadow: 'var(--card-shadow)'
              }}>
                <CompanyLogo name={company.name} logo={company.logo} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {company.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
                  {company.role}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981', fontFamily: 'Inter, sans-serif', flexShrink: 0, marginLeft: 4 }}>
                  {company.ctc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {verifiers.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            {/* Section header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14
            }}>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'Inter, sans-serif'
              }}>
                Reviewed by IIT KGP '25 students placed in these domains
              </span>
            </div>

            {/* Verifier cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {verifiers.map((v, i) => (
                <a
                  key={i}
                  href={v.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--bg2)',
                    boxShadow: 'var(--card-shadow)',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#0A66C2')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {/* Person avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    flexShrink: 0, overflow: 'hidden',
                    border: '2px solid var(--border)'
                  }}>
                    {v.photo ? (
                      <img src={v.photo} alt={v.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', background: v.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: 14, fontWeight: 700, color: '#fff'
                      }}>
                        {v.initials}
                      </div>
                    )}
                  </div>

                  {/* Person name + batch */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                      {v.batch}
                    </div>
                  </div>

                  {/* Company info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <img 
                      src={v.companyLogo} 
                      alt={v.company}
                      style={{ 
                        width: 22, 
                        height: 22, 
                        objectFit: 'contain', 
                        borderRadius: 4, 
                        flexShrink: 0,
                        display: 'block'
                      }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ 
                        fontSize: 13, 
                        fontWeight: 600, 
                        color: 'var(--text-primary)', 
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: 1.3
                      }}>
                        {v.company}
                      </div>
                      <div style={{ 
                        fontSize: 11, 
                        color: 'var(--text-muted)', 
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: 1.3
                      }}>
                        {v.role}
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn button */}
                  <div style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 6,
                    background: '#0A66C2', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginLeft: 4
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                </a>
              ))}
            </div>

            {/* Disclaimer */}
            <p style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 8,
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'italic'
            }}>
              * Profiles and LinkedIn links will be updated with real verified seniors shortly.
            </p>
          </div>
        )}

        <button
          onClick={onStart}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, var(--primary-mid), var(--primary))',
            color: 'white',
            fontSize: 17,
            fontWeight: 700,
            padding: 16,
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            marginTop: 32,
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Start Week 1 →
        </button>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
          Your progress is saved automatically. You can pause and resume anytime.
        </div>

      </div>
    </div>
  )
}
