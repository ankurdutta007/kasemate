export type Track = 'consulting' | 'product'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Case {
  id: string
  title: string
  track: Track
  subtype: string
  difficulty: Difficulty
  estimated_minutes: number
  premise_summary: string
  opening_question: string
  hidden_data: any
  intended_approach_summary: string
  source_book: string
}

// UI mapper helpers
export const getCaseCompany = (c: Case) => c.source_book || 'Unknown'
export const getCasePremise = (c: Case) => c.premise_summary || ''
export const getCaseTime = (c: Case) => c.estimated_minutes || 0

export const CONSULTING_SUBTYPES = [
  'All',
  'Profitability',
  'Market Entry',
  'M&A / Growth Strategy',
  'Pricing',
  'Operations',
  'Guesstimate',
]

export const PRODUCT_SUBTYPES = [
  'All',
  'Product Design',
  'Product Improvement',
  'Metrics / Root-Cause',
  'Prioritization / Tradeoff',
  'Strategy / Go-to-Market',
  'Guesstimate',
]

export function getMockHistory(cases: Case[]) {
  if (!cases || cases.length === 0) return []
  const names = ['Arjun', 'Neha', 'Rohan', 'Priya', 'Amit', 'Sneha', 'Vikram']
  const dates = [2, 4, 6, 14, 21, 30, 35]
  const scores = [74, 68, 82, 45, 79, 88, 71]

  return cases.slice(0, 7).map((c, i) => ({
    id: `hist-${i}`,
    caseId: c.id,
    name: names[i % names.length],
    title: c.title,
    score: scores[i % scores.length],
    subtype: c.subtype,
    track: c.track,
    date: new Date(Date.now() - dates[i % dates.length] * 24 * 60 * 60 * 1000).toISOString(),
    type: i % 2 === 0 ? 'audio' : 'chat'
  }))
}

export function formatRelativeDate(isoString: string) {
  const d = new Date(isoString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays <= 7) return `${diffDays} days ago`;
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
