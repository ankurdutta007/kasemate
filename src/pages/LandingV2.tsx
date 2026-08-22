import React, { useEffect, useRef } from 'react'
import { motion, useInView, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import NavV2 from '../components/landing-v2/NavV2'
import HeroV2 from '../components/landing-v2/HeroV2'
import TracksV2 from '../components/landing-v2/TracksV2'
import RoadmapV2 from '../components/landing-v2/RoadmapV2'
import CasesV2 from '../components/landing-v2/CasesV2'
import InterviewV2 from '../components/landing-v2/InterviewV2'
import ProofV2 from '../components/landing-v2/ProofV2'
import ClosingV2 from '../components/landing-v2/ClosingV2'
import ScrollReveal from '../components/landing-v2/ScrollReveal'
import { HERO_STATS } from '../components/landing-v2/content'
import { useLenisScroll } from '../components/landing-v2/useLenisScroll'
import '../components/landing-v2/landing-v2.css'

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const spring = useSpring(0, { duration: 2500, bounce: 0 })
  const display = useTransform(spring, (current) => Math.floor(current))

  useEffect(() => {
    if (inView) {
      spring.set(value)
    }
  }, [inView, spring, value])

  return <motion.span ref={ref}>{display}</motion.span>
}

function StatsTransitionV2() {
  return (
    <section style={{ background: 'var(--lv2-bg)', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'clamp(40px, 8vw, 80px)',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {HERO_STATS.map((stat, i) => (
          <ScrollReveal key={i} delay={i * 0.1} y={20} duration={0.8}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div
                className="lv2-display"
                style={{
                  fontFamily: 'var(--lv2-font-number)',
                  fontSize: 'clamp(48px, 8vw, 72px)',
                  fontWeight: 500,
                  color: 'var(--lv2-text)',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}
              >
                <AnimatedNumber value={parseInt(stat.value, 10)} />
              </div>
              <div
                style={{
                  fontSize: 'clamp(14px, 1.4vw, 16px)',
                  color: 'var(--lv2-text-muted)',
                  maxWidth: 200,
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                {stat.label}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

/**
 * LandingV2 — work-in-progress redesign of the landing page.
 * Lives at /preview-v2. The live landing page (src/pages/Landing.tsx at "/")
 * is completely untouched by anything in here.
 *
 * ── How this page stays sealed off from the rest of the app ──────────────
 *
 * Colours & fonts: declared as CSS variables on the `.lv2-root` wrapper below,
 *   inside src/components/landing-v2/landing-v2.css. Because they're scoped to
 *   this element rather than `:root`, they cannot reach any other route. The
 *   global theme and Tailwind config are untouched.
 *
 * Smooth scroll: Lenis is created when this page mounts and destroyed when it
 *   unmounts (see useLenisScroll.ts), so navigating away restores normal
 *   browser scrolling everywhere else.
 *
 * ── Reduced motion ───────────────────────────────────────────────────────
 * `useReducedMotion()` reads the operating system's "reduce motion" setting.
 * When it's on, three things happen:
 *   1. Lenis is never started — the visitor gets plain native scrolling.
 *   2. Framer Motion animations are handed 0-second durations and their
 *      finished values as their starting values, so the page renders in its
 *      final state immediately rather than animating into it.
 *   3. A `@media (prefers-reduced-motion: reduce)` block in landing-v2.css
 *      flattens any remaining CSS transition or animation, as a safety net.
 */
export default function LandingV2() {
  const prefersReducedMotion = useReducedMotion()

  // Lenis runs only when the visitor hasn't asked for reduced motion.
  useLenisScroll(!prefersReducedMotion)

  return (
    <div className="lv2-root">
      <NavV2 />
      <main>
        <HeroV2 />
        <TracksV2 />
        <RoadmapV2 />
        <CasesV2 />
        <ProofV2 />
        <InterviewV2 />
        <StatsTransitionV2 />
        <ClosingV2 />
      </main>
    </div>
  )
}
