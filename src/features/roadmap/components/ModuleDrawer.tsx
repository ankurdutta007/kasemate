import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getModuleById } from '../../../lib/roadmap-compiler'

type ModuleDrawerProps = {
  moduleId: string | null
  onClose: () => void
  isCompleted: boolean
  isLocked?: boolean
  lockedMessage?: string
  onMarkDone: (moduleId: string) => Promise<void>
  onMarkIncomplete: (moduleId: string) => Promise<void>
  userTracks?: string[]
}

export default function ModuleDrawer({
  moduleId,
  onClose,
  isCompleted,
  isLocked = false,
  lockedMessage,
  onMarkDone,
  onMarkIncomplete,
  userTracks = [],
}: ModuleDrawerProps) {
  const navigate = useNavigate()
  const [isMarkingDone, setIsMarkingDone] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const isOpen = moduleId !== null
  const module = getModuleById(moduleId || '')

  const handleMarkDone = async () => {
    if (!moduleId || isLocked) return
    setIsMarkingDone(true)
    await onMarkDone(moduleId)
    setIsMarkingDone(false)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
    }, 1500)
  }

  const handleMarkIncomplete = async () => {
    if (!moduleId || isLocked) return
    await onMarkIncomplete(moduleId)
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 99,
          }}
        />
      )}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: 420,
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
          zIndex: 100,
          overflowY: 'auto',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            padding: 24,
            width: '100%',
            boxSizing: 'border-box',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {!module ? (
            <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)' }}>
              Module not found
            </div>
          ) : (
            <>
              {module.family && (
                <div
                  style={{
                    display: 'inline-block',
                    background: 'var(--bg3)',
                    color: 'var(--text-muted)',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 20,
                    marginBottom: 16,
                    alignSelf: 'flex-start',
                  }}
                >
                  {module.family}
                </div>
              )}

              <h2
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 24px',
                }}
              >
                {module.title}
              </h2>

              {module.what && (
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    What this is
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {module.what}
                  </div>
                </div>
              )}

              {module.why && (
                <div
                  style={{ marginBottom: 20, borderLeft: '3px solid #F59E0B', paddingLeft: 12 }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    Why it matters
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {module.why}
                  </div>
                </div>
              )}

              {module.good && (
                <div
                  style={{ marginBottom: 20, borderLeft: '3px solid #10B981', paddingLeft: 12 }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    What good looks like
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {module.good}
                  </div>
                </div>
              )}

              {module.mistake && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: 'rgba(244,63,94,0.06)',
                    border: '1px solid rgba(244,63,94,0.15)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#F43F5E',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    Common mistake
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {module.mistake}
                  </div>
                </div>
              )}

              {module.trackNotes && userTracks.some((t) => module.trackNotes![t as any]) && (
                <div style={{ marginBottom: 32 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: 16,
                    }}
                  >
                    For your {userTracks.length > 1 ? 'tracks' : 'track'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {userTracks.map(
                      (track) =>
                        module.trackNotes![track as keyof typeof module.trackNotes] && (
                          <div
                            key={track}
                            style={{
                              background: 'var(--bg2)',
                              border: '1px solid var(--border)',
                              borderRadius: 10,
                              padding: 16,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: 'var(--primary-bright)',
                                textTransform: 'uppercase',
                                marginBottom: 6,
                              }}
                            >
                              {track}
                            </div>
                            <ul
                              style={{
                                fontSize: 13,
                                color: 'var(--text-secondary)',
                                lineHeight: 1.5,
                                margin: 0,
                                paddingLeft: 18,
                              }}
                            >
                              {(module.trackNotes![track as keyof typeof module.trackNotes] || '')
                                .split('\n')
                                .filter((line) => line.trim().length > 0)
                                .map((line, i) => (
                                  <li key={i}>{line.replace(/^•\s*/, '')}</li>
                                ))}
                            </ul>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {module.tasks && module.tasks.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: 16,
                    }}
                  >
                    What to do this week
                  </div>

                  {module.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      style={{
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        padding: 14,
                        marginBottom: 8,
                        background: 'var(--bg2)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color:
                              task.kind === 'external' ? '#3b82f6' : 'var(--primary-bright)',
                            background:
                              task.kind === 'external'
                                ? 'rgba(59,130,246,0.1)'
                                : 'rgba(124,58,237,0.1)',
                            padding: '2px 8px',
                            borderRadius: 10,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {task.kind === 'external' ? 'External' : 'Practice'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          ~{task.minutes} min
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          marginBottom: task.detail ? 4 : 12,
                        }}
                      >
                        {task.label}
                      </div>

                      {task.detail && (
                        <div
                          style={{
                            fontSize: 13,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                            marginBottom: 12,
                          }}
                        >
                          {task.detail}
                        </div>
                      )}

                      {(task as any).action === 'external' && task.href && (
                        <a
                          href={task.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            marginTop: 8,
                            padding: '6px 14px',
                            borderRadius: 6,
                            background: 'var(--primary-bright)',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          Open resource →
                        </a>
                      )}

                      {(task as any).action === 'linkedin' && task.href && (
                        <a
                          href={task.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            marginTop: 8,
                            padding: '6px 14px',
                            borderRadius: 6,
                            background: '#0A66C2',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          Go to LinkedIn →
                        </a>
                      )}

                      {(task as any).action === 'kasemate' && task.href && (
                        <button
                          onClick={() => {
                            navigate(task.href)
                            onClose()
                          }}
                          style={{
                            marginTop: 8,
                            padding: '6px 14px',
                            borderRadius: 6,
                            background: 'var(--bg3)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          Go to KaseMate →
                        </button>
                      )}

                      {(task as any).action === 'performance' && task.href && (
                        <button
                          onClick={() => {
                            navigate(task.href)
                            onClose()
                          }}
                          style={{
                            marginTop: 8,
                            padding: '6px 14px',
                            borderRadius: 6,
                            background: 'var(--bg3)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          View Performance →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)' }}
              >
                {isCompleted ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid #10B981',
                        borderRadius: 12,
                        padding: 16,
                        textAlign: 'center',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div style={{ color: '#10B981', fontWeight: 700, fontSize: 15 }}>
                        ✓ You completed this module
                      </div>
                    </div>
                    <button
                      onClick={handleMarkIncomplete}
                      disabled={isLocked}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        textDecoration: isLocked ? 'none' : 'underline',
                        opacity: isLocked ? 0.5 : 1
                      }}
                    >
                      Mark as incomplete
                    </button>
                  </div>
                ) : (
                  <div
                    title={isLocked ? lockedMessage : undefined}
                  >
                    <button
                      onClick={handleMarkDone}
                      disabled={isMarkingDone || isLocked}
                      style={{
                        width: '100%',
                        background: showSuccess
                          ? '#10B981'
                          : isLocked
                          ? 'var(--bg3)'
                          : 'linear-gradient(135deg, var(--primary-bright), var(--primary))',
                        color: isLocked ? 'var(--text-muted)' : 'white',
                        border: isLocked ? '1px solid var(--border)' : 'none',
                        borderRadius: 12,
                        padding: 16,
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: isLocked ? 'not-allowed' : (isMarkingDone ? 'wait' : 'pointer'),
                        boxShadow: isLocked ? 'none' : 'var(--card-shadow)',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      {isLocked ? '🔒 Locked' : (isMarkingDone ? 'Saving...' : showSuccess ? '✓ Done!' : 'Mark as done ✓')}
                    </button>
                    {isLocked && lockedMessage && (
                      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                        {lockedMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
