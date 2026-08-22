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

  // Tracking the scroll for subtle parallax on the cards.
  // We use ['start end', 'end start'] so it covers the entire time the section is on screen.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const stat = HERO_STATS.find(s => s.value === '271') ?? HERO_STATS[1]

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
      {/* ── Background Image Layer ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: 'url(/landing-v2/proof-bg-v2.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: 'clamp(48px, 8svh, 80px)' }}>
          <ScrollReveal y={24} duration={0.6}>
            <p
              className="lv2-display"
              style={{
                fontFamily: 'var(--lv2-font-number)',
                fontWeight: 500,
                margin: 0,
                fontSize: 'clamp(56px, 9vw, 96px)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: 'var(--lv2-accent)',
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                margin: '14px 0 0',
                fontSize: 'clamp(14px, 1.6vw, 18px)',
                color: 'var(--lv2-text-muted)',
              }}
            >
              {stat.label}
            </p>
          </ScrollReveal>
        </header>

        {/* ── Card Stack ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 240, // narrower stack width so it fans out neatly without exceeding the screen too early
            aspectRatio: '3 / 4',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            perspective: 1000,
          }}
        >
          {CASE_TYPES.map((c, i) => {
            const centerIdx = Math.floor(CASE_TYPES.length / 2)
            const offset = i - centerIdx // e.g. -3, -2, -1, 0, 1, 2, 3

            // Base transforms
            const baseX = offset * 45 // spread horizontally
            const baseRotate = offset * 5 
            const baseY = Math.abs(offset) * 12 // Outer cards sit slightly higher/lower
            
            // Subtle parallax
            const parallaxRotate = useTransform(scrollYProgress, [0, 1], [0, offset * 3.5])
            const parallaxY = useTransform(scrollYProgress, [0, 1], [0, Math.abs(offset) * 10])
            const parallaxX = useTransform(scrollYProgress, [0, 1], [0, offset * 18])

            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 60, rotate: 0, x: 0 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  rotate: prefersReducedMotion ? baseRotate : baseRotate,
                  x: prefersReducedMotion ? baseX : baseX,
                }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.04, // 0.24s max delay + 0.35s duration = 0.59s total
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  transformOrigin: 'bottom center',
                  zIndex: i,
                }}
              >
                <motion.div
                  className={`lv2-card-stack-item lv2-layer--s${c.stage}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    rotate: prefersReducedMotion ? 0 : parallaxRotate,
                    y: prefersReducedMotion ? baseY : useTransform(parallaxY, py => baseY - py),
                    x: prefersReducedMotion ? 0 : parallaxX,
                    transformOrigin: 'bottom center',
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 24,
                    background: 'var(--lv2-bg-elevated)', // FORCE opaque background so cards don't bleed through
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
                      color: '#ffffff', // explicit white instead of variable, to guarantee contrast
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap', // keep it on one line so it sticks out
                    }}>
                      {c.label}
                    </span>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      marginBottom: 8,
                    }} />
                    <div style={{ 
                      width: '70%', 
                      height: 8, 
                      borderRadius: 4, 
                      background: 'rgba(255,255,255,0.05)',
                    }} />
                    <div style={{ 
                      width: '90%', 
                      height: 8, 
                      borderRadius: 4, 
                      background: 'rgba(255,255,255,0.05)'
                    }} />
                    <div style={{ 
                      width: '50%', 
                      height: 8, 
                      borderRadius: 4, 
                      background: 'rgba(255,255,255,0.05)'
                    }} />
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
