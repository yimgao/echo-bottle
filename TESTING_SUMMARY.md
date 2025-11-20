# 🧪 Testing Summary - EchoBottle App

## Quick Start Testing

### 1. Start Dev Server
```bash
npm run dev
```
Open http://localhost:3000

---

## 📋 Test Checklist

### ✅ Guest Mode (3 Actions)

1. **Access Without Sign-In**
   - [ ] Visit `/auth` page
   - [ ] Click "Continue as Guest (3 free actions)"
   - [ ] Should redirect to `/home`
   - [ ] Should see "🎁 Guest Mode: 3 actions remaining" banner

2. **Throw First Bottle (Guest)**
   - [ ] Click "Cast a Bottle"
   - [ ] Write message: "This is my first bottle as a guest"
   - [ ] Select mood (e.g., "Curious")
   - [ ] Click "Throw into the Sea"
   - [ ] Should show success animation
   - [ ] Banner should update: "🎁 Guest Mode: 2 actions remaining"

3. **Catch First Bottle (Guest)**
   - [ ] Click bottle graphic or "Tap to Catch"
   - [ ] Should show "Catching a bottle..." loading
   - [ ] Should open chat with caught bottle
   - [ ] Banner should update: "🎁 Guest Mode: 1 actions remaining"

4. **Final Action (Guest)**
   - [ ] Throw or catch one more time
   - [ ] Banner should show: "⚠️ Guest limit reached! Sign in to continue"
   - [ ] Try to throw another bottle
   - [ ] Should show modal: "Guest Limit Reached - Sign in to continue"
   - [ ] Click "Sign In" button

---

### ✅ Authentication

5. **Sign In with Google**
   - [ ] Click "Continue with Google"
   - [ ] Complete Google sign-in
   - [ ] Should redirect to `/home`
   - [ ] Guest banner should disappear
   - [ ] Can throw/catch unlimited bottles

6. **Sign In Anonymously**
   - [ ] Click "Drift Anonymously"
   - [ ] Should redirect to `/home`
   - [ ] Guest banner should disappear
   - [ ] Can throw/catch unlimited bottles

7. **Sign Out**
   - [ ] Click "Sign Out" (top right or profile)
   - [ ] Should redirect to `/auth`

---

### ✅ Core Features

8. **Throw Bottle (Authenticated)**
   - [ ] Click "Cast a Bottle"
   - [ ] Write message (up to 500 chars)
   - [ ] Character counter shows correctly (e.g., "150/500")
   - [ ] Warning at 450+ chars (amber)
   - [ ] Error at 500 chars (red pulse)
   - [ ] Select different moods
   - [ ] Click "Throw into the Sea"
   - [ ] Should show "Drifting away..." animation
   - [ ] Should redirect with success message

9. **Catch Bottle**
   - [ ] Click bottle graphic on home page
   - [ ] Should show loading screen
   - [ ] Should open chat with random bottle
   - [ ] Bottle content displays correctly
   - [ ] Mood indicator shows correctly

10. **My Collection (Inbox)**
    - [ ] Click "My Collection"
    - [ ] Should show all caught bottles
    - [ ] Unread bottles have indicator
    - [ ] Click on a bottle to open chat
    - [ ] Should mark as read after opening

11. **Chat/View Bottle**
    - [ ] Open a bottle from inbox
    - [ ] Bottle content displays correctly
    - [ ] Mood/type indicator shows
    - [ ] "Back" button works
    - [ ] Can navigate to inbox

12. **Profile Page**
    - [ ] Click "My Journal" or profile icon
    - [ ] User info displays
    - [ ] Stats show correctly (Collected, Thrown)
    - [ ] Sign Out button works

---

### ✅ Database & Persistence

13. **Check Firebase Console**
    - [ ] Go to Firebase Console → Firestore
    - [ ] Check `artifacts/default-app-id/public/data/pool_bottles`
    - [ ] Should see thrown bottles with `content`, `type`, `createdAt`, `senderId`
    - [ ] Guest bottles have `isGuest: true`
    
