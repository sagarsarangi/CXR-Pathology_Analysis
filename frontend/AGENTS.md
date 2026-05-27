# AGENTS.md — Neuro: Complete Technical Bible

> **This is the single source of truth for any agent, developer, or AI working on this codebase.**
> Read it completely before writing a single line of code. It documents what is *actually here*, not what should be.

---

## 1. Project Overview

**Brand:** Neuro (internally "Neuro Syndication Group")
**Tagline:** "Understanding AI Revolution" / "Intelligence beyond Boundaries."
**Purpose:** A cinematic, dark-aesthetic Next.js marketing site for an AI syndication platform. The site is publicly accessible for most pages, but includes full email/password authentication (Supabase) and a protected dashboard.

### Core User Journey
1. Visitor lands on `/` — sees a full-screen, animated hero section with stacked Unsplash imagery.
2. Scrolls through Features (stacked full-screen cards with rotation-on-scroll), Philosophy (manifesto section), and Protocol (pinned stacking cards with embedded SVG animations).
3. Navbar links lead to `/what-we-do` (methodology) and `/what-we-can-do` (capabilities) — both public.
4. CTA button in hero/navbar routes to `/auth/signin` if unauthenticated, or `/dashboard` if authenticated.
5. Authenticated user reaches `/dashboard` — a styled "System Terminal" page showing account info and a sign-out button.
6. Email confirmation flow: sign-up triggers a Supabase confirmation email; clicking the link hits `/auth/callback`, which exchanges the code for a session and redirects to `/dashboard`.

---

## 2. Tech Stack — Exact Installed Versions

All versions are from `package.json`. Do not upgrade without verifying compatibility across the stack.

| Package | Version | Role |
|---|---|---|
| `next` | `^16.2.6` | Framework — App Router. All routes live in `/app`. |
| `react` | `^19.2.6` | UI library |
| `react-dom` | `^19.2.6` | DOM renderer |
| `gsap` | `^3.15.0` | **Only** animation library. No Framer Motion. Handles hero, page transitions, scroll reveals, all motion. |
| `@gsap/react` | `^2.1.2` | Provides `useGSAP` hook for scoped, SSR-safe animations in React components. |
| `lenis` | `^1.3.23` | Smooth scroll. Synced to GSAP ticker. |
| `@supabase/ssr` | `^0.10.3` | Supabase SSR package — used for both browser client and server client. **Not** the deprecated `auth-helpers-nextjs`. |
| `@supabase/supabase-js` | `^2.106.1` | Core Supabase JS SDK (Auth, DB types). |
| `zod` | `^4.4.3` | Form schema validation. All auth form inputs pass through Zod before hitting Supabase. |
| `zustand` | `^5.0.13` | Global client state. Owns auth state (`user`, `isLoading`). No Context API for this. |
| `react-hook-form` | `^7.76.0` | Form state management in auth pages. Paired with `@hookform/resolvers` for Zod integration. |
| `@hookform/resolvers` | `^5.2.2` | Bridges `react-hook-form` with Zod schemas via `zodResolver`. |
| `lucide-react` | `^1.16.0` | Icons. Used for `Loader2`, `LogOut`, `User`, `Shield`, `Activity`, `Zap` in dashboard/auth. |
| `tailwindcss` | `^3.4.17` | Utility-first CSS. Only styling system. No component CSS files. |
| `autoprefixer` | `^10.5.0` | PostCSS plugin for vendor prefixes. |
| `postcss` | `^8.5.15` | CSS transformation pipeline. |
| `clsx` | `^2.1.1` | Conditional class composition. Used via the `cn()` utility. |
| `tailwind-merge` | `^3.6.0` | Merges conflicting Tailwind classes. Used via the `cn()` utility. |
| **Dev** | | |
| `typescript` | `6.0.3` | Type checking. Strict mode enabled. |
| `@types/node` | `25.9.1` | Node.js types |
| `@types/react` | `19.2.15` | React types |

> **`package.json` `"type": "module"`** — the project uses ESM throughout. Import paths matter.

---

## 3. Project Structure — Annotated

