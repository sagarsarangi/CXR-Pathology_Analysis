# Frontend AGENTS.md — Technical Reference

> **Read this before touching any frontend code.**
> This file documents what is *actually here* — the current state of the frontend, verified file by file.
> Project-level context (model architecture, backend API, inference pipeline) lives in the root `AGENTS.md`.

---

## 1. What This Frontend Does

A Next.js 16 (App Router, TypeScript, Tailwind CSS) medical AI web application that:

- Authenticates users via Supabase (email/password + email confirmation).
- Protects the `/dashboard` route — unauthenticated users are redirected to `/auth/signin`.
- On the dashboard, accepts a chest X-ray image via drag-and-drop or click-to-browse.
- Posts the image to the FastAPI backend (`POST /predict`, `multipart/form-data`, field name `"file"`).
- Renders the backend response: classified findings, GradCAM heatmaps, YOLO detection boxes, risk badge, and confidence scores.

---

## 2. Tech Stack — Exact Installed Versions

All versions are from `package.json`. Do not upgrade without verifying compatibility.

| Package | Version | Role |
|---|---|---|
| `next` | `^16.2.6` | Framework — App Router. All routes in `/app`. |
| `react` | `^19.2.6` | UI library |
| `react-dom` | `^19.2.6` | DOM renderer |
| `gsap` | `^3.15.0` | **Only** animation library. No Framer Motion. |
| `@gsap/react` | `^2.1.2` | `useGSAP` hook for scoped, SSR-safe animations. |
| `lenis` | `^1.3.23` | Smooth scroll. Synced to GSAP ticker. |
| `@supabase/ssr` | `^0.10.3` | Supabase SSR package. **Not** `auth-helpers-nextjs`. |
| `@supabase/supabase-js` | `^2.106.1` | Core Supabase JS SDK. |
| `zod` | `^4.4.3` | Form schema validation. Auth forms pass through Zod. |
| `zustand` | `^5.0.13` | Global client state — owns auth state (`user`, `isLoading`). |
| `react-hook-form` | `^7.76.0` | Form state in auth pages. Paired with `@hookform/resolvers`. |
| `@hookform/resolvers` | `^5.2.2` | Bridges `react-hook-form` with Zod via `zodResolver`. |
| `lucide-react` | `^1.16.0` | Icons. Used across dashboard and auth pages. |
| `tailwindcss` | `^3.4.17` | Utility-first CSS. Only styling system. No component CSS files. |
| `autoprefixer` | `^10.5.0` | PostCSS vendor prefix plugin. |
| `postcss` | `^8.5.15` | CSS transformation pipeline. |
| `clsx` | `^2.1.1` | Conditional class composition via `cn()`. |
| `tailwind-merge` | `^3.6.0` | Merges conflicting Tailwind classes via `cn()`. |
| **Dev** | | |
| `typescript` | `6.0.3` | Type checking. Strict mode enabled. |
| `@types/node` | `25.9.1` | Node.js types |
| `@types/react` | `19.2.15` | React types |
| `cross-env` | `^10.1.0` | Cross-platform env var for the `dev` script |

> **`package.json` `"type": "module"`** — the project uses ESM throughout.

---

## 3. Project Structure — Annotated

