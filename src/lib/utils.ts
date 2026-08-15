import { type Case } from '../data/cases'

export function getScoreColor(score: number): string {
  if (score < 25) return 'var(--coral)'
  if (score < 50) return 'var(--amber)'
  if (score < 75) return 'var(--blue)'
  return 'var(--teal)'
}

export function getEligibleCasesForUser(
  cases: Case[],
  difficultyLevel: string | undefined,
  completedCaseIds: Set<string>,
  userTracks: string[]
): Case[] {
  return cases.filter(c => {
    // 1. Exclude completed cases
    if (completedCaseIds.has(c.id)) return false
    
    // 2. Filter by track
    const hasProduct = userTracks.includes('product');
    const hasConsulting = userTracks.includes('consulting');
    if (hasProduct && !hasConsulting) {
      if (c.track !== 'product') return false;
    } else if (hasConsulting && !hasProduct) {
      if (c.track !== 'consulting') return false;
    }
    
    // 3. Filter by difficulty logic
    if (difficultyLevel === 'new' && c.difficulty !== 'Easy') return false
    if (difficultyLevel === 'some' && c.difficulty === 'Hard') return false
    // 'ready' (Hard) allows all difficulties

    return true
  })
}

export function getTargetedNextCase(
  cases: Case[],
  completedCaseIds: Set<string>,
  userTracks: string[],
  difficultyLevel?: string,
  dimension?: string
): Case {
  const available = getEligibleCasesForUser(cases, difficultyLevel, completedCaseIds, userTracks)

  let filtered = available
  if (dimension) {
    if (dimension === 'Quant reasoning' || dimension === 'Quant') {
      filtered = available.filter(c => ['Guesstimate', 'Metrics', 'Root-Cause'].includes(c.subtype))
    } else if (dimension === 'Structuring' || dimension === 'Structure') {
      filtered = available.filter(c => ['Profitability', 'Market Entry', 'Product Design'].includes(c.subtype))
    } else if (dimension === 'Business judgment' || dimension === 'Judgment') {
      filtered = available.filter(c => ['M&A', 'Growth Strategy', 'Pricing', 'Strategy/GTM', 'Product Improvement'].includes(c.subtype))
    }
    // 'Communication' falls through, no specific filter
  }

  if (filtered.length === 0) {
    filtered = available
  }

  return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : cases[0]
}

export function getWeakestDimension(sessions: any[]): { subject: string, score: number } | null {
  const recent10 = sessions.slice(-10)
  const recentReps = recent10.length
  
  if (recentReps === 0) return null
  
  let sumStruct = 0, sumQuant = 0, sumBiz = 0, sumComm = 0
  recent10.forEach(s => {
    sumStruct += s.grading_result?.structuring?.score || 0
    sumQuant += s.grading_result?.quant_reasoning?.score || 0
    sumBiz += s.grading_result?.business_judgment?.score || 0
    sumComm += s.grading_result?.communication?.score || 0
  })

  const RADAR_DATA = [
    { subject: 'Structure', score: Math.round(sumStruct / recentReps) },
    { subject: 'Quant', score: Math.round(sumQuant / recentReps) },
    { subject: 'Judgment', score: Math.round(sumBiz / recentReps) },
    { subject: 'Comms', score: Math.round(sumComm / recentReps) },
  ]

  return RADAR_DATA.reduce((a, b) => a.score < b.score ? a : b)
}
