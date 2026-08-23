import React from 'react'
import ScrollReveal from './ScrollReveal'
import { CTA_BANNER } from './content'

export default function ClosingV2() {
  return (
    <section
      id="closing"
      style={{
        position: 'relative',
        background: 'var(--lv2-bg)',
        // Size to content: enough padding to feel spacious, but not forced 100vh
        padding: 'clamp(100px, 15svh, 200px) clamp(20px, 5vw, 40px)',
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
          <source media="(max-width: 768px)" srcSet="/landing-v2/dawn-mobile.webp" type="image/webp" />
          <source srcSet="/landing-v2/dawn.webp" type="image/webp" />
          <img
            loading="lazy"
            src="/landing-v2/dawn.webp"
            alt="KaseMate dawn"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
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
          // Top blends with ProofV2. Bottom blends with footer.
          background: `
            linear-gradient(180deg, rgba(10,10,15,1) 0%, rgba(10,10,15,0.7) 15%, rgba(10,10,15,0.3) 50%, rgba(10,10,15,0.7) 85%, rgba(10,10,15,1) 100%)
          `,
        }}
      />

      {/* ── Content Layer ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 700,
          textAlign: 'center',
        }}
      >
        <ScrollReveal y={24} duration={0.8} amount={0.3}>
          {/* Backdrop for text contrast against image */}
          <div
            style={{
              position: 'absolute',
              inset: '-60px -40px',
              background: 'radial-gradient(ellipse at center, rgba(10,10,15,0.7) 0%, rgba(10,10,15,0) 70%)',
              zIndex: -1,
              pointerEvents: 'none',
            }}
          />
          <h2
            className="lv2-display"
            style={{
              margin: '0 0 16px',
              fontSize: 'clamp(40px, 6vw, 64px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--lv2-text)',
              textWrap: 'balance',
              textShadow: '0 4px 24px rgba(0,0,0,0.8)',
            }}
          >
            {CTA_BANNER.headline.lead}{' '}
            <em className="lv2-display-italic" style={{ color: 'var(--lv2-accent)' }}>
              {CTA_BANNER.headline.emphasis}
            </em>
          </h2>
          <p
            style={{
              margin: '0 auto 40px',
              maxWidth: 480,
              fontSize: 'clamp(16px, 1.6vw, 18px)',
              lineHeight: 1.6,
              color: 'var(--lv2-text-muted)',
              textShadow: '0 2px 16px rgba(0,0,0,0.8)',
            }}
          >
            {CTA_BANNER.subhead}
          </p>
          <a
            href="/auth"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 52,
              padding: '0 32px',
              background: 'var(--lv2-text)',
              color: 'var(--lv2-bg)',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              borderRadius: 26,
              transition: 'transform 0.15s, opacity 0.15s',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.opacity = '1'
            }}
          >
            {CTA_BANNER.cta}
          </a>
        </ScrollReveal>
      </div>

      {/* Attribution line */}
      <p
        style={{
          position: 'absolute',
          bottom: 'clamp(24px, 4vh, 40px)',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: 0,
          fontSize: 12,
          color: 'var(--lv2-text-muted)',
          opacity: 0.8,
          letterSpacing: '0.02em',
          zIndex: 2,
          width: '100%',
          textAlign: 'center',
        }}
      >
        Made with ❤️ by Ankur for Placement Season 2026-27.
      </p>
    </section>
  )
}
