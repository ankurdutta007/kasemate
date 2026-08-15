function getISTMidnightEpoch(date) {
  // Returns 'YYYY-MM-DD' in IST
  const istDateString = new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return Date.parse(istDateString + 'T00:00:00Z');
}

// Concrete Example:
// 11:45 PM IST on Tuesday (e.g., Aug 11, 2026) -> UTC is 18:15 on Aug 11
const session1 = '2026-08-11T18:15:00Z';
// 12:15 AM IST on Wednesday (Aug 12, 2026) -> UTC is 18:45 on Aug 11
const session2 = '2026-08-11T18:45:00Z';

console.log("Current logic (Browser Local TZ - assuming UTC for this node env):");
console.log("Session 1 local toDateString:", new Date(session1).toDateString());
console.log("Session 2 local toDateString:", new Date(session2).toDateString());

console.log("\nNew IST logic:");
const t1 = getISTMidnightEpoch(session1);
const t2 = getISTMidnightEpoch(session2);

console.log("Session 1 IST string:", new Date(session1).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
console.log("Session 2 IST string:", new Date(session2).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
console.log("Epoch difference in days:", (t2 - t1) / 86400000);

