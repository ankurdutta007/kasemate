import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoadmapPlan } from './hooks/useRoadmapPlan'
import { useWeekProgress } from './hooks/useWeekProgress'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import WeekCard from './components/WeekCard'
import ModuleDrawer from './components/ModuleDrawer'
import { type WeekPlan } from '../../lib/roadmap-compiler'

function isWeekUnlocked(weekIndex: number, weeks: WeekPlan[], completedModuleIds: Set<string>): boolean {
  if (weekIndex === 0) return true;
  const prevWeek = weeks[weekIndex - 1];
  return prevWeek.moduleIds.length > 0 && prevWeek.moduleIds.every((id) => completedModuleIds.has(id));
}

export default function RoadmapDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { plan, loading: planLoading } = useRoadmapPlan()
  const { completedModuleIds, loading: progressLoading, setCompletedModuleIds } = useWeekProgress()

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(1)

  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set())

  const [previewMode, setPreviewMode] = useState(false)

  const isLoading = planLoading || progressLoading

  // All module IDs that belong to THIS plan — used to filter stale progress events
  const planModuleIds = useMemo(
    () => new Set((plan?.weeks || []).flatMap((w) => w.moduleIds)),
    [plan]
  )

  // Only count completions that are actually in the current plan
  const planCompletedIds = useMemo(() => {
    const set = new Set<string>()
    for (const id of completedModuleIds) {
      if (planModuleIds.has(id)) set.add(id)
    }
    return set
  }, [completedModuleIds, planModuleIds])

  const completedCount = planCompletedIds.size

  const progressPct =
    (plan?.totalModules ?? 0) === 0
      ? 0
      : Math.round((completedCount / plan!.totalModules) * 100)

  useEffect(() => {
    if (!plan) return

    let found = 1
    for (const wp of plan.weeks) {
      const allDone =
        wp.moduleIds.length > 0 && wp.moduleIds.every((id) => planCompletedIds.has(id))
      if (!allDone) {
        found = wp.week
        break
      }
    }
    setCurrentWeek(found)

    // Auto-expand all unlocked weeks when plan loads
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev)
      plan.weeks.forEach((w, idx) => {
        if (isWeekUnlocked(idx, plan.weeks, planCompletedIds)) {
          newSet.add(w.week)
        }
      })
      return newSet
    })
  }, [plan, planCompletedIds])

  const handleMarkDone = async (moduleId: string) => {
    if (!user) return

    const newSet = new Set(completedModuleIds)
    newSet.add(moduleId)
    setCompletedModuleIds(newSet)

    await supabase.from('rm_progress_events').insert({
      user_id: user.id,
      type: 'module_done',
      module_id: moduleId,
      source: 'roadmap',
    })

    // Auto-expand next week when a week completes
    if (plan) {
      for (const wp of plan.weeks) {
        if (wp.moduleIds.includes(moduleId)) {
          const allDone = wp.moduleIds.every((id) => newSet.has(id) && planModuleIds.has(id))
          if (allDone) {
            setExpandedWeeks((prev) => {
              const eSet = new Set(prev)
              eSet.add(wp.week + 1)
              return eSet
            })
          }
          break
        }
      }
    }
  }

  const handleMarkIncomplete = async (moduleId: string) => {
    if (!user) return

    const newSet = new Set(completedModuleIds)
    newSet.delete(moduleId)
    setCompletedModuleIds(newSet)

    await supabase
      .from('rm_progress_events')
      .delete()
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .eq('type', 'module_done')
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: 24, marginBottom: 16 }}>⏳</div>
        <div style={{ color: 'var(--text-muted)' }}>Building your roadmap...</div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Complete the roadmap setup to see your plan.</div>
        <button
          onClick={() => navigate('/onboarding/role')}
          style={{
            background: 'linear-gradient(135deg, var(--primary-bright), var(--primary))',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Set up roadmap →
        </button>
      </div>
    )
  }

  const tracksStr = (plan.tracks || [])
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' + ')
  const weeksLeft = Math.max(0, plan.totalWeeks - currentWeek + 1)
  
  // Find if selected module is locked
  let isSelectedModuleLocked = false;
  let selectedModuleLockMessage = '';
  if (selectedModuleId) {
    const weekIdx = plan.weeks.findIndex(w => w.moduleIds.includes(selectedModuleId));
    if (weekIdx > 0 && !isWeekUnlocked(weekIdx, plan.weeks, planCompletedIds)) {
      isSelectedModuleLocked = true;
      selectedModuleLockMessage = `Complete Week ${weekIdx} first to unlock this task.`;
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: 'Inter, sans-serif', padding: '20px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 20 }}>
          <div>
            <div style={{ margin: '0 0 8px' }}>
              <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 36, fontWeight: 400, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Your Roadmap
              </h1>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {plan.totalWeeks}-week plan · {tracksStr}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
              {completedCount === 0
                ? 'Your plan is ready. Start with Week 1 — the foundation matters most.'
                : `${completedCount} module${completedCount === 1 ? '' : 's'} done · Keep going.`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '12px 16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{weeksLeft}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Weeks left</div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '12px 16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{completedCount}/{plan.totalModules}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Modules done</div>
            </div>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 24, alignSelf: 'flex-start' }}>
          <input 
            type="checkbox" 
            checked={previewMode} 
            onChange={(e) => setPreviewMode(e.target.checked)}
            style={{ width: 22, height: 22, accentColor: 'var(--primary-bright)', cursor: 'pointer', margin: 0, flexShrink: 0 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Preview full roadmap</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {previewMode 
                ? "Browsing ahead — you'll still need to complete each week in order to check things off." 
                : "See what's in every week before you get there."}
            </span>
          </div>
        </label>

        <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--bg3)', marginBottom: 40, overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--primary-bright))', transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {plan.weeks.map((week, index) => {
            const nextWeek = plan.weeks[index + 1]
            const isUnlocked = isWeekUnlocked(index, plan.weeks, planCompletedIds)
            
            const prevWeek = index > 0 ? plan.weeks[index - 1] : null
            const prevWeekDoneCount = prevWeek ? prevWeek.modules.filter((m) => planCompletedIds.has(m.id)).length : 0
            const prevWeekTotalCount = prevWeek ? prevWeek.modules.length : 0

            return (
              <WeekCard
                key={week.week}
                week={week}
                weekNumber={week.week}
                isCurrentWeek={week.week === currentWeek}
                isLocked={!isUnlocked}
                isPreviewMode={previewMode}
                completedModuleIds={planCompletedIds}
                onModuleClick={setSelectedModuleId}
                isExpanded={expandedWeeks.has(week.week) || (previewMode && !isUnlocked)}
                currentWeek={currentWeek}
                onToggleExpand={() => {
                  setExpandedWeeks((prev) => {
                    const newSet = new Set(prev)
                    if (newSet.has(week.week) && week.week !== currentWeek) {
                      newSet.delete(week.week)
                    } else {
                      newSet.add(week.week)
                    }
                    return newSet
                  })
                }}
                nextWeekTheme={nextWeek?.theme}
                prevWeekDoneCount={prevWeekDoneCount}
                prevWeekTotalCount={prevWeekTotalCount}
              />
            )
          })}
        </div>
      </div>

      <ModuleDrawer
        moduleId={selectedModuleId}
        onClose={() => setSelectedModuleId(null)}
        isCompleted={selectedModuleId ? planCompletedIds.has(selectedModuleId) : false}
        isLocked={isSelectedModuleLocked}
        lockedMessage={selectedModuleLockMessage}
        onMarkDone={handleMarkDone}
        onMarkIncomplete={handleMarkIncomplete}
        userTracks={plan.tracks}
      />
    </div>
  )
}
