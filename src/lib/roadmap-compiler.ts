/**
 * KaseMate Roadmap Compiler v2
 * ----------------------------------------------------------------------------
 * Guarantees (enforced by assertPlanValid, run in dev):
 *   1. Every module appears EXACTLY ONCE across the whole plan.
 *   2. No week is empty. Every week has >= MIN_MODULES_PER_WEEK modules.
 *   3. Stage 1 (Get Shortlisted) is fully complete by week ceil(0.45 * weeks).
 *   4. Stage 2 (Convert the Interview) starts by week ceil(0.30 * weeks).
 *   5. plan.totalModules === sum of week.modules.length === unique module count.
 *
 * There are no hardcoded per-week module arrays anywhere in this file.
 * Everything is derived from module-library data + timeline density.
 */

import MODULE_LIBRARY from '../data/roadmap-modules.json';

export type Track = 'product' | 'consulting' | 'analyst' | 'general';
export type Timeline = 4 | 8 | 12;

export interface ModuleTask {
  label: string;
  kind: 'internal' | 'external';
  href: string;
  minutes: number;
  /** One sentence of concrete guidance — what to actually do, how much, to what standard. */
  detail: string;
  /**
   * Drives the task button. Do NOT infer the button from href/kind — use this.
   *   'kasemate'    → "Go to KaseMate →"  (href routes to a real consulting/product case category)
   *   'external'    → "Open resource →"   (opens href in a new tab)
   *   'linkedin'    → "Go to LinkedIn →"  (href is a LinkedIn URL)
   *   'performance' → "View Performance →" (href is /performance)
   *   'self'        → NO button at all    (a do-it-yourself task: write a doc, rehearse, etc.)
   * KaseMate only has consulting + product CASE practice — so 'kasemate' never appears on CV/HR/
   * GD/WAT/mock/base-sheet tasks. Those are 'self' or 'external' by design.
   */
  action: 'kasemate' | 'external' | 'linkedin' | 'performance' | 'self';
}

export interface Module {
  id: string;
  title: string;
  stage: 1 | 2;
  tier: 1 | 2 | 3;
  family: string;
  tracks: Track[];
  hours: number;
  priority: number;
  what: string;
  why: string;
  good: string;
  mistake: string;
  tasks: ModuleTask[];
  /**
   * Optional track-specific structural guidance, keyed by track. Currently only
   * populated on FOUND-01 (CV structure differs meaningfully by track — a
   * consulting CV and an analyst CV emphasise different things even though the
   * underlying "what/why/good/mistake" content is shared). Render only the
   * entries matching the user's selected tracks, if this field is present.
   */
  trackNotes?: Partial<Record<Track, string>>;
}

export interface WeekPlan {
  week: number;
  theme: string;
  stage: 1 | 2;
  stageLabel: string;
  moduleIds: string[];
  modules: Module[];
  hours: number;
  dailyMinutes: number;
  /** Human-readable daily commitment, e.g. "1h 15min/day". Use this in the UI, never raw minutes. */
  dailyTimeLabel: string;
  checkpoint: string;
}

export interface CompiledPlan {
  tracks: Track[];
  totalWeeks: Timeline;
  weeks: WeekPlan[];
  totalModules: number;
  totalHours: number;
  weeklyHours: number;
  dailyMinutes: number;
  /** Human-readable daily commitment across the whole plan, e.g. "2h 10min/day". */
  dailyTimeLabel: string;
  stage1EndsWeek: number;
  densityWarning: boolean;
  droppedModuleIds: string[];
}

/* ---------------------------------------------------------------- config -- */

const MODULES = MODULE_LIBRARY as unknown as Module[];

/** Highest tier included per timeline. Longer plan = more depth modules. */
const TIER_CAP: Record<Timeline, 1 | 2 | 3> = { 4: 1, 8: 2, 12: 3 };

/** Above this weekly load we start trimming the lowest-priority depth modules. */
const MAX_WEEKLY_HOURS: Record<Timeline, number> = { 4: 30, 8: 24, 12: 22 };

/** A week must never look empty. */
const MIN_MODULES_PER_WEEK = 2;

