import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion'
import { HERO } from './content'

/** Gentle deceleration curve used for the entrance animations. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const

/**
 * HeroV2 — beat 1 of the LandingV2 redesign.
 *
 * ── About the background image ──────────────────────────────────────────
 * The <picture> element below serves:
 *
 *     /public/landing-v2/hero.webp          (desktop / tablet)
 *     /public/landing-v2/hero-mobile.webp   (below 768px wide)
 *
 * The dark radial gradient on the same layer sits *behind* the image. It shows
 * through only in the moment before the image decodes, and stays as a sane
 * backdrop if a request ever fails.
 */
export default function HeroV2() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  // Track scroll progress across the hero's RUNWAY (the tall outer section).
  //
  // `['start start', 'end end']` maps 0 -> 1 over exactly the distance the
  // sticky child stays pinned: runway height minus one viewport, i.e. 80svh.
  // That matters. With the old `'end start'` the animation wanted a full runway
  // height of scroll, more than the page had, so it was truncated at 60% and
  // never finished. Now progress hits 1 at the precise moment the pin releases
  // and the next section starts entering.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Background creeps up in scale as you scroll past. Text fades and drifts up.
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  // Input range MUST span the full 0..1 of progress and explicitly hold at 0.
  // Written as [0, 0.6] -> [1, 0] the text fades out by 0.6 and then fades back
  // IN as progress runs on to 1 — out-of-range input is not held at the last
  // output value. That produced a visible text/no-text/text flicker. The extra
  // [.., 1] -> [.., 0] stop pins it dark for the rest of the runway.
  const textOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0, 0])
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60])
  // The artwork fades too, finishing at 0.85 — a little after the text at 0.6,
  // so the image lingers briefly on its own instead of both vanishing together.
  // Without this only the text faded, and the hero's desk/laptop/figure stayed
  // fully lit right up to the handoff, clashing with the turn section's glow.
  // Same explicit full-range form as above: an input range that stops short of
  // 1 lets the value climb back up once progress runs past its last stop.
  const bgOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0, 0])

  // With "reduce motion" on we hand Framer static values instead of the
  // scroll-linked ones, so the hero renders in its resting state and stays put.
  const bgStyle = prefersReducedMotion ? {} : { scale: bgScale, opacity: bgOpacity }
  const textStyle = prefersReducedMotion ? {} : { opacity: textOpacity, y: textY }

  // Entrance: children fade up ~100ms apart. Reduced motion collapses the whole
  // thing to zero duration and zero delay, so it appears already finished.
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.15,
      },
    },
  }

  const item: Variants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.7, ease: EASE_OUT },
    },
  }

  return (
    <section
      id="top"
      ref={sectionRef}
      style={{
        position: 'relative',
        // ── The runway ──
        // 180svh tall. The child below pins for the first 80svh of scrolling,
        // which is the distance the exit animation plays over; then the pin
        // releases and the runway's last viewport-height scrolls away normally,
        // handing off to the next section.
        //
        // Deliberately NO `overflow: hidden` here: any overflow other than
        // `visible` on an ancestor silently disables `position: sticky` on the
        // child. The clipping the hero needs lives on the sticky stage instead.
        //
        // With "reduce motion" on there is no exit animation to play, so the
        // runway would just be 80svh of scrolling where nothing happens. Those
        // visitors get a plain one-viewport hero instead.
        height: prefersReducedMotion ? '100svh' : '180svh',
      }}
    >
      {/* ── The pinned stage: one viewport tall, holds every visual layer ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        {/* ── Layer 1: background (placeholder gradient + real image on top) ── */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -2,
          // Sits behind the image: covers the pre-decode moment, and remains a
          // sane backdrop if a request ever fails.
          background:
            'radial-gradient(120% 90% at 50% 15%, #1a2340 0%, #0A0A0F 70%)',
          ...bgStyle,
        }}
      >
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/landing-v2/hero-v4.webp"
            type="image/webp"
          />
          <source srcSet="/landing-v2/hero-v4.webp" type="image/webp" />
          <img
            fetchPriority="high"
            src="/landing-v2/hero-v4.webp"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
        </picture>
      </motion.div>

      {/* ── Layer 2: readability scrim over the image ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          // Final stop is fully opaque, not 0.88: at 0.88 the bright artwork
          // still showed through the last row of pixels, so the hero ended
          // washed-out and met TurnV2's dark top edge as a hard seam. Landing
          // on solid --lv2-bg lets the two sections meet invisibly.
          background:
            'linear-gradient(180deg, rgba(10,10,15,0.72) 0%, rgba(10,10,15,0.42) 38%, rgba(10,10,15,1) 100%)',
        }}
      />

      {/* ── Layer 3: content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 900,
          padding: '140px clamp(20px, 5vw, 40px) 100px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...textStyle,
        }}
      >
        <motion.h1
          variants={item}
          className="lv2-display"
          style={{
            // Capped at 70px: Libre Baskerville is a wider typeface than Space Grotesk.
            // 70px keeps the headline firmly on two lines up to 2560px without overlapping the subhead.
            fontSize: 'clamp(44px, 8.5vw, 70px)',
            // 1.04 was tight enough that italic descenders ("g" in
            // "organized") spilled ~9px below the h1's box and crowded the
            // paragraph. 1.1 keeps the display leading tight but contained.
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--lv2-text)',
            margin: 0,
            textWrap: 'balance',
          }}
        >
          {HERO.headline.lead}{' '}
          <em className="lv2-display-italic" style={{ color: 'var(--lv2-accent)' }}>
            {HERO.headline.emphasis}
          </em>
        </motion.h1>

        <motion.p
          variants={item}
          style={{
            // 40px (was 28px) so the gap survives any leftover descender
            // overflow no matter how many lines the headline wraps to.
            margin: '40px 0 0',
            maxWidth: 600,
            fontSize: 'clamp(16px, 1.8vw, 20px)',
            lineHeight: 1.7,
            color: 'var(--lv2-text-muted)',
          }}
        >
          {HERO.subhead.map((part, i) => (
            <span
              key={i}
              style={part.accent ? { color: 'var(--lv2-accent)' } : undefined}
            >
              {part.text}
            </span>
          ))}
        </motion.p>

        <motion.div
          variants={item}
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => navigate('/auth')}
            className="lv2-pill"
            style={{ padding: '15px 32px', fontSize: 15, fontWeight: 500 }}
          >
            {HERO.primaryCta}
          </button>
          <a
            href={HERO.secondaryCtaHref}
            className="lv2-textlink"
            style={{ padding: '15px 20px', fontSize: 15, fontWeight: 500 }}
          >
            {HERO.secondaryCta}
          </a>
        </motion.div>
      </motion.div>
      </div>
    </section>
  )
}
