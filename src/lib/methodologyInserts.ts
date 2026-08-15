export const METHODOLOGY_INSERTS: Record<string, string> = {
  'profitability': `This is a profitability case: a business's profit has changed and the candidate
must diagnose why and recommend action. Expect the candidate to split Profit =
Revenue − Cost, then Revenue = Price × Volume (by segment/product/channel), and
Cost = Fixed + Variable. A strong candidate asks whether the change is revenue-
driven, cost-driven, or both, before picking a branch — reward this explicitly.
Common weak move to push back on: diving into cost-cutting ideas before
diagnosing which side of the P&L actually moved. If they hypothesize a branch,
ask what data would confirm or kill it before revealing that data.`,

  'market_entry': `This is a market-entry case: should the client enter a new market/geography/
segment? Expect a structure covering (1) market attractiveness — size, growth,
competition, regulation, (2) the client's right to win — capabilities, existing
assets, brand fit, and (3) financial viability — entry cost vs. expected return.
A strong candidate sequences these rather than jumping to a gut recommendation.
Push back if they recommend entry/no-entry before addressing at least two of the
three legs. Guesstimate-style market sizing often appears as a sub-task inside
this case — let them build it top-down or bottom-up and probe their assumptions
lightly ("why that penetration rate?") rather than correcting the math yourself.`,



  'ma_growth': `This case asks whether the client should acquire, partner, or pursue organic
growth. Expect a structure weighing strategic rationale (why this move, why now),
target/deal attractiveness (valuation, synergies, integration risk), and
alternatives (could organic growth achieve the same goal cheaper?). Push back
specifically on synergy claims — a common weak move is assuming synergies without
naming their source (cost, revenue, or capability) or sizing them. Reward
candidates who explicitly compare the M&A option against a "do nothing" or
organic-growth baseline rather than evaluating the deal in isolation.`,

  'pricing': `This case asks the candidate to set or change a price. Expect consideration of
cost-based, competitor-based, and value-based approaches, with a strong candidate
naming all three before picking a lens appropriate to the case's product
(commodity vs. differentiated). Push back if they anchor only on cost without
considering willingness-to-pay or competitive response. A good closing move is
naming a likely competitor or customer reaction to the proposed price — probe for
this if it's missing near the end of the case.`,

  'operations': `This case asks the candidate to diagnose and fix an operational problem (cost,
time, quality, throughput). Expect a process-mapping instinct — breaking the
operation into sequential stages and isolating which stage is the bottleneck —
before jumping to solutions. Push back hard on solution-first thinking here
specifically; it's the most common failure mode in ops cases. Reward candidates
who ask for a specific metric per stage (e.g. time or defect rate per step)
rather than asking for the answer in general terms.`,

  'consulting_guesstimate': `Same discipline as Market Sizing above, but often framed with a sharper business
hook (e.g. "how many X does this client need to stock"). Keep the pace brisk —
guesstimates run shorter than full cases. Interrupt gently if the candidate
spends too long on one assumption ("that's a reasonable estimate, let's keep
moving") since real interviewers manage guesstimate pacing tightly.`,

  'product_design': `This case asks the candidate to design a product or feature for a given user and
problem (the CIRCLES-style approach: clarify the goal, identify the user, report
their needs, cut through to prioritize, list solutions, evaluate trade-offs,
summarize). Expect the candidate to nail down WHO the user is and WHAT problem
matters most before proposing any solution — push back immediately if they jump
to "I would build X" without first anchoring on a specific user and need. Reward
candidates who prioritize explicitly (why this feature over that one) rather
than listing ideas without a filter.`,

  'product_improvement': `This case gives an existing product/feature with a specific weakness and asks
how to improve it. Expect the candidate to first clarify the goal metric (what
does "improve" mean, numerically), then generate a structured list of levers
(not a scattershot brainstorm), then prioritize by impact and effort. Push back
if they propose solutions before defining what success looks like.`,

  'metrics_root_cause': `This is a metric-change diagnosis case (a number moved — find out why), evaluated
using a funnel- or driver-tree-style decomposition, mirroring GAME-method
thinking. Expect the candidate to segment the metric (by user group, platform,
geography, time) before speculating about causes, and to separate internal
causes (a product/logging change) from external ones (seasonality, a competitor
move, a market shift) — this internal/external split is the single most-tested
instinct in this case type, so push back specifically if it's missing. Reveal
segment-level data only once they ask for the specific cut.`,

  'prioritization': `This case gives several competing features/initiatives and limited capacity.
Expect the candidate to propose explicit criteria (impact, effort, strategic
fit, risk) before ranking anything — push back if they rank by gut feel without
naming criteria first. Reward candidates who acknowledge genuine trade-offs
("we'd be giving up X to get Y") rather than presenting the ranking as costless.`,

  'strategy_gtm': `This case asks a bigger strategic question (should we launch, expand, reposition).
Expect a structure that weighs market opportunity, competitive dynamics, and
internal readiness/resources — similar shape to the consulting market-entry case
but with a product-adoption lens (why would users switch/adopt). Push back if the
recommendation ignores execution risk or assumes unlimited resources.`,

  'product_guesstimate': `Same core discipline as the consulting guesstimate, but framed around product
usage (searches per day, DAU for a feature, etc.) rather than a market's dollar
size. Keep pacing brisk; the evaluation is on structured estimation, not the
exact number.`
}

/**
 * Normalizes DB track and subtype into the exact string key
 * expected by METHODOLOGY_INSERTS.
 */
export function getMethodologyKey(track: string, subtype: string): string {
  const normTrack = track.toLowerCase()
  const normSub = subtype.trim()
  
  if (normTrack === 'consulting') {
    switch (normSub) {
      case 'Profitability': return 'profitability'
      case 'Market Entry': return 'market_entry'
      case 'M&A / Growth Strategy': return 'ma_growth'
      case 'Pricing': return 'pricing'
      case 'Operations': return 'operations'
      case 'Guesstimate': return 'consulting_guesstimate'
    }
  } else if (normTrack === 'product') {
    switch (normSub) {
      case 'Product Design': return 'product_design'
      case 'Product Improvement': return 'product_improvement'
      case 'Metrics / Root-Cause': return 'metrics_root_cause'
      case 'Prioritization / Tradeoff': return 'prioritization'
      case 'Strategy / Go-to-Market': return 'strategy_gtm'
      case 'Guesstimate': return 'product_guesstimate'
    }
  }
  
  // Fallback to a reasonable default based on track if there's a mismatch
  return normTrack === 'consulting' ? 'profitability' : 'product_design'
}
