import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Safe Mode Firebase Init - ensures UI renders even if backend config is missing (Demo Mode)
let app: FirebaseApp | undefined;
let auth: Auth | { currentUser: null };
let db: Firestore | null;
let analytics: Analytics | null = null;
let isDemoMode: boolean = false;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB52qH8KAxkOAgx-L2K5PVzR-R1-IO2XEU',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'echobottle-60d27.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'echobottle-60d27',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'echobottle-60d27.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '972400832480',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:972400832480:web:d625227282c5c7d33c8585',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-C3E7TNQ8BQ',
};

try {
  // Check if all required config values are present
  const hasConfig = 
    firebaseConfig.apiKey && 
    firebaseConfig.authDomain && 
    firebaseConfig.projectId;

  if (hasConfig) {
    // Initialize Firebase only if not already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Analytics only in browser environment
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Analytics initialization failed (this is normal in development)", e);
      }
    }
  } else {
    isDemoMode = true;
    console.warn("Running in Demo Mode (No Firebase Config found)");
    auth = { currentUser: null };
    db = null;
  }
} catch (e) {
  isDemoMode = true;
  console.error("Firebase Init Error, switching to Demo Mode", e);
  auth = { currentUser: null };
  db = null;
}

export { app, auth, db, analytics, isDemoMode };

export const appId: string = process.env.NEXT_PUBLIC_APP_ID || 'default-app-id';