```
/
├── AGENTS.md                    ← This file. The authoritative technical bible.
├── package.json                 ← Dependencies and scripts. ESM ("type": "module").
├── tsconfig.json                ← TypeScript config. Strict mode. Path alias: @/* → ./*
├── tailwind.config.ts           ← Design token system. Colors, fonts, border radii, animations.
├── postcss.config.mjs           ← PostCSS: tailwindcss + autoprefixer.
├── next.config.ts               ← Next.js config. Allows Unsplash remote images. No source maps override.
├── next-env.d.ts                ← Auto-generated Next.js TS references. Do not edit.
├── .env.local                   ← ACTUAL secrets. Gitignored. See Section 4.
├── .env.local.template          ← Safe to commit. Contains variable names only.
├── .gitignore                   ← Covers .env, .env.local, .env.*.local, node_modules, .next.
│
├── public/
│   └── images/
│       ├── philo.jpg            ← Local image used as parallax background in Philosophy section.
│       └── ppl.jpg             ← Local image used as parallax texture in Philosophy section.
│
├── app/
│   ├── globals.css              ← Tailwind directives + CSS custom props + global utilities. Nothing else.
│   ├── layout.tsx               ← Root layout. Loads Google Fonts (Sora, Instrument Serif, Fira Code).
│   │                               Mounts: AuthInitializer, LenisProvider, PageTransition, Navbar, Footer.
│   ├── page.tsx                 ← Landing page /. Composes: Hero, Features, Philosophy, Protocol.
│   │
│   ├── auth/
│   │   ├── layout.tsx           ← Auth shared layout. Centered card, glassmorphism panel.
│   │   ├── callback/
│   │   │   └── route.ts         ← API route. Exchanges Supabase email-confirmation code for session.
│   │   ├── signin/
│   │   │   └── page.tsx         ← Sign-in form. react-hook-form + zodResolver + Supabase signInWithPassword.
│   │   └── signup/
│   │       └── page.tsx         ← Sign-up form. react-hook-form + zodResolver + Supabase signUp + email redirect.
│   │
│   ├── dashboard/
│   │   ├── layout.tsx           ← Client-side auth guard (second layer after middleware). Shows spinner while loading.
│   │   └── page.tsx             ← Authenticated dashboard. StatCards + user info + sign-out button.
│   │
│   ├── what-we-do/
│   │   └── page.tsx             ← Public page /what-we-do. Methodology page. Hero + 3-column process grid.
│   │
│   └── what-we-can-do/
│       └── page.tsx             ← Public page /what-we-can-do. Capabilities page. Hero + stat grid + detail list.
│
├── components/
│   ├── layout/
│   │   ├── AuthInitializer.tsx  ← Client component. Mounts at root. Listens to onAuthStateChange, writes to Zustand.
│   │   ├── LenisProvider.tsx    ← Client wrapper. Calls useLenis() which creates Lenis + syncs to gsap.ticker.
│   │   ├── Navbar.tsx           ← Fixed, pill-shaped nav. GSAP scroll morph. Hides over #features section.
│   │   ├── PageTransition.tsx   ← GSAP curtain transition. 6 dark columns animate in/out on route change.
│   │   │                           Provides TransitionContext + usePageTransition hook.
│   │   └── Footer.tsx           ← Minimal footer. Copyright only.
│   │
│   ├── sections/
│   │   ├── Hero.tsx             ← Stacked-image cinematic hero. GSAP timeline: clip-path reveal → expand → content fade.
│   │   ├── Features.tsx         ← Three full-screen feature cards. GSAP: rotation-on-scroll + pinning without spacing.
│   │   ├── Philosophy.tsx       ← Manifesto section. ScrollTrigger fade-up for two contrast statements.
│   │   └── Protocol.tsx         ← Three full-screen pinned stacking cards. Scale/blur/fade on scroll. Three sub-animations.
│   │
│   └── ui/                      ← EMPTY. Reserved for future reusable UI primitives.
│
├── lib/
│   ├── gsap.ts                  ← Registers ScrollTrigger + useGSAP plugins. Guard: only runs in browser (typeof window).
│   ├── lenis.ts                 ← useLenis() hook. Creates Lenis instance, syncs to gsap.ticker, cleans up on unmount.
│   ├── schemas.ts               ← signUpSchema + signInSchema Zod schemas. Exported types: SignUpInput, SignInInput.
│   ├── store.ts                 ← useAuthStore (Zustand). Shape: { user, isLoading, setUser, setLoading }.
│   ├── utils.ts                 ← cn() helper. Merges clsx + tailwind-merge.
│   └── supabase/
│       ├── client.ts            ← createClient(). Browser-side Supabase. Uses createBrowserClient from @supabase/ssr.
│       └── server.ts            ← createServerSupabaseClient(). Async. Uses cookies() from next/headers. Server-only.
│
├── hooks/                       ← EMPTY. Reserved. No custom hooks have been created yet.
│
└── middleware.ts                ← Route protection. Runs on every non-static request.
                                    Guards /dashboard (redirects to /auth/signin if no user).
                                    Guards /auth/* (redirects to /dashboard if user exists).
```

---

## 4. Environment Setup

### Required Variables

Create `.env.local` in the project root (already gitignored):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

**Both are public-prefixed (`NEXT_PUBLIC_`) because:**
- The browser Supabase client (`lib/supabase/client.ts`) runs on the client and needs them.
- The server client also reads them, but via `process.env` server-side.
- The anon key is safe to expose — it is protected by Supabase Row Level Security (RLS) and is not a secret key.

