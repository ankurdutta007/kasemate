/**
 * content.ts — verbatim copy extracted from src/pages/Landing.tsx
 *
 * Every string below is copied EXACTLY as it appears on the live landing page.
 * Nothing here has been rewritten, shortened, or "improved".
 *
 * Where the live page splits a headline into a normal part and an italic
 * emphasised part, that split is preserved as two fields (`lead` / `emphasis`)
 * so the V2 design can style them independently without changing the words.
 *
 * This file is TEXT ONLY — no images, no colours, no logic. Logos and images
 * stay in the components that use them.
 */

/* ─── NAV ─────────────────────────────────────────────────────────── */

export const BRAND_NAME = "KaseMate"

export const NAV_LINKS = [
  { label: "Tracks", href: "#tracks" },
  { label: "How it works", href: "#roadmap" },
  { label: "Companies", href: "#proof" },
  // { label: "FAQ", href: "#faq" }, // disabled pending FaqV2.tsx being built
] as const

export const NAV_CTA = "Get started →"

/* ─── HERO ────────────────────────────────────────────────────────── */

export const HERO = {
  headline: {
    lead: "Your placement prep,",
    emphasis: "actually organized.",
  },
  // Rendered as one paragraph. Segments marked `accent` are tinted with the
  // warm accent colour so the concrete numbers stand out of the muted copy;
  // everything else stays the default muted off-white.
  subhead: [
    { text: "A week-by-week roadmap, ", accent: false },
    { text: "271 curated cases", accent: true },
    { text: " with full worked solutions, and a live AI interviewer that grades you on ", accent: false },
    { text: "four dimensions", accent: true },
    { text: ", built from what actually got KGPians placed last year.", accent: false },
  ],
  attribution: "Built by KGPians, for KGPians.",
  primaryCta: "Build your roadmap →",
  secondaryCta: "See how it works",
  secondaryCtaHref: "#how-it-works",
} as const

export const HERO_STATS = [
  { value: "271", label: "hand-curated cases, not scraped" },
  { value: "57", label: "roadmap modules across all tracks" },
] as const

/* ─── COMPANY TICKER ──────────────────────────────────────────────── */

// Rendered uppercase on the live page via CSS text-transform.
export const COMPANIES_HEADING = "Where our roadmap points you"

export const TARGET_COMPANIES = [
  "McKinsey & Co",
  "Accenture S&C",
  "Deloitte",
  "PwC",
  "Flipkart",
  "Zomato",
  "JPMorganChase",
  "Capital One",
  "American Express",
  "ITC Limited",
  "ICICI Bank",
  "Swiggy",
  "Tata Steel",
  "Jio Financial Services",
  "Ola",
  "Blinkit",
  "Ema",
  "Navi",
  "Media.net",
  "Sprinklr",
  "HiLabs",
  "CityMall",
  "Lyric",
  "ZS Associates",
  "EXL",
  "Indus Insights",
  "Ayna",
  "Acuvon",
  "Moneyview",
  "IDFC",
  "Kotak Mahindra Bank",
  "Meesho",
  "Cashfree",
  "Axis Bank",
  "DTDC",
  "Urban Company",
] as const

/* ─── CHOOSE YOUR TRACK ───────────────────────────────────────────── */

export const TRACKS_SECTION = {
  eyebrow: "CHOOSE YOUR TRACK",
  headline: {
    lead: "Four tracks.",
    emphasis: "One platform.",
  },
  subhead:
    "Consulting and Product have live AI practice. Data & BA and General Management get a full roadmap with curated resources.",
  cardCta: "Start this track →",
} as const

export const TRACK_CARDS = [
  {
    title: "Consulting Track",
    sub: "6 subtypes · Live AI practice",
    desc: "Master Profitability, Market Entry, M&A, and more, with cases targeting McKinsey, Accenture Strategy & Consulting, Deloitte, and PwC.",
    tags: ["Profitability", "Market Entry", "M&A", "Guesstimate"],
    color: "#f97316"
  },
  {
    title: "Product Track",
    sub: "6 subtypes · Live AI practice",
    desc: "Master Product Design, Metrics, GTM, and Prioritization, with cases targeting Flipkart, Zomato, Ola, and Blinkit.",
    tags: ["Product Design", "Metrics", "GTM", "Prioritization"],
    color: "#6366f1"
  },
  {
    title: "Data & Business Analyst",
    sub: "Roadmap · Curated external resources",
    desc: "Learn quant reasoning, SQL, and case-based business analysis, targeting roles at JPMorgan Chase, Capital One, American Express, and Kotak Mahindra Bank.",
    tags: ["Quant Reasoning", "SQL", "Business Analysis"],
    color: "#3b82f6"
  },
  {
    title: "General Management",
    sub: "Roadmap · Curated external resources",
    desc: "Learn company research, case fundamentals, and role-specific prep, targeting roles at ITC, ICICI Bank, Swiggy, Tata Steel, and Jio Financial Services.",
    tags: ["Banking", "Operations", "MT Roles"],
    color: "#34d399"
  },
] as const

/* ─── CASEBOOK / RESOURCE TICKERS ─────────────────────────────────── */

export const RESOURCES_HEADING =
  "Curated from Leading Product and Consulting Casebooks"

export const CONSULTING_RESOURCES = [
  "Harvard",
  "Wharton",
  "IIM Ahmedabad",
  "IIM Bangalore",
  "IIM Calcutta",
  "ISB",
  "XLRI Jamshedpur",
  "MDI Gurgaon",
  "IIT Bombay",
  "Case in Point",
] as const

export const PRODUCT_RESOURCES = [
  "FMS Delhi",
  "IIT Kanpur",
  "IIT BHU",
  "The Product Folks",
  "Product School",
  "PM School",
  "Decode & Conquer",
  "Cracking the PM Interview",
] as const