```
frontend/
├── AGENTS.md                    ← This file.
├── package.json                 ← Dependencies and scripts. ESM ("type": "module").
├── tsconfig.json                ← TypeScript config. Strict mode. Path alias: @/* → ./*
├── tailwind.config.ts           ← Design token system. Colors, fonts, border radii, animations.
├── postcss.config.mjs           ← PostCSS: tailwindcss + autoprefixer.
├── next.config.ts               ← Next.js config.
├── next-env.d.ts                ← Auto-generated Next.js TS references. Do not edit.
├── middleware.ts                ← Route protection. Guards /dashboard → /auth/signin.
├── .env.local                   ← ACTUAL secrets. Gitignored.
├── .env.local.template          ← Safe to commit. Variable names only.
│
├── public/
│   └── images/                  ← Static image assets (if any).
│
├── app/
│   ├── globals.css              ← Tailwind directives + CSS custom props + global utilities.
│   ├── layout.tsx               ← Root layout. Mounts AuthInitializer, LenisProvider, PageTransition, Navbar, Footer.
│   ├── page.tsx                 ← Landing/home page.
│   │
│   ├── auth/
│   │   ├── layout.tsx           ← Auth shared layout. Centered card.
│   │   ├── callback/
│   │   │   └── route.ts         ← API route. Exchanges Supabase email-confirmation code for session.
│   │   ├── signin/
│   │   │   └── page.tsx         ← Sign-in form. react-hook-form + zodResolver + signInWithPassword.
│   │   └── signup/
│   │       └── page.tsx         ← Sign-up form. react-hook-form + zodResolver + signUp + email redirect.
│   │
│   ├── dashboard/
│   │   ├── layout.tsx           ← Client-side auth guard (second layer after middleware).
│   │   └── page.tsx             ← Main diagnostic UI. Upload zone + analysis results + image viewer.
│   │
│   ├── performance/             ← Additional page (check page.tsx for content).
│   │
│   └── what-we-can-do/
│       └── page.tsx             ← Public marketing/capabilities page.
│
├── components/
│   ├── layout/
│   │   ├── AuthInitializer.tsx  ← Renders null. Syncs Supabase auth state to Zustand on mount.
│   │   ├── LenisProvider.tsx    ← Activates Lenis smooth scroll (synced to gsap.ticker).
│   │   ├── Navbar.tsx           ← Fixed nav. GSAP scroll morph. Hides over #features section.
│   │   ├── PageTransition.tsx   ← GSAP curtain transition on route changes.
│   │   └── Footer.tsx           ← Minimal footer.
│   │
│   ├── sections/
│   │   ├── Hero.tsx             ← Landing hero section. GSAP animations.
│   │   ├── Features.tsx         ← Feature cards. GSAP scroll pinning + rotation.
│   │   ├── Philosophy.tsx       ← Text-focused section. ScrollTrigger fade-up.
│   │   └── Protocol.tsx         ← Pinned stacking cards with inline SVG animations.
│   │
│   └── ui/                      ← Reserved for future reusable UI primitives (currently empty).
│
├── lib/
│   ├── gsap.ts                  ← Registers ScrollTrigger + useGSAP. SSR-guarded.
│   ├── lenis.ts                 ← useLenis() hook. Creates Lenis + syncs to gsap.ticker.
│   ├── schemas.ts               ← signUpSchema + signInSchema Zod schemas.
│   ├── store.ts                 ← useAuthStore (Zustand). Shape: { user, isLoading, setUser, setLoading }.
│   ├── utils.ts                 ← cn() helper. Merges clsx + tailwind-merge.
│   └── supabase/
│       ├── client.ts            ← createClient(). Browser-side. Uses createBrowserClient.
│       └── server.ts            ← createServerSupabaseClient(). Server-only. Uses cookies().
│
└── hooks/                       ← Reserved. No custom hooks yet (empty directory).
```

---

## 4. Environment Setup

### Required Variables

Create `.env.local` in the `frontend/` root (already gitignored):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key

# Optional — defaults to http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

- Both `NEXT_PUBLIC_SUPABASE_*` vars are safe to expose — protected by Supabase RLS.
- `NEXT_PUBLIC_BACKEND_URL` is the FastAPI backend origin. All `/predict` calls use this.

### Running the Frontend

