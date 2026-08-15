import React from 'react'
import logo from '../imports/logo.webp'

export default function Loader({ fullScreen = true }: { fullScreen?: boolean }) {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative' }}>
      <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulsing rings */}
        <div style={{ position: 'absolute', top: -16, left: -16, right: -16, bottom: -16, borderRadius: '50%', border: '2px solid var(--primary)', opacity: 0, animation: 'pulse-ring 2s cubic-bezier(0.2, 0, 0.8, 1) infinite' }} />
        <div style={{ position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: '50%', border: '2px solid var(--primary)', opacity: 0, animation: 'pulse-ring 2s cubic-bezier(0.2, 0, 0.8, 1) infinite', animationDelay: '0.6s' }} />
        
        {/* Logo */}
        <img src={logo} alt="Loading..." style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', position: 'relative', zIndex: 10, animation: 'float 3s ease-in-out infinite' }} />
      </div>
      
      {/* Loading text with animated dots */}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
        Loading
        <span style={{ display: 'flex', gap: 2 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'currentColor', animation: 'thinking-dot 1.4s infinite', animationDelay: '0s' }} />
          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'currentColor', animation: 'thinking-dot 1.4s infinite', animationDelay: '0.2s' }} />
          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'currentColor', animation: 'thinking-dot 1.4s infinite', animationDelay: '0.4s' }} />
        </span>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    )
  }

  return content
}
