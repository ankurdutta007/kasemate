import type { CSSProperties, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/** Same deceleration curve the hero uses, so every beat feels related. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const

type ScrollRevealProps = {
  children: ReactNode
  /** Seconds to wait after the element enters view. Use to stagger siblings. */
  delay?: number
  /** Seconds the fade/slide takes. */
  duration?: number
  /** How far up the children travel, in px. */
  y?: number
  /**
   * Fraction of the element that must be visible before it fires (0–1).
   * Lower it for tall blocks that would otherwise never cross the threshold.
   */
  amount?: number
  /** Reveal once and stay put (default), or replay on every re-entry. */
  once?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * ScrollReveal — fades + slides its children up as they scroll into view.
 *
 * Used by every section from beat 2 onward, so the whole page shares one
 * entrance feel and one accessibility guarantee.
 *
 * ── Reduced motion ───────────────────────────────────────────────────────
 * When the visitor has "reduce motion" on, this renders a plain <div> with the
 * children already in their final state. It doesn't animate to the final state
 * with a 0s duration — it never mounts a motion component at all, so there is
 * no transform, no opacity transition, and nothing for a screen reader or a
 * slow device to trip over.
 *
 * ── Why IntersectionObserver is safe here ────────────────────────────────
 * `whileInView` is built on IntersectionObserver. LandingV2 runs Lenis, but
 * Lenis in this project scrolls the window itself rather than transforming a
 * wrapper element, so observer thresholds resolve against the real viewport
 * exactly as they would with native scrolling.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.7,
  y = 24,
  amount = 0.25,
  once = true,
  className,
  style,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
