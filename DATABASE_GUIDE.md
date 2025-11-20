# 🗄️ EchoBottle Database Guide

## 📊 Database Overview

Your app uses **Firebase Firestore** (NoSQL database) to store messages (bottles) and user data.

---

## 🔌 How Database Connects

### 1. **Initialization** (`lib/firebase.ts`)

```typescript
// Step 1: Firebase config (from environment or hardcoded)
const firebaseConfig = {
  apiKey: "...",
  authDomain: "echobottle-60d27.firebaseapp.com",
  projectId: "echobottle-60d27",
  // ... other config
};

// Step 2: Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Step 3: Get Firestore Database instance
const db = getFirestore(app);
```

**Connection Flow:**
```
Your App → Firebase SDK → Firestore Cloud Database
```

---

## 📁 Database Structure

Your Firestore database is organized like this:

```
Firestore Database
└── artifacts/
    └── {appId}/                    # "default-app-id" or custom
        ├── public/
        │   └── data/
        │       └── pool_bottles/   # 🏊 Public message pool
        │           └── {bottleId}  # Individual bottles
        │               ├── content: "Message text..."
        │               ├── type: "sad" | "happy" | "love" | "talk"
        │               ├── createdAt: Timestamp
        │               └── senderId: "user-123"
        │
        └── users/
            └── {userId}/            # Each user's data
                └── inbox/          # 📬 User's collected bottles
                    └── {bottleId}  # Individual received bottles
                        ├── content: "Message text..."
                        ├── type: "sad" | "happy" | "love" | "talk"
                        ├── createdAt: Timestamp
                        └── unread: true/false
```

---

## 🗂️ Collections Explained

### 1. **Public Bottle Pool** (`pool_bottles`)

**Path:** `artifacts/{appId}/public/data/pool_bottles/{bottleId}`

**Purpose:** Central pool where all users throw their bottles

**Data Structure:**
```typescript
{
  content: string,        // The message text
  type: MoodType,        // "sad" | "happy" | "love" | "talk"
  createdAt: Timestamp,  // When it was created
  senderId: string       // Who sent it (user ID)
}
```

**Rules:**
- ✅ **Anyone can READ** (public pool)
- ✅ **Only authenticated users can CREATE** (throw bottles)

**Example Document:**
```json
{
  "content": "Sometimes I feel like I'm the only one looking at the moon.",
  "type": "sad",
  "createdAt": "2024-01-15T10:30:00Z",
  "senderId": "user-abc123"
}
```

---

### 2. **User Inbox** (`users/{userId}/inbox`)

**Path:** `artifacts/{appId}/users/{userId}/inbox/{bottleId}`

**Purpose:** Personal collection of bottles each user has caught

**Data Structure:**
```typescript
{
  content: string,        // The message text
  type: MoodType,        // "sad" | "happy" | "love" | "talk"
  createdAt: Timestamp,  // When it was caught
  unread: boolean         // Whether user has read it
}
```

**Rules:**
- ✅ **Only the owner can READ** their inbox
- ✅ **Only the owner can CREATE/UPDATE/DELETE** their inbox items

**Example Document:**
```json
{
  "content": "Just got my dream job! Needed to tell someone!",
  "type": "happy",
  "createdAt": "2024-01-15T11:00:00Z",
  "unread": true
}
```

---

## 🔄 How Data Flows

### **Scenario 1: User Throws a Bottle** 🎯

```
1. User writes message → CreatePage
2. User clicks "Throw into the Sea"
3. App calls: sendBottle(text, mood)
4. Bottle is added to: pool_bottles/
5. ✅ Bottle is now in the public pool
```

**Code Flow:**
```typescript
// In CreatePage.tsx
onSend({ text: "Hello world", mood: "happy" })

// In firestore.ts
await addDoc(
  collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles'),
  {
    content: "Hello world",
    type: "happy",
    createdAt: serverTimestamp(),
    senderId: currentUser.uid
  }
);
```

---

### **Scenario 2: User Catches a Bottle** 🎣

