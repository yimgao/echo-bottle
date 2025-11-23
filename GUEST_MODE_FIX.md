# Guest Mode Bug Fix - Authentication Issue

## Problem
Guest users were unable to catch or throw bottles, receiving "Sign In Required" modals instead of being allowed their 3 free actions.

## Root Cause
Multiple issues were preventing guest mode from functioning:

### 1. **Auth Initialization Race Condition**
The `initAuth()` function was being called but the auth state wasn't settling before users tried to interact with the app:
- `AuthContext` was trying to call `initAuth()` in multiple places
- The auth listener and initialization were racing
- Components were trying to access `user` before it was set

### 2. **Property Name Inconsistency**
The code was inconsistently using `user.uid` vs `user.id`:
- The `User` type only defined `id` property
- Some components used `user.uid` (which doesn't exist)
- This resulted in `null` being passed to Firestore functions
- Firestore functions threw `AUTH_REQUIRED` error when `userId` was `null`

### 3. **Missing Loading State Check**
The catch route wasn't properly waiting for auth to initialize before attempting actions.

## Fixes Applied

### 1. Fixed Auth Initialization (`lib/services/auth.ts`)
```typescript
export const initAuth = async (): Promise<void> => {
  // Added early return if already authenticated
  if (auth.currentUser) {
    return;
  }
  
  // Sign in anonymously for guest users
  await signInAnonymously(auth as any);
  console.log('Guest user signed in anonymously');
}
```

### 2. Simplified AuthContext (`lib/context/AuthContext.tsx`)
```typescript
// Initialize auth once, then subscribe to changes
const initialize = async () => {
  try {
    await initAuth();
  } catch (e) {
    console.error("Auth initialization failed:", e);
  }
};

initialize();

// Subscribe to auth state changes
const unsubscribe = subscribeToAuthState((nextUser) => {
  setUser(nextUser);
  setIsLoading(false);
});
```

### 3. Fixed Property Inconsistencies
- Updated `User` type to include both `id` and `uid` for compatibility
- Updated `subscribeToAuthState` to set both properties
- Fixed all component usages to use `user.id` consistently

**Files updated:**
- `types/index.ts`: Added `uid?: string` to User interface
- `lib/services/auth.ts`: Set both `id` and `uid` in auth state callback
- `app/home/page.tsx`: Changed `user?.uid` to `user?.id`
- `app/inbox/page.tsx`: Changed `user?.uid` to `user?.id`
- `components/pages/HomePage.tsx`: Changed `user.uid` to `user.id`
- `components/pages/CreatePage.tsx`: Changed `user.uid` to `user.id`

### 4. Added Loading State Guard (`app/catch/page.tsx`)
```typescript
useEffect(() => {
  const handleCatch = async () => {
    if (isLoading) return; // Wait for auth to settle
    
    const userId = user?.id || null;
    
    if (!userId) {
      setError('AUTH_REQUIRED');
      return;
    }
    
    // ... rest of logic
  };
}, [router, user, isLoading]); // Added isLoading to dependencies
```

### 5. Added Loading State Guard (`app/create/page.tsx`)
```typescript
const handleSendConfirm = async ({ text, mood }) => {
  if (isLoading) return; // Wait for auth to settle
  
  const userId = user?.id || null;
  
  if (!userId) {
    setLimitModalType('auth');
    return;
  }
  
  // ... rest of logic
};
```

## Testing Checklist

### Guest Mode (Anonymous Auth)
- [ ] Fresh visitor is automatically signed in anonymously
- [ ] Guest can throw a bottle (1st action)
- [ ] Guest can catch a bottle (2nd action)
- [ ] Guest can throw/catch up to 3 times total
- [ ] After 3 actions, guest sees limit modal with sign-in CTA
- [ ] Guest limit counter shows remaining actions (3, 2, 1, 0)
- [ ] Guest session persists across page reloads (until browser storage cleared)

### Authenticated Users
- [ ] Signed-in users can throw/catch up to 10 times per day
- [ ] Limit resets at UTC midnight
- [ ] Atomic transaction prevents race conditions

### UI/UX
- [ ] No "Sign In Required" modal for guests with actions remaining
- [ ] Loading state prevents premature action attempts
- [ ] Consistent behavior across all routes (home, create, catch)

## Deployment Notes
- No database changes required (already using Firebase Anonymous Auth)
- No environment variable changes needed
- Clear browser storage recommended for users experiencing issues
- Anonymous sessions will persist until:
  - User signs in with Google/Email
  - User clears browser storage
  - User signs out

## Related Documentation
- See `AUTH_FLOW.md` for detailed authentication architecture
- See `GUEST_AND_LIMITS.md` for limit enforcement details
- See `SECURITY_AUDIT_FIXES.md` for overall security improvements

