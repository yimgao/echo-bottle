# Firestore Data Model & Services

## 1. Collections & Documents
| Path | Schema | Purpose |
|------|--------|---------|
| `artifacts/{appId}/public/data/pool_bottles/{bottleId}` | `{ content: string, type: MoodType, createdAt: Timestamp, senderId: string, isGuest: boolean, random: number }` | Global pool of thrown bottles. `random` is 0-1 float for efficient sampling. |
| `artifacts/{appId}/users/{uid}/inbox/{docId}` | `{ content, type, createdAt, unread: boolean, isGuest: boolean }` | Bottles collected by a signed-in user (including anonymous). |
| `artifacts/{appId}/users/{uid}/daily_stats/{YYYY-MM-DD}` | `{ count: number, updatedAt: Timestamp }` | Daily action counter for limits (User: 10, Guest/Anon: 3). |

> `appId` defaults to `default-app-id` but can be overridden via `NEXT_PUBLIC_APP_ID`.
> **Note:** Previous `guests/{guestId}` paths have been deprecated and removed in favor of Firebase Anonymous Authentication.

## 2. Service Helpers (`lib/services/firestore.ts`)
### subscribeToInbox(userId, callback)
- Creates a realtime snapshot listener on `users/{uid}/inbox`. In demo mode (no Firestore), returns the hardcoded `SYSTEM_BOTTLES`.

### sendBottle(text, mood)
1. Determine current Firebase user (must be authenticated, anonymously or via email).
2. Check daily limit against `daily_stats/{today}` using a **Firestore Transaction** to prevent race conditions.
   - **Anonymous User (Guest)**: Limit 3.
   - **Authenticated User**: Limit 10.
3. If under limit, increment count atomically.
4. Insert document into `public/data/pool_bottles` with `senderId` = `uid` and `random` = `Math.random()`.

### catchBottle()
1. Perform the same rate-limit check (transactional).
2. Generate a random value `r`.
3. Query `pool_bottles` where `random >= r`, ordered by `random`. If empty, query `random < r` ordered desc.
4. Pick the first bottle that isn't from the current user (client-side filter).
5. Write the caught bottle into `users/{uid}/inbox`.
6. Return `{ id, content, type, createdAt, unread: true }` to the UI.

### getAvailableBottlesCount()
- Uses `getCountFromServer` to efficiently count total bottles and subtract user's own bottles. Much cheaper than fetching 100 documents.

### countUserSentBottles(userId)
- Uses Firestore’s `getCountFromServer()` on `pool_bottles` filtered by `senderId === uid`. Drives the “Thrown” stat in Profile.

## 3. Security Rules / Permissions
- See `firestore.rules`. Key points:
  - `artifacts/{appId}/users/{uid}/...` requires `request.auth.uid == uid`.
  - `public/data/pool_bottles` read access is public.
  - `public/data/pool_bottles` create access requires authentication (`request.auth != null`).
  - Guest access relies on Firebase Anonymous Auth; no unauthenticated writes allowed.

## 4. Considerations / Future Enhancements
- **Analytics**: We currently log minimal metadata. If moderation is required, add fields like `mood`, `language`, `reportCount`, etc.
- **Indexes**: Auto-indexes usually suffice for the single-field random query. If complex filtering is added, `firestore.indexes.json` may need updates.
- **Cleanup**: For long-term storage, consider scheduled Cloud Functions to archive old bottles.
