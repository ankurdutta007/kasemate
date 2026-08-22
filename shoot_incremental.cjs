const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const casesFile = '/Users/ankurdutta/Downloads/code/src/components/landing-v2/CasesV2.tsx';
  let originalCode = fs.readFileSync(casesFile, 'utf8');

  // We will rewrite CasesV2.tsx to accept a slice of CASE_TYPES
  const testCode = `
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { HERO_STATS } from './content'
import ScrollReveal from './ScrollReveal'

const CASE_TYPES = [
  { label: 'Mergers & Acquisitions', stage: 2 },
  { label: 'Market Entry', stage: 1 },
  { label: 'Product Design', stage: 2 },
  { label: 'Profitability', stage: 1 },
  { label: 'Metrics', stage: 2 },
  { label: 'Guesstimate', stage: 1 },
  { label: 'Go-To-Market', stage: 2 },
]

export default function CasesV2() {
  const prefersReducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const stat = HERO_STATS.find(s => s.value === '271') ?? HERO_STATS[1]

  // READ FROM WINDOW FOR TESTING
  const count = typeof window !== 'undefined' ? (window.TEST_CARD_COUNT || 1) : 1;
  const visibleCases = CASE_TYPES.slice(0, count);

  return (
    <section
      id="cases"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: 'var(--lv2-bg)',
        padding: 'clamp(64px, 10svh, 120px) clamp(20px, 5vw, 40px) clamp(100px, 15svh, 180px)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <header style={{ textAlign: 'center', marginBottom: 'clamp(48px, 8svh, 80px)' }}>
          <ScrollReveal y={24} duration={0.6}>
            <p className="lv2-display" style={{ margin: 0, fontSize: 'clamp(56px, 9vw, 96px)', lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--lv2-accent)' }}>
              {stat.value}
            </p>
            <p style={{ margin: '14px 0 0', fontSize: 'clamp(14px, 1.6vw, 18px)', color: 'var(--lv2-text-muted)' }}>
              {stat.label}
            </p>
          </ScrollReveal>
        </header>

        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 240, // narrower cards so they fit when spread
            aspectRatio: '3 / 4',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            perspective: 1000,
          }}
        >
          {visibleCases.map((c, i) => {
            const centerIdx = Math.floor(visibleCases.length / 2)
            const offset = i - centerIdx 

            const baseX = offset * 45 // spread horizontally
            const baseRotate = offset * 5 
            const baseY = Math.abs(offset) * 12 
            
            const parallaxRotate = useTransform(scrollYProgress, [0, 1], [0, offset * 2])
            const parallaxY = useTransform(scrollYProgress, [0, 1], [0, Math.abs(offset) * 6])
            const parallaxX = useTransform(scrollYProgress, [0, 1], [0, offset * 10])

            const finalRotate = useTransform(parallaxRotate, r => baseRotate + r)
            const finalY = useTransform(parallaxY, py => baseY - py)
            const finalX = useTransform(parallaxX, px => baseX + px)

            return (
              <ScrollReveal
                key={c.label}
                delay={0} // Disable stagger for instant test
                duration={0.1}
                y={0}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  transformOrigin: 'bottom center',
                  zIndex: i,
                }}
              >
                <motion.div
                  className={\`lv2-card-stack-item lv2-layer--s\${c.stage}\`}
                  style={{
                    width: '100%',
                    height: '100%',
                    rotate: finalRotate,
                    y: finalY,
                    x: finalX,
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 24,
                    background: 'var(--lv2-bg-elevated)', // opaque
                    boxShadow: '0 4px 24px rgba(10, 10, 15, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: 16,
                    marginBottom: 16,
                  }}>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: '#ffffff', // explicit white
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                    }}>
                      {c.label}
                    </span>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', marginBottom: 8 }} />
                    <div style={{ width: '70%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ width: '90%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ width: '50%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
                  </div>
                </motion.div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
  `;

  fs.writeFileSync(casesFile, testCode);
  
  await new Promise(r => setTimeout(r, 2000)); // wait for vite hmr
  
  for (let count = 1; count <= 7; count += 2) {
    
    // Evaluate count script before rendering
    await page.evaluateOnNewDocument((c) => {
      window.TEST_CARD_COUNT = c;
    }, count);
    
    await page.goto('http://localhost:8443/preview-v2?count=' + count, { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      const el = document.getElementById('cases');
      if (el) {
        window.scrollTo(0, el.offsetTop + el.offsetHeight - window.innerHeight);
      }
    });
    
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/cases_spread_' + count + '.png' });
  }

  // Restore original
  fs.writeFileSync(casesFile, originalCode);

  await browser.close();
})();
