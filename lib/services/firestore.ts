'use client';

import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  getDocs, 
  limit,
  getDoc,
  increment,
  runTransaction,
  where
} from 'firebase/firestore';
import { db, appId, isDemoMode } from '../firebase';
import { SYSTEM_BOTTLES } from '@/constants/moods';
import type { Bottle, BottlesCallback, Unsubscribe } from '@/types';
import type { MoodType } from '@/types';

// Daily limits for all users (including anonymous)
const USER_DAILY_LIMIT = 10;
const GUEST_DAILY_LIMIT = 3; // For anonymous users

/**
 * Check if user is anonymous (guest) based on Firebase Auth
 * Anonymous users get a lower limit (3 vs 10)
 */
const getUserLimit = (isAnonymous: boolean): number => {
  return isAnonymous ? GUEST_DAILY_LIMIT : USER_DAILY_LIMIT;
};

/**
 * Atomically check and increment user's THROW limit using a transaction.
 * Separate from catch limit - users can throw 3 times AND catch 3 times per day.
 * 
 * @param userId - Firebase Auth UID (works for both authenticated and anonymous users)
 * @param isAnonymous - Whether the user is anonymous (guest)
 * @throws Error with code 'USER_LIMIT_REACHED' or 'GUEST_LIMIT_REACHED'
 */
