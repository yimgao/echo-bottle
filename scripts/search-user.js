/**
 * Search user by UUID and view their bottles
 * 
 * Usage:
 *   node scripts/search-user.js <USER_ID>
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query,
  where,
  getDocs
} = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB52qH8KAxkOAgx-L2K5PVzR-R1-IO2XEU",
  authDomain: "echobottle-60d27.firebaseapp.com",
  projectId: "echobottle-60d27",
  storageBucket: "echobottle-60d27.firebasestorage.app",
  messagingSenderId: "972400832480",
  appId: "1:972400832480:web:d625227282c5c7d33c8585"
};

const appId = process.env.NEXT_PUBLIC_APP_ID || 'default-app-id';

async function searchUser(userId) {
  console.log(`🔍 Searching for user: ${userId}\n`);

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // 1. Find bottles thrown by this user
    console.log('📤 Bottles thrown by this user:');
    console.log('─'.repeat(60));
    
    const poolRef = collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles');
    const thrownQuery = query(poolRef, where('senderId', '==', userId));
    const thrownSnapshot = await getDocs(thrownQuery);
    
    if (thrownSnapshot.empty) {
      console.log('   No bottles thrown yet.\n');
    } else {
      thrownSnapshot.forEach((doc, index) => {
        const data = doc.data();
        const date = data.createdAt && data.createdAt.seconds 
          ? new Date(data.createdAt.seconds * 1000).toLocaleString()
          : 'Unknown date';
        
        console.log(`\n${index + 1}. [${data.type?.toUpperCase() || 'UNKNOWN'}] ${doc.id}`);
        console.log(`   Date: ${date}`);
        console.log(`   Content: "${data.content?.substring(0, 100)}${data.content?.length > 100 ? '...' : ''}"`);
      });
      console.log(`\n   Total thrown: ${thrownSnapshot.size}\n`);
    }

    // 2. Find bottles caught by this user (in their inbox)
    console.log('\n📥 Bottles caught by this user:');
    console.log('─'.repeat(60));
    
    const inboxRef = collection(db, 'artifacts', appId, 'users', userId, 'inbox');
    const inboxSnapshot = await getDocs(inboxRef);
    
    if (inboxSnapshot.empty) {
      console.log('   No bottles caught yet.\n');
    } else {
      inboxSnapshot.forEach((doc, index) => {
        const data = doc.data();
        const date = data.createdAt && data.createdAt.seconds 
          ? new Date(data.createdAt.seconds * 1000).toLocaleString()
          : 'Unknown date';
        
        console.log(`\n${index + 1}. [${data.type?.toUpperCase() || 'UNKNOWN'}] ${doc.id}`);
        console.log(`   Date: ${date}`);
        console.log(`   Read: ${data.unread === false ? 'Yes' : 'No'}`);
        console.log(`   Content: "${data.content?.substring(0, 100)}${data.content?.length > 100 ? '...' : ''}"`);
      });
      console.log(`\n   Total caught: ${inboxSnapshot.size}\n`);
    }

    // 3. Check daily stats
    console.log('\n📊 Recent daily activity:');
    console.log('─'.repeat(60));
    
    const statsRef = collection(db, 'artifacts', appId, 'users', userId, 'daily_stats');
    const statsSnapshot = await getDocs(statsRef);
    
    if (statsSnapshot.empty) {
      console.log('   No activity recorded yet.\n');
    } else {
      const stats = [];
      statsSnapshot.forEach((doc) => {
        const data = doc.data();
        stats.push({
          date: doc.id,
          throwCount: data.throwCount || 0,
          catchCount: data.catchCount || 0
        });
      });
      
      // Sort by date descending
      stats.sort((a, b) => b.date.localeCompare(a.date));
      
      stats.slice(0, 7).forEach((stat) => {
        console.log(`   ${stat.date}: Threw ${stat.throwCount}, Caught ${stat.catchCount}`);
      });
      console.log();
    }

    console.log('\n✅ Search complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error during search:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
  
  process.exit(0);
}

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: Please provide a user ID');
  console.error('\nUsage: node scripts/search-user.js <USER_ID>');
  console.error('Example: node scripts/search-user.js FuCXzzqf6oMFinBxvYRHVkw9KKu2\n');
  process.exit(1);
}

searchUser(userId);