**Where to get them:**
1. Go to your [Supabase dashboard](https://app.supabase.com).
2. Select your project → Settings → API.
3. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Running the Project

```bash
npm install
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

---

## 5. Frontend Architecture

### Layout Hierarchy

```
RootLayout (app/layout.tsx) — Server Component
  └── <html lang="en" className="dark">
        └── <body> — Font CSS variables applied here
              ├── <AuthInitializer />          — Client, renders null, sets Zustand auth state
              └── <LenisProvider>              — Client, initializes Lenis smooth scroll
                    └── <PageTransition>       — Client, manages GSAP curtain transition
                          ├── <div.noise-overlay />   — Fixed, full-screen, 5% opacity noise
                          ├── <Navbar />       — Fixed nav
                          ├── <main>           — Page content
                          └── <Footer />
```

Every layout component except `RootLayout` and `AuthLayout` is a client component (`"use client"`).

### Font Loading

Fonts are loaded via `next/font/google` in `app/layout.tsx`. Three fonts are loaded:

| Font | Variable | Tailwind class | Usage |
|---|---|---|---|
| `Sora` | `--font-sora` | `font-sans`, `font-display` | Body text, headings, nav |
| `Instrument_Serif` (italic, weight 400) | `--font-instrument-serif` | `font-drama` | Dramatic serif italic in hero, philosophy, page heroes |
| `Fira_Code` | `--font-fira-code` | `font-mono` | Monospace labels, overlines, data readouts |

Font variables are injected onto `<body>` via `cn(sora.variable, instrumentSerif.variable, firaCode.variable, ...)`. Tailwind reads them via `var(--font-*)` in `tailwind.config.ts`.

### Tailwind Design Token System (`tailwind.config.ts`)

**Colors** (all semantic names):

| Token | Value | Usage |
|---|---|---|
| `primary` | `#000000` | Pure black — main background color |
| `accent` | `#FFFFFF` | White — CTAs, highlights, active states |
| `background` | `#050505` | Deepest black — page background |
| `foreground` | `#F5F5F5` | Off-white — primary text |
| `surface` | `#111111` | Charcoal — card/panel backgrounds |
| `muted` | `#888888` | Medium gray — secondary text, placeholders |
| `border` | `#222222` | Subtle border — dividers |

**Global CSS variables** (`app/globals.css`):
```css
:root {
  --background: #000000;
  --foreground: #ffffff;
}
```
These mirror the Tailwind tokens. `body` uses `var(--foreground)` and `var(--background)`.

**Custom font families** (Tailwind config):
```ts
fontFamily: {
  sans:    ["var(--font-sora)", "ui-sans-serif", "system-ui"],
  display: ["var(--font-sora)", "ui-sans-serif", "system-ui"],
  drama:   ["var(--font-instrument-serif)", "serif"],
  mono:    ["var(--font-fira-code)", "monospace"],
}
```

**Border radii extensions:**
```ts
borderRadius: {
  "3xl": "2rem",   // Used via .rounded-container → @apply rounded-[2rem] md:rounded-[3rem]
  "4xl": "3rem",
}
```

**Custom animations:**
```ts
animation: {
  "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
}
```

### Global CSS (`app/globals.css`)

Contains exactly:
1. Tailwind directives (`@tailwind base/components/utilities`)
2. `:root` CSS custom property variables
3. `body` base styles (color, background, font-family, `overflow-x: hidden`)
4. `.noise-overlay` — Fixed, full-viewport, `z-index: 9999`, `pointer-events: none`, `opacity: 0.05`, `mix-blend-mode: overlay`
5. `.will-change-transform` and `.will-change-opacity` — utility classes for GSAP-animated elements
6. `.rounded-container` — `@apply rounded-[2rem] md:rounded-[3rem]` — the global container rounding system
7. `.btn-magnetic` — `@apply relative overflow-hidden transition-transform duration-300` — base for magnetic button effect (GSAP handles the actual scale)

**Nothing else goes in globals.css. No per-component styles. No additional keyframes.**

### Responsive Strategy

Mobile-first breakpoints following Tailwind defaults (`sm:640`, `md:768`, `lg:1024`, `xl:1280`). Key patterns:
- `font-size` scales: `text-4xl md:text-7xl lg:text-9xl`
- Padding: `px-8 md:px-20`, `p-8 md:p-20`
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Navbar links shrink: `text-[8px] md:text-[10px]`

---

## 6. Animation System

### GSAP Plugin Registration (`lib/gsap.ts`)

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger };
```

**Critical rules:**
- Plugin registration is guarded by `typeof window !== "undefined"` to prevent SSR crashes.
- Plugins are **registered once here and nowhere else**. Registering in individual components causes duplication bugs.
- Every component imports `gsap` and `ScrollTrigger` from `@/lib/gsap`, never directly from `gsap`.
- `useGSAP` is imported from `@gsap/react` — not from this file — but it is *registered* here.

### Lenis Smooth Scroll (`lib/lenis.ts` + `components/layout/LenisProvider.tsx`)

`lib/lenis.ts` exports `useLenis()` — a React hook (client-side only):
- Creates a `Lenis` instance with `duration: 1.2`, custom easing, `smoothWheel: true`.
- Syncs Lenis to GSAP's ticker: `gsap.ticker.add((time) => instance.raf(time * 1000))`.
- Disables lag smoothing: `gsap.ticker.lagSmoothing(0)` — required for frame-perfect sync.
- Cleanup: calls `instance.destroy()` and removes the ticker function on unmount.

`LenisProvider` (`"use client"`) simply calls `useLenis()` and renders `<>{children}</>`. It is placed in `app/layout.tsx` wrapping all page content.

> **Known gotcha with Lenis cleanup:** The `gsap.ticker.remove()` call in the cleanup passes a new arrow function, not the same reference that was added. This means the ticker callback is **not actually removed** on unmount. This is a known bug. In practice it causes no visible issues because the Lenis instance is destroyed (`instance.destroy()`), so the raf calls become no-ops. If you refactor, extract the ticker function to a variable to fix this properly.

### `useGSAP` Pattern

Every component that runs GSAP animations uses `useGSAP` from `@gsap/react`. This hook:
- Accepts an `{ scope }` option — pass a `ref` to scope all selector-based animations to that element only.
- Returns a context that is automatically reverted on unmount (no manual `ctx.revert()` needed).
- Is SSR-safe — it is equivalent to `useLayoutEffect` server-side.

**Pattern used throughout:**
```tsx
const containerRef = useRef<HTMLDivElement>(null);

useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // All animations here
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    // Instant/static fallbacks here
  });
}, { scope: containerRef });
```

### `prefers-reduced-motion` Handling

**Implemented in:** `Hero.tsx`, `Features.tsx`, `Protocol.tsx`.

Pattern: `gsap.matchMedia()` with two branches — one for full motion, one for instant/static state. The reduced-motion branch uses `gsap.set()` to immediately place elements in their final state without transitions.

**Not yet implemented in:** `Philosophy.tsx`, `Navbar.tsx`, `PageTransition.tsx`. These still run animations unconditionally. Future agents should add `matchMedia` guards to these.

### Hero Animation (`components/sections/Hero.tsx`)

The hero is a cinematic "opening shot" sequence using a GSAP timeline:

**Images:** An array of 5 images (4 Unsplash URLs + 1 local `/images/philo.jpg`) are stacked absolutely with `zIndex` ascending. Each starts with `clipPath: "inset(0% 0% 100% 0%)"` (hidden below).

**Timeline sequence:**
1. **Image reveal** (`delay: 0.35`, `stagger: 0.25`): Each image reveals top-to-bottom by animating `clipPath` to `inset(0% 0% 0% 0%)`. Uses `power1.out` ease.
2. **Container expand**: The initially-small container (`w-[min(88vw,28rem)]`, `aspect-video`) expands to `100%` width, `100dvh` height, removing aspect ratio constraint. Uses `power3.inOut`.
3. **Fade in**: `radialRef`, `contentRef`, `logoRef` fade from `opacity: 0` to `1` with stagger `0.1`. Uses `power2.out`.
4. **Headline reveal**: Elements with `.line-reveal` class animate from `y: 50, opacity: 0` to `y: 0, opacity: 1` with stagger `0.1`. Uses `power3.out`.

**`INTRO_END_DELAY_SEC`** is a calculated export: `0.35 + (IMAGES.length - 1) * 0.25 + 1 + 1`. This is the total duration of the intro animation sequence in seconds. It is exported but currently not consumed elsewhere — reserved for future use (e.g., delaying other section animations until the hero completes).

**CTA logic:** The hero's "Init Core" / "Interface" button calls `handleCoreClick`, which navigates to `/auth/signin` or `/dashboard` depending on Zustand auth state, using `usePageTransition().navigateTo()`.

**Known issue:** The hero creates a Supabase client (`createClient()`) directly inside the component but never uses it. This is dead code — the auth state is read from Zustand. Safe to remove.

### Features Section (`components/sections/Features.tsx`)

Three full-screen sections with a **stacked card scroll effect:**

- Cards 2 and 3 start rotated `30deg` (transform-origin: `bottom left`).
- As each card scrolls into view, it rotates back to `0deg` via `scrub: true` ScrollTrigger (`start: "top bottom"`, `end: "top 25%"`).
- Cards 1 and 2 are **pinned** without spacing (`pin: true, pinSpacing: false`) — they stick in place as subsequent cards scroll over them.
- Card 3 (last) is not pinned.

**Navbar interaction:** The Navbar hides itself when the `#features` section is active (via `ScrollTrigger.create` in `Navbar.tsx`). The features container has `id="features"`.

### Philosophy Section (`components/sections/Philosophy.tsx`)

- ScrollTrigger on the container with `start: "top 60%"` and `toggleActions: "play none none reverse"`.
- `text1Ref` (the neutral statement) fades up to `opacity: 0.5` — intentionally not full opacity.
- `text2Ref` (the bold statement) fades up to `opacity: 1` starting `-0.6s` relative to text1.
- Background: a local image (`/images/ppl.jpg`) at `opacity: 0.2`, grayscale. Does **not** use Next.js `<Image>` component — uses a plain `<img>` tag. This is the only instance where this rule is broken.

### Protocol Section (`components/sections/Protocol.tsx`)

Three full-screen cards that **pin and stack**. Each card is pinned from `"top top"` for a duration equal to `0.5 * window.innerHeight`. As the next card scrolls in, the previous card scales to `0.9`, blurs to `20px`, and fades to `0.5` (scrubbed).

**Per-card SVG animations (always running, no matchMedia guard):**
- **Card 01 — MotifAnimation:** Rotating gear/circle SVG. `gsap.to(ref, { rotation: 360, duration: 20, repeat: -1, ease: "none" })`.
- **Card 02 — WaveformAnimation:** Three sine-wave SVG paths. Each path starts with `strokeDashoffset: 2000` and animates to `0` over `3-5s` with `repeat: -1`. Generates paths mathematically via `generatePath(offset)`.
- **Card 03 — LaserAnimation:** A 10×10 dot grid + a scanning bar animated via `gsap.to(lineRef, { attr: { y1: 100, y2: 100 }, duration: 4, repeat: -1, yoyo: true })`.

> **Known bug in LaserAnimation:** `lineRef` is assigned to two different elements simultaneously — both the `<rect>` scanning bar and the `<line>` laser core share the same ref. The `<rect>` (scanning bar) will be the ref's final value since it appears later in the JSX. The `<line>` never gets animated. This is a pre-existing bug.

### Page Transitions (`components/layout/PageTransition.tsx`)

A React Context-based system. Renders 6 dark gray (`#3b3b3b`) columns that cover the full viewport, positioned `fixed`, `z-index: 999`, `pointer-events: none`.

**API:** `usePageTransition()` returns `{ navigateTo }`. All navigation in the app (Navbar, Hero buttons, auth redirects) uses `navigateTo(href)` — never `<Link>` or `router.push()` directly.

**Exit transition (navigateTo called):**
1. Sets all 6 columns to `y: "100%"` (below viewport).
2. Animates columns to `y: "0%"` with `stagger: 0.05` (`power3.inOut`).
3. On complete, calls `router.push(href)`.

