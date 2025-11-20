# 🧪 EchoBottle Testing Checklist

## Pre-Testing Setup

- [ ] Dev server is running: `npm run dev`
- [ ] Firebase Authentication is enabled (Anonymous at minimum)
- [ ] Firestore Database is created
- [ ] Security rules are published
- [ ] `.env.local` file exists with all variables

---

## ✅ Core Functionality Tests

### 1. Authentication Flow

**Test Anonymous Login:**
- [ ] Open `http://localhost:3000`
- [ ] Should see auth page with "EchoBottle" logo
- [ ] Click "Drift Anonymously"
- [ ] Should redirect to `/home`
- [ ] Check browser console - should NOT see "Demo Mode" warning
- [ ] Check Firebase Console > Authentication > Users - should see new anonymous user

**Test Google Login (if enabled):**
- [ ] Click "Continue with Google"
- [ ] Should open Google sign-in popup
- [ ] Complete sign-in
- [ ] Should redirect to `/home`

**Test Sign Out:**
- [ ] Click "Sign Out" button
- [ ] Should redirect to `/auth`
- [ ] User should be logged out

---

### 2. Home Page

**Visual Check:**
- [ ] Ocean background displays correctly
- [ ] Bottle graphic is visible and animated
- [ ] Text "The ocean keeps everyone's secrets" displays
- [ ] "Cast a Bottle" button is visible
- [ ] "My Collection" button is visible
- [ ] Navigation dock at bottom (mobile) or sidebar (web)

**Functionality:**
- [ ] Click "Tap to Catch" on bottle graphic
- [ ] Should redirect to `/catch` then `/chat` with a bottle
- [ ] Click "Cast a Bottle" button
- [ ] Should navigate to `/create`
- [ ] Click "My Collection" button
- [ ] Should navigate to `/inbox`

---

### 3. Create Page (Throw Bottle)

**Visual Check:**
- [ ] Textarea is visible and editable
- [ ] Placeholder text shows "Share a secret, a wish, or a dream..."
- [ ] Character counter shows "0/500"
- [ ] 4 mood buttons display (Melancholy, Joy, Love, Curious)
- [ ] "Throw into the Sea" button is visible

**Functionality:**
- [ ] Type a message (test with 10 characters)
- [ ] Character counter updates correctly
- [ ] Select different moods - buttons highlight when selected
- [ ] Type message longer than 500 chars - should stop at 500
- [ ] With empty message - "Throw" button should be disabled
- [ ] With message - "Throw" button should be enabled
- [ ] Click "Throw into the Sea"
- [ ] Should show "Drifting away..." animation
- [ ] Should redirect to `/home` after ~2.5 seconds
- [ ] Check Firestore: `artifacts/default-app-id/public/data/pool_bottles/`
- [ ] Should see new bottle document with your message

---

### 4. Catch Bottle Flow

**Test Catch:**
- [ ] From home, click "Tap to Catch" or navigate to `/catch`
- [ ] Should show "Catching a bottle..." loading
- [ ] Should redirect to `/chat?id={bottleId}`
- [ ] Should display the caught bottle message
- [ ] Check Firestore: `artifacts/default-app-id/users/{userId}/inbox/`
- [ ] Should see new bottle in your inbox with `unread: true`

---

### 5. Inbox Page (My Collection)

**Visual Check:**
- [ ] Header shows "Found Bottles"
- [ ] List of bottles displays (if any)
- [ ] Each bottle shows:
  - [ ] Mood icon with correct color
  - [ ] Mood label (MELANCHOLY, JOY, LOVE, CURIOUS)
  - [ ] Message content (truncated if long)
  - [ ] "Washed up" timestamp
  - [ ] Unread indicator (cyan dot) for unread bottles

**Functionality:**
- [ ] Click on an unread bottle
- [ ] Should navigate to `/chat?id={bottleId}`
- [ ] Bottle should be marked as read
- [ ] Unread indicator should disappear
- [ ] Check Firestore - `unread` field should be `false`
- [ ] Empty state: If no bottles, should show "The shore is empty today."

---

### 6. Chat Page