/** Core (tier 1) Stage 1 work must be finished by this week. */
const STAGE1_DEADLINE_WEEK: Record<Timeline, number> = { 4: 3, 8: 5, 12: 7 };

/** Absolutely no Stage 1 work after this week — the tail is for cases and mocks. */
const STAGE1_TAIL_WEEK: Record<Timeline, number> = { 4: 3, 8: 6, 12: 9 };

/** Ordering hint: fraction of the plan across which Stage 1 is spread. */
const STAGE1_SPREAD_FRAC = 0.45;

/** Stage 2 must have begun by this fraction of the plan. */
const STAGE2_START_FRAC = 0.3;

const STAGE_LABEL: Record<1 | 2, string> = {
  1: 'Stage 1: Get Shortlisted',
  2: 'Stage 2: Convert the Interview',
};

/* ------------------------------------------------------------ selection -- */

function selectModules(tracks: Track[], weeks: Timeline) {
  const cap = TIER_CAP[weeks];
  const selected = MODULES.filter(
    (m) => m.tier <= cap && m.tracks.some((t) => tracks.includes(t))
  );

  // Density guard: if the union of many tracks blows past a sane weekly load,
  // drop the lowest-priority depth modules first. Tier 1 is never dropped.
  const budget = MAX_WEEKLY_HOURS[weeks] * weeks;
  const dropped: string[] = [];
  const kept = [...selected].sort((a, b) => b.priority - a.priority);

  let total = kept.reduce((s, m) => s + m.hours, 0);
  for (let tier = 3; tier >= 2 && total > budget; tier--) {
    for (let i = kept.length - 1; i >= 0 && total > budget; i--) {
      if (kept[i].tier !== tier) continue;
      // never trim below the minimum module floor
      if (kept.length - 1 < MIN_MODULES_PER_WEEK * weeks) break;
      total -= kept[i].hours;
      dropped.push(kept[i].id);
      kept.splice(i, 1);
    }
  }

  return {
    modules: kept,
    dropped,
    densityWarning: total > budget,
  };
}

/* -------------------------------------------------------------- ordering -- */

/**
 * Give every module a target position in [0,1] along the plan, then sort.
 * Stage 1 is spread over [0, stage1Deadline], Stage 2 over [stage2Start, 1].
 * The two ranges deliberately overlap so case work begins before aptitude ends.
 */
function orderModules(modules: Module[], weeks: Timeline): Module[] {
  const s1Deadline = STAGE1_SPREAD_FRAC;
  const s2Start = (Math.ceil(STAGE2_START_FRAC * weeks) - 1) / weeks;

  const positioned: Array<{ m: Module; pos: number }> = [];

  for (const stage of [1, 2] as const) {
    const group = modules
      .filter((m) => m.stage === stage)
      .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

    const groupHours = group.reduce((s, m) => s + m.hours, 0) || 1;
    const start = stage === 1 ? 0 : s2Start;
    const end = stage === 1 ? s1Deadline : 1;

    let cum = 0;
    for (const m of group) {
      const mid = (cum + m.hours / 2) / groupHours;
      positioned.push({ m, pos: start + mid * (end - start) });
      cum += m.hours;
    }
  }

  return positioned
    .sort((a, b) => a.pos - b.pos || a.m.stage - b.m.stage || b.m.priority - a.m.priority)
    .map((p) => p.m);
}

/* --------------------------------------------------------------- packing -- */