**Entrance transition (route change detected via `usePathname`):**
1. Columns start at `y: "0%"` (covering screen).
2. Animate to `y: "-100%"` (above viewport) with `stagger: 0.05` (`power3.inOut`).
3. On complete, `isTransitioning.current = false`.

**Guard:** `isTransitioning.current` prevents double-triggering while a transition is in progress.

### Navbar Animations (`components/layout/Navbar.tsx`)

Three `useGSAP` hooks:

1. **Section visibility:** ScrollTrigger on `#features`. When active, hides navbar (`y: -100, opacity: 0`). When inactive, shows it (`y: 0, opacity: 1`). Runs on `pathname` dependency — re-creates trigger on route change.
2. **Scroll morph:** On scroll past 50px, morphs nav to pill shape: `backgroundColor: rgba(0,0,0,0.6)`, `backdropFilter: blur(16px)`, `borderRadius: 9999px`, `y: 20`. Reverts on scroll back to top.
3. **Navbar content:** Logo ("NEURO"), two nav links ("Services" → `/what-we-do`, "Solutions" → `/what-we-can-do`), and a conditional CTA ("Interface" → `/dashboard` if authenticated, "Init" → `/auth/signin` if not).

---

## 7. Authentication Flow

### Supabase Client Selection

| File | Client Type | When to Use |
|---|---|---|
| `lib/supabase/client.ts` | Browser client (`createBrowserClient`) | All client components (`"use client"`), event handlers, form submissions |
| `lib/supabase/server.ts` | Server client (`createServerSupabaseClient`) | Server components, API routes, middleware (middleware has its own inline client) |

**Never use the server client in client components. Never use the browser client in server components.**

### Auth State Initialization (`components/layout/AuthInitializer.tsx`)

This is a render-null client component mounted at root in `app/layout.tsx`. On mount it:
1. Calls `supabase.auth.getSession()` to get any existing session and immediately syncs to Zustand.
2. Subscribes to `supabase.auth.onAuthStateChange()` — any login/logout/token refresh event updates Zustand.
3. Cleanup: calls `subscription.unsubscribe()` on unmount.

**This is the only place Supabase auth events are subscribed to.** All other components read from Zustand via `useAuthStore()`.

### Sign-Up Flow (`app/auth/signup/page.tsx`)

1. User fills email, password, confirmPassword.
2. `react-hook-form` + `zodResolver(signUpSchema)` validates in real-time.
3. `signUpSchema` requirements: `email` must be valid email; `password` min 6 chars (note: template says 8, actual code says **6**); `confirmPassword` must match `password`.
4. On submit: `supabase.auth.signUp({ email, password, options: { emailRedirectTo: "${window.location.origin}/auth/callback" } })`.
5. On success: shows "Check Your Email" confirmation state. **Does not auto-redirect.**
6. On error: displays raw Supabase error message in a red alert box.

### Email Confirmation Callback (`app/auth/callback/route.ts`)

- `GET /auth/callback?code=<code>&next=<path>`
- Exchanges `code` for session via `supabase.auth.exchangeCodeForSession(code)`.
- On success: redirects to `next` param (defaults to `/dashboard`).
- On failure: redirects to `/auth/signin?error=Could not authenticate user`.

### Sign-In Flow (`app/auth/signin/page.tsx`)

1. User fills email, password.
2. `react-hook-form` + `zodResolver(signInSchema)` validates.
3. `signInSchema`: email valid, password non-empty.
4. On submit: `supabase.auth.signInWithPassword({ email, password })`.
5. On success: `router.push("/dashboard")` — direct push, not `navigateTo()` (bypasses page transition).
6. On error: displays raw Supabase error message.

### Sign-Out (`app/dashboard/page.tsx`)

1. `supabase.auth.signOut()` — clears Supabase session.
2. `router.push("/")` — redirects to landing.
3. Zustand store updates automatically via `onAuthStateChange` in `AuthInitializer` (user set to `null`).

### Session Persistence

Supabase `@supabase/ssr` handles session persistence via cookies. The server client reads cookies from `next/headers`. The middleware client reads/writes request/response cookies directly. Token refresh happens automatically as part of the `createServerClient` cookie lifecycle.

---

## 8. State Management (Zustand)

### `useAuthStore` (`lib/store.ts`)

```ts
interface AuthState {
  user: User | null;      // Supabase User object or null
  isLoading: boolean;     // true until AuthInitializer resolves the initial session
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}
```

**Default state:** `user: null, isLoading: true`. The `isLoading: true` default means any component that renders before `AuthInitializer` resolves will see a loading state — this is intentional.

**Consumers:**
- `AuthInitializer` — writes to store.
- `Navbar` — reads `user` to show "Interface" vs "Init" button.
- `Hero` — reads `user` to determine CTA destination.
- `DashboardLayout` — reads `user` and `isLoading` for client-side guard.
- `DashboardPage` — reads `user` for email display.

**Nothing else lives in Zustand.** There is no UI state, routing state, or anything beyond auth in the store. If future features need global state, add new stores or extend this one with explicit actions.

---

## 9. Schema Validation (Zod)

All schemas live in `lib/schemas.ts`. These are the only Zod schemas in the project.

### `signUpSchema`

```ts
z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
```

> **Discrepancy:** The AGENTS.md template says `min(8)`, but the actual code enforces `min(6)`. This means a 6-7 character password is accepted by the form but may conflict with Supabase's own password policy (Supabase defaults to min 6, but this can be configured in the dashboard). Verify/align these.