**Visual Check:**
- [ ] Back button is visible
- [ ] Header shows "Drifting Connection"
- [ ] Original bottle message displays in center (system message)
- [ ] Input field at bottom with "Whisper back..." placeholder
- [ ] Reply counter shows "3 left"

**Functionality:**
- [ ] Type a reply message
- [ ] Press Enter or click Send button
- [ ] Your message should appear on the right
- [ ] Reply counter should decrease (3 → 2 → 1 → 0)
- [ ] After ~2.5 seconds, bot response should appear on the left
- [ ] After 3 replies, should show "Session Ended"
- [ ] Click "Back" button
- [ ] Should return to `/inbox`

---

### 7. Profile Page

**Visual Check:**
- [ ] Header shows "My Journal"
- [ ] User avatar/icon displays
- [ ] User name shows (or "Anonymous Traveler")
- [ ] Stats show "Collected" and "Thrown" counts
- [ ] "Sent History" section displays
- [ ] "Sign Out" button is visible

**Functionality:**
- [ ] Click "Sign Out"
- [ ] Should redirect to `/auth`
- [ ] User should be logged out

---

### 8. Navigation

**Mobile Navigation (FloatingDock):**
- [ ] Dock is centered at bottom
- [ ] 4 buttons visible: Ocean, Cast, Collection, Me
- [ ] Active page button is highlighted (white background)
- [ ] Click each button - should navigate correctly
- [ ] Unread badge shows on Collection if unread bottles exist

**Web Navigation (Sidebar):**
- [ ] Sidebar visible on left (desktop view)
- [ ] Logo and "EchoBottle" title display
- [ ] 4 navigation items visible
- [ ] Active page is highlighted
- [ ] Click each item - should navigate correctly
- [ ] Unread count badge shows on "My Collection"

---

### 9. Responsive Design

**Mobile (< 1024px):**
- [ ] Layout is mobile-first
- [ ] Navigation dock at bottom
- [ ] Content fits screen width
- [ ] Touch targets are at least 44px
- [ ] Text is readable without zooming

**Tablet (768px - 1023px):**
- [ ] Layout adapts correctly
- [ ] Navigation dock still at bottom
- [ ] Content is appropriately sized

**Desktop (≥ 1024px):**
- [ ] Sidebar navigation appears
- [ ] Content area uses full width
- [ ] Ocean background displays correctly
- [ ] Hover effects work on buttons

---

### 10. Real-Time Updates

**Test Real-Time:**
- [ ] Open app in two browser windows/tabs
- [ ] In Tab 1: Throw a bottle
- [ ] In Tab 2: Catch a bottle (should see new bottle in pool)
- [ ] In Tab 1: Mark bottle as read
- [ ] In Tab 2: Inbox should update automatically (unread count decreases)

---

## 🐛 Error Handling Tests

### Network Errors:
- [ ] Disconnect internet
- [ ] Try to throw a bottle - should handle gracefully
- [ ] Try to catch a bottle - should handle gracefully
- [ ] Reconnect internet - should resume working

### Firebase Errors:
- [ ] Check console for Firebase errors
- [ ] Should NOT see "Permission denied" errors
- [ ] Should NOT see "Demo Mode" warnings (if Firebase is set up)

---

## 🔒 Security Tests

### Authentication:
- [ ] Cannot access `/home` without logging in
- [ ] Redirects to `/auth` if not authenticated
- [ ] Cannot access other users' inboxes

### Firestore Rules:
- [ ] Can read public bottle pool
- [ ] Can only read own inbox
- [ ] Can create bottles in pool (when authenticated)
- [ ] Can only update own inbox items

---

## 📊 Performance Tests

- [ ] Page loads quickly (< 3 seconds)
- [ ] Navigation is smooth (no lag)
- [ ] Animations are smooth (60fps)
- [ ] Real-time updates are instant
- [ ] No memory leaks (check with DevTools)

---

## 🌐 Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## ✅ Final Verification

- [ ] All tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Firebase Console shows data correctly
- [ ] Ready for deployment

---

## 🚀 Ready to Deploy?

Once all tests pass, you're ready to deploy! 🎉

