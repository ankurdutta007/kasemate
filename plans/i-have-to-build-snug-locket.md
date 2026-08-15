# Vantage — Case Interview Practice Platform

## Context

Building a full case-interview practice platform for college students prepping for consulting and product management interviews. The PRD ("Bullpen") describes 14 pages. The user wants a modern, different-colored redesign inspired by the Orfi.ai reference (clean light sections + orange CTAs) and the NexusBank dashboard (dark mode with emerald/teal accents). Product name: **Vantage** ("Your edge in every case interview").

## Aesthetic Stance

**Editorial dark-mode tech** — deep charcoal/indigo base, electric coral (#ff5c3a) primary CTA, teal (#00d4a8) accent for data and track chips, warm off-white text. Asymmetric hero layout. Clean, confident.

**Fonts** (Google Fonts, Vite `@import` in `src/index.css`):
- Display: `Instrument Serif` — editorial serif for hero/section headings
- Body: `Outfit` — clean modern sans for all body copy
- Mono: `JetBrains Mono` — score displays, labels, timers

**Color tokens** (written inline in `src/index.css` via Tailwind CSS v4 `@theme`):
- `--background: #0d0f14`
- `--foreground: #f0ede8`
- `--card: #161b24`
- `--primary: #ff5c3a`
- `--secondary: #1a2235`
- `--accent: #00d4a8`
- `--muted: #1e2535`
- `--muted-foreground: #7a8599`
- `--border: rgba(255,255,255,0.08)`
- `--radius: 0.75rem`

Landing hero section uses a **light** treatment (ivory `#f8f6f1` background) matching Orfi reference, then transitions to dark for the app pages.

## Pages to Build (all in single SPA via React Router)

1. **Landing** (`/`) — Hero + features + how it works + testimonials + FAQ + CTA footer
2. **Sign Up/Login** (`/auth`) — Centered card, email + password, toggle
3. **Onboarding Role** (`/onboarding/role`) — 3 selectable cards (Consulting / Product / Both)
4. **Onboarding Level** (`/onboarding/level`) — 3 selectable rows
5. **Practice Hub** (`/hub`) — Tab switcher: Random practice + Browse all (case grid with filters)
6. **Case Interview Text** (`/case/:id`) — Transcript UI, hint drawer, timer, wrap up
7. **Feedback** (`/feedback`) — Score ring, 4 rubric dimension cards, weakness callout
8. **Dashboard** (`/dashboard`) — Cold-start state + warm state toggled by rep count; radar chart + trend line via recharts
9. **Profile/Settings** (`/settings`) — Simple settings list

## File Structure

```
src/
  App.tsx              ← React Router shell + nav
  index.css            ← Google Font imports + Tailwind + theme tokens
  pages/
    Landing.tsx
    Auth.tsx
    OnboardingRole.tsx
    OnboardingLevel.tsx
    Hub.tsx
    CaseInterview.tsx
    Feedback.tsx
    Dashboard.tsx
    Settings.tsx
  components/
    Nav.tsx            ← Top navbar (shared across app pages)
    CaseCard.tsx       ← Reusable case card for Browse grid
```

## Dependencies to Install

- `react-router-dom` — routing between pages
- `recharts` — radar chart + trend line on Dashboard

## Implementation Steps

1. **`src/index.css`** — Add Google Font `@import`s (Instrument Serif, Outfit, JetBrains Mono), then `@theme` block with all color and typography tokens
2. **Install deps** — `pnpm add react-router-dom recharts`
3. **`src/App.tsx`** — Set up `BrowserRouter` + `Routes` pointing to each page; include `Nav` for app pages, no nav on Landing/Auth/Onboarding
4. **`src/pages/Landing.tsx`** — Full landing page: hero (light ivory bg), features grid (3 cards), "how it works" 3-step, testimonials row, FAQ accordion, CTA banner, footer
5. **`src/pages/Auth.tsx`** — Centered dark card with email/password, sign up / login toggle
6. **`src/pages/OnboardingRole.tsx`** + **`OnboardingLevel.tsx`** — Progress bar + selectable cards
7. **`src/pages/Hub.tsx`** — Tab pill switcher, random case CTA card, browse grid with track + subtype + difficulty filters and mock case data
8. **`src/pages/CaseInterview.tsx`** — Scrolling transcript, AI interviewer turn indicators, message input, hint button, live timer, wrap up button
9. **`src/pages/Feedback.tsx`** — Score ring SVG, 4 dimension cards with progress bars, weakness callout, next-steps CTA
10. **`src/pages/Dashboard.tsx`** — Warm state: score ring + streak stats + recharts RadarChart + LineChart; cold-state behind rep count < 3
11. **`src/components/Nav.tsx`** — Top nav with Vantage logo, links to Hub/Dashboard/Settings, user avatar

## Mock Data

Use hardcoded case data (10-12 cases across consulting + product subtypes) in `src/data/cases.ts` to populate Hub browse grid and simulate the interview/feedback flow.

## Verification

- App navigates between all pages without errors
- Landing page renders all sections (hero → features → steps → testimonials → FAQ → CTA)
- Hub tab switching works, case filter chips filter the grid
- Dashboard shows radar + line chart in warm state, cold-start message with 0 reps
- Fonts (Instrument Serif headings, Outfit body) render correctly