14. **Check User Inbox**
    - [ ] Check `artifacts/default-app-id/users/{userId}/inbox`
    - [ ] Should see caught bottles
    - [ ] Guest inbox: `artifacts/default-app-id/guests/{guestId}/inbox`

15. **Real-time Updates**
    - [ ] Throw a bottle in one browser
    - [ ] Check "My Collection" in another browser (same user)
    - [ ] Should appear in real-time (if signed in)

---

### ✅ UI/UX

16. **Mobile View (< 1024px)**
    - [ ] Bottom navigation dock appears
    - [ ] Dock buttons are centered
    - [ ] Dock doesn't overlap content (check padding)
    - [ ] All buttons are touch-friendly (min 44px)
    - [ ] Text sizes are readable

17. **Desktop View (>= 1024px)**
    - [ ] Sidebar navigation appears
    - [ ] Main content area is wider
    - [ ] Floating bottles animation shows
    - [ ] Ocean waves animation shows
    - [ ] Particle field shows

18. **Responsive Design**
    - [ ] Resize browser window
    - [ ] Layout adapts correctly
    - [ ] No horizontal scroll
    - [ ] All elements remain accessible

---

### ✅ Error Handling

19. **Network Errors**
    - [ ] Disconnect internet
    - [ ] Try to throw bottle
    - [ ] Should show error message
    - [ ] Reconnect internet
    - [ ] Should work normally

20. **Permission Errors**
    - [ ] Check browser console
    - [ ] Should NOT see "Permission denied" errors
    - [ ] If errors, check Firestore rules are published

21. **Guest Limit Errors**
    - [ ] Use all 3 guest actions
    - [ ] Try to throw 4th bottle
    - [ ] Should show limit modal (not error)
    - [ ] Click "Sign In" should redirect to auth

---

### ✅ Browser Console Checks

22. **Console Logs**
    - [ ] Open DevTools Console (F12)
    - [ ] Should NOT see "Demo Mode" warning (if Firebase configured)
    - [ ] Should NOT see "Permission denied" errors
    - [ ] Should NOT see uncaught errors

23. **LocalStorage**
    - [ ] Check localStorage:
      - `echobottle_guest_actions` - guest action history
      - `echobottle_guest_id` - guest ID
    - [ ] After sign-in, guest data should be cleared (or not matter)

---

## 🐛 Known Issues to Check

1. **Nav Overlap on Mobile**
   - [ ] Check if bottom nav overlaps content
   - [ ] Verify padding (`pb-24 sm:pb-28`) is applied

2. **Scroll on Create Page**
   - [ ] Check if scrollbar appears unnecessarily
   - [ ] Should be smooth, no overflow

3. **Available Bottles Count**
   - [ ] Home page shows count of available bottles
   - [ ] Updates every 30 seconds
   - [ ] Shows 0 when pool is empty

4. **Success/Error Messages**
   - [ ] After throwing bottle, success message appears
   - [ ] After error, error message appears
   - [ ] Messages auto-dismiss after 3 seconds

---

## ✅ Expected Results

### Guest Mode Flow
1. ✅ Can use app without signing in
2. ✅ 3 actions allowed (throw or catch)
3. ✅ Counter updates in real-time
4. ✅ After limit, prompted to sign in
5. ✅ Sign-in clears limit

### Authenticated Flow
1. ✅ Unlimited actions
2. ✅ Full access to all features
3. ✅ Real-time inbox updates
4. ✅ Data persists across sessions

---

## 📝 Test Results Template

```
Date: [Date]
Tester: [Your Name]
Environment: [Dev/Staging/Prod]

Guest Mode: ✅ Pass / ❌ Fail
Authentication: ✅ Pass / ❌ Fail
Throwing Bottles: ✅ Pass / ❌ Fail
Catching Bottles: ✅ Pass / ❌ Fail
Database: ✅ Pass / ❌ Fail
UI/UX: ✅ Pass / ❌ Fail
Mobile: ✅ Pass / ❌ Fail
Desktop: ✅ Pass / ❌ Fail

Issues Found:
- [List any issues]

Notes:
[Any additional notes]
```

