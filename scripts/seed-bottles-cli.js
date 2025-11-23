/**
 * Seed script using Firebase CLI (no service account needed)
 * 
 * Usage:
 *   node scripts/seed-bottles-cli.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  connectFirestoreEmulator,
  serverTimestamp
} = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration from your console
const firebaseConfig = {
  apiKey: "AIzaSyB52qH8KAxkOAgx-L2K5PVzR-R1-IO2XEU",
  authDomain: "echobottle-60d27.firebaseapp.com",
  projectId: "echobottle-60d27",
  storageBucket: "echobottle-60d27.firebasestorage.app",
  messagingSenderId: "972400832480",
  appId: "1:972400832480:web:d625227282c5c7d33c8585"
};

const appId = process.env.NEXT_PUBLIC_APP_ID || 'default-app-id';

// Seed data - Chinese version
const SEED_DATA_CN = [
  // Happy - 快乐与分享
  { mood: 'happy', text: "今天下班路上看到了超级美的晚霞，粉紫色的天空治愈了一整天的疲惫。" },
  { mood: 'happy', text: "刚刚学会了做红烧肉，味道竟然意外地好！觉得自己是大厨了哈哈。" },
  { mood: 'happy', text: "收到了好久不见的老朋友寄来的明信片，字迹还是那么熟悉。" },
  { mood: 'happy', text: "终于买到了心心念念的那张黑胶唱片，现在正单曲循环中。" },
  { mood: 'happy', text: "今天在地铁上给一位老奶奶让座，她给了我一颗大白兔奶糖，好甜。" },
  { mood: 'happy', text: "没有任何理由，就是觉得今天是个好日子，希望你也是！" },
  { mood: 'happy', text: "刚刚完成了人生中第一个全马，腿虽然废了，但心里爽翻了！" },
  { mood: 'happy', text: "养的猫咪终于学会握手了，虽然用了整整三袋冻干..." },
  { mood: 'happy', text: "发工资啦！今晚决定去吃顿好的犒劳自己。" },
  { mood: 'happy', text: "在旧衣服口袋里翻出了两百块钱，这就是生活的小惊喜吧！" },
  { mood: 'happy', text: "今天的天气好到让人想翘班去公园躺着晒太阳。" },
  { mood: 'happy', text: "刚刚解决了一个困扰我三天的 Bug，程序员的快乐就是这么朴实无华。" },
  { mood: 'happy', text: "隔壁邻居送了一篮自家种的草莓，超级甜！" },
  { mood: 'happy', text: "听到了很久以前很喜欢的一首歌，前奏一响，回忆全是甜的。" },
  { mood: 'happy', text: "今天早起坚持跑了5公里，感觉整个人都精神了。" },
  { mood: 'happy', text: "抢到了喜欢的歌手演唱会门票！手速爆发！" },
  { mood: 'happy', text: "路边的流浪狗被好心人收养了，看到它有了家真好。" },
  { mood: 'happy', text: "周末睡到自然醒，阳光刚好洒在被子上，这就是幸福的味道。" },
  { mood: 'happy', text: "第一次尝试烤饼干，虽然卖相一般，但朋友们都说好吃。" },
  { mood: 'happy', text: "和喜欢的人一起看了场电影，虽然剧情烂尾了，但心情是满分的。" },
  { mood: 'happy', text: "今天没有遇到红灯，一路畅通，感觉运气爆棚。" },
  { mood: 'happy', text: "发现了一家藏在巷子里的宝藏咖啡店，拿铁超好喝。" },
  { mood: 'happy', text: "很久没联系的同学突然发消息祝我生日快乐，原来还有人记得。" },
  { mood: 'happy', text: "把房间彻底大扫除了一遍，看着整洁的屋子心情舒畅。" },
  { mood: 'happy', text: "在这个瓶子里装了一点好运气，捡到的人这一周都会顺顺利利！" },

  // Sad - 忧伤与倾诉
  { mood: 'sad', text: "有时候觉得城市就像一片深海，我们都是孤独游弋的鱼。" },
  { mood: 'sad', text: "在大雨里走了一小时，分不清脸上是雨水还是泪水。" },
  { mood: 'sad', text: "通讯录里有一千个人，却找不到一个可以随时打电话聊天的人。" },
  { mood: 'sad', text: "有些再见，说着说着就真的再也不见了。" },
  { mood: 'sad', text: "今晚的月亮很圆，但我却异常想家。" },
  { mood: 'sad', text: "努力了很久的事情最后还是搞砸了，真的好挫败。" },
  { mood: 'sad', text: "突然听懂了陈奕迅的《十年》，原来遗憾才是常态。" },
  { mood: 'sad', text: "看着镜子里的自己，突然觉得好陌生，我好像活成了自己讨厌的样子。" },
  { mood: 'sad', text: "失眠的第N天，数羊数水饺都没有用，脑子里全是乱七八糟的念头。" },
  { mood: 'sad', text: "如果不曾见过太阳，我本可以忍受黑暗。" },
  { mood: 'sad', text: "其实我并没有那么坚强，只是习惯了假装无所谓。" },
  { mood: 'sad', text: "今天被领导骂了一顿，躲在厕所里哭完还要洗把脸继续工作，成年人的世界真难。" },
  { mood: 'sad', text: "很想念爷爷做的红烧肉，可惜再也吃不到了。" },
  { mood: 'sad', text: "看到以前的照片，才发现自己那是笑得多么无忧无虑。" },
  { mood: 'sad', text: "明明是三个人的电影，我却始终不能有姓名。" },
  { mood: 'sad', text: "这座城市万家灯火，却没有一盏是为我而留的。" },
  { mood: 'sad', text: "还是忍不住去看了他的社交动态，看到他过得很好，我却很难过。" },
  { mood: 'sad', text: "大概是太久没有被人坚定地选择过了吧。" },
  { mood: 'sad', text: "雨下得好大，好像要把这座城市所有的秘密都淹没。" },
  { mood: 'sad', text: "有些话烂在肚子里，也不能发朋友圈，只能写在这个瓶子里。" },
  { mood: 'sad', text: "我试着去热爱生活，但生活好像并不爱我。" },
  { mood: 'sad', text: "最怕突然听懂了一句歌词，最怕突然想起一个名字。" },
  { mood: 'sad', text: "好像什么都有了，又好像什么都没有。" },
  { mood: 'sad', text: "今天是你离开的第365天，我还在原地，你呢？" },
  { mood: 'sad', text: "我不想做一个懂事的人了，我也想有人哄，有人疼。" },

  // Love - 爱与祝福
  { mood: 'love', text: "希望捡到这个瓶子的你，能遇到一个温暖的人，陪你度过漫长岁月。" },
  { mood: 'love', text: "爱自己是终身浪漫的开始。" },
  { mood: 'love', text: "斯人若彩虹，遇上方知有。祝你也早日遇到那个彩虹般的人。" },
  { mood: 'love', text: "不管如何，你现在是一个人，请记得要好好吃饭，好好睡觉，你值得被爱。" },
  { mood: 'love', text: "我想把世界上最好的祝福都给你，陌生人，祝你平安喜乐。" },
  { mood: 'love', text: "虽然不知道你是谁，但希望你今晚能做一个甜甜的梦。" },
  { mood: 'love', text: "真正的爱不是互相凝视，而是望向同一个方向。" },
  { mood: 'love', text: "想对暗恋了三年的那个男生说：祝你幸福，虽然新娘不是我。" },
  { mood: 'love', text: "爸妈身体健康，这就是我现在最大的愿望。" },
  { mood: 'love', text: "你是可爱的，值得被爱的，不要怀疑自己。" },
  { mood: 'love', text: "愿你有软肋也有盔甲，愿你历经千帆，归来仍是少年。" },
  { mood: 'love', text: "今天是我结婚纪念日，依然觉得娶到她是这辈子最幸运的事。" },
  { mood: 'love', text: "那个笨蛋，天冷了也不知道多穿点衣服。但我还是好喜欢他。" },
  { mood: 'love', text: "爱不仅是名词，更是动词。去爱吧，就像从未受过伤一样。" },
  { mood: 'love', text: "送你一朵小红花，奖励你今天也很棒！🌸" },
  { mood: 'love', text: "所有的相遇都是久别重逢，很高兴能在这个数字海洋里遇到你。" },
  { mood: 'love', text: "愿你被这个世界温柔以待。" },
  { mood: 'love', text: "刚刚给妈妈打了个电话说我爱她，她吓了一跳，然后笑了。" },
  { mood: 'love', text: "爱情可能迟到，但永远不会缺席，请保持期待。" },
  { mood: 'love', text: "你的眼睛里有星辰大海，不要让它黯淡下去。" },
  { mood: 'love', text: "异地恋很辛苦，但一想到未来有你，我就充满了力量。" },
  { mood: 'love', text: "如果你正在经历低谷，抱抱你，一切都会好起来的。" },
  { mood: 'love', text: "世界上有那么多人，我们能相遇本身就是奇迹。" },
  { mood: 'love', text: "希望你的笑容，像今天的阳光一样灿烂。" },
  { mood: 'love', text: "无论发生什么，记得爱那个独一无二的自己。" },

  // Talk - 闲聊与好奇
  { mood: 'talk', text: "如果不考虑金钱，你现在最想做的事情是什么？" },
  { mood: 'talk', text: "推荐一首你最近单曲循环的歌吧？我是《Last Dance》。" },
  { mood: 'talk', text: "如果世界末日来了，你最后想吃的一顿饭是什么？" },
  { mood: 'talk', text: "你相信外星人的存在吗？我觉得他们一定在看着我们。" },
  { mood: 'talk', text: "最近在看《三体》，被里面的宇宙观震撼到了，你看过吗？" },
  { mood: 'talk', text: "如果可以拥有一种超能力，你希望是飞行还是隐身？" },
  { mood: 'talk', text: "你觉得人工智能未来会取代人类吗？" },
  { mood: 'talk', text: "有没有一部电影，是你每隔几年就会重看一遍的？" },
  { mood: 'talk', text: "如果你能穿越回十年前，你会对那时的自己说什么？" },
  { mood: 'talk', text: "大家早饭一般都吃什么？豆浆油条还是牛奶面包？" },
  { mood: 'talk', text: "最近有什么好看的美剧或者动漫推荐吗？剧荒了。" },
  { mood: 'talk', text: "你是猫派还是狗派？" },
  { mood: 'talk', text: "如果给你一张任意门票，你现在想去哪里旅行？" },
  { mood: 'talk', text: "分享一个你知道的冷知识吧！" },
  { mood: 'talk', text: "你觉得男女之间有纯友谊吗？" },
  { mood: 'talk', text: "此时此刻，你窗外的风景是什么样的？" },
  { mood: 'talk', text: "如果要把你的人生拍成电影，你会取什么名字？" },
  { mood: 'talk', text: "你最喜欢的一个汉字是什么？为什么？" },
  { mood: 'talk', text: "小时候的梦想实现了吗？" },
  { mood: 'talk', text: "有没有哪本书彻底改变了你的想法？" },
  { mood: 'talk', text: "我是ENFP，你呢？MBTI测试真的准吗？" },
  { mood: 'talk', text: "如果可以和历史上的一个人共进晚餐，你会选谁？" },
  { mood: 'talk', text: "你相信一见钟情吗？" },
  { mood: 'talk', text: "大家觉得什么颜色的衣服最显白？" },
  { mood: 'talk', text: "这是一个测试瓶子，如果你收到了，请对着屏幕笑一下：）" }
];

// Seed data - English version
const SEED_DATA_EN = [
  // Happy - Joy & Gratitude
  { mood: 'happy', text: "Found a forgotten $20 bill in my winter coat pocket today. It's the little things!" },
  { mood: 'happy', text: "The barista drew a little cat in my latte foam. Made my entire morning." },
  { mood: 'happy', text: "Finally finished reading that book I started six months ago. Feeling accomplished." },
  { mood: 'happy', text: "Saw a double rainbow after the storm. Nature is showing off today." },
  { mood: 'happy', text: "My dog finally learned to catch a frisbee! We are unstoppable now." },
  { mood: 'happy', text: "Just booked a solo trip to a place I've never been. Nervous but excited!" },
  { mood: 'happy', text: "Woke up before my alarm and realized I still had an hour to sleep. Pure bliss." },
  { mood: 'happy', text: "A stranger complimented my outfit on the subway. Confidence boosted +100." },
  { mood: 'happy', text: "Perfected my grandmother's cookie recipe. My kitchen smells like heaven." },
  { mood: 'happy', text: "Got the job! I can't believe it actually happened." },
  { mood: 'happy', text: "Dancing alone in my living room to 80s music. Highly recommend it." },
  { mood: 'happy', text: "The cherry blossoms are blooming, and the city looks pink." },
  { mood: 'happy', text: "Had a deep conversation with an old friend until 3 AM. Soul recharged." },
  { mood: 'happy', text: "Finally figured out the solution to a problem that's been bugging me for weeks." },
  { mood: 'happy', text: "Watching fireflies in the backyard. Summer nights are magic." },
  { mood: 'happy', text: "My plant finally grew a new leaf! I'm a proud plant parent." },
  { mood: 'happy', text: "The smell of rain on hot asphalt (petrichor) is my favorite scent." },
  { mood: 'happy', text: "Managed to keep my white sneakers clean for a whole week. A new record." },
  { mood: 'happy', text: "Today I chose to be kind to myself, and it made all the difference." },
  { mood: 'happy', text: "Sitting by the ocean, listening to the waves. Peace is real." },
  { mood: 'happy', text: "Laughed so hard my stomach hurts. I needed that." },
  { mood: 'happy', text: "Found the perfect playlist for this drive. Life feels like a movie." },
  { mood: 'happy', text: "Successfully assembled IKEA furniture without leftover screws!" },
  { mood: 'happy', text: "Feeling grateful for the roof over my head and the food on my table." },
  { mood: 'happy', text: "Today is a good day to have a good day." },

  // Sad - Melancholy & Reflection
  { mood: 'sad', text: "Sometimes the silence in my apartment is too loud." },
  { mood: 'sad', text: "I miss who I was before everything changed." },
  { mood: 'sad', text: "It's raining, and I feel like the sky understands me today." },
  { mood: 'sad', text: "Scrolling through old messages and wondering where we went wrong." },
  { mood: 'sad', text: "The hardest part of moving on is letting go of the future you imagined." },
  { mood: 'sad', text: "I feel like I'm waiting for a train at an airport." },
  { mood: 'sad', text: "Everyone seems to have it figured out except me." },
  { mood: 'sad', text: "Another birthday, another year of feeling slightly behind." },
  { mood: 'sad', text: "I wish I could hug the person you used to be." },
  { mood: 'sad', text: "Sitting in a crowded room but feeling completely alone." },
  { mood: 'sad', text: "The song we used to sing together just came on the radio." },
  { mood: 'sad', text: "I'm tired of being strong. I just want to rest." },
  { mood: 'sad', text: "Grief is just love with nowhere to go." },
  { mood: 'sad', text: "Why do we only appreciate moments when they become memories?" },
  { mood: 'sad', text: "I pushed everyone away, and now I'm sad that they're gone." },
  { mood: 'sad', text: "Just one of those days where getting out of bed feels like a victory." },
  { mood: 'sad', text: "I saw something today that reminded me of you, and I almost called." },
  { mood: 'sad', text: "Feeling like a background character in my own life." },
  { mood: 'sad', text: "The city lights are beautiful, but they make me feel so small." },
  { mood: 'sad', text: "Regret is a heavy stone to carry in your pocket." },
  { mood: 'sad', text: "I wish I had spoken up when I had the chance." },
  { mood: 'sad', text: "Watching the sunset and feeling a vague sense of loss." },
  { mood: 'sad', text: "Sometimes you just have to cry it out to make room for more happiness." },
  { mood: 'sad', text: "I'm trying my best, even if it doesn't look like much." },
  { mood: 'sad', text: "Missing a home that doesn't exist anymore." },

  // Love - Romance & Kindness
  { mood: 'love', text: "You are the poetry I never knew how to write." },
  { mood: 'love', text: "Sending you virtual flowers and a real smile. 🌻" },
  { mood: 'love', text: "Be the reason someone believes in the goodness of people." },
  { mood: 'love', text: "If you're reading this, know that you are enough, just as you are." },
  { mood: 'love', text: "I hope you find someone who looks at you like you're the sun." },
  { mood: 'love', text: "Love isn't about finding the perfect person, it's about seeing an imperfect person perfectly." },
  { mood: 'love', text: "To the stranger who finds this: I hope your day is filled with magic." },
  { mood: 'love', text: "Call your mom. She misses you." },
  { mood: 'love', text: "The world is better because you are in it." },
  { mood: 'love', text: "Self-love is the best love. Date yourself first." },
  { mood: 'love', text: "I still remember the first time I saw you." },
  { mood: 'love', text: "Let all that you do be done in love." },
  { mood: 'love', text: "Holding hands is such an underrated form of intimacy." },
  { mood: 'love', text: "May you attract someone who speaks your language so you don't have to translate your soul." },
  { mood: 'love', text: "Kindness costs nothing but means everything." },
  { mood: 'love', text: "I wish I could bottle up this feeling and give it to you." },
  { mood: 'love', text: "You are loved more than you will ever know." },
  { mood: 'love', text: "Distance means so little when someone means so much." },
  { mood: 'love', text: "Falling in love with the world, one sunset at a time." },
  { mood: 'love', text: "Your vibe attracts your tribe. Stay radiant." },
  { mood: 'love', text: "Sending love to anyone who is healing from things they don't discuss." },
  { mood: 'love', text: "A simple 'thank you' can change someone's day." },
  { mood: 'love', text: "Love is the only thing that doubles when you share it." },
  { mood: 'love', text: "I hope you find the courage to chase what sets your soul on fire." },
  { mood: 'love', text: "Always wear your invisible crown." },

  // Talk - Questions & Curiosity
  { mood: 'talk', text: "If you could have dinner with any historical figure, who would it be?" },
  { mood: 'talk', text: "What is the bravest thing you have ever done?" },
  { mood: 'talk', text: "Pineapple on pizza: Yes or No? Let's settle this." },
  { mood: 'talk', text: "If money was no object, what would your life look like?" },
  { mood: 'talk', text: "What is a song that changed your life?" },
  { mood: 'talk', text: "Do you believe in aliens? Or are we alone in the universe?" },
  { mood: 'talk', text: "Tell me a secret you've never told anyone." },
  { mood: 'talk', text: "What is your favorite smell in the whole world?" },
  { mood: 'talk', text: "If you could instantly master any skill, what would it be?" },
  { mood: 'talk', text: "What advice would you give to your 10-year-old self?" },
  { mood: 'talk', text: "Cats or Dogs? There is only one right answer." },
  { mood: 'talk', text: "What is the most beautiful place you have ever visited?" },
  { mood: 'talk', text: "If you were a color, which one would you be?" },
  { mood: 'talk', text: "Do you think technology brings us closer or drives us apart?" },
  { mood: 'talk', text: "What is your go-to comfort food?" },
  { mood: 'talk', text: "Describe your perfect day in three words." },
  { mood: 'talk', text: "Have you ever had a supernatural experience?" },
  { mood: 'talk', text: "What is a book that you wish you could read again for the first time?" },
  { mood: 'talk', text: "If you could live in any movie universe, which one would you pick?" },
  { mood: 'talk', text: "Coffee or Tea? The eternal debate." },
  { mood: 'talk', text: "What is the best compliment you've ever received?" },
  { mood: 'talk', text: "If animals could talk, which one would be the rudest?" },
  { mood: 'talk', text: "What are you most grateful for right now?" },
  { mood: 'talk', text: "Do you believe in fate, or do we make our own destiny?" },
  { mood: 'talk', text: "This is a test bottle. If you found it, you owe yourself a treat!" }
];

// Combine both datasets
const SEED_DATA = [...SEED_DATA_CN, ...SEED_DATA_EN];

async function promptForAuth() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\n🔐 请输入管理员邮箱: ', (email) => {
      rl.question('🔐 请输入密码: ', (password) => {
        rl.close();
        resolve({ email: email.trim(), password: password.trim() });
      });
    });
  });
}

async function seedBottles() {
  console.log('🌊 Starting bottle seeding process...\n');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  try {
    // Authenticate with email/password
    console.log('🔐 准备登录...');
    console.log('注意：你需要先在 Firebase Console 创建一个管理员账户');
    console.log('访问: https://console.firebase.google.com/ > Authentication > Users\n');
    
    const { email, password } = await promptForAuth();
    
    console.log('\n⏳ 正在登录...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ 登录成功!\n');
    
    const poolRef = collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles');

    // Step 1: Delete all existing bottles
    console.log('🗑️  Step 1: Deleting existing bottles...');
    const existingBottles = await getDocs(poolRef);
    console.log(`   Found ${existingBottles.size} existing bottles`);
    
    if (existingBottles.size > 0) {
      let deletedCount = 0;
      for (const doc of existingBottles.docs) {
        await deleteDoc(doc.ref);
        deletedCount++;
        if (deletedCount % 10 === 0) {
          console.log(`   Deleted ${deletedCount}/${existingBottles.size}...`);
        }
      }
      console.log(`   ✅ Deleted ${deletedCount} bottles\n`);
    } else {
      console.log(`   ✅ No bottles to delete\n`);
    }

    // Step 2: Add new seed data
    console.log('🍾 Step 2: Adding new seed bottles...');
    console.log(`   Total bottles to add: ${SEED_DATA.length}`);
    console.log(`   - Chinese: ${SEED_DATA_CN.length}`);
    console.log(`   - English: ${SEED_DATA_EN.length}\n`);
    
    let addedCount = 0;
    const moodCounts = {};
    
    for (const bottle of SEED_DATA) {
      await addDoc(poolRef, {
        content: bottle.text,
        type: bottle.mood,
        createdAt: serverTimestamp(),
        senderId: 'system' // Mark as system bottles
      });
      
      addedCount++;
      moodCounts[bottle.mood] = (moodCounts[bottle.mood] || 0) + 1;
      
      if (addedCount % 25 === 0) {
        console.log(`   Added ${addedCount}/${SEED_DATA.length}...`);
      }
    }
    
    console.log(`   ✅ Added ${addedCount} bottles\n`);
    
    // Step 3: Summary
    console.log('📊 Summary:');
    console.log(`   Total bottles: ${addedCount}`);
    console.log(`   By mood:`);
    Object.entries(moodCounts).forEach(([mood, count]) => {
      console.log(`   - ${mood}: ${count}`);
    });
    
    console.log('\n🎉 Seeding complete!\n');
    
  } catch (error) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      console.error('\n❌ 登录失败：邮箱或密码错误');
      console.error('请确保你在 Firebase Console 中创建了一个用户账户');
    } else {
      console.error('\n❌ Error during seeding:', error.message);
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the seeding
seedBottles();

