import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BRAND_NAME, IMAGE_ALT, NAV_CTA, NAV_LINKS } from './content'
import { setPageScrollLocked, subscribeToPageScroll } from './useLenisScroll'
import logo from '@/imports/logo.webp'

/** Scroll distance after which the nav gains its dark translucent backdrop. */
const SCROLL_THRESHOLD = 0.8 // × viewport height

/**
 * Fades the backdrop panel out below the bar. Held solid through the 72px bar
 * itself (72/100 of the panel's height) so contrast behind the links is
 * untouched, then ramped to nothing across the 28px overhang.
 */
const PANEL_MASK =
  'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%)'

const isPastThreshold = () =>
  typeof window !== 'undefined' &&
  window.scrollY > window.innerHeight * SCROLL_THRESHOLD

/**
 * NavV2 — the overlay navigation bar for the LandingV2 redesign.
 *
 * Starts fully transparent so the hero image runs edge to edge underneath it
 * (no white strip, no solid bar). Once the visitor has scrolled past ~80% of
 * the viewport height — i.e. they are leaving the hero and moving onto lighter
 * content — a dark translucent panel with a backdrop blur fades in behind the
 * links so they stay readable.
 */
export default function NavV2() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  // Initialised from the CURRENT scroll position rather than hardcoded false,
  // so the bar is already solid if someone refreshes halfway down the page or
  // opens a #faq style deep link.
  const [scrolled, setScrolled] = useState(isPastThreshold)
  const [menuOpen, setMenuOpen] = useState(false)

  // Fade the backdrop in once we're 80% of a viewport down the page.
  useEffect(() => {
    const update = () => setScrolled(isPastThreshold())
    update()
    const unsubscribe = subscribeToPageScroll(update)
    window.addEventListener('resize', update)
    return () => {
      unsubscribe()
      window.removeEventListener('resize', update)
    }
  }, [])

  // Freeze the page behind the mobile menu while it's open.
  useEffect(() => {
    setPageScrollLocked(menuOpen)
    return () => setPageScrollLocked(false)
  }, [menuOpen])

  // Close the menu if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const goToAuth = () => {
    setMenuOpen(false)
    navigate('/auth')
  }

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          // No background here — the animated panel below provides it.
          background: 'transparent',
        }}
      >
        {/* The blur panel. Separate absolutely-positioned layer so we can fade
            it independently of the links, which stay at full opacity. */}
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            // Overhangs the 72px bar so the fade-out happens in spare space
            // below it rather than eating into the area behind the links.
            bottom: -28,
            background: 'var(--lv2-glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            // Two things used to draw a visible line here. The obvious one was a
            // `borderBottom` hairline. The subtler one is that a panel with a
            // backdrop-filter ends at a hard edge — the blur simply stops, and
            // that discontinuity reads as a seam even with no border at all.
            // Masking fades the tint AND the blur out together, so there is
            // nothing left to cut against the content below.
            maskImage: PANEL_MASK,
            WebkitMaskImage: PANEL_MASK,
            pointerEvents: 'none',
          }}
        />

        <nav
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 1240,
            margin: '0 auto',
            padding: '0 clamp(20px, 4vw, 48px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          {/* Brand */}
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
                // Remove any hash without triggering a reload
                history.replaceState(null, '', '/')
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
            }}
          >
            <img
              src={logo}
              alt={IMAGE_ALT.logo}
              style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover' }}
            />
            <span
              className="lv2-display"
              style={{
                fontSize: 22,
                // Overrides the 400 set by .lv2-display so the wordmark
                // holds its own against the hero image behind it.
                fontWeight: 700,
                color: 'var(--lv2-text)',
                letterSpacing: '-0.01em',
              }}
            >
              {BRAND_NAME}
            </span>
          </a>

          {/* Desktop links */}
          <div
            className="lv2-nav-desktop"
            style={{ alignItems: 'center', gap: 36 }}
          >
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="lv2-nav-link"
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="lv2-nav-desktop" style={{ alignItems: 'center' }}>
            <button
              onClick={goToAuth}
              className="lv2-pill"
              style={{ padding: '9px 20px', fontSize: 14, fontWeight: 500 }}
            >
              {NAV_CTA}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lv2-nav-burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 5,
              width: 44,
              height: 44,
              padding: 11,
              borderRadius: 999,
              border: '1px solid var(--lv2-hairline)',
              background: 'rgba(245,243,239,0.06)',
              cursor: 'pointer',
            }}
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 1.5,
                  borderRadius: 2,
                  background: 'var(--lv2-text)',
                  transition: 'transform 0.25s ease, opacity 0.25s ease',
                  transform:
                    menuOpen && i === 0
                      ? 'translateY(6.5px) rotate(45deg)'
                      : menuOpen && i === 2
                        ? 'translateY(-6.5px) rotate(-45deg)'
                        : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </nav>
      </header>

      {/* Full-screen mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              background: 'var(--lv2-bg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: 8,
              padding: '0 clamp(24px, 8vw, 64px)',
              overscrollBehavior: 'contain',
            }}
          >
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="lv2-display"
                style={{
                  fontSize: 'clamp(32px, 9vw, 48px)',
                  lineHeight: 1.35,
                  color: 'var(--lv2-text)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={goToAuth}
              className="lv2-pill"
              style={{
                marginTop: 32,
                padding: '14px 32px',
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {NAV_CTA}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
