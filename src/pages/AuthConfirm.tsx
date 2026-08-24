import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthConfirm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleConfirm = async () => {
    if (!tokenHash || type !== 'email') {
      setStatus('error')
      setErrorMessage('Invalid confirmation link. Please check your email for the correct link.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email',
      })

      if (error) {
        throw error
      }

      setStatus('success')
      // Auto-login succeeds, navigate to onboarding/role
      setTimeout(() => {
        navigate('/onboarding/role')
      }, 1500)
    } catch (err: any) {
      setStatus('error')
      // Check if it's an expired/invalid token error
      if (err.message?.toLowerCase().includes('expired') || err.message?.toLowerCase().includes('invalid')) {
        setErrorMessage('This link has expired, please request a new one.')
      } else {
        setErrorMessage(err.message || 'An error occurred during verification.')
      }
    }
  }

  return (
    <div
      className="auth-wrapper lv2-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: 'var(--lv2-bg)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: 'var(--lv2-bg-elevated)',
          borderRadius: 20,
          border: '1px solid var(--lv2-hairline)',
          padding: 'clamp(24px, 4vh, 32px)',
          boxShadow: 'var(--card-shadow-lg)',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 28,
            fontWeight: 400,
            color: 'var(--lv2-text)',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}
        >
          Confirm your email
        </h1>
        
        {status === 'idle' && (
          <>
            <p
              style={{
                fontSize: 15,
                color: 'var(--lv2-text-muted)',
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Click the button below to verify your email address and continue.
            </p>
            <button
              onClick={handleConfirm}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--lv2-accent)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 20px rgba(66,16,61,0.4)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Verify Email
            </button>
          </>
        )}

        {status === 'loading' && (
          <p style={{ fontSize: 15, color: 'var(--lv2-text-muted)' }}>Verifying...</p>
        )}

        {status === 'success' && (
          <div style={{ color: '#00d4a8', marginTop: 16 }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: '0 auto 16px' }}
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Email verified!</p>
            <p style={{ fontSize: 14, marginTop: 8, opacity: 0.8 }}>Redirecting...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                backgroundColor: 'var(--coral-subtle)',
                border: '1px solid rgba(224,82,82,0.3)',
                color: 'var(--coral)',
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 20,
              }}
            >
              {errorMessage}
            </div>
            <button
              onClick={() => navigate('/auth')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: '1.5px solid var(--lv2-hairline)',
                backgroundColor: 'var(--lv2-glass)',
                color: 'var(--lv2-text)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Back to Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