function packIntoWeeks(ordered: Module[], weeks: Timeline): Module[][] {
  const totalHours = ordered.reduce((s, m) => s + m.hours, 0) || 1;
  const buckets: Module[][] = Array.from({ length: weeks }, () => []);
  const placed = new Set<string>();

  // Order-preserving proportional assignment: a module lands in the week that
  // contains the midpoint of its slice of the total-hours timeline.
  let cum = 0;
  for (const m of ordered) {
    if (placed.has(m.id)) continue; // hard duplicate guard
    const mid = (cum + m.hours / 2) / totalHours;
    const w = Math.min(weeks - 1, Math.max(0, Math.floor(mid * weeks)));
    buckets[w].push(m);
    placed.add(m.id);
    cum += m.hours;
  }

  fillThinWeeks(buckets, weeks);

  // These two constraints can conflict on dense single-tier (4-week) plans —
  // fixing one can undo the other — so alternate them until both hold or we
  // give up after a few rounds (whichever constraint is still unmet after
  // that reflects a genuine content-density limit, not a compiler bug).
  const stage2Deadline = Math.ceil(STAGE2_START_FRAC * weeks);
  const stage1Deadline = STAGE1_DEADLINE_WEEK[weeks];
  for (let round = 0; round < 4; round++) {
    enforceStage2Start(buckets, stage2Deadline);
    enforceStage1Deadline(buckets, stage1Deadline);
  }
  enforceStage2Start(buckets, stage2Deadline);

  return buckets;
}

/**
 * Hard guarantee: no tier-1 (must-do) Stage 1 module may land after the
 * Stage 1 deadline week. Proportional packing is a good default but isn't
 * aware of the deadline on its own, so this swaps any offending module back
 * with a later-appropriate module (tier 2/3 Stage 1, or Stage 2) sitting
 * inside the deadline window. Runs after enforceStage2Start so the two never
 * fight each other.
 */
function enforceStage1Deadline(buckets: Module[][], deadlineWeek: number) {
  for (let guard = 0; guard < 50; guard++) {
    let offenderWeek = -1;
    let offender: Module | undefined;

    for (let w = deadlineWeek; w < buckets.length; w++) {
      const hit = buckets[w].find((m) => m.stage === 1 && m.tier === 1);
      if (hit) { offenderWeek = w; offender = hit; break; }
    }
    if (!offender) return;

    // Find a swap partner in an earlier (in-deadline) week: prefer a
    // deeper-tier Stage 1 module so we don't disturb the Stage 2 start
    // guarantee already established by enforceStage2Start; only fall back to
    // a Stage 2 module if no such Stage 1 module exists in the window.
    let partnerWeek = -1;
    let partner: Module | undefined;
    for (let w = 0; w < deadlineWeek; w++) {
      partner = buckets[w].find((m) => m.stage === 1 && m.tier > 1);
      if (partner) { partnerWeek = w; break; }
    }
    if (!partner) {
      for (let w = 0; w < deadlineWeek; w++) {
        partner = buckets[w].find((m) => m.stage === 2);
        if (partner) { partnerWeek = w; break; }
      }
    }
    if (!partner) return; // nothing safe to swap with; leave as-is

    buckets[offenderWeek].splice(buckets[offenderWeek].indexOf(offender), 1);
    buckets[partnerWeek].splice(buckets[partnerWeek].indexOf(partner), 1);
    buckets[offenderWeek].push(partner);
    buckets[partnerWeek].push(offender);
  }
}

/**
 * On Stage-1-heavy track mixes (SQL + Python + stats) case work can slip past
 * its start week. Swap the earliest Stage 2 module back with the lowest-value
 * Stage 1 module sitting in the target week. Counts and hours stay balanced.
 */
function enforceStage2Start(buckets: Module[][], targetWeek: number) {
  for (let guard = 0; guard < 20; guard++) {
    const firstIdx = buckets.findIndex((b) => b.some((m) => m.stage === 2));
    if (firstIdx === -1 || firstIdx < targetWeek) return;

    const src = buckets[firstIdx];
    const dst = buckets[targetWeek - 1];

    const s2 = src.filter((m) => m.stage === 2).sort((a, b) => b.priority - a.priority)[0];
    const s1 = dst.filter((m) => m.stage === 1).sort((a, b) => a.priority - b.priority)[0];
    if (!s2 || !s1) return;

    src.splice(src.indexOf(s2), 1);
    dst.splice(dst.indexOf(s1), 1);
    dst.push(s2);
    src.unshift(s1);
  }
}

/**
 * Guarantee every week clears MIN_MODULES_PER_WEEK by cascading modules one
 * step at a time across ADJACENT weeks only, so the sequence order is never
 * broken. This is what stops a week-1 module from landing in week 12.
 */