```
1. User clicks "Tap to Catch" → HomePage
2. App calls: catchBottle()
3. System:
   - Fetches 20 random bottles from pool_bottles/
   - Filters out user's own bottles
   - Picks one randomly
   - Creates copy in user's inbox/
4. ✅ Bottle appears in user's inbox
```

**Code Flow:**
```typescript
// In catchBottle()
const poolRef = collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles');
const q = query(poolRef, orderBy('createdAt', 'desc'), limit(20));
const snapshot = await getDocs(q);

// Filter out own bottles
const othersBottles = snapshot.docs
  .filter(b => b.senderId !== currentUser.uid);

// Pick random
const pickedBottle = othersBottles[random];

// Add to user's inbox
await addDoc(
  collection(db, 'artifacts', appId, 'users', userId, 'inbox'),
  {
    content: pickedBottle.content,
    type: pickedBottle.type,
    createdAt: serverTimestamp(),
    unread: true
  }
);
```

---

### **Scenario 3: User Views Inbox** 📬

```
1. User navigates to Inbox → InboxPage
2. App calls: subscribeToInbox(userId, callback)
3. Firestore listens for changes in: users/{userId}/inbox/
4. Real-time updates: Any new bottles appear automatically
5. ✅ Inbox always shows latest bottles
```

**Code Flow:**
```typescript
// In firestore.ts
const q = query(
  collection(db, 'artifacts', appId, 'users', userId, 'inbox'),
  orderBy('createdAt', 'desc')
);

// Real-time listener
return onSnapshot(q, (snapshot) => {
  const bottles = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  callback(bottles); // Updates UI automatically
});
```

---

### **Scenario 4: User Marks Bottle as Read** ✅

```
1. User opens a bottle → ChatPage
2. App calls: markBottleAsRead(userId, bottleId)
3. Updates: users/{userId}/inbox/{bottleId}
4. Sets: unread: false
5. ✅ Badge count updates automatically (via real-time listener)
```

**Code Flow:**
```typescript
// In firestore.ts
const docRef = doc(db, 'artifacts', appId, 'users', userId, 'inbox', bottleId);
await updateDoc(docRef, { unread: false });
```

---

## 🔐 Security Rules

