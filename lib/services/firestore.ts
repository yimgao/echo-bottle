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
  setDoc,
  increment
} from 'firebase/firestore';
import { db, appId, isDemoMode } from '../firebase';
import { auth } from '../firebase';
import { SYSTEM_BOTTLES } from '@/constants/moods';
import { recordGuestAction, getGuestStatus } from './guest';
import type { Bottle, BottlesCallback, Unsubscribe } from '@/types';
import type { MoodType } from '@/types';

const USER_DAILY_LIMIT = 10;

const checkAndIncrementUserLimit = async (userId: string): Promise<void> => {
  if (isDemoMode || !db) {
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, 'artifacts', appId, 'users', userId, 'daily_stats', today);
  const statsSnap = await getDoc(statsRef);
  const data = statsSnap.data() as { count?: number } | undefined;
  const currentCount = data?.count ?? 0;

  if (currentCount >= USER_DAILY_LIMIT) {
    throw new Error('USER_LIMIT_REACHED');
  }

  await setDoc(statsRef, {
    count: increment(1),
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const subscribeToInbox = (userId: string, callback: BottlesCallback): Unsubscribe => {
  if (isDemoMode || !db) {
    callback(SYSTEM_BOTTLES as Bottle[]);
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
  }, (error) => {
    console.error("Data fetch error:", error);
    callback([]);
  });
};

export const sendBottle = async (text: string, mood: MoodType): Promise<void> => {
  if (isDemoMode || !db) {
    return Promise.resolve();
  }

  // Check if user is authenticated
  const isAuthenticated = auth && 'currentUser' in auth && auth.currentUser;
  
  if (!isAuthenticated) {
    const statusBefore = getGuestStatus();
    
    if (statusBefore.hasReachedLimit) {
      throw new Error('GUEST_THROW_LIMIT_REACHED');
    }
    
    const recorded = recordGuestAction('throw');
    if (!recorded) {
      throw new Error('GUEST_THROW_LIMIT_REACHED');
    }
  } else {
    const userId = (auth as any).currentUser.uid;
    await checkAndIncrementUserLimit(userId);
  }

  // Use guest ID if not authenticated
  const senderId = isAuthenticated 
    ? (auth as any).currentUser.uid 
    : `guest-${typeof window !== 'undefined' ? localStorage.getItem('echobottle_guest_id') || Date.now() : Date.now()}`;

  // Save guest ID for future use
  if (!isAuthenticated && typeof window !== 'undefined') {
    if (!localStorage.getItem('echobottle_guest_id')) {
      localStorage.setItem('echobottle_guest_id', senderId);
    }
  }

  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles'), {
    content: text,
    type: mood,
    createdAt: serverTimestamp(),
    senderId: senderId,
    isGuest: !isAuthenticated
  });
};

export const catchBottle = async (): Promise<Bottle> => {
  if (isDemoMode || !db) {
    const pickedBottle = SYSTEM_BOTTLES[Math.floor(Math.random() * SYSTEM_BOTTLES.length)];
    return {
      id: Date.now().toString(),
      content: pickedBottle.content,
      type: pickedBottle.type,
      createdAt: { seconds: Date.now() / 1000 },
      unread: true
    };
  }

  // Check if user is authenticated
  const isAuthenticated = auth && 'currentUser' in auth && auth.currentUser;
  
  if (!isAuthenticated) {
    const statusBefore = getGuestStatus();
    
    if (statusBefore.hasReachedLimit) {
      throw new Error('GUEST_CATCH_LIMIT_REACHED');
    }
    
    const recorded = recordGuestAction('catch');
    if (!recorded) {
      throw new Error('GUEST_CATCH_LIMIT_REACHED');
    }
  } else {
    const userId = (auth as any).currentUser.uid;
    await checkAndIncrementUserLimit(userId);
  }

  // Use guest ID or user ID
  const userId = isAuthenticated 
    ? (auth as any).currentUser.uid 
    : `guest-${typeof window !== 'undefined' ? localStorage.getItem('echobottle_guest_id') || Date.now() : Date.now()}`;

  // Save guest ID for future use
  if (!isAuthenticated && typeof window !== 'undefined') {
    if (!localStorage.getItem('echobottle_guest_id')) {
      localStorage.setItem('echobottle_guest_id', userId);
    }
  }

  try {
    const poolRef = collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles');
    const q = query(poolRef, orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    
    let pickedBottle: any;
    
    if (!snapshot.empty) {
      const othersBottles = snapshot.docs
        .map(d => d.data())
        .filter(b => b.senderId !== userId);
      
      if (othersBottles.length > 0) {
        pickedBottle = othersBottles[Math.floor(Math.random() * othersBottles.length)];
      }
    }
    
    if (!pickedBottle) {
      pickedBottle = SYSTEM_BOTTLES[Math.floor(Math.random() * SYSTEM_BOTTLES.length)];
    }

    // Store in inbox (use guest inbox if not authenticated)
    const inboxPath = isAuthenticated
      ? collection(db, 'artifacts', appId, 'users', userId, 'inbox')
      : collection(db, 'artifacts', appId, 'guests', userId, 'inbox');

    const newDocRef = await addDoc(inboxPath, {
      content: pickedBottle.content,
      type: pickedBottle.type,
      createdAt: serverTimestamp(),
      unread: true,
      isGuest: !isAuthenticated
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

export const markBottleAsRead = async (userId: string, bottleId: string): Promise<void> => {
  if (isDemoMode || !db) {
    return Promise.resolve();
  }
  
  const docRef = doc(db, 'artifacts', appId, 'users', userId, 'inbox', bottleId);
  await updateDoc(docRef, { unread: false });
};

export const getAvailableBottlesCount = async (): Promise<number> => {
  if (isDemoMode || !db) {
    return 5; // Mock count for demo mode
  }

  if (!auth || (auth && 'currentUser' in auth && !auth.currentUser)) {
    return 0;
  }

  try {
    const poolRef = collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles');
    const q = query(poolRef, orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return 0;
    }

    // Filter out user's own bottles
    const othersBottles = snapshot.docs.filter(
      d => d.data().senderId !== (auth as any).currentUser.uid
    );
    
    return othersBottles.length;
  } catch (e) {
    console.error("Error getting bottles count:", e);
    return 0;
  }
};

