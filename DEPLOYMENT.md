# 🚀 EchoBottle Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your repository: `yimgao/echo-bottle`
4. Vercel will auto-detect Next.js configuration

### Step 2: Configure Environment Variables

In Vercel dashboard, add these environment variables:

```bash
# Firebase Configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB52qH8KAxkOAgx-L2K5PVzR-R1-IO2XEU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=echobottle-60d27.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=echobottle-60d27
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=echobottle-60d27.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972400832480
NEXT_PUBLIC_FIREBASE_APP_ID=1:972400832480:web:d625227282c5c7d33c8585
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-C3E7TNQ8BQ

# App Configuration
NEXT_PUBLIC_APP_ID=default-app-id
```

**Where to find Firebase values:**
- Go to: [Firebase Console](https://console.firebase.google.com/)
- Select your project: `echobottle-60d27`
- Go to: Project Settings → General → Your apps → Web app
- Copy the configuration values

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://echo-bottle-xxx.vercel.app`

---

## 🔄 Automatic Deployments

Once connected, Vercel will automatically:
- ✅ Deploy every push to `main` branch
- ✅ Create preview deployments for PRs
- ✅ Rebuild on environment variable changes

---

## 🌍 Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `echobottle.app`)
3. Update DNS records as instructed
4. SSL certificate auto-configured

---

## 📊 Monitoring & Analytics

Vercel provides:
- Real-time logs
- Performance metrics
- Error tracking
- Analytics dashboard

Access at: `https://vercel.com/your-username/echo-bottle`

---

## 🐛 Troubleshooting

### Build Failed?
- Check environment variables are set correctly
- Ensure Firebase project ID matches
- Check build logs in Vercel dashboard

### Firebase Connection Issues?
1. Verify Firebase rules are deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Check Firebase project is active
3. Verify API keys in environment variables

### App Shows "Demo Mode"?
- Environment variables not set correctly
- Redeploy after setting variables

---

## 🔥 Firebase Setup Checklist

- [x] Firestore database created
- [x] Authentication enabled (Anonymous + Email/Google)
- [x] Security rules deployed
- [ ] Authorized domains added (add your Vercel domain)
  - Go to: Authentication → Settings → Authorized domains
  - Add: `your-app.vercel.app`

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | ⚠️ | Firebase analytics (optional) |
| `NEXT_PUBLIC_APP_ID` | ✅ | App identifier for Firestore |

---

## 🎉 Post-Deployment

After deployment:

1. **Test the app** at your Vercel URL
2. **Add Vercel domain to Firebase** authorized domains
3. **Test guest mode**: Try throwing and catching bottles
4. **Test auth flow**: Sign up with email
5. **Monitor logs**: Check Vercel and Firebase consoles

---

## 💡 Pro Tips

- Use Vercel's **Preview Deployments** for testing
- Enable **Analytics** in Vercel dashboard
- Set up **Custom Domain** for production
- Use **Environment Groups** for staging/prod
- Enable **Automatic HTTPS** (default)

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

**Ready to deploy?** 🚀

Click here: [Import to Vercel](https://vercel.com/import/git?s=https://github.com/yimgao/echo-bottle)
