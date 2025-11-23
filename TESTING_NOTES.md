# Testing & QA Notes

## 1. Manual Test Matrix
| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Guest throws 3 bottles | Use `/create` without logging in; send 3 messages. | Status banner counts down (3→0). 4th attempt shows “Daily Throw Limit Reached” modal. |
| Guest catches 3 bottles | Visit `/catch` repeatedly as guest. | Same as above but for catch modal. |
| Guest → Sign in | Hit “Sign in” from modal, log in via Google/email. | Guest counters reset; Home banners disappear; Create/Catch now allow 10 actions. |
| Authenticated daily limit | Logged-in user throws/catches 10 times cumulatively. | “Daily Action Limit Reached” modal appears; profile stats show totals. |
| Email verification | Register with email+password. | Auth page shows “verification email sent”; clicking link allows login; Profile shows “Email verified”. |
| Inbox read/unread | Catch a bottle, open `/chat`, then return to `/inbox`. | Item appears, unread indicator clears once opened. |
| Profile stats | After throw/catch, visit `/profile`. | “Collected” and “Thrown” counts update (guest profile stays at 0). |

> Full walkthroughs are also captured in `TESTING_SUMMARY.md`, `TESTING_CHECKLIST.md`, and `TEST_GUEST_MODE.md`.

## 2. Lint, Build & Type Checks
- `npm run lint` – runs Next.js ESLint config. No warnings allowed before commit.
- `npm run build` – compiles server/client bundles and runs type checking (`tsc --noEmit`).
- When testing OAuth, Chrome may log `Cross-Origin-Opener-Policy` warnings; they don’t break functionality but keep an eye on them.

## 3. Data Fixtures / Seeding
- No automatic seed script is committed. To populate Firestore:
  1. Create a service-account key.
  2. Use Firebase Admin SDK script (see earlier chat instructions for `scripts/seedPool.ts`) to clear/create `pool_bottles` documents.
  3. Optionally seed inbox entries for demo accounts to showcase profile stats.

## 4. Debugging Checklist
- **Permission errors (`Missing or insufficient permissions`)**:
  - Make sure you’re logged in (not anonymous). Inspect `auth.currentUser`.
  - Verify Firestore rules and `daily_stats/{date}` counts; delete document for test resets.
  - Check if app is running in demo mode (env vars missing) – in that case Firestore calls are no-ops.
- **Guest limit inconsistencies**:
  - Inspect `localStorage.echobottle_guest_actions` to confirm entries.
  - Clear storage to simulate a new guest.
  - Remember limits reset at UTC midnight, not local.
- **Email verification**:
  - Resend via Profile (button uses `resendVerificationEmail`).
  - After verifying, log out/in to pick up new `emailVerified` state.
- **UI gating**:
  - If “Sign In Required” appears despite being logged in, check console for `permission-denied`; session may have expired.

## 5. Suggested Automation (future)
- Integration tests around `sendBottle`/`catchBottle` could be written with Playwright using a mocked Firestore emulator.
- Unit tests for `lib/services/guest.ts` (pure functions) could verify date math and remaining count logic.

