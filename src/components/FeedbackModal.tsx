import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface FeedbackModalProps {
  onClose: () => void
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    const { error } = await supabase.from('feedback').insert({
      message: message.trim(),
      user_id: user?.id || null,
      page_url: window.location.href,
    })

    setLoading(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      console.error('Failed to submit feedback', error)
      // If there's an error, maybe just close it or show an alert, 
      // but for MVP just revert loading state so they can try again.
      alert('Failed to submit feedback. Please try again.')
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      padding: 20
    }}>
      <div style={{
        backgroundColor: 'var(--bg2)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        boxShadow: 'var(--card-shadow-lg)',
        border: '1px solid var(--border)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 20,
            lineHeight: 1
          }}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 style={{ 
          fontFamily: 'Plus Jakarta Sans, sans-serif', 
          fontSize: 20, 
          fontWeight: 600, 
          color: 'var(--text-primary)', 
          margin: '0 0 8px' 
        }}>
          Give Feedback
        </h2>
        
        {success ? (
          <div style={{
            padding: '32px 0 16px',
            textAlign: 'center',
            color: 'var(--teal)',
            fontWeight: 500,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'var(--teal-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              ✓
            </div>
            Thanks, got it.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
              Notice a bug or have a suggestion? Let us know below.
            </p>
            <textarea
              autoFocus
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                minHeight: 120,
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg3)',
                color: 'var(--text-primary)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                resize: 'vertical',
                marginBottom: 16
              }}
              required
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-mid))',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !message.trim() ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? 'Submitting...' : 'Submit feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
