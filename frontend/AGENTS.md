# Frontend AGENTS.md — Technical Reference

> **Read this before touching any frontend code.**
> This file documents what is *actually here* — the current state of the frontend, verified file by file.
> Project-level context (model architecture, backend API, inference pipeline) lives in the root `AGENTS.md`.

---

## 1. What This Frontend Does

A Next.js 16 (App Router, TypeScript, Tailwind CSS) medical AI web application that:

- Authenticates users via Supabase.
- On the dashboard, accepts a chest X-ray image via drag-and-drop or **Clinical Reference Archive**.
- Renders findings: GradCAM heatmaps, YOLO detection boxes, risk badge, and confidence scores.

---

## 3. Project Structure — Annotated

```
frontend/
├── AGENTS.md                    ← This file.
├── public/
│   ├── images/                  ← Static UI assets.
│   └── testing_images/          ← Archive of sample X-rays for the Reference Library.
│
├── app/
│   ├── api/
│   │   └── sample-images/       ← GET route to list images from public/testing_images.
│   ├── dashboard/
│   │   └── page.tsx             ← Main diagnostic UI.
│   ├── performance/
│   │   └── page.tsx             ← Technical validation and benchmarks.
│   └── ...
│
├── components/
│   ├── layout/                  ← Global wrappers (Auth, Lenis, Navbar).
│   ├── sections/
│   │   └── SampleGallery.tsx    ← The "Clinical Reference Archive" component.    
│   └── ui/                      ← Reusable primitives.
│
└── lib/                         ← Logic, stores, and utilities.
```

---

## 5. Dashboard — Core Feature (`app/dashboard/page.tsx`)

### Clinical Reference Archive (New)
The dashboard now integrates a `SampleGallery` component (labeled "Clinical Reference Archive").
- Users can browse a library of pre-loaded clinical units.
- Selecting an image fetches the file from `/testing_images/` and injects it into the upload pipeline.
- Controlled via `isModalOpen` state in the gallery component.

### Image Viewer — Three View Modes
| Mode | Source field | Description |
|---|---|---|
| **Raw** | `images.original_b64` | Original X-ray (or YOLO-annotated version) |
| **Heatmap** | `images.heatmap_b64` | GradCAM overlay of the first positive condition |     
| **Detection** | `images.boxes_b64` | YOLO bounding boxes drawn on the image |

---

## 6. Route Map

| Route | File | Protected | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | No | Landing page. |
| `/performance` | `app/performance/page.tsx` | No | Technical validation & benchmarks. |
| `/auth/signin` | `app/auth/signin/page.tsx` | No (redirects if authed) | Sign-in form. |   
| `/auth/signup` | `app/auth/signup/page.tsx` | No (redirects if authed) | Sign-up form. |   
| `/auth/callback` | `app/auth/callback/route.ts` | No | Email confirmation code exchange. | 
| `/dashboard` | `app/dashboard/page.tsx` | **Yes** (middleware + client guard) | Main diagnostic UI. |

---

## 13. Known Issues and Gotchas

### 1. Sample Gallery Fetching
The gallery depends on `app/api/sample-images/route.ts` to scan the `public/testing_images` directory. If the directory is empty, the gallery will not render.

### 2. Lenis Ticker Cleanup
Ticker cleanup in `lib/lenis.ts` uses an arrow function reference that doesn't match the listener. Silent but technically a memory leak on HMR.

---

## 15. Extension Guide

### Adding New Samples
To add images to the Reference Archive:
1. Drop `.jpg` or `.png` files into `frontend/public/testing_images/`.
2. The `SampleGallery` will automatically detect them via the API route.