### `signInSchema`

```ts
z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})
```

### Type Exports

```ts
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
```

Both types are used as generics in `useForm<SignUpInput>` and `useForm<SignInInput>`.

---

## 10. Route Protection

### Layer 1: Middleware (`middleware.ts`)

Runs on **every request** (except `_next/static`, `_next/image`, favicon, and image files). Uses an inline `createServerClient` (not imported from `lib/supabase/server.ts`) with full cookie read/write/remove handlers.

**Checks:** `await supabase.auth.getUser()` (not `getSession()` — `getUser()` validates the JWT against Supabase servers, more secure).

**Redirects:**
- `/dashboard*` without authenticated user → `/auth/signin`
- `/auth/*` with authenticated user → `/dashboard`

**Matcher pattern:** `"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"` — very broad, catches everything except static assets.

### Layer 2: Client Guard (`app/dashboard/layout.tsx`)

A client component that reads from Zustand:
- While `isLoading: true` → shows a centered `<Loader2>` spinner.
- After loading, if `user: null` → `router.push("/auth/signin")`.
- If `user` exists → renders `children`.

**Why both layers?** Middleware is the server-side primary gate. The client guard prevents flash-of-content while the Zustand store initializes on the client. Defense in depth.

---

## 11. Backend / Supabase

### Supabase Features Used

| Feature | How Used |
|---|---|
| **Auth** | Email/password sign-up with email confirmation. Sign-in. Sign-out. JWT session management via cookies. |
| **Database** | Not used in the current codebase. No tables queried, no RLS policies defined here. |
| **Storage** | Not used. |
| **Edge Functions** | Not used. |

### Database Schema

**No database schema is currently defined by this codebase.** The dashboard shows hardcoded mock data ("Neural Resonance: 98.2%", "AES-256", "0.14ms"). No Supabase database queries are made anywhere in the application.

If a database is needed in future, the schema must be created in the Supabase dashboard with appropriate RLS policies. Use `lib/supabase/server.ts` for server-side queries.

### Supabase Email Confirmation

Sign-up sends a confirmation email. The `emailRedirectTo` is set to `${window.location.origin}/auth/callback`. The callback route (`app/auth/callback/route.ts`) handles code exchange. Ensure the Supabase dashboard's **Authentication → URL Configuration** has the correct site URL and redirect URLs configured.

---

## 12. Component Inventory

### `AuthInitializer` (`components/layout/AuthInitializer.tsx`)

- **Renders:** Nothing (returns `null`).
- **Props:** None.
- **Animations:** None.
- **Purpose:** Side-effect only. Initializes Zustand auth state from Supabase session. Must be the first child of `<body>` in the root layout.
- **Gotcha:** Mounted outside `<LenisProvider>` and `<PageTransition>` — placement is intentional so auth state is ready before any navigation logic runs.

### `LenisProvider` (`components/layout/LenisProvider.tsx`)

- **Renders:** `<>{children}</>` (transparent wrapper).
- **Props:** `{ children: ReactNode }`.
- **Purpose:** Activates Lenis smooth scroll for the entire app.
- **Gotcha:** Lenis is initialized in `useLenis()` inside `useEffect` — client-side only. The initial server render has no Lenis; it activates after hydration.

### `PageTransition` (`components/layout/PageTransition.tsx`)

- **Renders:** Children + 6 fixed `<div>` columns (the transition curtain).
- **Props:** `{ children: ReactNode, column?: number }` (default `column = 6`).
- **Exports:** `usePageTransition()` hook — returns `{ navigateTo: (href: string) => void }`.
- **Animations:** GSAP animates 6 columns. Exit: columns slide up from below. Entrance: columns slide off above.
- **Critical:** All in-app navigation MUST use `navigateTo()` from this hook. Using `<Link>` or `router.push()` directly bypasses the transition animation (sign-in page currently does this intentionally for the auth redirect, which is acceptable).

### `Navbar` (`components/layout/Navbar.tsx`)

- **Renders:** Fixed, horizontally-centered pill nav with logo, links, CTA.
- **Props:** None.
- **Animations:** Three `useGSAP` hooks (visibility, scroll morph, scroll hide/show).
- **Gotcha:** The visibility ScrollTrigger depends on `#features` existing in the DOM. On pages without `#features` (all pages except `/`), the trigger is not created and `isHidden` stays `false`.

### `Footer` (`components/layout/Footer.tsx`)

- **Renders:** Minimal `<footer>` with copyright text.
- **Props:** None.
- **Animations:** None.
- **Note:** Imports `usePageTransition` but does not use it — dead import. Safe to remove.

### `Hero` (`components/sections/Hero.tsx`)

- **Renders:** Full-screen (`h-screen`) hero with stacked image reveal + content overlay.
- **Props:** None.
- **Animations:** Full GSAP timeline on mount (see Section 6).
- **Exports:** `INTRO_END_DELAY_SEC` — calculated animation duration. Not currently consumed.
- **Gotcha:** Creates a Supabase client that is never used. Dead code.

### `Features` (`components/sections/Features.tsx`)

- **Renders:** Three full-screen `<section>` elements with a stacked-scroll reveal.
- **Props:** None.
- **Animations:** ScrollTrigger rotation + pinning (see Section 6).
- **Container id:** `id="features"` — referenced by Navbar's ScrollTrigger.

### `Philosophy` (`components/sections/Philosophy.tsx`)

