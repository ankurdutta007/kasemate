import { type WeekPlan } from '../../../lib/roadmap-compiler'
import imgLock from '../../../imports/lock-illustration.webp'

type WeekCardProps = {
  week: WeekPlan
  weekNumber: number
  isCurrentWeek: boolean
  isLocked: boolean
  isPreviewMode: boolean
  completedModuleIds: Set<string>
  onModuleClick: (moduleId: string) => void
  isExpanded: boolean
  onToggleExpand: () => void
  nextWeekTheme?: string
  currentWeek: number
  prevWeekDoneCount?: number
  prevWeekTotalCount?: number
}

export default function WeekCard({
  week,
  weekNumber,
  isCurrentWeek,
  isLocked,
  isPreviewMode,
  completedModuleIds,
  onModuleClick,
  isExpanded,
  onToggleExpand,
  nextWeekTheme,
  currentWeek,
  prevWeekDoneCount = 0,
  prevWeekTotalCount = 0,
}: WeekCardProps) {
  const completedCount = week.modules.filter((m) => completedModuleIds.has(m.id)).length
  const totalCount = week.modules.length
  const isCompleted = totalCount > 0 && completedCount === totalCount

  const isStage1 = week.stage === 1
  const badgeBg = isStage1 ? 'rgba(245,158,11,0.12)' : 'rgba(124,58,237,0.1)'
  const badgeColor = isStage1 ? '#F59E0B' : 'var(--primary-bright)'

  if (!isExpanded) {
    return (
      <div
        onClick={() => onToggleExpand()}
        style={{
          borderRadius: 16,
          border: isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
          borderLeft: isCompleted ? '3px solid #10B981' : undefined,
          background: 'var(--bg2)',
          padding: '16px 20px',
          marginBottom: 12,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Inter, sans-serif',
          transition: 'border-color 0.15s, opacity 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, width: 60 }}>
            Week {weekNumber}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            {week.theme}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {isLocked ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                <span style={{ fontSize: 'inherit', display: 'flex', alignItems: 'center' }}>🔒</span> Locked
              </span>
            ) : (
              `${totalCount} modules · ~${week.hours}h`
            )}
          </div>
          {isCompleted ? (
            <div style={{ color: '#10B981', fontSize: 16 }}>✓</div>
          ) : !isPreviewMode && (
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>▼</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        border: isCurrentWeek ? '2px solid var(--primary-bright)' : '1px solid var(--border)',
        background: 'var(--bg2)',
        padding: 20,
        boxShadow: 'var(--card-shadow)',
        marginBottom: 20,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {isCurrentWeek && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            fontSize: 11,
            background: 'var(--primary-bright)',
            color: 'white',
            padding: '3px 10px',
            borderRadius: 20,
            fontWeight: 600,
          }}
        >
          This week
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
            Week {weekNumber}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {week.theme}
          </div>
        </div>
        {week.week !== currentWeek && !isPreviewMode && (
          <button
            onClick={onToggleExpand}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 12,
              padding: '4px 8px',
            }}
          >
            ▲
          </button>
        )}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        ~{week.hours}h total · {totalCount} modules · {week.dailyTimeLabel} habit
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {week.stageLabel && (
          <div
            style={{
              background: badgeBg,
              color: badgeColor,
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isLocked && isPreviewMode && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: 'inherit', lineHeight: 1 }}>🔒</span> Locked</span>}
            {!(isLocked && isPreviewMode) && week.stageLabel}
            {isLocked && isPreviewMode && <span>· {week.stageLabel}</span>}
          </div>
        )}
      </div>

      {isLocked && !isPreviewMode ? (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '24px 32px',
          background: 'var(--bg)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={imgLock} alt="Locked" style={{ height: 80, width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Finish Week {weekNumber - 1} to unlock
            </div>
            <div style={{ fontSize: 13 }}>
              {prevWeekDoneCount} of {prevWeekTotalCount} modules done in Week {weekNumber - 1}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {week.modules.map((module) => {
            const isDone = completedModuleIds.has(module.id)

            return (
              <div
                key={module.id}
                onClick={() => {
                  onModuleClick(module.id)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: isDone ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border)',
                  background: isDone ? 'rgba(16,185,129,0.06)' : 'var(--bg)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isDone)
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-bright)'
                }}
                onMouseLeave={(e) => {
                  if (!isDone)
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: (isDone || (isLocked && isPreviewMode)) ? 'none' : '2px solid #D1D5DB',
                    background: isDone ? '#10B981' : (isLocked && isPreviewMode ? 'var(--bg3)' : 'transparent'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    flexShrink: 0,
                  }}
                >
                  {isDone && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
                  {isLocked && isPreviewMode && !isDone && <span style={{ fontSize: 'inherit', display: 'flex', alignItems: 'center' }}>🔒</span>}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {module.family && (
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        background: 'var(--bg3)',
                        padding: '2px 6px',
                        borderRadius: 6,
                        fontWeight: 700,
                      }}
                    >
                      {module.family}
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {module.title}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 16 }}>
                  ~{module.hours}h
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 16 }}>→</div>
              </div>
            )
          })}
        </div>
      )}

      {week.checkpoint && (!isLocked || isPreviewMode) && (
        <div
          style={{
            background: 'var(--bg3)',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 12,
            color: 'var(--text-muted)',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ color: 'var(--primary-bright)', fontWeight: 700 }}>✓ Week goal:</span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{week.checkpoint}</span>
        </div>
      )}

      {isCompleted && totalCount > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            background: 'rgba(16,185,129,0.1)',
            borderRadius: 8,
            color: '#10B981',
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Week {weekNumber} done! 🎉{' '}
          {nextWeekTheme ? `Week ${weekNumber + 1} is now unlocked.` : ''}
        </div>
      )}
    </div>
  )
}
