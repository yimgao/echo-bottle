# 🧪 Guest Mode Testing Guide

## Quick Test Checklist

### 1. Guest Access (No Sign-In Required)
- [ ] Visit `/auth` page
- [ ] Click "Continue as Guest (3 free actions)"
- [ ] Should redirect to `/home`
- [ ] Should see "Guest Mode: 3 actions remaining" banner

### 2. Throw Bottle (Guest Mode)
- [ ] Click "Cast a Bottle" button
- [ ] Write a message (up to 500 chars)
- [ ] Select a mood (Sad, Joy, Love, Curious)
- [ ] Click "Throw into the Sea"
- [ ] Should show "Drifting away..." animation
- [ ] Should redirect to home with success message
- [ ] Guest counter should decrease to "2 actions remaining"

### 3. Catch Bottle (Guest Mode)
- [ ] Click the bottle graphic or "Tap to Catch"
- [ ] Should show "Catching a bottle..." loading
- [ ] Should open chat page with a bottle
- [ ] Guest counter should decrease to "1 actions remaining"

### 4. Guest Limit Reached
- [ ] Use remaining action (throw or catch)
- [ ] After 3rd action, should see "Guest limit reached!" banner
- [ ] Try to throw another bottle
- [ ] Should show modal: "Guest Limit Reached - Sign in to continue"
- [ ] Try to catch another bottle
- [ ] Should show "Guest Limit Reached" page with sign-in option

### 5. Sign In After Limit
- [ ] Click "Sign In" button when limit reached
- [ ] Should redirect to `/auth` page
- [ ] Sign in with Google or Anonymous
- [ ] Should redirect to `/home`
- [ ] Guest limit banner should disappear
- [ ] Should be able to throw/catch unlimited bottles

### 6. Authenticated User Flow
- [ ] Sign in (Google or Anonymous)
- [ ] Should NOT see guest limit banner
- [ ] Should be able to throw bottles unlimited
- [ ] Should be able to catch bottles unlimited
- [ ] Bottles should appear in "My Collection"

### 7. Data Persistence
- [ ] Throw a bottle as guest
- [ ] Check Firebase Console → Firestore → `artifacts/default-app-id/public/data/pool_bottles`
- [ ] Should see bottle with `isGuest: true` and `senderId: "guest-{timestamp}"`
- [ ] Catch a bottle as guest
- [ ] Check Firebase Console → `artifacts/default-app-id/guests/{guestId}/inbox`
- [ ] Should see caught bottle with `isGuest: true`

### 8. Browser Console Checks
- [ ] Open DevTools Console
- [ ] Should NOT see "Demo Mode" warning (if Firebase configured)
- [ ] Should NOT see permission errors
- [ ] Check localStorage:
  - `echobottle_guest_actions` - should contain action history
  - `echobottle_guest_id` - should contain guest ID

### 9. Navigation
- [ ] Home page navigation works
- [ ] Create page navigation works
- [ ] Inbox/Collection page navigation works
- [ ] Profile page navigation works
- [ ] Bottom navigation (mobile) works
- [ ] Sidebar navigation (desktop) works

### 10. Mobile vs Desktop
- [ ] Test on mobile viewport (< 1024px)
- [ ] Test on desktop viewport (>= 1024px)
- [ ] Bottom dock should appear on mobile
- [ ] Sidebar should appear on desktop
- [ ] All features work on both views

---

## Expected Behavior

### Guest Mode (3 Actions)
- ✅ Can use app without signing in
- ✅ Can throw 3 bottles OR catch 3 bottles (total 3 actions)
- ✅ Counter shows remaining actions
- ✅ After limit, prompted to sign in
- ✅ Guest data stored separately from authenticated users

### Authenticated Mode
- ✅ Unlimited actions
- ✅ No limit banner
- ✅ Full access to all features
- ✅ Data stored in user's inbox

---

## Common Issues

1. **"Guest limit reached" but can still use app**
   - Check localStorage: `echobottle_guest_actions`
   - Verify limit check is working

2. **Actions not counting**
   - Check browser console for errors
   - Verify `recordGuestAction` is called

3. **Modal not showing**
   - Check error handling in `app/create/page.tsx`
   - Verify `GUEST_LIMIT_REACHED` error is caught

4. **Sign-in doesn't clear guest actions**
   - Check `lib/services/auth.ts` - `clearGuestActions()` should be called

