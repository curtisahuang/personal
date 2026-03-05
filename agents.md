# Project Knowledge Base

## 1. Project Overview
- **Project**: `person-website` (`package.json`)
- **Purpose**: A personal portfolio site built with Next.js App Router, centered on visual branding and an interactive photoblog experience.
- **Audience**: Visitors/recruiters/clients viewing the owner’s profile and creative work.
- **Key capabilities**:
  - Home/landing page with animated decorative UI and contact/social links.
  - Photoblog page with a 24-tile gallery, fullscreen modal viewer, caption overlays, and back navigation.

## 2. Architecture Overview
- **High-level architecture**: Single Next.js frontend app (no separate backend service in repo).
- **Rendering model**:
  - Root layout is a server component (`src/app/layout.tsx`).
  - Main routes (`src/app/page.tsx`, `src/app/photoblog/page.tsx`) are explicitly client components (`"use client"`) due to hooks/interactivity.
- **Route structure**:
  - `/` → `src/app/page.tsx`
  - `/photoblog` → `src/app/photoblog/page.tsx`
- **Component responsibilities**:
  - `Header`: clickable hero image linking to photoblog.
  - `Summary`: responsive tagline text.
  - `SideSlogan`: mouse-reactive 3D text effect.
  - `Chicken`: toggled decorative image.
  - `Footer` + `Contact`: contact section and social links with scroll-linked animation.
  - `Caption`: reusable overlay for image captions in modal.
- **Data flow**:
  - Home page uses local UI state only (`showChicken`, footer ref for smooth scroll).
  - Photoblog reads local JSON (`src/app/photoblog/photos.json`), normalizes entries with defaults, and enforces fixed length of 24 photos.
  - Modal state is local (`activeIndex`), with viewport-aware sizing for fullscreen image display.
- **External integrations**:
  - `framer-motion` for animation/layout transitions.
  - Next.js router (`useRouter`) for back navigation fallback.
  - External outbound links (GitHub/Instagram/LinkedIn/WhatsApp/phone/email).

## 3. Tech Stack
- **Languages**: TypeScript + React JSX/TSX, CSS.
- **Framework/runtime**:
  - Next.js `^16.0.1`
  - React `^19`
  - React DOM `^19`
- **Styling**:
  - Tailwind CSS `^4.1.16`
  - PostCSS with `@tailwindcss/postcss`
  - Global custom CSS in `src/app/globals.css`
  - CSS Modules (`SideSlogan.module.css`)
- **Animation**:
  - Framer Motion `^12`
- **Tooling**:
  - TypeScript `^5.9.3`
  - ESLint `^9` with `next/core-web-vitals`
- **Package manager/build**:
  - npm (`package-lock.json`, lockfileVersion 3)
  - Scripts: `dev`, `build`, `start`, `lint`
- **Database/storage**:
  - No database/ORM found.
  - Content data is local JSON (`photos.json`) plus static image assets.

## 4. Directory Structure
- `src/app/`
  - `layout.tsx`: global shell + metadata + font.
  - `page.tsx`: homepage route.
  - `globals.css`: app-wide styles, variables, utility animations.
  - `components/`: reusable UI components.
  - `photoblog/page.tsx`: photoblog route.
  - `photoblog/photos.json`: photo caption/config data source.
- `src/assets/`: imported static assets (`chicken.png`, `vaporwave.png`, `down-chevron.svg`).
- `public/`: default static files (`next.svg`, `vercel.svg`).
- Root config files:
  - `package.json`, `package-lock.json`
  - `tsconfig.json`
  - `next.config.mjs`
  - `tailwind.config.ts`
  - `postcss.config.js`
  - `.eslintrc.json`

**Conventions observed**:
- App Router filesystem routing under `src/app`.
- Barrel exports in `src/app/components/index.ts`.
- Prefer local state and prop drilling over global state/store.

## 5. Key Entry Points
- **Application entry points**:
  - Root layout: `src/app/layout.tsx`
  - Home route: `src/app/page.tsx`
  - Photoblog route: `src/app/photoblog/page.tsx`