Your `firestore.rules` file controls who can access what:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId} {
      // Public pool - anyone can read, only auth users can create
      match /public/data/pool_bottles/{bottleId} {
        allow read: if true;                    // ✅ Public
        allow create: if request.auth != null;  // ✅ Must be logged in
      }
      
      // User inbox - only owner can access
      match /users/{userId}/inbox/{bottleId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow create: if request.auth != null && request.auth.uid == userId;
        allow update: if request.auth != null && request.auth.uid == userId;
        allow delete: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

**What This Means:**
- ✅ **Public Pool**: Everyone can see bottles, but only logged-in users can add
- ✅ **User Inbox**: Only you can see/modify your own inbox
- ❌ **No Access**: Users can't see other users' inboxes

---

## 🎭 Demo Mode

If Firebase isn't configured, the app runs in **Demo Mode**:

```typescript
// In firebase.ts
if (!hasConfig) {
  isDemoMode = true;
  db = null;  // No database connection
}

// In firestore.ts
if (isDemoMode || !db) {
  // Return mock data instead
  callback(SYSTEM_BOTTLES);
  return () => {};
}
```

**Demo Mode Behavior:**
- ✅ UI still works
- ✅ Uses mock data (`SYSTEM_BOTTLES`)
- ✅ No real database operations
- ⚠️ Shows "Demo Mode" banner

---

## 📊 Real-Time Features

Your app uses **Firestore real-time listeners**:

### **What This Means:**
- 🔄 **Automatic Updates**: When a new bottle arrives, inbox updates instantly
- 🔄 **No Refresh Needed**: Changes appear without page reload
- 🔄 **Live Sync**: Multiple devices stay in sync

### **How It Works:**
```typescript
// Subscribe to inbox changes
const unsubscribe = subscribeToInbox(userId, (bottles) => {
  setMyBottles(bottles); // UI updates automatically
});

// Cleanup when component unmounts
return () => unsubscribe();
```

---

## 🔍 Query Examples

### **Get Latest 20 Bottles from Pool:**
```typescript
const q = query(
  collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles'),
  orderBy('createdAt', 'desc'),
  limit(20)
);
```

### **Get User's Unread Bottles:**
```typescript
const q = query(
  collection(db, 'artifacts', appId, 'users', userId, 'inbox'),
  where('unread', '==', true),
  orderBy('createdAt', 'desc')
);
```

### **Get All User's Bottles (Sorted):**
```typescript
const q = query(
  collection(db, 'artifacts', appId, 'users', userId, 'inbox'),
  orderBy('createdAt', 'desc')
);
```

---

## 🛠️ Database Operations

### **Create (Add Bottle):**
```typescript
await addDoc(collection(db, 'path'), {
  content: "...",
  type: "happy",
  createdAt: serverTimestamp()
});
```

### **Read (Get Bottles):**
```typescript
const snapshot = await getDocs(query(...));
const bottles = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### **Update (Mark as Read):**
```typescript
await updateDoc(doc(db, 'path', id), {
  unread: false
});
```

### **Listen (Real-Time):**
```typescript
return onSnapshot(query(...), (snapshot) => {
  // Called whenever data changes
  const bottles = snapshot.docs.map(...);
  callback(bottles);
});
```

---

## 📈 Data Types

### **Bottle Object:**
```typescript
interface Bottle {
  id: string;                    // Document ID
  content: string;               // Message text
  type: MoodType;                // "sad" | "happy" | "love" | "talk"
  createdAt?: Timestamp;         // Firestore timestamp
  unread?: boolean;              // Read status (inbox only)
  senderId?: string;             // Who sent it (pool only)
}
```

### **Mood Types:**
- `"sad"` - Melancholy
- `"happy"` - Joy
- `"love"` - Love
- `"talk"` - Curious

---

## 🎯 Key Concepts

### **1. Collection vs Document**
- **Collection**: Like a folder (e.g., `pool_bottles/`)
- **Document**: Like a file (e.g., `pool_bottles/bottle-123`)

### **2. Path Structure**
```
collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles')
```
This creates the path: `artifacts/{appId}/public/data/pool_bottles`

### **3. Real-Time Listeners**
- `onSnapshot()` listens for changes
- Automatically updates when data changes
- Returns unsubscribe function to clean up

### **4. Server Timestamps**
- `serverTimestamp()` uses server time (not client time)
- Prevents timezone issues
- More accurate than `new Date()`

---

## 🚀 Performance Tips

1. **Limit Queries**: Always use `limit()` when fetching from pool
2. **Index Fields**: Firestore auto-indexes, but complex queries may need manual indexes
3. **Cleanup Listeners**: Always unsubscribe when components unmount
4. **Filter Early**: Filter out own bottles before random selection

---

## 🔧 Troubleshooting

### **"Permission Denied" Error:**
- Check Firestore security rules
- Ensure user is authenticated
- Verify user ID matches in rules

### **"No Documents" in Pool:**
- Check if anyone has thrown bottles
- Verify `pool_bottles` collection exists
- Check security rules allow reads

### **Real-Time Not Updating:**
- Check listener is active
- Verify path is correct
- Check browser console for errors

---

## 📝 Summary

**Your Database:**
- ✅ **Type**: Firebase Firestore (NoSQL)
- ✅ **Structure**: Hierarchical (collections/documents)
- ✅ **Real-Time**: Yes (automatic updates)
- ✅ **Security**: Rules-based access control
- ✅ **Demo Mode**: Falls back to mock data if not configured

**Main Collections:**
1. `pool_bottles/` - Public message pool
2. `users/{userId}/inbox/` - Personal inbox per user

**Key Features:**
- 🔄 Real-time synchronization
- 🔐 Secure access control
- 📊 Automatic indexing
- 🎭 Demo mode fallback

---

**Your database is ready to use!** 🎉

