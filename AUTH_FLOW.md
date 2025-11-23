# Authentication & Session Flow (Updated Architecture)

## 1. Unified Authentication Model

**All users require Firebase Authentication**:
- No unauthenticated access to Firestore
- Guests use Firebase Anonymous Authentication
- Single `AuthContext` manages all auth state

### AuthContext (`lib/context/AuthContext.tsx`)
- Subscribes to Firebase `onAuthStateChanged`
- Provides derived state:
  - `user`: `{ id, name, email, emailVerified, isAnonymous, uid } | null`
  - `isLoading`: true while Firebase Auth is initializing
  - `isSignedIn`: `user exists && !user.isAnonymous`
  - `isGuest`: `!isSignedIn` (includes anonymous users)
  - `isVerified`: email verified or anonymous
  - `needsVerification`: signed in but email not verified

## 2. Supported Login Flows

| Flow              | Implementation Details                                                   |
|-------------------|---------------------------------------------------------------------------|
| Google OAuth      | `loginWithGoogle()` → `signInWithPopup(auth, GoogleAuthProvider)`. Errors bubble to AuthPage. |
| Email/Password    | `loginWithEmail()` → checks email verification → throws `auth/email-not-verified` if unverified. |
| Signup            | `registerWithEmail()` → `createUserWithEmailAndPassword()` → sends verification email → signs out immediately. |
| Anonymous (Guest) | `initAuth()` calls `signInAnonymously()` if no session exists. Automatic and transparent. |

### Verification UX
- Auth screen shows success message when signup email sent
- Profile page displays email status and "Resend verification email" button
- Inbox access requires verified email (or anonymous session for catching only)

## 3. Rate Limiting Strategy

**Unified Firestore-based system** (no localStorage):

| User Type | Daily Limit | Storage Path |
|-----------|-------------|--------------|
| Guest (Anonymous) | 3 actions/day | `artifacts/{appId}/users/{uid}/daily_stats/{date}` |
| Authenticated | 10 actions/day | `artifacts/{appId}/users/{uid}/daily_stats/{date}` |

**Implementation highlights:**
- Uses Firestore Transactions for atomic read-modify-write
- Prevents race conditions when multiple requests happen simultaneously
- Server-enforced (cannot be bypassed client-side)
- Automatic reset at UTC midnight (new document per day)

**Function signature:**
```typescript
await checkAndIncrementUserLimit(userId: string, isAnonymous: boolean);
// Throws: 'GUEST_LIMIT_REACHED' or 'USER_LIMIT_REACHED'
```

## 4. UI & Navigation Enforcement

### Layout Components (`WebLayout` / `FloatingDock`)
- Disable "My Collection" / "My Journal" when `isGuest`
- Show "Sign in" or "Verify email" tooltips
- Redirect to `/auth` when guest tries to access protected routes

### Home & Create Pages
- Display guest limit banners: "Guest Mode: X actions remaining"
- Fetch live status via `getUserDailyStatus(userId, isAnonymous)`
- Show sign-in CTA when limit reached

### Route Guards (`/catch`, `/create`)
- Wrap service calls in try/catch
- Map errors to modals:
  - `GUEST_LIMIT_REACHED` → "Daily limit reached, sign in for more"
  - `USER_LIMIT_REACHED` → "Daily Action Limit Reached (10/day)"
  - `AUTH_REQUIRED` → "Sign In Required"

## 5. Lifecycle Sequence

### Initial Load
1. **App boots** → `app/page.tsx` calls `initAuth()`
2. **`initAuth()`**:
   - Checks if user is already signed in
   - If not, calls `signInAnonymously()` to create guest session
   - Returns the current user
3. **`AuthContext`** receives user info and exposes derived state
4. **Router** redirects to `/home`

