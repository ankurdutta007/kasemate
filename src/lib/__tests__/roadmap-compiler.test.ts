import { compilePlan, assertPlanValid, type Track, type Timeline } from '../roadmap-compiler';

const TRACKS: Track[] = ['product', 'consulting', 'analyst', 'general'];

const combos: Track[][] = [];
for (let mask = 1; mask < 16; mask++) {
  combos.push(TRACKS.filter((_, i) => mask & (1 << i)));
}

let failures = 0;
for (const tracks of combos) {
  for (const weeks of [4, 8, 12] as Timeline[]) {
    const plan = compilePlan(tracks, weeks);
    const errors = assertPlanValid(plan);
    const label = `${tracks.join('+')} ${weeks}wk`;
    if (errors.length) {
      failures++;
      console.error(`FAIL ${label}: ${errors.join(' | ')}`);
    } else {
      const min = Math.min(...plan.weeks.map(w => w.modules.length));
      console.log(`PASS ${label} — ${plan.totalModules} modules, min ${min}/week`);
    }
  }
}
console.log(failures === 0 ? '\nAll 45 combinations valid.' : `\n${failures} combinations FAILED.`);
if (failures > 0) process.exit(1);
