/**
 * Glow behind the band, sampled from turn.webp itself: its deep violet runs
 * #1f083d at the edges to #320f4c along the top, dominant rgb(24, 8, 56).
 *
 * The vertical radius is exactly 50%, so the ramp reaches zero precisely at the
 * section's top and bottom edges. That is deliberate and load-bearing: the hero
 * above resolves to solid --lv2-bg, so any colour left at this section's top
 * edge would show up as a seam. Reaching the page background exactly at the
 * boundary is what lets the section start invisibly.
 *
 * Within that constraint the stops are weighted outward (0.92 alpha still at
 * 42%, 0.72 at 70%) so the padding is genuinely lit rather than being black
 * with a bright core hidden behind the opaque band.
 *
 * Note the outer stop is `rgba(10, 10, 15, 0)` and not `transparent`: the
 * `transparent` keyword interpolates through transparent BLACK, which greys the
 * midpoint of the ramp. Matching the base colour at zero alpha keeps it clean.
 */
const GLOW =
  'radial-gradient(ellipse 90% 50% at 50% 50%,' +
  ' #43186f 0%,' +
  ' rgba(52, 19, 90, 0.92) 42%,' +
  ' rgba(36, 13, 70, 0.72) 70%,' +
  ' rgba(20, 10, 44, 0.42) 88%,' +
  ' rgba(10, 10, 15, 0) 100%), var(--lv2-bg)'

/**
 * TurnV2 — beat 2 of the LandingV2 story: the shift from scattered prep to
 * something ordered.
 *
 * Deliberately quieter than the hero. No headline, no buttons, no images — a
 * brief glowing gradient breath between the hero and the sections that follow.
 */
export default function TurnV2() {
  return (
    <section
      id="the-turn"
      style={{
        position: 'relative',
        height: '50vh', // Modest 50vh content-sized block for transition
        background: GLOW,
      }}
    />
  )
}