/* ─── CTA BANNER ──────────────────────────────────────────────────── */

export const CTA_BANNER = {
  headline: {
    lead: "Build your prep plan",
    emphasis: "today.",
  },
  subhead:
    "Takes two minutes. Pick your track, get your plan, start practicing.",
  cta: "Get started for free →",
} as const

/* ─── HOW IT WORKS ────────────────────────────────────────────────── */

export const HOW_IT_WORKS_SECTION = {
  eyebrow: "HOW IT WORKS",
  headline: {
    lead: "Practice that",
    emphasis: "actually sticks.",
  },
  subhead: "Three steps. Every session you get better.",
  stepCta: "Try it free →",
} as const

export const STEPS = [
  {
    n: "01",
    title: "Build your roadmap",
    body: "Choose your track(s) and a 4/8/12-week timeline. KaseMate compiles a week-by-week plan from real curated resources, with no generic filler and no hardcoded template.",
    tag: "Roadmap",
  },
  {
    n: "02",
    title: "Study or go live",
    body: "Open any case's full breakdown (framework, structure, sample reasoning) before you ever speak. When you're ready, enter a live case and get pushed the way a real interviewer would push you.",
    tag: "Live practice",
  },
  {
    n: "03",
    title: "Track what's actually improving",
    body: "Every scored response feeds your Performance dashboard (skill radar, score trend, streak) so your next case targets exactly what you're weakest at.",
    tag: "Performance",
  },
] as const

/* ─── VERIFIED BY ─────────────────────────────────────────────────── */

export const VERIFIED_SECTION = {
  eyebrow: "VERIFIED, NOT GUESSED",
  headline: {
    lead: "Built with input from",
    emphasis: "KGPians who've been through it.",
  },
  subhead:
    "Every roadmap and case type was checked against real placement experience, not guesswork from a textbook.",
} as const

// NOTE: these are still the placeholder cards from the live page.
// The live file carries "TODO: Ankur — replace with real names/companies/photos".
// Copied verbatim, placeholders included.
export const SENIOR_VALIDATORS = [
  {
    track: "Consulting",
    // Badge renders as track name uppercased + " TRACK" on the live page.
    badge: "CONSULTING TRACK",
    name: "[Name]",
    company: "Placed at [Company Name]",
    batch: "IIT KGP, Batch of 20XX",
    note: "Confirmed the Profitability and Guesstimate cases match what he was actually asked in his interviews.",
  },
  {
    track: "Product",
    badge: "PRODUCT TRACK",
    name: "[Name]",
    company: "Placed at [Company Name]",
    batch: "IIT KGP, Batch of 20XX",
    note: "Checked the Metrics/Root-Cause cases against real PM interview rounds before they went live.",
  },
  {
    track: "Data & BA",
    badge: "DATA & BA TRACK",
    name: "[Name]",
    company: "Placed at [Company Name]",
    batch: "IIT KGP, Batch of 20XX",
    note: "Reviewed the Data & Business Analyst roadmap modules against real BA placement rounds.",
  },
  {
    track: "General Management",
    badge: "GENERAL MANAGEMENT TRACK",
    name: "[Name]",
    company: "Placed at [Company Name]",
    batch: "IIT KGP, Batch of 20XX",
    note: "Checked the General Management roadmap against banking and MT placement experience.",
  },
] as const

/* ─── FAQ ─────────────────────────────────────────────────────────── */

export const FAQ_SECTION = {
  eyebrow: "FAQ",
  headline: {
    lead: "Questions",
    emphasis: "answered.",
  },
} as const

export const FAQS = [
  {
    q: "What do I actually get with KaseMate?",
    a: "A week-by-week roadmap built around your track and timeline. Full curated solutions and structured frameworks for 271 real cases, so you can study before you ever go live. And when you're ready, a live AI interviewer that grades you on four dimensions, so you know exactly where you stand before the real thing.",
  },
  {
    q: "Can I trust the grading, or is it just vibes?",
    // Backticks used here because this string contains both ' and " characters.
    a: `Every response is scored against a fixed rubric across four dimensions, and each score cites the specific moment in your transcript it's based on. It's not a vague "good job" or "needs work," you can see exactly which answer earned or lost you points.`,
  },
] as const

/* ─── FOOTER ──────────────────────────────────────────────────────── */

export const FOOTER = {
  tagline:
    "Roadmap, Practice, and Performance, all in one. Built for IIT Kharagpur.",
  version: "v1.0 · Verified by Placement Batch of 2025-26",
  madeBy: "Made with ❤️ by Ankur for Placement Season 2026-27.",
  copyright: "© 2026 KaseMate",
} as const

export const FOOTER_SOCIALS = ["LinkedIn", "Instagram"] as const

export const FOOTER_LINKS = {
  Platform: [
    { label: "Roadmap", to: "/roadmap" },
    { label: "Practice Hub", to: "/hub" },
    { label: "Dashboard", to: "/dashboard" },
  ],
  Resources: [
    { label: "How it works", to: "#how-it-works" },
    { label: "FAQ", to: "#faq" },
  ],
  Support: [
    { label: "Give feedback", action: "feedback" },
    { label: "Settings", to: "/settings" },
  ],
} as const

export const FOOTER_LEGAL = ["Privacy Policy", "Terms of Use", "Contact"] as const

/* ─── IMAGE ALT TEXT ──────────────────────────────────────────────── */
// Not visible on screen, but read aloud by screen readers — so it counts as copy.

export const IMAGE_ALT = {
  logo: "KaseMate Logo",
  heroIllustration: "KaseMate placement prep illustration",
  ctaHero: "KaseMate placement prep",
} as const