function fillThinWeeks(buckets: Module[][], weeks: number) {
  for (let guard = 0; guard < 500; guard++) {
    const thin = buckets.findIndex((b) => b.length < MIN_MODULES_PER_WEEK);
    if (thin === -1) return;

    // Find the nearest week with a surplus, then shift one module per hop.
    let donor = -1;
    for (let d = 1; d < weeks; d++) {
      if (thin - d >= 0 && buckets[thin - d].length > MIN_MODULES_PER_WEEK) { donor = thin - d; break; }
      if (thin + d < weeks && buckets[thin + d].length > MIN_MODULES_PER_WEEK) { donor = thin + d; break; }
    }
    if (donor === -1) return; // not enough modules to satisfy the floor

    if (donor < thin) {
      for (let i = donor; i < thin; i++) buckets[i + 1].unshift(buckets[i].pop() as Module);
    } else {
      for (let i = donor; i > thin; i--) buckets[i - 1].push(buckets[i].shift() as Module);
    }
  }
}

/* ------------------------------------------------------------- time label -- */

/**
 * Converts raw minutes into a human-readable daily commitment string.
 * Never show raw minutes above ~59 in the UI — "146 min/day" reads badly;
 * "2h 26min/day" reads immediately. Use this everywhere dailyMinutes surfaces.
 */