```bash
# From the frontend/ directory
npm install
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

The backend must be running separately at `NEXT_PUBLIC_BACKEND_URL` for analysis to work.

---

## 5. Dashboard — Core Feature (`app/dashboard/page.tsx`)

This is the heart of the application. Understand this file completely before editing it.

### Upload Zone

- Accepts drag-and-drop or click-to-browse.
- Validates: only `image/*` files accepted. Shows preview before submission.
- On submit, sends `POST /predict` (`multipart/form-data`, field `"file"`) to the FastAPI backend.
- Shows a loading/spinner state while awaiting response.
- On error: displays error message to user.

### Backend Integration

```ts
const formData = new FormData();
formData.append("file", selectedFile);

const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/predict`, {
  method: "POST",
  body: formData,
});
const data = await response.json();
```

The response shape is fully documented in the root `AGENTS.md` → Section 10.

### Image Viewer — Three View Modes

Toggled via buttons after analysis completes:

| Mode | Source field | Description |
|---|---|---|
| **Raw** | `images.original_b64` | Original X-ray (or YOLO-annotated version) |
| **Heatmap** | `images.heatmap_b64` | GradCAM overlay of the first positive condition |
| **Detection** | `images.boxes_b64` | YOLO bounding boxes drawn on the image |

Images are rendered as: `<img src={`data:image/jpeg;base64,${b64}`} />`.

> **Note:** `individual_heatmaps` (per-condition heatmaps) are available in the response. If you add a per-condition heatmap viewer, read from `images.individual_heatmaps[conditionName]`.

### Findings Panel

- Reads `confirmed_findings` array (NOT `differential_top3` — that field no longer exists).
- Each finding displays: condition name, risk level badge, normalized confidence progress bar.
- `normalized_conf` from the response drives the progress bar width (`0.0` to `1.0`).
- Conditions are pre-sorted by raw probability descending in the backend response.

### Object Detection Panel

- Reads `yolo_boxes` array: `[{ class, conf, xyxy }]`.
- Each box shows class name and raw YOLO confidence.

### Risk Badge

- Reads `risk_level` from the top-level response.
- Values: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` / `NORMAL` / `UNCERTAIN`.
- Color-coded by severity.

### Case Flags

- Reads `case_flags` array.
- `"heatmap_only:{condition}"` flags are filtered from display (internal annotation).
- Other flags rendered as small tag elements.

### Report Field

- `report` is always `null` in the current backend. Do not render a report panel.

---

## 6. Route Map

| Route | File | Protected | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | No | Landing page. |
| `/what-we-can-do` | `app/what-we-can-do/page.tsx` | No | Public marketing/capabilities page. |
| `/performance` | `app/performance/page.tsx` | No | Additional public page. |
| `/auth/signin` | `app/auth/signin/page.tsx` | No (redirects if authed) | Sign-in form. |
| `/auth/signup` | `app/auth/signup/page.tsx` | No (redirects if authed) | Sign-up form. |
| `/auth/callback` | `app/auth/callback/route.ts` | No | Email confirmation code exchange. |
| `/dashboard` | `app/dashboard/page.tsx` | **Yes** (middleware + client guard) | Main diagnostic UI. |

---

## 7. Authentication Flow

### Supabase Client Selection

| File | Type | When to Use |
|---|---|---|
| `lib/supabase/client.ts` | Browser (`createBrowserClient`) | All `"use client"` components, event handlers, form submissions |
| `lib/supabase/server.ts` | Server (`createServerSupabaseClient`) | Server components, API routes |

**Never mix browser client into server components or vice versa.**

### Auth State Initialization (`components/layout/AuthInitializer.tsx`)

Render-null client component mounted at root. On mount:
1. Calls `supabase.auth.getSession()` → syncs immediately to Zustand.
2. Subscribes to `supabase.auth.onAuthStateChange()` → keeps Zustand in sync on login/logout/refresh.
3. Cleanup: `subscription.unsubscribe()` on unmount.

**This is the only place Supabase auth events are subscribed to.**

### Sign-Up (`app/auth/signup/page.tsx`)

1. `react-hook-form` + `zodResolver(signUpSchema)` validates: email, password (min 6), confirmPassword match.
2. `supabase.auth.signUp({ email, password, options: { emailRedirectTo: "${origin}/auth/callback" } })`
3. On success: shows "Check Your Email" confirmation state. No auto-redirect.
4. On error: raw Supabase error in a red alert.

### Email Callback (`app/auth/callback/route.ts`)

- `GET /auth/callback?code=<code>`
- `supabase.auth.exchangeCodeForSession(code)` → redirect to `/dashboard`.
- On failure → redirect to `/auth/signin?error=Could not authenticate user`.

### Sign-In (`app/auth/signin/page.tsx`)

1. `react-hook-form` + `zodResolver(signInSchema)` validates.
2. `supabase.auth.signInWithPassword({ email, password })`
3. On success: `router.push("/dashboard")` — **direct push, not `navigateTo()`** (intentional: bypasses GSAP transition).

### Sign-Out (`app/dashboard/page.tsx`)

1. `supabase.auth.signOut()`
2. `router.push("/")` — Zustand auto-updates via `onAuthStateChange`.

---

## 8. Route Protection

### Layer 1: Middleware (`middleware.ts`)

Runs on every non-static request. Uses an inline `createServerClient`.

- Calls `supabase.auth.getUser()` (not `getSession()`) — validates JWT server-side.
- `/dashboard*` without user → redirect to `/auth/signin`.
- `/auth/*` with user → redirect to `/dashboard`.

### Layer 2: Client Guard (`app/dashboard/layout.tsx`)

Client component. Reads Zustand:
- `isLoading: true` → shows centered spinner.
- `user: null` (after loading) → `router.push("/auth/signin")`.
- `user` exists → renders `children`.

**Why both?** Middleware is the primary gate. Client guard prevents flash-of-content during Zustand hydration.

---

## 9. State Management (Zustand)

### `useAuthStore` (`lib/store.ts`)

```ts
interface AuthState {
  user: User | null;      // Supabase User object or null
  isLoading: boolean;     // true until AuthInitializer resolves initial session
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}
```

**Default state:** `user: null, isLoading: true`.

**Consumers:** `AuthInitializer` (writes), `Navbar` (reads user for CTA), dashboard layout guard, dashboard page (email display).

**Nothing else lives in Zustand.** Analysis results are local component state — they exist only for the browser session. No database persistence.

---

## 10. Schema Validation (Zod — `lib/schemas.ts`)

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

> **Note:** Enforces `min(6)`. Verify this aligns with the Supabase project's password policy (Supabase defaults to min 6, configurable in dashboard).

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

---

## 11. Animation System

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

**Rules:**
- Guard with `typeof window !== "undefined"` — prevents SSR crashes.
- **Register plugins here and nowhere else.** Registering in components causes duplication bugs.
- Every component imports `gsap` and `ScrollTrigger` from `@/lib/gsap`, never from `gsap` directly.

### Lenis Smooth Scroll

`lib/lenis.ts` exports `useLenis()`:
- Creates Lenis: `duration: 1.2`, custom easing, `smoothWheel: true`.
- Syncs to GSAP ticker: `gsap.ticker.add((time) => instance.raf(time * 1000))`.
- Disables lag smoothing: `gsap.ticker.lagSmoothing(0)`.
- Cleanup: `instance.destroy()`.

> **Known cleanup bug:** `gsap.ticker.remove()` is called with a new arrow function, not the original reference — the ticker callback is not actually removed. The Lenis instance is destroyed, making raf calls no-ops. Silent bug. Fix by extracting the callback to a named variable.

### `useGSAP` Pattern

```tsx
const containerRef = useRef<HTMLDivElement>(null);

useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Animations here
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    // gsap.set() instant fallbacks here
  });
}, { scope: containerRef });
```

- Always pass `{ scope: containerRef }` — scopes selectors and enables auto-cleanup on unmount.
- Never use raw `useEffect` for GSAP animations.

### `prefers-reduced-motion`

Implemented in: `Hero.tsx`, `Features.tsx`, `Protocol.tsx`.
**Not yet implemented in:** `Philosophy.tsx`, `Navbar.tsx`, `PageTransition.tsx` — these animate unconditionally. Add `gsap.matchMedia()` guards when touching these files.

### Page Transitions (`components/layout/PageTransition.tsx`)

Renders 6 dark columns (fixed, z-999) as the transition curtain.

**API:** `usePageTransition()` returns `{ navigateTo }`.

- **Exit (navigateTo called):** columns slide up from below → `router.push(href)` on complete.
- **Entrance (pathname change):** columns slide off above viewport.
- **Guard:** `isTransitioning.current` prevents double-triggering.

**All in-app navigation uses `navigateTo()`.** Exception: post-auth redirects in sign-in use `router.push()` directly — intentional.

---

## 12. Supabase Usage

| Feature | Usage |
|---|---|
| **Auth** | Email/password sign-up + email confirmation. Sign-in. Sign-out. JWT session via cookies. |
| **Database** | Not used. No tables queried. |
| **Storage** | Not used. |
| **Edge Functions** | Not used. |

Analysis results are **not persisted**. They exist only in client-side component state for the current session.

---

## 13. Known Issues and Gotchas

### 1. Lenis Ticker Cleanup Bug
`lib/lenis.ts` cleanup creates a new arrow function instead of removing the original reference. Silent — Lenis instance is destroyed correctly. Fix by naming the ticker callback.

### 2. `prefers-reduced-motion` Gaps
`Philosophy.tsx`, `Navbar.tsx`, `PageTransition.tsx` animate without `gsap.matchMedia()` checks. Add guards when modifying these files.

### 3. Sign-In Bypasses Page Transition
`app/auth/signin/page.tsx` uses `router.push("/dashboard")` instead of `navigateTo("/dashboard")`. This is intentional — post-auth redirects skip the GSAP curtain. Keep this behavior unless explicitly changing the UX.

### 4. Philosophy Uses `<img>` Not `<Image>`
`Philosophy.tsx` uses a plain `<img>` for the background texture. Bypasses Next.js image optimization. Low-priority fix.

### 5. `components/ui/` and `hooks/` are Empty
Both directories exist as placeholders. No files inside them.

### 6. `next.config.ts` Allows Remote Images
Configured to allow Unsplash remote image hostnames (used in Hero). Do not remove these without updating image sources.

### 7. `report` is Always `null`
The backend always returns `"report": null`. Do not render a report panel in the dashboard — it is a Phase 2 backend feature.

---

## 14. Absolute Don'ts

- ❌ **No Framer Motion.** GSAP is the only animation library.
- ❌ **No per-component `.module.css` files.** `globals.css` is the only CSS file.
- ❌ **No `@supabase/auth-helpers-nextjs`.** Use `@supabase/ssr` exclusively.
- ❌ **No ScrollTrigger instances without cleanup.** `useGSAP` with `{ scope }` handles this.
- ❌ **No raw `useEffect` for GSAP animations.** Use `useGSAP`.
- ❌ **No manual `requestAnimationFrame` alongside GSAP.** Use `gsap.ticker`.
- ❌ **No client-only route protection.** Middleware is the primary layer — never remove it.
- ❌ **No hardcoded secrets.** Credentials go in `.env.local` only.
- ❌ **No GSAP plugin registration in individual components.** Register only in `lib/gsap.ts`.
- ❌ **No `differential_top3`.** That field no longer exists. Use `confirmed_findings`.
- ❌ **No persisting analysis results.** Results are session-only, no database writes.

---

## 15. Extension Guide

### Adding a Backend Field to the Dashboard

1. Check the root `AGENTS.md` Section 10 for the exact response shape.
2. Update the TypeScript type/interface for the API response in the dashboard component.
3. Render the new field. No backend changes needed if the field already exists in the response.

### Adding a New Public Page

1. Create `app/your-route/page.tsx`.
2. Use `navigateTo("/your-route")` from `usePageTransition()` for any nav links.
3. Add the link to `components/layout/Navbar.tsx` if needed.
4. No middleware changes required for public routes.

### Adding a New Protected Route

1. Create the route under `app/`.
2. In `middleware.ts`, add the path to the `isProtectedPath` check:
   ```ts
   request.nextUrl.pathname.startsWith("/your-protected-path")
   ```
3. Copy `app/dashboard/layout.tsx` for the client-side guard.

### Adding a New Animation

1. Add a `useRef` for the target element.
2. Add animation logic inside the existing `useGSAP` → `mm.add("(prefers-reduced-motion: no-preference)", ...)` block.
3. Add a `gsap.set()` fallback in the reduced-motion branch.
4. `useGSAP` with `{ scope }` auto-reverts on unmount.

### Adding Global State Beyond Auth

Create a new Zustand store:
```ts
// lib/someStore.ts
import { create } from "zustand";
interface SomeState { /* ... */ }
export const useSomeStore = create<SomeState>((set) => ({ /* ... */ }));
```
Do not use React Context for state that Zustand can own.

---

## 16. Final Verification Checklist

Before considering any task complete:

- [ ] Dashboard correctly reads `confirmed_findings` (not `differential_top3`)
- [ ] Image viewer toggles correctly between Raw / Heatmap / Detection modes
- [ ] `NEXT_PUBLIC_BACKEND_URL` is used for all backend fetch calls (no hardcoded localhost)
- [ ] `/dashboard` is unreachable without a valid Supabase session (middleware + client guard both active)
- [ ] All GSAP animations use `useGSAP` with `{ scope }` — no raw `useEffect` for animations
- [ ] Lenis is synced to GSAP ticker and wraps all page content
- [ ] Sign-up form validates with `signUpSchema`; sign-in with `signInSchema`
- [ ] No per-component CSS files exist
- [ ] `globals.css` contains only Tailwind directives, CSS variables, and documented global utilities
- [ ] No secrets in source code — `.env.local` is gitignored
- [ ] `report` field is not rendered (always `null`)