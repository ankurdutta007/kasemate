export function parseApproachSummary(raw: string | null | undefined): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const parts = [];
      if (parsed.framework_name) parts.push(`Framework to aim for: ${parsed.framework_name}`);
      if (parsed.framework_steps && Array.isArray(parsed.framework_steps) && parsed.framework_steps.length > 0) {
        parts.push(`Key steps:\n${parsed.framework_steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`);
      }
      if (parsed.strong_answer) parts.push(`What a strong answer looks like: ${parsed.strong_answer}`);
      if (parsed.common_pitfall) parts.push(`Common pitfall to watch out for: ${parsed.common_pitfall}`);
      
      if (parts.length > 0) {
        return parts.join('\n\n');
      }
      
      // Fallback: If it's an object but none of our specific keys matched, 
      // safely stringify it while explicitly excluding 'sample_exchange' to save tokens.
      const stripped = { ...parsed };
      delete stripped.sample_exchange;
      return JSON.stringify(stripped, null, 2);
    }
  } catch (e) {
    // If it fails to parse, it's likely a legacy plain-text string
    return raw;
  }
  return raw;
}
