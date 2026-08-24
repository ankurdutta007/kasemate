import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { usePostHog } from '@posthog/react'

export default function Nav() {
  const location = useLocation()
  const posthog = usePostHog()
  const { theme, toggle } = useTheme()
  const isLanding = location.pathname === '/'
  const isAuth = location.pathname === '/auth'
  const isOnboarding = location.pathname.startsWith('/onboarding')
  const isCase = location.pathname.startsWith('/case/')
  const isDark = theme === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Close menu on resize above breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isPreviewV2 = location.pathname === '/preview-v2'

  if (isLanding || isAuth || isOnboarding || isCase || isPreviewV2) return null

  const navLinks = [
    { to: '/roadmap', label: 'Roadmap' },
    { to: '/hub', label: 'Practice' },
    { to: '/dashboard', label: 'Performance' },
  ]

  return (
    <>
      <nav className="vantage-nav" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>


          {/* Desktop nav links */}
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={() => posthog.capture('nav_tab_changed', { tab: label.toLowerCase() })}
                style={({ isActive }) => ({ padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 15, fontWeight: isActive ? 700 : 500, fontFamily: 'Inter, sans-serif', color: isActive ? 'var(--primary)' : 'var(--text-muted)', backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent', transition: 'all 0.15s' })}>
                {label}
              </NavLink>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button onClick={toggle} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, transition: 'all 0.15s' }}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <NavLink to="/settings" className="nav-avatar-desktop" style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: 'pointer', textDecoration: 'none' }}>A</NavLink>

            {/* Hamburger button, mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              style={{
                display: 'none',
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg3)',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 14,
                transition: 'all 0.15s',
                flexDirection: 'column',
                gap: 4,
                padding: 7,
              }}
            >
              <span style={{
                display: 'block',
                width: '100%',
                height: 2,
                borderRadius: 1,
                backgroundColor: 'var(--text-primary)',
                transition: 'all 0.2s',
                transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
              }} />
              <span style={{
                display: 'block',
                width: '100%',
                height: 2,
                borderRadius: 1,
                backgroundColor: 'var(--text-primary)',
                transition: 'all 0.2s',
                opacity: menuOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block',
                width: '100%',
                height: 2,
                borderRadius: 1,
                backgroundColor: 'var(--text-primary)',
                transition: 'all 0.2s',
                transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
              }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            position: 'fixed',
            top: 60,
            left: 0,
            right: 0,
            zIndex: 49,
            backgroundColor: 'var(--nav-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
            padding: '8px 24px 16px',
            display: 'none',
            flexDirection: 'column',
            gap: 4,
            animation: 'fade-in-up 0.15s ease-out',
          }}
        >
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => posthog.capture('nav_tab_changed', { tab: label.toLowerCase() })}
              style={({ isActive }) => ({
                padding: '12px 16px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                transition: 'all 0.15s',
                display: 'block',
              })}>
              {label}
            </NavLink>
          ))}
          <NavLink to="/settings" onClick={() => setMenuOpen(false)} style={({ isActive }) => ({ padding: '12px 16px', borderRadius: 10, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent', transition: 'all 0.15s' })}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>A</div>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Account</span>
          </NavLink>
        </div>
      )}
    </>
  )
}
