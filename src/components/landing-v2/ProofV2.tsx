import React from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'

// Logo imports
import logoMckinsey from '@/imports/logos/mckinsey.jpg'
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
import logoOla from '@/imports/logos/ola.png'
import logoBlinkit from '@/imports/logos/blinkit.png'
import logoEma from '@/imports/logos/ema.png'
import logoNavi from '@/imports/logos/navi.svg'
import logoMedianet from '@/imports/logos/medianet.png'
import logoSprinklr from '@/imports/logos/sprinklr.png'
import logoHilabs from '@/imports/logos/hilabs.svg'
import logoCitymall from '@/imports/logos/citymall.jpg'
import logoLyric from '@/imports/logos/lyric.png'
import logoZs from '@/imports/logos/zs.png'
import logoExl from '@/imports/logos/exl.png'
import logoIndusinsights from '@/imports/logos/indusinsights.jpg'
import logoAyna from '@/imports/logos/ayna.png'
import logoAcuvon from '@/imports/logos/acuvon.png'
import logoMoneyview from '@/imports/logos/moneyview.png'
import logoIdfc from '@/imports/logos/idfc.png'
import logoKotak from '@/imports/logos/kotak.png'
import logoMeesho from '@/imports/logos/meesho.png'
import logoCashfree from '@/imports/logos/cashfree.png'
import logoAxis from '@/imports/logos/axis.png'
import logoDtdc from '@/imports/logos/dtdc.png'
import logoUrbancompany from '@/imports/logos/urbancompany.jpg'

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
  { n: 'Ola', logo: logoOla },
  { n: 'Blinkit', logo: logoBlinkit },
  { n: 'Ema', logo: logoEma },
  { n: 'Navi', logo: logoNavi },
  { n: 'Media.net', logo: logoMedianet },
  { n: 'Sprinklr', logo: logoSprinklr },
  { n: 'HiLabs', logo: logoHilabs },
  { n: 'CityMall', logo: logoCitymall },
  { n: 'Lyric', logo: logoLyric },
  { n: 'ZS Associates', logo: logoZs },
  { n: 'EXL', logo: logoExl },
  { n: 'Indus Insights', logo: logoIndusinsights },
  { n: 'Ayna', logo: logoAyna },
  { n: 'Acuvon', logo: logoAcuvon },
  { n: 'Moneyview', logo: logoMoneyview },
  { n: 'IDFC', logo: logoIdfc },
  { n: 'Kotak Mahindra Bank', logo: logoKotak },
  { n: 'Meesho', logo: logoMeesho },
  { n: 'Cashfree', logo: logoCashfree },
  { n: 'Axis Bank', logo: logoAxis },
  { n: 'DTDC', logo: logoDtdc },
  { n: 'Urban Company', logo: logoUrbancompany },
]

export default function ProofV2() {
  return (
    <section
      id="proof"
      style={{
        background: 'var(--lv2-bg)',
        padding: 'clamp(80px, 12svh, 160px) 0 clamp(40px, 8svh, 80px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 1000,
          margin: '0 auto',
          padding: '0 clamp(20px, 5vw, 40px)',
          textAlign: 'center',
        }}
      >
        {/* Tagline */}
        <ScrollReveal y={20} duration={0.8} delay={0.2}>
          <p
            style={{
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              fontWeight: 500,
              color: 'var(--lv2-text-muted)',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              marginBottom: 32,
            }}
          >
            BUILT BY <em style={{ color: 'var(--lv2-accent)', fontStyle: 'normal' }}>KGPIANS</em>, FOR <em style={{ color: 'var(--lv2-accent)', fontStyle: 'normal' }}>KGPIANS</em>.
          </p>
        </ScrollReveal>
      </div>

      {/* Infinite Logo Marquee */}
      <div
        style={{
          width: '100%',
          padding: '32px 0 0',
          position: 'relative',
        }}
      >
        <p
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--lv2-text-faint)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            margin: '0 0 24px 0',
            position: 'relative',
            zIndex: 3,
          }}
        >
          Companies you're preparing for
        </p>

        {/* Left/Right Fade Masks */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
            background: `
              linear-gradient(90deg, rgba(10,10,15,1) 0%, rgba(10,10,15,0) 15%, rgba(10,10,15,0) 85%, rgba(10,10,15,1) 100%)
            `,
          }}
        />
        
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <motion.div
            style={{
              display: 'flex',
              gap: 64,
              paddingRight: 64,
              width: 'max-content',
            }}
            animate={{ x: [0, '-50%'] }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {/* Double the array for seamless looping */}
            {[...TARGET_COMPANIES, ...TARGET_COMPANIES].map((company, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 40,
                  opacity: 0.85,
                }}
              >
                <img
                  loading="lazy"
                  src={company.logo}
                  alt={company.n}
                  style={{
                    height: '100%',
                    maxWidth: 120,
                    objectFit: 'contain',
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
