# Guest Handling & Limits (Updated Architecture)

## 1. Unified Authentication Model

**All users use Firebase Authentication**, including guests:
- **Authenticated Users**: Sign in with Google or Email/Password
- **Guest Users**: Use Firebase Anonymous Authentication (automatically created by `initAuth()`)

**No localStorage-based guest IDs** - all identity is managed through Firebase Auth UIDs.

## 2. Daily Limit Mechanism

### Storage Path
All daily usage is tracked in Firestore:
```
artifacts/{appId}/users/{uid}/daily_stats/{YYYY-MM-DD}
```

This path is used for **both** authenticated and anonymous users.

### Limit Values
- **Guest Users** (Anonymous Auth): 3 actions per day
- **Authenticated Users**: 10 actions per day

### Implementation (`lib/services/firestore.ts`)

**Atomic Transaction-Based Limit Checking:**
```typescript
const checkAndIncrementUserLimit = async (userId: string, isAnonymous: boolean): Promise<void> => {
  const dailyLimit = isAnonymous ? 3 : 10;
  
  await runTransaction(db, async (transaction) => {
    const statsSnap = await transaction.get(statsRef);
    const currentCount = statsSnap.data()?.count ?? 0;

    if (currentCount >= dailyLimit) {
      throw new Error(isAnonymous ? 'GUEST_LIMIT_REACHED' : 'USER_LIMIT_REACHED');
    }

    transaction.set(statsRef, {
      count: increment(1),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
}
```

**Key improvements:**
- Uses Firestore Transactions to prevent race conditions
- Single source of truth for all users
- Automatic UTC day-based reset (new document per day)

## 3. Querying User Status

Components can fetch current usage via `getUserDailyStatus()`:

```typescript
const status = await getUserDailyStatus(userId, isAnonymous);
// Returns: { used, limit, remaining, hasReachedLimit }
```

This is used in UI components (HomePage, CreatePage) to display:
- "Guest Mode: X actions remaining today"
- Warning when limit is reached

## 4. Security Model

### Firestore Rules
```
match /users/{userId}/daily_stats/{date} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Benefits:**
- Users can only access their own stats
- Anonymous users are treated as authenticated (via Firebase Auth)
- No public access to user data

### Public Pool Access
```
match /public/data/pool_bottles/{bottleId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null 
    && request.resource.data.senderId == request.auth.uid;
}
```

**Prevents:**
- Unauthenticated spam
- Users impersonating others
- Public write access abuse

## 5. UI Error Mapping & Messaging

| Error Code | User Type | UI Response |
|-----------|-----------|-------------|
| `GUEST_LIMIT_REACHED` | Anonymous | Show "Daily limit reached" modal with sign-in CTA |
| `USER_LIMIT_REACHED` | Authenticated | Show "Daily Action Limit Reached" modal (10 actions) |
| `AUTH_REQUIRED` | None | Show "Sign In Required" modal |

## 6. Removed Legacy Systems

**Deprecated and removed:**
- ❌ `lib/services/guest.ts` (localStorage-based tracking)
- ❌ `lib/context/GuestContext.tsx` (client-side guest state)
- ❌ `localStorage.echobottle_guest_id` (predictable ID generation)
- ❌ `localStorage.echobottle_guest_actions` (client-side limit enforcement)
- ❌ `guests/{guestId}/inbox` Firestore paths (insecure public access)

**Replaced with:**
- ✅ Firebase Anonymous Authentication for all guests
- ✅ Server-side limit enforcement with Firestore Transactions
- ✅ Secure `users/{uid}` paths for all user data
- ✅ `getUserDailyStatus()` for real-time limit queries

## 7. Migration Notes

### For Users
- No action required
- Existing guest localStorage data is ignored
- New anonymous session created on first visit
- Session persists across page reloads until browser storage is cleared

### For Developers
- All firestore service functions now require `userId` parameter
- Pass `user.uid` and `user.isAnonymous` from `useAuthContext()`
- Remove any references to `GuestContext` or `guest.ts`
- Ensure `initAuth()` is called before any Firestore operations

## 8. Practical Notes

- **UTC-based resets**: Limits reset at UTC 00:00 (new document date)
- **Cross-device**: Anonymous sessions are device-specific (no cross-device sync)
- **Rate limiting**: Server-side enforcement prevents client-side bypasses
- **Race conditions**: Firestore Transactions ensure atomic limit checks
- **Security**: All reads/writes require authentication (including anonymous)
