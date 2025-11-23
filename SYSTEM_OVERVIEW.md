# EchoBottle – System & Build Overview

## Technology Stack
| Layer  | Implementation | Details |
|--------|----------------|---------|
| Framework | **Next.js 14** (App Router) | Route-per-folder under `app/`. Server Components by default; interactive pieces marked with `'use client'`. |
| Language | **TypeScript** | Strict mode enabled. Paths resolved via `"moduleResolution": "bundler"` to support Next imports. |
| Styling  | **TailwindCSS** + custom CSS | Tailwind for layout/spacing; `app/globals.css` sets fonts, background gradients, scrollbar styles. |
| Runtime Providers | `AuthProvider` | Injected in `app/layout.tsx` so every page can read auth state via hooks. |
| Backend | **Firebase** (Auth + Firestore) | `lib/firebase.ts` bootstraps config; falls back to "Demo Mode" when env vars are missing. Anonymous Auth used for all guests. |
| Deployment | Vercel (primary) | `vercel.json` config; Firebase hosting files remain for alternative deployments. |

## Repository Layout (abridged)
```
app/
├─ layout.tsx                 # wraps AuthProvider and <body>
├─ page.tsx                   # initial redirect to /home
├─ auth/home/create/catch/... # per-route entry components
components/
├─ layout/                    # WebLayout (desktop), FloatingDock (mobile)
├─ pages/                     # Route UIs: HomePage, CreatePage, ProfilePage, etc.
├─ visual/                    # Ocean background, particles, waves, etc.
lib/
├─ firebase.ts                # Firebase init + demo fallback
├─ context/                   # AuthContext definition
├─ services/                  # auth.ts, firestore.ts helper APIs
```

## Control Flow Snapshot
1. `app/layout.tsx` renders the HTML shell and wraps everything with `AuthProvider`. This context exposes `useAuthContext()` so any component can read login state without prop drilling.
2. `app/page.tsx` runs `initAuth()` which ensures all users have a Firebase session (using Anonymous Auth for guests) and then pushes to `/home`.
3. Route entry files (`app/home/page.tsx`, `app/create/page.tsx`, etc.) handle data fetching / effects, but actual markup sits in `components/pages/*` for reusability between desktop/mobile layouts.
4. Desktop vs mobile shells: `components/layout/WebLayout.tsx` renders the sidebar and sign-out button; `components/layout/FloatingDock.tsx` renders the bottom navigation dock. Both read auth state to disable or reroute links.

## Environment & Configuration
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Standard Firebase web SDK config (apiKey, authDomain, projectId, etc.). |
| `NEXT_PUBLIC_APP_ID`     | Firestore artifact namespace; defaults to `'default-app-id'`. |
| `.env.local`             | Local dev overrides. Production uses Vercel dashboard secrets. |
| `firebase.json`, `firestore.rules`, `firestore.indexes.json` | Required if deploying to Firebase Hosting/Firestore. |

## Build / Test Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Launch dev server with hot reload. |
| `npm run lint` | ESLint (Next config) over the whole project. |
| `npm run build` | Production build + type-check. |
| `npm run start` | Serve the built app locally. |

## Deployment Notes
- **Vercel**: push to `main`, then run `vercel --prod` (or set up auto-deploy). Make sure all Firebase env vars are configured in the Vercel dashboard.
- **Firebase Hosting**: optional. Use `npm run build:firebase` (if defined) and `firebase deploy`. Ensure service account permissions and `firebase use <project>` are set.
- **Firestore rules/indexes**: whenever data model changes, run `firebase deploy --only firestore:rules,firestore:indexes`.

## Key Dependencies
- `firebase` – Web SDK (Auth + Firestore).
- `lucide-react` – Icon set for UI.
- `react-hot-toast` (used where needed) for notifications.
- `tailwindcss`, `autoprefixer`, `postcss` for styling pipeline.

## Development Tips
- Because App Router uses React Server Components, any hook-based logic must be inside files marked `'use client'`.
- Use `useAuthContext()` for authentication state; services (`lib/services/*`) centralize all backend mutations/data access.
- All users must have a Firebase Auth session (Anonymous Auth for guests) - no unauthenticated access is allowed.
- For design consistency, prefer existing components in `components/visual/` (OceanBackground, GlassCard) rather than reimplementing styling.