### Sign In (Google/Email)
1. User clicks "Sign in" → navigates to `/auth`
2. **Google**: `loginWithGoogle()` → popup → user object
3. **Email**: `loginWithEmail(email, password)` → checks verification
4. **`AuthContext`** updates → `isSignedIn: true`, `isGuest: false`
5. UI re-renders with full access (10 actions/day limit)

### Sign Out
1. User clicks "Sign Out" → calls `logout()`
2. **`logout()`** → `signOut(auth)` → `initAuth()` (creates new anonymous session)
3. **`AuthContext`** updates → `isGuest: true`
4. Router redirects to `/auth` or `/home`
5. New anonymous session starts with fresh daily limit (3 actions)

## 6. Security Model

### Firebase Authentication
- **All Firestore access requires authentication**
- Anonymous users get a real Firebase UID
- UID is cryptographically secure (not predictable)
- Session persists in browser storage until sign-out or cleared

### Firestore Security Rules
```
// User data (inbox, stats)
match /users/{userId}/** {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Public pool (bottles)
match /public/data/pool_bottles/{bottleId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null 
    && request.resource.data.senderId == request.auth.uid;
}
```

**Key protections:**
- ✅ Users can only access their own data
- ✅ Cannot impersonate others in public pool
- ✅ Anonymous users treated as authenticated
- ✅ No public read/write access
- ✅ Server-side validation of `senderId`

## 7. Removed Legacy Systems

**Previous architecture had two conflicting "guest" systems:**

### ❌ Removed: localStorage Guest Mode
- Used `localStorage.echobottle_guest_id` (predictable `Date.now()`)
- Client-side limit tracking in `localStorage.echobottle_guest_actions`
- Insecure Firestore path: `guests/{guestId}/inbox` (public read access!)
- Race conditions in limit checking (no transactions)

### ✅ Replaced With:
- Firebase Anonymous Authentication (secure UIDs)
- Server-side limit enforcement with Firestore Transactions
- Unified user paths: `users/{uid}` for all users
- Atomic read-modify-write operations

## 8. Migration Impact

### Breaking Changes
1. **Service function signatures changed**:
   ```typescript
   // Old (implicit global auth)
   await sendBottle(text, mood);
   
   // New (explicit userId)
   await sendBottle(userId, isAnonymous, text, mood);
   ```

2. **Context removed**:
   - `GuestContext` deleted
   - Use `useAuthContext()` for all auth state
   - Call `getUserDailyStatus(userId, isAnonymous)` for limit info

3. **Firestore paths changed**:
   - `guests/{guestId}/**` paths removed
   - All users use `users/{uid}/**`

### Non-Breaking
- Users experience seamless transition
- Old localStorage keys ignored (not used)
- New anonymous sessions created automatically
- No action required from end users

## 9. Best Practices

### Component Usage
```typescript
const { user, isGuest } = useAuthContext();
const [dailyStatus, setDailyStatus] = useState(null);

useEffect(() => {
  if (user && isGuest) {
    getUserDailyStatus(user.uid, user.isAnonymous)
      .then(setDailyStatus);
  }
}, [user, isGuest]);

const handleAction = async () => {
  await sendBottle(user?.uid, user?.isAnonymous, text, mood);
};
```

### Error Handling
```typescript
try {
  await catchBottle(user?.uid, user?.isAnonymous);
} catch (error) {
  if (error.message === 'GUEST_LIMIT_REACHED') {
    // Show guest limit modal
  } else if (error.message === 'USER_LIMIT_REACHED') {
    // Show user limit modal
  } else if (error.message === 'AUTH_REQUIRED') {
    // Redirect to /auth
  }
}
```

### Security Checklist
- ✅ Always pass `userId` to Firestore functions
- ✅ Never trust client-side limit checks
- ✅ Use Transactions for atomic operations
- ✅ Validate `senderId` matches `request.auth.uid`
- ✅ Ensure `initAuth()` runs before any Firestore calls
- ✅ Test with Anonymous Auth users (not just signed-in)
