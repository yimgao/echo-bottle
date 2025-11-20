# EchoBottle 🌊

A beautiful message-in-a-bottle web application built with React, Firebase, and Tailwind CSS. Share secrets, wishes, and dreams with strangers across the digital ocean.

## Features

- 🍾 **Cast Bottles**: Send anonymous messages into the ocean
- 🌊 **Catch Bottles**: Discover messages from others
- 💬 **Chat**: Exchange limited replies with found bottles
- 📬 **Inbox**: Keep track of all your discovered messages
- 🎨 **Beautiful UI**: Glassmorphism design with smooth animations

## Tech Stack

- **React 18+** - Functional components with Hooks
- **Firebase** - Authentication & Cloud Firestore
- **Tailwind CSS** - Styling with custom animations
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Anonymous) and Cloud Firestore
   - Add your Firebase config to `index.html` before the React script:
   ```html
   <script>
     window.__firebase_config = JSON.stringify({
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
     });
     window.__app_id = 'your-app-id';
   </script>
   ```

3. Set up Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/pool_bottles/{bottleId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    match /artifacts/{appId}/users/{userId}/inbox/{bottleId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── pages/          # Page components (Auth, Home, Create, Inbox, Chat)
│   └── visual/         # Reusable visual components (Header, GlassCard, etc.)
├── config/             # Firebase configuration
├── constants/          # Constants (moods, system bottles)
├── services/           # Business logic (auth, firestore)
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles and animations
```

## License

MIT

