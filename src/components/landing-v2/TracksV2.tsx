import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import { TRACKS_SECTION, TRACK_CARDS } from './content'

/**
 * Artwork per track. content.ts is copy-only by design — no image paths live
 * there — so the mapping is here, keyed by the title string it owns.
 */
const TRACK_IMAGES: Record<string, string> = {
  'Product Track': '/landing-v2/track-product-v4.webp',
  'Consulting Track': '/landing-v2/track-consulting-v3.webp',
  'Data & Business Analyst': '/landing-v2/track-data-v4.webp',
  'General Management': '/landing-v2/track-gm-v3.webp',
}

const CARDS = TRACK_CARDS

/** Chevron icon. `currentColor` so the button's hover colour carries through. */
function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d={direction === 'left' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * TracksV2 — beat 3: the four tracks, as a centred carousel.
 *
 * ── Why native scroll-snap and not a drag handler ────────────────────────
 * The brief put mobile swipe feel above everything else, and the best swipe on
 * a phone is the one the OS already implements. A scroll-snap container gets
 * real momentum, rubber-banding at the ends, and mid-fling interruption for
 * free; a hand-written pointer/velocity loop has to reimplement all three and
 * still fights the browser. So the container scrolls natively and React only
 * *observes* it to decide which card is centred — it never drives position
 * except when an arrow or dot is pressed.
 *
 * Desktop gets arrow buttons rather than relying on horizontal wheel: a mouse
 * has no horizontal axis, and Lenis owns the vertical wheel on this page.
 */
export default function TracksV2() {
  const prefersReducedMotion = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Observe scroll position -> nearest card to the container's centre.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let frame = 0

    const measure = () => {
      frame = 0
      const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'))
      if (!cards.length) return
      const centre = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let bestDistance = Infinity
      cards.forEach((card, i) => {
        const cardCentre = card.offsetLeft + card.offsetWidth / 2
        const distance = Math.abs(cardCentre - centre)
        if (distance < bestDistance) {
          bestDistance = distance
          best = i
        }
      })
      setActive(best)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const scrollByAmount = useCallback(
    (direction: -1 | 1) => {
      const el = trackRef.current
      if (!el) return
      const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'))
      const target = Math.max(0, Math.min(cards.length - 1, active + direction))
      const card = cards[target]
      if (card) {
        el.scrollTo({
          left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        })
      }
    },
    [active, prefersReducedMotion]
  )

  const goToIndex = useCallback(
    (index: number) => {
      const el = trackRef.current
      if (!el) return
      const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'))
      const card = cards[index]
      if (card) {
        el.scrollTo({
          left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        })
      }
    },
    [prefersReducedMotion]
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollByAmount(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollByAmount(-1)
    }
  }

  return (
    <section
      id="tracks"
      style={{
        position: 'relative',
        background: 'var(--lv2-bg)',
        // Tightened so heading + cards + controls clear a single 800-900px
        // viewport without scrolling inside the section.
        padding: 'clamp(44px, 7svh, 88px) 0 clamp(36px, 5.5svh, 72px)',
        overflow: 'hidden',
      }}
    >
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="lv2-comet-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      {/* ── Background texture overlay ── */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          height: '750px',
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
        }}
      >
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/landing-v2/tracks-bg-v3.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            opacity: 0.20,
          }}
        />
      </div>
      <ScrollReveal duration={0.8} y={28} amount={0.15}>
        {/* ── Section header ── */}
        <header
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '0 clamp(20px, 5vw, 40px)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: '0.14em',
              color: 'var(--lv2-text-faint)',
            }}
          >
            {TRACKS_SECTION.eyebrow}
          </p>
          <h2
            className="lv2-display"
            style={{
              margin: '12px 0 0',
              fontSize: 'clamp(28px, 4.4vw, 44px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--lv2-text)',
              textWrap: 'balance',
            }}
          >
            {TRACKS_SECTION.headline.lead}{' '}
            <em className="lv2-display-italic" style={{ color: 'var(--lv2-accent)' }}>
              {TRACKS_SECTION.headline.emphasis}
            </em>
          </h2>
          <p
            style={{
              margin: '14px 0 0',
              fontSize: 'clamp(13.5px, 1.4vw, 16px)',
              lineHeight: 1.6,
              color: 'var(--lv2-text-muted)',
            }}
          >
            {TRACKS_SECTION.subhead}
          </p>
        </header>

        {/* ── Carousel ── */}
        <div
          ref={trackRef}
          className="lv2-carousel"
          role="group"
          aria-roledescription="carousel"
          aria-label="Placement tracks"
          tabIndex={0}
          onKeyDown={onKeyDown}
          style={{ position: 'relative', marginTop: 'clamp(22px, 3.2svh, 40px)', outline: 'none' }}
        >
          {CARDS.map((card, i) => {
            const isRealActive = i === active
            return (
            <article
              key={`${card.title}-${i}`}
              data-card
              data-active={isRealActive}
              className="lv2-card"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${CARDS.length}: ${card.title}`}
              aria-current={isRealActive}
              onClick={() => goToIndex(i)}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid var(--lv2-hairline)',
                background: 'var(--lv2-bg-elevated)',
                cursor: 'pointer',
              }}
            >
              <svg 
                className="lv2-card-highlight-svg" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
              >
                <g filter="url(#lv2-comet-glow)">
                  {Array.from({ length: 20 }).map((_, j) => {
                    const delay = -0.4 * (1 - (j / 19)); 
                    const opacity = Math.pow(0.85, j);
                    return (
                      <rect 
                        key={j}
                        x="0" y="0" width="100%" height="100%" rx="20" 
                        fill="none" 
                        stroke="var(--lv2-accent)" 
                        strokeWidth="4" 
                        pathLength="100"
                        style={{
                          animation: isRealActive ? '' : 'none',
                          animationDelay: `${delay}s`,
                          opacity: opacity
                        }}
                      />
                    );
                  })}
                </g>
              </svg>
              {/* Source art is 1000x1250; shown a little shorter (object-fit
                  cover) so it fills the 1:1.15 frame without squishing. */}
              <div style={{ width: '100%', aspectRatio: '1000 / 1120' }}>
                <img
                  loading="lazy"
                  src={TRACK_IMAGES[card.title]}
                  // The title sits right beneath, so the artwork is decorative.
                  alt=""
                  width={1000}
                  height={1120}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
              <div style={{ padding: '14px 18px 16px' }}>
                <h3
                  className="lv2-display"
                  style={{
                    margin: 0,
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: '-0.01em',
                    color: (card as any).color || 'var(--lv2-text)',
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: 'var(--lv2-text-muted)',
                  }}
                >
                  {card.sub}
                </p>
                {/* Check if desc exists so TypeScript stays happy, though we know it does in content.ts */}
                {'desc' in card && card.desc && (
                  <p
                    style={{
                      margin: '12px 0 0',
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: 'var(--lv2-text-faint)',
                    }}
                  >
                    {card.desc as React.ReactNode}
                  </p>
                )}
              </div>
            </article>
            )
          })}
        </div>

        {/* ── Controls ── */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <div className="lv2-carousel-arrows" style={{ gap: 10 }}>
            <button
              type="button"
              className="lv2-carousel-btn"
              onClick={() => scrollByAmount(-1)}
              aria-label="Previous track"
              disabled={active === 0}
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              className="lv2-carousel-btn"
              onClick={() => scrollByAmount(1)}
              aria-label="Next track"
              disabled={active === CARDS.length - 1}
            >
              <Chevron direction="right" />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {CARDS.map((card, i) => (
              <button
                key={card.title}
                type="button"
                className="lv2-dot"
                data-active={i === active}
                onClick={() => goToIndex(i)}
                aria-label={`Go to ${card.title}`}
              />
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