- **Navigation links**:
  - Home → Photoblog via `Header` (`<Link href="/photoblog">`).
  - Photoblog “← Back” button uses `router.back()` with fallback `router.push("/")`.
- **CLI commands**:
  - `npm run dev` (local development)
  - `npm run build` (production build)
  - `npm run start` (serve built app)
  - `npm run lint` (Next ESLint)
- **API/background workers**:
  - No `route.ts` API endpoints found.
  - No workers/queues/cron jobs found.

## 6. Core Concepts
- **Photoblog normalization pipeline**:
  - Raw `photos.json` entries are mapped to typed `Photo` objects with defaults.
  - App forces exactly 24 tiles; missing entries are filled with fallback image/caption.
- **Caption positioning model**:
  - `CaptionPosition` union supports right/left/center and top/bottom variants.
- **UI interaction primitives**:
  - Scroll-linked transforms (`Footer` with `useScroll` + `useTransform`).
  - Modal transitions with `AnimatePresence` + `layoutId` matching for smooth open/close motion.
  - Mouse-position-based perspective transforms (`SideSlogan`).
- **Typography/branding**:
  - `Raleway` applied globally via layout.
  - `Inter` applied on homepage title.

## 7. Development Patterns
- **Code organization**:
  - Route-level logic in `page.tsx` files.
  - Shared UI in `src/app/components`.
  - Local assets imported directly from `src/assets`.
- **State management**:
  - Component-level React state (`useState`, `useMemo`, `useEffect`, `useRef`).
  - No Redux/Zustand/Context provider patterns observed.
- **Error handling**:
  - Minimal explicit error handling; mostly defensive defaults (e.g., photoblog fallbacks).
  - No custom `error.tsx` route boundary files.
- **Logging**:
  - No dedicated logging framework or conventions found.
- **Configuration management**:
  - Mostly static file-based config; no `.env` files in repo root.
  - Path alias `@/*` → `src/*` in `tsconfig.json`.
- **Auth/authz**:
  - No authentication/authorization mechanisms present.

## 8. Testing Strategy
- **Current state**:
  - No test files (`*.test.*` / `*.spec.*`) found.
  - No test framework configuration (Jest/Vitest/Playwright/Cypress) found.
  - No `test` script in `package.json`.
- **Quality gates currently used**:
  - TypeScript strict mode.
  - ESLint via `next/core-web-vitals`.
- **Implication for future agents**:
  - Changes should be validated manually (`npm run dev`, route walkthrough, lint).
  - If adding non-trivial features, introducing a test framework would improve safety.

## 9. Getting Started
- **Prerequisites**:
  - Node.js declared as `>=18.17` in repo docs/config.
  - Note: `next@16` in lockfile indicates Node `>=20.9.0` engine requirement; align local/runtime Node accordingly to avoid issues.
- **Setup**:
  1. Install dependencies: `npm install`
  2. Start dev server: `npm run dev`
  3. Open `http://localhost:3000`
- **Common tasks**:
  - Lint: `npm run lint`
  - Build: `npm run build`
  - Start prod server: `npm run start`
- **Editing points**:
  - Homepage: `src/app/page.tsx`
  - Photoblog behavior/data: `src/app/photoblog/page.tsx` + `src/app/photoblog/photos.json`
  - Shared components: `src/app/components/*`

## 10. Areas of Complexity
- **Photoblog modal sizing + animation coupling**:
  - Dynamic viewport calculations and fallback image dimensions interact with Framer Motion layout transitions.
- **Asset/source fallback pathing**:
  - Photoblog supports `/assets/<filename>` from `public`, but current repo primarily uses `src/assets` imports and fallback `vaporwave`; this can be confusing when adding real photo files.
- **Heavy style specificity in global CSS**:
  - Strong global element styles (`h1`-`h6`, body gradients, user-select rules) may create side effects when adding new UI.
- **Node version mismatch risk**:
  - `README`/`package.json` mention Node 18+, while Next 16 lockfile entry expects Node 20.9+.
- **Testing gap / technical debt**:
  - No automated tests or CI workflows; regression risk is higher for UI changes.