- **Renders:** Dark full-screen manifesto section with parallax background image.
- **Props:** None.
- **Animations:** ScrollTrigger fade-up on two text elements.
- **Gotcha:** Uses `<img>` not `<Image>` for the background. The image is a local file (`/images/ppl.jpg`).
- **Gotcha:** No `prefers-reduced-motion` guard. Animations run unconditionally.

### `Protocol` (`components/sections/Protocol.tsx`)

- **Renders:** Three full-screen cards with inline SVG animations.
- **Props:** None.
- **Animations:** Pinned stacking + three sub-animations (see Section 6).
- **Gotcha:** `LaserAnimation` has a duplicate ref bug (see Section 6).

---

## 13. Page Inventory

| Route | File | Protected | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | No | Landing page. Composes Hero + Features + Philosophy + Protocol. |
| `/what-we-do` | `app/what-we-do/page.tsx` | No | Methodology page. Hero + 3 process cards. Linked from Navbar "Services". |
| `/what-we-can-do` | `app/what-we-can-do/page.tsx` | No | Capabilities page. Hero + stat grid + detail text. Linked from Navbar "Solutions". |
| `/auth/signin` | `app/auth/signin/page.tsx` | No (redirects to /dashboard if authed) | Sign-in form. |
| `/auth/signup` | `app/auth/signup/page.tsx` | No (redirects to /dashboard if authed) | Sign-up form. |
| `/auth/callback` | `app/auth/callback/route.ts` | No | API route. Handles email confirmation code exchange. |
| `/dashboard` | `app/dashboard/page.tsx` | **Yes** (middleware + client guard) | System Terminal dashboard. User info + sign-out. |

All pages except `/dashboard` inherit the root layout (Navbar, Footer, noise overlay, page transition). The `/auth/*` pages share `app/auth/layout.tsx` which adds a centered frosted-glass card wrapper.

---

## 14. Known Constraints and Gotchas

### 1. Lenis Ticker Cleanup Bug
`lib/lenis.ts` cleanup function creates a new arrow function instead of removing the original reference. The Lenis instance is destroyed correctly, making this a silent bug. Fix: extract the ticker callback to a named variable before adding.

### 2. LaserAnimation Duplicate Ref
In `Protocol.tsx`, `lineRef` is assigned to both the `<rect>` scanning bar and the `<line>` laser element. Only the last assignment (the `<line>`) takes effect. The scanning bar never animates. The `<rect>` should use a separate ref.

### 3. Dead Supabase Client in Hero
`Hero.tsx` creates `const supabase = createClient()` but never calls any Supabase methods. Remove it.

### 4. Dead Import in Footer
`Footer.tsx` imports `usePageTransition` but never uses `navigateTo`. Remove the import.

### 5. Password Min Length Discrepancy
`signUpSchema` enforces `min(6)`, not `min(8)` as documented in the original template. Decide on one value and align the schema and Supabase dashboard policy.

### 6. Auth Redirect Bypasses Page Transition
`app/auth/signin/page.tsx` uses `router.push("/dashboard")` (Next.js router) instead of `navigateTo("/dashboard")` (PageTransition). This is intentional — the transition plays before navigation for all regular in-app links, but post-auth redirects skip it. Keep this behavior or apply consistently.

### 7. Philosophy Uses `<img>` Not `<Image>`
`Philosophy.tsx` uses a plain `<img>` for `/images/ppl.jpg`. This bypasses Next.js image optimization. Low priority fix since it's a background texture.

### 8. `prefers-reduced-motion` Not Everywhere
`Philosophy.tsx`, `Navbar.tsx`, and `PageTransition.tsx` animate without checking `prefers-reduced-motion`. The Hero, Features, and Protocol sections do check it. Future agents must add `gsap.matchMedia()` guards to the unprotected components.

### 9. Next.js `^16.2.6` Version
The project targets what appears to be a pre-release or forward-looking Next.js version. Verify this is the correct version string and that the actual installed version in `node_modules` matches. Run `npm list next` to confirm.

### 10. `components/ui/` and `hooks/` are Empty
Both directories exist but contain no files. They are placeholders for future development.

### 11. `.env.local` is in the Repository Directory
The actual `.env.local` with real Supabase credentials exists in the project root. It is correctly gitignored. Do not commit it. When deploying, use the host's environment variable system (Vercel env vars, etc.) — never commit `.env.local`.

### 12. `next.config.ts` Has No Source Maps Override
Production source maps are not explicitly disabled in `next.config.ts`. By default, Next.js does not expose source maps in production builds, so this is acceptable. Do not add `productionBrowserSourceMaps: true`.

---

## 15. Skill Usage

**Mandatory rule:** Before working in any domain, check `C:\Users\saran\.agents\skills` and read the relevant skill's `SKILL.md`. Skills encode hard-won, environment-specific knowledge that overrides training data.

### Relevant Skills for This Project

| Domain | Skill Directory |
|---|---|
| GSAP animations | `gsap-core/`, `gsap-react/`, `gsap-scrolltrigger/`, `gsap-plugins/`, `gsap-timeline/` |
| Smooth scroll | `gsap-frameworks/` (Lenis integration) |
| Next.js App Router | `nextjs-app-router-patterns/`, `next-best-practices/`, `nextjs-react-typescript/` |
| Supabase auth | `supabase-postgres-best-practices/` |
| Frontend design | `frontend-design/`, `ui-ux-pro-max/`, `high-end-visual-design/` |
| Zustand | `zustand/` |

> Do not write GSAP code before reading the gsap-react skill. Do not write Supabase queries before reading the supabase skill. Skills are non-negotiable.