const checkAndIncrementThrowLimit = async (userId: string, isAnonymous: boolean): Promise<void> => {
  if (isDemoMode || !db) {
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, 'artifacts', appId, 'users', userId, 'daily_stats', today);
  const dailyLimit = getUserLimit(isAnonymous);

  console.log('[Throw Limit] Starting check for user:', userId, 'isAnonymous:', isAnonymous, 'dailyLimit:', dailyLimit);

  try {
    await runTransaction(db, async (transaction) => {
      const statsSnap = await transaction.get(statsRef);
      const data = statsSnap.data() as { throwCount?: number } | undefined;
      const currentCount = data?.throwCount ?? 0;

      console.log('[Throw Limit] Current throw count:', currentCount, 'Limit:', dailyLimit);

      if (currentCount >= dailyLimit) {
        console.log('[Throw Limit] Throw limit reached! Throwing error');
        throw new Error(isAnonymous ? 'GUEST_LIMIT_REACHED' : 'USER_LIMIT_REACHED');
      }

      console.log('[Throw Limit] Incrementing throw count from', currentCount, 'to', currentCount + 1);
      transaction.set(statsRef, {
        throwCount: increment(1),
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
    
    console.log('[Throw Limit] Transaction completed successfully');
  } catch (error: any) {
    console.error('[Throw Limit] Error occurred:', error);
    
    // Only re-throw if it's a limit error, otherwise throw the original error
    if (error.message?.includes('LIMIT_REACHED')) {
      throw error;
    }
    
    // Re-throw the original error for debugging
    throw error;
  }
};

/**
 * Atomically check and increment user's CATCH limit using a transaction.
 * Separate from throw limit - users can throw 3 times AND catch 3 times per day.
 * 
 * @param userId - Firebase Auth UID (works for both authenticated and anonymous users)
 * @param isAnonymous - Whether the user is anonymous (guest)
 * @throws Error with code 'USER_LIMIT_REACHED' or 'GUEST_LIMIT_REACHED'
 */
const checkAndIncrementCatchLimit = async (userId: string, isAnonymous: boolean): Promise<void> => {
  if (isDemoMode || !db) {
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, 'artifacts', appId, 'users', userId, 'daily_stats', today);
  const dailyLimit = getUserLimit(isAnonymous);

  console.log('[Catch Limit] Starting check for user:', userId, 'isAnonymous:', isAnonymous, 'dailyLimit:', dailyLimit);

  try {
    await runTransaction(db, async (transaction) => {
      const statsSnap = await transaction.get(statsRef);
      const data = statsSnap.data() as { catchCount?: number } | undefined;
      const currentCount = data?.catchCount ?? 0;

      console.log('[Catch Limit] Current catch count:', currentCount, 'Limit:', dailyLimit);

      if (currentCount >= dailyLimit) {
        console.log('[Catch Limit] Catch limit reached! Throwing error');
        throw new Error(isAnonymous ? 'GUEST_LIMIT_REACHED' : 'USER_LIMIT_REACHED');
      }

      console.log('[Catch Limit] Incrementing catch count from', currentCount, 'to', currentCount + 1);
      transaction.set(statsRef, {
        catchCount: increment(1),
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
    
    console.log('[Catch Limit] Transaction completed successfully');
  } catch (error: any) {
    console.error('[Catch Limit] Error occurred:', error);
    
    // Only re-throw if it's a limit error, otherwise throw the original error
    if (error.message?.includes('LIMIT_REACHED')) {
      throw error;
    }
    
    // Re-throw the original error for debugging
    throw error;
  }
};

/**
 * Subscribe to a user's inbox for real-time updates.
 * Works for both authenticated and anonymous users.
 * 
 * @param userId - Firebase Auth UID
 * @param callback - Function to call with updated bottles list
 * @returns Unsubscribe function
 */
export const subscribeToInbox = (userId: string, callback: BottlesCallback): Unsubscribe => {
  if (isDemoMode || !db) {
    callback(SYSTEM_BOTTLES as Bottle[]);
    return () => {};
  }

  // Don't subscribe if userId is invalid or doesn't match current auth user
  if (!userId || userId === 'demo-user') {
    console.warn('[subscribeToInbox] Invalid userId, returning empty array');
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'artifacts', appId, 'users', userId, 'inbox'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const bottles: Bottle[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Bottle));
    callback(bottles);
  }, (error: any) => {
    // Handle permission errors gracefully
    if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.code === 'permission-denied') {
      console.warn("Permission denied for inbox subscription. User may have signed out or userId doesn't match auth.uid.");
      callback([]);
      return;
    }
    console.error("Data fetch error:", error);
    callback([]);
  });
};

/**
 * Send a bottle to the public pool.
 * All users (authenticated and anonymous) must be logged in via Firebase Auth.
 * Users can throw 3 bottles per day (separate from catch limit).
 * 
 * @param userId - Firebase Auth UID
 * @param isAnonymous - Whether the user is anonymous (guest)
 * @param text - Message content
 * @param mood - Mood type
 * @throws Error with code 'USER_LIMIT_REACHED' or 'GUEST_LIMIT_REACHED' if limit exceeded
 * @throws Error with code 'AUTH_REQUIRED' if no userId provided
 */
export const sendBottle = async (
  userId: string | null,
  isAnonymous: boolean,
  text: string,
  mood: MoodType
): Promise<void> => {
  if (isDemoMode || !db) {
    return Promise.resolve();
  }

  if (!userId) {
    throw new Error('AUTH_REQUIRED');
  }

  // Check and increment THROW limit atomically (separate from catch)
  await checkAndIncrementThrowLimit(userId, isAnonymous);

  // Add to public pool
  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles'), {
    content: text,
    type: mood,
    createdAt: serverTimestamp(),
    senderId: userId
  });
};

/**
 * Catch a random bottle from the public pool.
 * Fetches a larger pool of bottles for better randomization.
 * Users can catch 3 bottles per day (separate from throw limit).
 * 
 * @param userId - Firebase Auth UID
 * @param isAnonymous - Whether the user is anonymous (guest)
 * @throws Error with code 'USER_LIMIT_REACHED' or 'GUEST_LIMIT_REACHED' if limit exceeded
 * @throws Error with code 'AUTH_REQUIRED' if no userId provided
 */
export const catchBottle = async (userId: string | null, isAnonymous: boolean): Promise<Bottle> => {
  if (isDemoMode || !db) {
    const pickedBottle = SYSTEM_BOTTLES[Math.floor(Math.random() * SYSTEM_BOTTLES.length)];
    return {
      id: crypto.randomUUID(),
      content: pickedBottle.content,
      type: pickedBottle.type,
      createdAt: { seconds: Date.now() / 1000 },
      unread: true
    };
  }

  if (!userId) {
    throw new Error('AUTH_REQUIRED');
  }

  // Check and increment CATCH limit atomically (separate from throw)
  await checkAndIncrementCatchLimit(userId, isAnonymous);

  try {
    const poolRef = collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles');
    // Fetch more bottles for better randomization (100 instead of 20)
    const q = query(poolRef, orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    
    let pickedBottle: any;
    
    if (!snapshot.empty) {
      // Filter out user's own bottles
      const othersBottles = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter((b: any) => b.senderId !== userId);
      
      if (othersBottles.length > 0) {
        // Pick a random bottle from the available pool
        pickedBottle = othersBottles[Math.floor(Math.random() * othersBottles.length)];
      }
    }
    
    // Fallback to system bottles if no bottles available
    if (!pickedBottle) {
      const systemBottle = SYSTEM_BOTTLES[Math.floor(Math.random() * SYSTEM_BOTTLES.length)];
      pickedBottle = {
        content: systemBottle.content,
        type: systemBottle.type
      };
    }

    // Store in user's inbox (works for both authenticated and anonymous users)
    const inboxRef = collection(db, 'artifacts', appId, 'users', userId, 'inbox');
    const newDocRef = await addDoc(inboxRef, {
      content: pickedBottle.content,
      type: pickedBottle.type,
      createdAt: serverTimestamp(),
      unread: true
    });

    return {
      id: newDocRef.id,
      content: pickedBottle.content,
      type: pickedBottle.type,
      createdAt: { seconds: Date.now() / 1000 },
      unread: true
    };
  } catch (e) {
    console.error("Catch error:", e);
    throw e;
  }
};

/**
 * Mark a bottle as read in the user's inbox.
 * 
 * @param userId - Firebase Auth UID
 * @param bottleId - Bottle document ID
 */
export const markBottleAsRead = async (userId: string, bottleId: string): Promise<void> => {
  if (isDemoMode || !db) {
    return Promise.resolve();
  }
  
  const docRef = doc(db, 'artifacts', appId, 'users', userId, 'inbox', bottleId);
  await updateDoc(docRef, { unread: false });
};

/**
 * Get count of available bottles in the pool (excluding user's own bottles).
 * Uses a simpler query to avoid complex index requirements.
 * 
 * @param userId - Firebase Auth UID (null if not authenticated)
 * @returns Count of available bottles
 */
export const getAvailableBottlesCount = async (userId: string | null): Promise<number> => {
  if (isDemoMode || !db) {
    return 5; // Mock count for demo mode
  }

  if (!userId) {
    return 0;
  }

  try {
    const poolRef = collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles');
    // Simplified query: just get recent bottles and filter client-side
    // This avoids the complex composite index requirement
    const q = query(
      poolRef,
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    
    // Filter out user's own bottles client-side
    const availableBottles = snapshot.docs.filter(
      doc => doc.data().senderId !== userId
    );
    
    return availableBottles.length;
  } catch (e: any) {
    // If index error, return a fallback count
    if (e?.code === 'failed-precondition' || e?.message?.includes('index')) {
      console.warn("Index not ready, returning estimated count");
      return 5; // Fallback estimate
    }
    console.error("Error getting bottles count:", e);
    return 0;
  }
};

/**
 * Count total bottles sent by a user.
 * 
 * @param userId - Firebase Auth UID
 * @returns Count of bottles sent
 */
export const countUserSentBottles = async (userId: string): Promise<number> => {
  if (isDemoMode || !db) {
    return 0;
  }

  try {
    const poolRef = collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles');
    const q = query(poolRef, where('senderId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.size;
  } catch (e) {
    console.error("Error counting user sent bottles:", e);
    return 0;
  }
};

/**
 * Get user's remaining actions for today.
 * Returns the number of actions remaining based on their daily limit.
 * 
 * @param userId - Firebase Auth UID
 * @param isAnonymous - Whether the user is anonymous (guest)
 * @returns Object with actions used, limit, and remaining
 */
export const getUserDailyStatus = async (
  userId: string | null,
  isAnonymous: boolean
): Promise<{ 
  throwUsed: number; 
  throwLimit: number; 
  throwRemaining: number; 
  catchUsed: number;
  catchLimit: number;
  catchRemaining: number;
  // Legacy fields for backward compatibility
  used: number; 
  limit: number; 
  remaining: number; 
  hasReachedLimit: boolean;
}> => {
  const limit = getUserLimit(isAnonymous);
  
  if (isDemoMode || !db || !userId) {
    return { 
      throwUsed: 0, 
      throwLimit: limit, 
      throwRemaining: limit,
      catchUsed: 0,
      catchLimit: limit,
      catchRemaining: limit,
      used: 0, 
      limit: limit, 
      remaining: limit, 
      hasReachedLimit: false 
    };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const statsRef = doc(db, 'artifacts', appId, 'users', userId, 'daily_stats', today);
    const statsSnap = await getDoc(statsRef);
    const data = statsSnap.data() as { throwCount?: number; catchCount?: number } | undefined;
    
    const throwUsed = data?.throwCount ?? 0;
    const catchUsed = data?.catchCount ?? 0;
    const throwRemaining = Math.max(0, limit - throwUsed);
    const catchRemaining = Math.max(0, limit - catchUsed);
    
    // Legacy: total combined
    const totalUsed = throwUsed + catchUsed;
    const totalRemaining = throwRemaining + catchRemaining;
    const hasReachedLimit = throwUsed >= limit && catchUsed >= limit;

    return { 
      throwUsed, 
      throwLimit: limit, 
      throwRemaining,
      catchUsed,
      catchLimit: limit,
      catchRemaining,
      used: totalUsed, 
      limit: limit * 2, // Total limit is now 6 (3 throw + 3 catch)
      remaining: totalRemaining, 
      hasReachedLimit 
    };
  } catch (e) {
    console.error("Error getting user daily status:", e);
    return { 
      throwUsed: 0, 
      throwLimit: limit, 
      throwRemaining: limit,
      catchUsed: 0,
      catchLimit: limit,
      catchRemaining: limit,
      used: 0, 
      limit: limit * 2, 
      remaining: limit * 2, 
      hasReachedLimit: false 
    };
  }
};

