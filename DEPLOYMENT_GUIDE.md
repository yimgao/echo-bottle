# 🚀 EchoBottle Deployment Guide

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] All tests pass (see `TESTING_CHECKLIST.md`)
- [ ] Firebase Authentication is enabled
- [ ] Firestore Database is created
- [ ] Security rules are published
- [ ] `.env.local` is NOT committed (it's in `.gitignore`)
- [ ] No console errors
- [ ] Build succeeds locally

---

## 🧪 Step 1: Test Locally First

### Run Tests:

```bash
# 1. Start dev server
npm run dev

# 2. Test in browser: http://localhost:3000
# Follow the TESTING_CHECKLIST.md

# 3. Test build locally
npm run build:firebase

# 4. Check for build errors
# Should see: "Export successful. Exported to: out"
```

### Verify Build Output:

```bash
# Check the output directory
ls -la out/

# Should see:
# - index.html
# - _next/ (with static files)
# - Other assets
```

---

## 🔧 Step 2: Configure Environment Variables for Production

### Option A: Firebase Hosting (Recommended)

Firebase Hosting doesn't support `.env` files directly. You have two options:

**Option 1: Use Hardcoded Values (Current Setup)**
- ✅ Already configured in `lib/firebase.ts`
- ✅ Works out of the box
- ⚠️ Values are visible in client-side code (this is normal for Firebase)

**Option 2: Use Firebase Functions (Advanced)**
- More secure but requires Cloud Functions setup
- Not needed for this app since Firebase config is public anyway

### Option B: Other Platforms (Vercel, Netlify, etc.)

Add environment variables in your platform's dashboard:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_APP_ID`

---

## 🔥 Step 3: Deploy to Firebase Hosting

### Prerequisites:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init
   ```
   - Select: Hosting
   - Use existing project: `echobottle-60d27`
   - Public directory: `out`
   - Configure as single-page app: Yes
   - Set up automatic builds: No

### Deploy:

```bash
# Build and deploy in one command
npm run firebase:deploy

# Or step by step:
npm run build:firebase
firebase deploy --only hosting
```

### Deploy Firestore Rules (if updated):

```bash
npm run firebase:rules
```

---

## 🌐 Step 4: Verify Deployment

After deployment, you'll get URLs like:
- **Production URL**: `https://echobottle-60d27.web.app`
- **Custom Domain**: `https://echobottle-60d27.firebaseapp.com`

### Test Deployed Site:

1. **Open the URL** in a browser
2. **Test Authentication:**
   - Try anonymous login
   - Should work without "Demo Mode"
3. **Test Core Features:**
   - Throw a bottle
   - Catch a bottle
   - View inbox
   - Check real-time updates
4. **Check Console:**
   - Open DevTools
   - Should NOT see errors
   - Should NOT see "Demo Mode" warnings

---

## 🔄 Step 5: Update Firebase Console

### Update Authorized Domains:

1. Go to [Firebase Console > Authentication > Settings](https://console.firebase.google.com/project/echobottle-60d27/authentication/settings)
2. Scroll to "Authorized domains"
3. Your Firebase domain should already be there
4. If using custom domain, add it here

---

## 📊 Step 6: Monitor Deployment

### Check Firebase Hosting:

1. Go to [Firebase Console > Hosting](https://console.firebase.google.com/project/echobottle-60d27/hosting)
2. Should see your deployment
3. Check deployment history
4. View analytics (if enabled)

### Check Firestore:

1. Go to [Firestore Database](https://console.firebase.google.com/project/echobottle-60d27/firestore)
2. Verify data structure:
   - `artifacts/default-app-id/public/data/pool_bottles/`
   - `artifacts/default-app-id/users/{userId}/inbox/`

---

## 🎯 Deployment Commands Summary

```bash
# Test build locally
npm run build:firebase

# Deploy to Firebase Hosting
npm run firebase:deploy

# Deploy Firestore rules only
npm run firebase:rules

# View deployment logs
firebase hosting:channel:list
```

---

## 🐛 Troubleshooting

### Build Fails:

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf .next out node_modules
npm install
npm run build:firebase
```

**Error: "Type errors"**
```bash
# Check TypeScript
npm run lint
# Fix any errors before building
```

### Deployment Fails:

**Error: "Permission denied"**
```bash
# Re-login to Firebase
firebase logout
firebase login
```

**Error: "Project not found"**
```bash
# Check .firebaserc file
cat .firebaserc
# Should show: "default": "echobottle-60d27"
```

### Site Not Working After Deployment:

1. **Check Firebase Console:**
   - Verify hosting deployment succeeded
   - Check for errors in logs

2. **Check Browser Console:**
   - Open DevTools
   - Look for errors
   - Check network tab

3. **Clear Cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

4. **Check Environment Variables:**
   - Verify Firebase config is correct
   - Check if "Demo Mode" is showing (means config issue)

---

## 🔐 Security Checklist

Before going live:

- [ ] Firestore security rules are published
- [ ] Authentication is properly configured
- [ ] No sensitive data in client code
- [ ] HTTPS is enabled (automatic with Firebase Hosting)
- [ ] CORS is configured (if needed)

---

## 📈 Post-Deployment

### Enable Analytics:

Analytics is already configured and will work automatically in production.

### Monitor Usage:

1. **Firebase Console > Analytics**
   - View user engagement
   - Track events
   - Monitor performance

2. **Firestore Usage:**
   - Monitor read/write operations
   - Check quota limits (Spark plan has limits)

### Set Up Custom Domain (Optional):

1. Go to [Firebase Hosting > Custom Domain](https://console.firebase.google.com/project/echobottle-60d27/hosting)
2. Add your domain
3. Follow DNS setup instructions
4. SSL certificate is automatic

---

## 🎉 Success!

Your app is now live! 🚀

**Production URL:** `https://echobottle-60d27.web.app`

---

## 🔄 Future Updates

To update your deployed app:

```bash
# Make your changes
# Test locally
npm run dev

# Build and deploy
npm run firebase:deploy
```

That's it! Your changes will be live in minutes.

---

## 📝 Notes

- **Free Tier Limits (Spark Plan):**
  - 50K reads/day
  - 20K writes/day
  - 20K deletes/day
  - 1GB storage
  - 10GB/month bandwidth

- **Upgrade to Blaze Plan:**
  - If you exceed free tier limits
  - Pay-as-you-go pricing
  - More features available

---

**Ready to deploy?** Follow the steps above! 🚀

