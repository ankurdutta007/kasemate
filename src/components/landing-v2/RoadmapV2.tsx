import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { HERO_STATS } from './content'

/**
 * The eight layers, derived from the real module library.
 *
 * content.ts carries no roadmap phase copy, so these names come from the
 * `family` values in src/data/roadmap-modules.json, title-cased and bucketed.
 * The counts are the real module counts and sum to exactly 57 — the same 57
 * quoted in HERO_STATS — with every module covered by exactly one group.
 *
 * `stage` is the module's real stage from src/lib/roadmap-compiler.ts:
 *   1 = "Get Shortlisted", 2 = "Convert the Interview".
 * It drives the amber/violet split, so the colour change lands on the genuine
 * boundary rather than an arbitrary one.
 */
const LAYERS = [
  { label: 'Foundations', count: 3, stage: 1 },
  { label: 'Aptitude', count: 6, stage: 1 },
  { label: 'Guesstimates & Puzzles', count: 4, stage: 1 },
  { label: 'SQL & Python', count: 6, stage: 1 },
  { label: 'Business & Stats', count: 8, stage: 1 },
  { label: 'Consulting Cases', count: 7, stage: 2 },
  { label: 'Product Cases', count: 8, stage: 2 },
  { label: 'Interviews & Mocks', count: 15, stage: 2 },
] as const

/**
 * Vertical pitch between layers once fully separated, in px — and the pitch
 * while still closed. The same pitch drives both desktop and mobile now that
 * the layouts are unified, eliminating the need to sync with CSS breakpoints.
 */
const PITCH = { row: 68, closed: 8, rowH: 54 }

type Layer = (typeof LAYERS)[number]

function StackLayer({
  layer,
  index,
  progress,
  reduced,
  row,
  closedPitch,
}: {
  layer: Layer
  index: number
  progress: MotionValue<number>
  reduced: boolean
  row: number
  closedPitch: number
}) {
  const closed = index * closedPitch
  const open = index * row

  // Transform values scrub reliably, so the separation itself stays a Framer
  // MotionValue. The two fades do NOT — see the note in landing-v2.css — and
  // are driven by CSS custom properties from the parent instead.
  //
  // The input range spans the full 0..1. A range that stops short (e.g.
  // [0, 0.7]) does NOT clamp: the value climbs back as progress runs past the
  // last stop, which is the flicker bug from Round 2.
  const y = useTransform(progress, [0, 1], [closed, open])

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        // Closed deck reads top-down, so earlier layers sit above later ones.
        zIndex: LAYERS.length - index,
        y: reduced ? open : y,
      }}
    >
      <div className={`lv2-layer-row lv2-layer--s${layer.stage}`}>
        <div className="lv2-layer-bar">
          {Array.from({ length: layer.count }, (_, t) => (
            <span key={t} className="lv2-layer-tick" />
          ))}
        </div>
        <div className="lv2-layer-annot">
          <span className="lv2-layer-label">{layer.label}</span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * RoadmapV2 — beat 4: the 57-module roadmap as a deck that opens on scroll.
 *
 * ── Non-pinned, by design ────────────────────────────────────────────────
 * The brief said to try the simple version first, and it holds up here. The
 * separation is driven continuously by `useScroll` on the STACK (see below for
 * why not the section), so the deck opens as you approach it and is fully
 * spread by the time it's completely on screen.
 *
 * Pinning would buy nothing here. The hero needed a runway because its exit had
 * to *finish* before the next section could start entering; this animation has
 * no such handoff to protect — it just needs to track approach. Skipping the pin
 * also avoids the scroll-budget cost and the `svh`/offset subtleties that made
 * Round 2 expensive. If the open ever feels rushed, widening the offset window
 * is a one-line change before reaching for a runway.
 */
export default function RoadmapV2() {
  const prefersReducedMotion = useReducedMotion()
  const reduced = Boolean(prefersReducedMotion)
  const stackRef = useRef<HTMLDivElement>(null)
  const { row, closed, rowH } = PITCH
  const stackHeight = (LAYERS.length - 1) * row + rowH

  // Anchored to the STACK, not the section. Against the section, progress 0
  // lands while the section is still entirely below the fold — the deck would
  // finish half-opening before you ever saw it closed. Against the stack,
  // progress 0 is the moment the closed deck edges into view from the bottom
  // and 1 is when it sits centred, so the whole open happens on screen.
  //
  // `['start end', 'end end']` = start opening the moment the deck edges in
  // from the bottom, finish exactly when the whole deck is on screen. Not
  // `'center center'`: centring the stack demands more scroll than the page has
  // while this is the last section, so the deck stalled at ~90% open and never
  // finished — the same "animation needs more runway than exists" trap as the
  // hero in Round 2. Completing on "fully visible" is always reachable.
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ['start end', 'end end'],
  })

  // Fades, written to the stack as CSS custom properties. All eight layers
  // share one curve each, so two variables cover the whole deck.
  const barReveal = useTransform(scrollYProgress, [0, 0.45, 1], [0.5, 1, 1])
  const labelReveal = useTransform(scrollYProgress, [0.3, 0.75, 1], [0, 1, 1])

  const writeVar = (name: string, v: number) =>
    stackRef.current?.style.setProperty(name, String(v))

  useMotionValueEvent(barReveal, 'change', v => {
    if (!reduced) writeVar('--lv2-bar-reveal', v)
  })
  useMotionValueEvent(labelReveal, 'change', v => {
    if (!reduced) writeVar('--lv2-label-reveal', v)
  })

  // Seed on mount: `change` only fires once scroll moves, and reduced-motion
  // users get the finished state outright.
  useEffect(() => {
    if (reduced) {
      writeVar('--lv2-bar-reveal', 1)
      writeVar('--lv2-label-reveal', 1)
    } else {
      writeVar('--lv2-bar-reveal', barReveal.get())
      writeVar('--lv2-label-reveal', labelReveal.get())
    }
  }, [reduced, barReveal, labelReveal])

  const stat = HERO_STATS.find(s => s.value === '57') ?? HERO_STATS[0]

  return (
    <section
      id="roadmap"
      style={{
        position: 'relative',
        background: 'var(--lv2-bg)',
        padding: 'clamp(64px, 10svh, 120px) clamp(20px, 5vw, 40px) clamp(72px, 11svh, 130px)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* ── Header: the only roadmap copy that exists in content.ts ── */}
        <header style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6svh, 64px)' }}>
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
        </header>

        {/* ── The deck. Fixed height so opening it causes no layout shift.
             `--lv2-layer-row-h` set inline so it's correct on the very first
             paint, preventing flashes of incorrect height. ── */}
        <div
          ref={stackRef}
          style={{
            position: 'relative',
            height: stackHeight,
            ['--lv2-layer-row-h' as string]: `${rowH}px`,
          }}
        >
          {LAYERS.map((layer, i) => (
            <StackLayer
              key={layer.label}
              layer={layer}
              index={i}
              progress={scrollYProgress}
              reduced={reduced}
              row={row}
              closedPitch={closed}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