---

## 16. Extension Guide

### Adding a New Public Page

1. Create `app/your-route/page.tsx` as a client component.
2. Follow the animation pattern from `what-we-do/page.tsx`: one `useRef`, `useGSAP` with `{ scope: ref }`, `gsap.matchMedia()` for motion preferences.
3. Use `navigateTo("/your-route")` from `usePageTransition()` in any nav links pointing to this page. Add the link to `Navbar.tsx`'s `navLinks` array.
4. No changes to middleware — public routes require no middleware config.

### Adding a New Protected Route

1. Create the route under `app/` with any path.
2. Open `middleware.ts` and add the path to the `isProtectedPath` check:
   ```ts
   const isProtectedPath =
     request.nextUrl.pathname.startsWith("/dashboard") ||
     request.nextUrl.pathname.startsWith("/your-protected-path");
   ```
3. Create a layout that reads from Zustand and redirects if unauthenticated (copy `app/dashboard/layout.tsx`).

### Adding a New Animation to an Existing Component

1. Read the gsap-react skill first.
2. Add a new `useRef` for the target element.
3. Add animation logic inside the existing `useGSAP` call's `mm.add("(prefers-reduced-motion: no-preference)", ...)` block.
4. Add a `gsap.set()` fallback in the `mm.add("(prefers-reduced-motion: reduce)", ...)` block.
5. `useGSAP` with `{ scope }` handles cleanup automatically — no manual `ctx.revert()` needed.

### Adding a New Supabase Table with RLS

1. Open Supabase dashboard → SQL Editor.
2. Create the table with appropriate columns.
3. Enable RLS: `ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;`
4. Write policies:
   ```sql
   -- Users can only read their own rows
   CREATE POLICY "user_read_own" ON your_table
     FOR SELECT USING (auth.uid() = user_id);
   -- Users can only insert their own rows
   CREATE POLICY "user_insert_own" ON your_table
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```
5. In code, query using the server client (`lib/supabase/server.ts`) in Server Components or API routes. Use the browser client (`lib/supabase/client.ts`) in client event handlers.

### Adding Global State Beyond Auth

1. Either add new fields + actions to `useAuthStore` in `lib/store.ts`, or create a new Zustand store:
   ```ts
   // lib/uiStore.ts
   import { create } from "zustand";
   interface UIState {
     isMobileMenuOpen: boolean;
     toggleMobileMenu: () => void;
   }
   export const useUIStore = create<UIState>((set) => ({
     isMobileMenuOpen: false,
     toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
   }));
   ```
2. Do not use React Context for state that Zustand can own.

### Changing Brand Content

All brand-specific content is hardcoded in the section components. There is no CMS or config file. To change copy:
- **Hero headline:** `components/sections/Hero.tsx` lines 149-154.
- **Hero CTA labels:** `Hero.tsx` line 161 (`user ? "Interface" : "Init Core"`).
- **Features cards:** `components/sections/Features.tsx` `FEATURES` array.
- **Philosophy statements:** `components/sections/Philosophy.tsx` lines 47-53.
- **Protocol steps:** `components/sections/Protocol.tsx` `PROTOCOLS` array.
- **Navbar links:** `components/layout/Navbar.tsx` `navLinks` array.
- **Footer copyright:** `components/layout/Footer.tsx` line 8.
- **Site metadata:** `app/layout.tsx` `metadata` object (title, description).

---

## 17. Absolute Don'ts (Carry Forward)

These rules must be respected in all future work on this codebase:

- ❌ **No Framer Motion.** GSAP is the only animation library.
- ❌ **No per-component `.module.css` files.** `globals.css` is the only CSS file.
- ❌ **No `@supabase/auth-helpers-nextjs`.** Use `@supabase/ssr` exclusively.
- ❌ **No ScrollTrigger instances without cleanup.** `useGSAP` handles this automatically — do not switch to raw `useEffect` for GSAP.
- ❌ **No manual `requestAnimationFrame` alongside GSAP.** Use `gsap.ticker`.
- ❌ **No client-side-only route protection.** Middleware (`middleware.ts`) is mandatory as the primary layer.
- ❌ **No hardcoded secrets.** Credentials go in `.env.local` only.
- ❌ **No GSAP plugin registration in individual components.** Register only in `lib/gsap.ts`.
- ❌ **No business logic inside GSAP animation callbacks.** Keep animations pure motion code.
- ❌ **No skipping skills.** Read the relevant skill file before working in any covered domain.

---

## 18. Final Verification Checklist

Before considering any task done, verify:

- [ ] Lenis is synced to GSAP ticker and wraps the entire app
- [ ] All GSAP animations use `useGSAP` with `{ scope }` — no raw `useEffect` for animations
- [ ] `prefers-reduced-motion` is handled in every animated component
- [ ] Sign-up form validates with `signUpSchema` and shows inline Zod errors per field
- [ ] Sign-in form validates with `signInSchema` and shows inline Zod errors per field
- [ ] `/dashboard` is unreachable without a valid Supabase session (middleware + client guard both active)
- [ ] No per-component CSS files exist
- [ ] `globals.css` contains only Tailwind directives, CSS variables, and the documented global utilities
- [ ] All images except Philosophy background use Next.js `<Image>` component
- [ ] All interactive elements have visible focus styles (`focus:ring-2 focus:ring-accent/50`)
- [ ] Relevant skill files were read before starting work in their domain
- [ ] No secrets are committed — `.env.local` is gitignored