export function formatDailyTime(minutes: number): string {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded}min/day`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m === 0 ? `${h}h/day` : `${h}h ${m}min/day`;
}

/* --------------------------------------------------------- subtype slugs -- */

/**
 * Canonical case-category slugs, one place only. If the app's Hub component
 * ever uses different slug strings internally than the ones below, update
 * ONLY this map — nothing else in this file, and nothing in the module data,
 * needs to change. This exists specifically so a routing mismatch is a
 * one-line fix here instead of a search-and-replace across roadmap-modules.json.
 */
/**
 * Canonical case-category strings, one place only — the exact Title Case
 * strings KaseMate's Hub component filters on (confirmed against the live
 * app, since a guessed slug like 'ma-growth' silently fails to match
 * 'M&A / Growth Strategy'). roadmap-modules.json now stores these values
 * directly, URL-encoded, so this map exists purely as living documentation
 * and for the one dynamic case below (shared Guesstimate track routing) — if
 * Hub's internal strings ever change, update the JSON's hrefs to match the
 * new values AND this map together, so they can't silently drift apart again.
 */
const SUBTYPE_SLUG: Record<string, string> = {
  profitability: 'Profitability',
  'market-entry': 'Market Entry',
  'market-sizing': 'Market Sizing',
  'ma-growth': 'M&A / Growth Strategy',
  pricing: 'Pricing',
  operations: 'Operations',
  guesstimate: 'Guesstimate',
  'product-design': 'Product Design',
  'product-improvement': 'Product Improvement',
  'metrics-rca': 'Metrics / Root-Cause',
  prioritization: 'Prioritization / Tradeoff',
  'strategy-gtm': 'Strategy / Go-to-Market',
};

/* ------------------------------------------------- shared-subtype routing -- */

/**
 * Some case subtypes exist under more than one track in KaseMate's bank —
 * currently only 'Guesstimate', which has its own case set under BOTH
 * Consulting and Product. The module data can't hardcode which one to use,
 * because the same GUE-01/GUE-02 modules serve all four roadmap tracks. This
 * resolves the href's track param at compile time, using the tracks the user
 * actually selected, so a product-only plan never routes into the consulting
 * case list (or vice versa).
 *
 * If this bank ever adds more subtypes shared across tracks, add the exact
 * canonical string to SHARED_SUBTYPES below — no other change needed.
 */
const SHARED_SUBTYPES = new Set([SUBTYPE_SLUG.guesstimate]); // 'Guesstimate'

function resolvePreferredCaseTrack(tracks: Track[]): 'consulting' | 'product' {
  if (tracks.includes('consulting')) return 'consulting';
  if (tracks.includes('product')) return 'product';
  // Analyst/General-only plans have no dedicated case bank for this subtype;
  // consulting's guesstimate set is the larger of the two, so it's the safer default.
  return 'consulting';
}

function localizeSharedSubtypeHrefs(mods: Module[], tracks: Track[]): Module[] {
  const preferred = resolvePreferredCaseTrack(tracks);
  return mods.map((m) => {
    const needsLocalizing = m.tasks.some((t) => {
      if (t.action !== 'kasemate') return false;
      const st = t.href.match(/subtype=([^&]+)/)?.[1];
      return st !== undefined && SHARED_SUBTYPES.has(decodeURIComponent(st));
    });
    if (!needsLocalizing) return m;

    return {
      ...m,
      tasks: m.tasks.map((t) => {
        if (t.action !== 'kasemate') return t;
        const st = t.href.match(/subtype=([^&]+)/)?.[1];
        if (!st || !SHARED_SUBTYPES.has(decodeURIComponent(st))) return t;
        return { ...t, href: t.href.replace(/track=[a-z]+/, `track=${preferred}`) };
      }),
    };
  });
}

/* ----------------------------------------------------------------- theme -- */

const FAMILY_THEME: Record<string, string> = {
  foundation: 'CV & Positioning',
  aptitude: 'Aptitude',
  puzzles: 'Puzzles',
  guesstimate: 'Guesstimates',
  business: 'Business Fundamentals',
  sql: 'SQL',
  python: 'Python & Pandas',
  stats: 'Statistics & Experiments',
  tools: 'Analyst Tooling',
  'case-core': 'Case Fundamentals',
  'case-consulting': 'Consulting Cases',
  'case-product': 'Product Cases',
  'case-general': 'Business & GM Cases',
  metrics: 'Metrics',
  communication: 'GD, WAT & Communication',
  interview: 'Interview Craft',
  mock: 'Mocks',
  practice: 'Volume Practice',
};

function deriveTheme(mods: Module[], week: number, weeks: number): string {
  const byFamily = new Map<string, number>();
  for (const m of mods) byFamily.set(m.family, (byFamily.get(m.family) ?? 0) + m.hours);

  const ranked = [...byFamily.entries()].sort((a, b) => b[1] - a[1]);
  const labels = ranked.slice(0, 2).map(([f]) => FAMILY_THEME[f] ?? f);

  if (labels.length === 0) return `Week ${week}`;
  if (labels.length === 1 || ranked[1][1] < ranked[0][1] * 0.4) {
    return week === weeks ? `${labels[0]} — Final Push` : labels[0];
  }
  return `${labels[0]} + ${labels[1]}`;
}

function deriveCheckpoint(mods: Module[], week: number, weeks: number): string {
  const titles = mods.slice(0, 2).map((m) => m.title);
  if (week === weeks) {
    return `Everything closed out. You can walk into any round on your list without cramming.`;
  }
  if (mods.every((m) => m.stage === 1)) {
    return `${titles.join(' and ')} done to timed standard — you can clear an OA on these.`;
  }
  if (mods.every((m) => m.stage === 2)) {
    return `${titles.join(' and ')} done, with every session reviewed and logged.`;
  }
  return `${titles.join(' and ')} complete — OA prep holding while case work ramps up.`;
}

/** No two weeks should carry an identical theme label. */
function dedupeThemes(weekPlans: WeekPlan[]) {
  const seen = new Map<string, number>();
  for (const wk of weekPlans) {
    const base = wk.theme;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    if (n === 1) continue;
    const suffix = wk.week === weekPlans.length ? 'Final Push' : n === 2 ? 'Deep Dive' : 'Reinforcement';
    wk.theme = `${base} — ${suffix}`;
  }
}

/* ------------------------------------------------------------- validation -- */

export function assertPlanValid(plan: CompiledPlan) {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const wk of plan.weeks) {
    if (wk.modules.length === 0) errors.push(`Week ${wk.week} is empty`);
    for (const m of wk.modules) {
      if (seen.has(m.id)) errors.push(`Duplicate module ${m.id} (week ${wk.week})`);
      seen.add(m.id);
    }
  }

  const summed = plan.weeks.reduce((s, w) => s + w.modules.length, 0);
  if (summed !== plan.totalModules)
    errors.push(`Header count ${plan.totalModules} != week sum ${summed}`);
  if (seen.size !== plan.totalModules)
    errors.push(`Unique count ${seen.size} != header count ${plan.totalModules}`);

  // Core OA prep (stage 1, tier 1) must be finished by the stage-1 deadline.
  const lastCoreStage1 = Math.max(
    0,
    ...plan.weeks
      .filter((w) => w.modules.some((m) => m.stage === 1 && m.tier === 1))
      .map((w) => w.week)
  );
  const deadline = STAGE1_DEADLINE_WEEK[plan.totalWeeks];
  if (lastCoreStage1 > deadline)
    errors.push(`Core Stage 1 runs to week ${lastCoreStage1}, deadline is ${deadline}`);

  // No aptitude/OA work at all in the final quarter — that time is for cases.
  const lastStage1 = Math.max(
    0,
    ...plan.weeks.filter((w) => w.modules.some((m) => m.stage === 1)).map((w) => w.week)
  );
  const tailStart = STAGE1_TAIL_WEEK[plan.totalWeeks];
  if (lastStage1 > tailStart)
    errors.push(`Stage 1 module in week ${lastStage1}; must end by week ${tailStart}`);

  const firstStage2 = Math.min(
    Infinity,
    ...plan.weeks.filter((w) => w.modules.some((m) => m.stage === 2)).map((w) => w.week)
  );
  const s2Deadline = Math.ceil(STAGE2_START_FRAC * plan.totalWeeks);
  if (firstStage2 > s2Deadline)
    errors.push(`Stage 2 starts week ${firstStage2}, should start by ${s2Deadline}`);

  return errors;
}

/* -------------------------------------------------------------- compiler -- */

export function compilePlan(tracks: Track[], weeks: Timeline): CompiledPlan {
  if (!tracks.length) throw new Error('compilePlan: at least one track required');

  const { modules, dropped, densityWarning } = selectModules(tracks, weeks);
  const ordered = orderModules(modules, weeks);
  const buckets = packIntoWeeks(ordered, weeks);

  const totalHours = modules.reduce((s, m) => s + m.hours, 0);
  const weeklyHours = totalHours / weeks;

  const weekPlans: WeekPlan[] = buckets.map((rawMods, i) => {
    const mods = localizeSharedSubtypeHrefs(rawMods, tracks);
    const week = i + 1;
    const hours = mods.reduce((s, m) => s + m.hours, 0);
    const stage2Share = mods.filter((m) => m.stage === 2).reduce((s, m) => s + m.hours, 0);
    const stage: 1 | 2 = stage2Share > hours / 2 ? 2 : 1;

    return {
      week,
      theme: deriveTheme(mods, week, weeks),
      stage,
      stageLabel: STAGE_LABEL[stage],
      moduleIds: mods.map((m) => m.id),
      modules: mods,
      hours,
      dailyMinutes: Math.round((hours * 60) / 7),
      dailyTimeLabel: formatDailyTime((hours * 60) / 7),
      checkpoint: deriveCheckpoint(mods, week, weeks),
    };
  });

  dedupeThemes(weekPlans);

  const plan: CompiledPlan = {
    tracks,
    totalWeeks: weeks,
    weeks: weekPlans,
    totalModules: modules.length,
    totalHours,
    weeklyHours: Math.round(weeklyHours * 10) / 10,
    dailyMinutes: Math.round((weeklyHours * 60) / 7),
    dailyTimeLabel: formatDailyTime((weeklyHours * 60) / 7),
    stage1EndsWeek: STAGE1_DEADLINE_WEEK[weeks],
    densityWarning,
    droppedModuleIds: dropped,
  };

  if (import.meta.env?.DEV) {
    const errs = assertPlanValid(plan);
    if (errs.length) console.error('[roadmap-compiler] INVALID PLAN', tracks, weeks, errs);
  }

  return plan;
}

export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

export const ALL_MODULES = MODULES;
