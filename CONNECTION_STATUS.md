# 🔌 Database Connection Status

## How to Check Your Connection Status

Your app automatically detects if it's connected to Firebase. Here's how to check:

### 1. **Visual Indicator (Auth Page)**

If you see a yellow banner at the top saying **"Demo Mode (No Backend)"**, the app is **NOT** connected to the database.

### 2. **Browser Console**

Open your browser's Developer Console (F12 or Cmd+Option+I) and check:

**✅ Connected:**
- No "Demo Mode" warnings
- No "Permission denied" errors
- Firebase initialization succeeds

**❌ NOT Connected (Demo Mode):**
- Warning: "Running in Demo Mode (No Firebase Config found)"
- Uses mock data
- Cannot save/retrieve real data

**⚠️ Partial Connection (Errors):**
- "Permission denied" → Firestore security rules issue
- "User not authenticated" → Authentication not enabled
- "Missing or insufficient permissions" → Rules not published

---

## Current Connection Status

Based on your setup, your app should be:

### ✅ **CONNECTED** if:
1. `.env.local` file exists with Firebase config
2. Firebase Authentication is enabled
3. Firestore Database is created
4. Security rules are published

### ❌ **NOT CONNECTED (Demo Mode)** if:
1. Missing `.env.local` file
2. Firebase config values are empty
3. Firebase initialization fails

### ⚠️ **CONNECTED BUT ERRORS** if:
1. Firebase initialized successfully
2. But getting permission errors
3. Authentication not working

---

## How to Verify Connection

### Method 1: Check Browser Console

1. Open your app in browser
2. Open Developer Console (F12)
3. Look for these messages:

```
✅ Good:
- Firebase initialized successfully
- No warnings about Demo Mode

❌ Bad:
- "Running in Demo Mode"
- "Permission denied"
- "User not authenticated"
```

### Method 2: Try Real Actions

1. **Throw a Bottle:**
   - Navigate to Create page
   - Write a message and throw it
   - Check Firebase Console → Firestore → Data
   - Should see bottle in `artifacts/default-app-id/public/data/pool_bottles/`

2. **Check Authentication:**
   - Try "Drift Anonymously"
   - Check Firebase Console → Authentication → Users
   - Should see new anonymous user created

---

## Common Issues

### Issue 1: "Demo Mode" Banner Shows

**Problem:** App is using mock data, not real database

**Solution:**
1. Check `.env.local` exists
2. Restart dev server: `npm run dev`
3. Verify all environment variables are set

### Issue 2: "Permission Denied" Error

**Problem:** Firestore security rules blocking access

**Solution:**
1. Go to [Firestore Rules](https://console.firebase.google.com/project/echobottle-60d27/firestore/rules)
2. Verify rules are published
3. Check rules match your code structure

### Issue 3: "User not authenticated" Error

**Problem:** Authentication not enabled

**Solution:**
1. Go to [Firebase Authentication](https://console.firebase.google.com/project/echobottle-60d27/authentication)
2. Enable "Anonymous" authentication (required)
3. Enable "Google" authentication (optional)

---

## Quick Diagnostic

Run this in your browser console to check status:

```javascript
// Check Firebase initialization
console.log('Firebase App:', window.firebase?.app);
console.log('Auth:', window.firebase?.auth);
console.log('Firestore:', window.firebase?.firestore);

// Check if authenticated
import { auth } from '@/lib/firebase';
console.log('Current User:', auth?.currentUser);
console.log('Is Demo Mode:', isDemoMode);
```

---

## Status Summary

Based on your current setup:

- ✅ **Firebase Config**: Present (in `.env.local` and hardcoded fallback)
- ❓ **Authentication**: Need to verify if enabled in Firebase Console
- ❓ **Firestore Database**: Need to verify if created
- ❓ **Security Rules**: Need to verify if published

**Next Steps:**
1. Complete Firebase setup (see `FIREBASE_SETUP_CHECKLIST.md`)
2. Enable Authentication
3. Create Firestore Database
4. Publish Security Rules

Once all steps are complete, your app will be **fully connected** to the database! 🎉

