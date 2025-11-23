# EchoBottle 🌊

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/git?s=https://github.com/yimgao/echo-bottle)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)

A beautiful message-in-a-bottle web application built with Next.js 14, Firebase, and Tailwind CSS. Share secrets, wishes, and dreams with strangers across the digital ocean.

**🌐 [Live Demo](https://echo-bottle.vercel.app)** | **📚 [Deployment Guide](./DEPLOYMENT.md)**

## ✨ Features

- 🍾 **Cast Bottles**: Send anonymous messages into the ocean (3/day for guests, 10/day for users)
- 🎣 **Catch Bottles**: Discover random messages from others (3/day for guests, 10/day for users)
- 👤 **Guest Mode**: Try the app instantly without sign-up (Firebase Anonymous Auth)
- 📬 **My Collection**: View all bottles you've caught
- 💎 **Read-Only Bottles**: Beautiful single-direction bottle experience
- 🎨 **Beautiful UI**: Modern glassmorphism design with smooth animations
- 🔐 **Secure**: Server-side validation with Firestore security rules
- 📱 **Responsive**: Works seamlessly on mobile, tablet, and desktop

## 🚀 Tech Stack

- **Next.js 14** - App Router with React Server Components
- **TypeScript** - Type-safe development
- **Firebase** - Authentication & Cloud Firestore
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icon library
- **Vercel** - Deployment and hosting

## 🚀 Quick Deploy

### One-Click Deploy to Vercel

1. Click the **Deploy with Vercel** button above
2. Connect your GitHub account
3. Configure environment variables (Firebase config)
4. Deploy! 🎉

**Detailed guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 💻 Local Development

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Firebase account

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yimgao/echo-bottle.git
cd echo-bottle
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Anonymous, Email/Password, Google)
   - Create a Firestore database
   - Copy your Firebase config

4. **Set up environment variables:**

Create `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_APP_ID=default-app-id
```

5. **Deploy Firestore Security Rules:**
```bash
firebase deploy --only firestore:rules
```

6. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

7. **Build for production:**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
echo-bottle/
├── app/                    # Next.js 14 App Router
│   ├── auth/              # Authentication pages
│   ├── catch/             # Catch bottle page
│   ├── chat/              # Read bottle page
│   ├── create/            # Create bottle page
│   ├── home/              # Home page
│   ├── inbox/             # Collection page
│   └── profile/           # User profile page
├── components/
│   ├── layout/            # Layout components (FloatingDock, WebLayout)
│   ├── pages/             # Page components
│   └── visual/            # Reusable UI components
├── lib/
│   ├── context/           # React Context (Auth)
│   ├── services/          # Business logic (auth, firestore)
│   └── firebase.ts        # Firebase configuration
├── constants/             # App constants (moods, bottles)
├── types/                 # TypeScript type definitions
├── public/                # Static assets
├── firestore.rules        # Firestore security rules
├── vercel.json            # Vercel configuration
└── DEPLOYMENT.md          # Deployment guide
```

## 🎯 Key Features Explained

### Guest Mode
- **Anonymous Authentication**: Users can try the app instantly without creating an account
- **Daily Limits**: 3 throws + 3 catches per day for guests
- **Upgrade Path**: Sign up for unlimited access

### Bottle System
- **Throw**: Send your message to the public pool
- **Catch**: Randomly discover messages from others
- **Read-Only**: Messages are one-way (like real bottles in the ocean)
- **Separate Limits**: Throwing and catching have independent counters

### Security
- Firebase Anonymous Auth for guest users
- Firestore security rules enforce server-side validation
- User data isolation (users can only access their own data)
- Atomic transactions for limit checking (prevent race conditions)

## 📊 Architecture

```
┌─────────────┐
│   Vercel    │  ← Next.js 14 App (Frontend)
│   Hosting   │
└──────┬──────┘
       │
       │ HTTPS
       │
┌──────▼──────┐
│  Firebase   │
│             │
│  ┌────────┐ │
│  │ Auth   │ │  ← Anonymous + Email/Google
│  └────────┘ │
│             │
│  ┌────────┐ │
│  │Firestore│ │  ← NoSQL Database
│  └────────┘ │
└─────────────┘
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

- Design inspiration from message-in-a-bottle concept
- Firebase for backend infrastructure
- Vercel for seamless deployment
- Next.js team for the amazing framework

---

**Made with ❤️ by the EchoBottle team**

