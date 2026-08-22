import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import { STEPS } from './content'

const DIMENSIONS = [
  {
    label: 'Structuring',
    yOffset: -6,
    rotate: -4,
    delay: 0.1,
    color: '#8b5cf6', // Violet
  },
  {
    label: 'Quant reasoning',
    yOffset: 8,
    rotate: 5,
    delay: 0.2,
    color: '#eab308', // Yellow
  },
  {
    label: 'Business judgment',
    yOffset: 0,
    rotate: -3,
    delay: 0.3,
    color: '#8b5cf6', // Violet
  },
  {
    label: 'Communication',
    yOffset: -4,
    rotate: 6,
    delay: 0.4,
    color: '#eab308', // Yellow
  },
]

export default function InterviewV2() {
  const step = STEPS[1] // "Study or go live"

  return (
    <section
      id="interview"
      style={{
        position: 'relative',
        background: 'var(--lv2-bg)',
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* ── Background Image Layer ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <picture>
          <source srcSet="/landing-v2/interview.webp" type="image/webp" />
          <img
            loading="lazy"
            src="/landing-v2/interview.webp"
            alt="Live AI Interviewer"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'right center',
              display: 'block',
              transform: 'scale(1.05) rotate(1.5deg)', // Counteract the tilted horizon in the artwork
            }}
          />
        </picture>
      </div>

      {/* ── Scrim / Gradient Overlay Layer ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          // Horizontal gradient fixes the left/right seams.
          // Vertical gradient softens in the middle to reveal the image while keeping text readable, and finishes opaque to blend with the next section.
          background: `
            linear-gradient(90deg, rgba(10,10,15,1) 0%, rgba(10,10,15,0) 10%, rgba(10,10,15,0) 90%, rgba(10,10,15,1) 100%),
            linear-gradient(180deg, rgba(10,10,15,1) 0%, rgba(10,10,15,0.85) 15%, rgba(10,10,15,0.4) 50%, rgba(10,10,15,0.85) 85%, rgba(10,10,15,1) 100%)
          `,
        }}
      />

      {/* ── Content Layer ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 900,
          padding: 'clamp(64px, 10svh, 120px) clamp(20px, 5vw, 40px)',
          textAlign: 'center',
        }}
      >
        <ScrollReveal y={28} duration={0.8} amount={0.15}>
          <header style={{ position: 'relative', marginBottom: 'clamp(32px, 5svh, 48px)' }}>
            {/* Subtle backdrop specifically for text readability */}
            <div
              style={{
                position: 'absolute',
                inset: '-60px -40px',
                background: 'radial-gradient(ellipse at center, rgba(10,10,15,0.7) 0%, rgba(10,10,15,0) 70%)',
                zIndex: -1,
                pointerEvents: 'none',
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: '0.14em',
                color: 'var(--lv2-text-faint)',
                textTransform: 'uppercase',
                textShadow: '0 2px 12px rgba(0,0,0,0.8)',
              }}
            >
              Live Practice
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
                textShadow: '0 4px 24px rgba(0,0,0,0.8)',
              }}
            >
              Study or <em className="lv2-display-italic" style={{ color: 'var(--lv2-accent)' }}>go live.</em>
            </h2>
            <p
              style={{
                margin: '14px auto 0',
                maxWidth: 600,
                fontSize: 'clamp(13.5px, 1.4vw, 16px)',
                lineHeight: 1.6,
                color: 'var(--lv2-text-muted)',
                textShadow: '0 2px 16px rgba(0,0,0,0.8)',
              }}
            >
              {step.body}
            </p>

            {/* Clustered Dimension Badges */}
            <div
              className="gap-y-[24px] gap-x-[20px] md:gap-y-[12px] md:gap-x-[16px]"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: 'clamp(28px, 4vh, 40px)',
                position: 'relative',
                zIndex: 3,
              }}
            >
              {DIMENSIONS.map((dim, i) => (
                <motion.div
                  key={dim.label}
                  initial={{ opacity: 0, y: 24, scale: 0.85, rotate: 0 }}
                  whileInView={{ opacity: 1, y: dim.yOffset, scale: 1, rotate: dim.rotate }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E"), linear-gradient(135deg, color-mix(in srgb, ${dim.color} 85%, white), color-mix(in srgb, ${dim.color} 75%, black))`,
                    border: `3px solid rgba(255, 255, 255, 0.95)`,
                    borderRadius: 999,
                    padding: '8px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'clamp(13px, 1.3vw, 15px)',
                      fontWeight: 600,
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.01em',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {dim.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </header>
        </ScrollReveal>
      </div>
    </section>
  )
}
