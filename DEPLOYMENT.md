# EchoBottle Deployment Guide

This guide covers how to deploy EchoBottle and set up Firebase (Database & Authentication).

## Table of Contents

1. [Firebase Setup](#firebase-setup)
2. [Local Development](#local-development)
3. [Deploying to Vercel](#deploying-to-vercel)
4. [Deploying with Docker](#deploying-with-docker)
5. [Environment Variables](#environment-variables)

---

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., `echobottle`)
4. Disable Google Analytics (optional) or enable if needed
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Get Started**
2. Enable **Anonymous** authentication:
   - Click on **"Anonymous"**
   - Toggle it **ON**
   - Click **Save**

3. (Optional) Enable **Google** authentication:
   - Click on **"Google"**
   - Toggle it **ON**
   - Enter a support email
   - Click **Save**

### Step 3: Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **"Create database"**
3. Choose **"Start in production mode"** (you can add security rules later)
4. Select a location closest to your users
5. Click **"Enable"**

### Step 4: Set Up Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // App ID pattern
    match /artifacts/{appId} {
      // Public bottle pool - anyone can read/write
      match /public/data/pool_bottles/{bottleId} {
        allow read: if true;
        allow create: if request.auth != null;
      }
      
      // User inbox - only the user can read their own inbox
      match /users/{userId}/inbox/{bottleId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow create: if request.auth != null && request.auth.uid == userId;
        allow update: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **"Publish"**

### Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon) > **General** tab
2. Scroll down to **"Your apps"**
3. Click **Web icon** (`</>`) to add a web app
4. Register app with a nickname (e.g., "EchoBottle Web")
5. Copy the `firebaseConfig` object

The config looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Step 6: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
cp .env.local.example .env.local
```

Then fill in your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_APP_ID=default-app-id
```

---

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Firebase config
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Demo Mode

If you don't set up Firebase, the app will run in **Demo Mode** with mock data. This is useful for UI development without a backend.

---

## Deploying to Vercel

Vercel is the recommended platform for Next.js applications.

### Step 1: Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket

2. Make sure `.env.local` is in `.gitignore` (it should be by default)

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
   vercel env add NEXT_PUBLIC_APP_ID
   ```

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in

2. Click **"Add New Project"**

3. Import your Git repository

4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables:**
   - Go to **Settings** > **Environment Variables**
   - Add each variable from your `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `NEXT_PUBLIC_APP_ID`

6. Click **"Deploy"**

7. Your app will be live at `https://your-project.vercel.app`

### Step 3: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to **Settings** > **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Deploying with Docker

### Step 1: Build the Docker Image

```bash
docker build -t echobottle .
```

### Step 2: Run the Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \
  -e NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id \
  -e NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket \
  -e NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id \
  -e NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id \
  -e NEXT_PUBLIC_APP_ID=default-app-id \
  echobottle
```

### Step 3: Using Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  echobottle:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
      - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
      - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
      - NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
      - NEXT_PUBLIC_APP_ID=${NEXT_PUBLIC_APP_ID}
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

### Deploying to Cloud Platforms

#### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/echobottle

# Deploy to Cloud Run
gcloud run deploy echobottle \
  --image gcr.io/YOUR_PROJECT_ID/echobottle \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=..."
```

#### AWS ECS/Fargate

Use AWS ECR to store images and ECS to run containers. Configure environment variables in task definitions.

#### Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name echobottle \
  --image echobottle:latest \
  --dns-name-label echobottle \
  --ports 3000 \
  --environment-variables \
    NEXT_PUBLIC_FIREBASE_API_KEY=... \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
```

---

## Environment Variables

All environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in these variables.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `my-project` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage Bucket | `project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:123:web:abc` |
| `NEXT_PUBLIC_APP_ID` | App ID for Firestore collections | `default-app-id` |

### Optional Variables

- Leave variables empty to run in **Demo Mode** (no backend required)

---

## Troubleshooting

### Firebase Authentication Not Working

1. Check that Anonymous auth is enabled in Firebase Console
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Ensure Firestore rules allow authenticated users

### Firestore Permission Denied

1. Go to Firebase Console > Firestore > Rules
2. Verify rules match the template above
3. Check that users are authenticated before accessing collections

### Environment Variables Not Loading

1. Make sure variables start with `NEXT_PUBLIC_`
2. Restart the development server after changing `.env.local`
3. In production, verify variables are set in deployment platform

### Build Errors

1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node.js version (requires 18+)

---

## Next Steps

- Set up custom domain
- Configure Firebase Storage (if needed for future features)
- Set up Firebase Functions for server-side logic
- Enable Firebase Analytics
- Set up CI/CD pipelines

---

## Support

For issues or questions:
- Check Firebase documentation: https://firebase.google.com/docs
- Check Next.js documentation: https://nextjs.org/docs
- Review the code in `lib/firebase.js` and `lib/services/`

