# App Router File-Based Routing

This project uses Next.js App Router with file-based routing. Each route corresponds to a directory in the `app/` folder.

## Routes

### `/` (Root)
- **File**: `app/page.tsx`
- **Purpose**: Entry point that checks authentication and redirects accordingly
- **Redirects**:
  - Authenticated users → `/home`
  - Unauthenticated users → `/auth`

### `/auth`
- **File**: `app/auth/page.tsx`
- **Purpose**: Authentication page (login/signup)
- **URL**: `https://your-domain.com/auth`

### `/home`
- **File**: `app/home/page.tsx`
- **Purpose**: Home page with bottle catching interface
- **URL**: `https://your-domain.com/home`
- **Protected**: Yes (requires authentication)

### `/create`
- **File**: `app/create/page.tsx`
- **Purpose**: Create and send a new bottle
- **URL**: `https://your-domain.com/create`
- **Protected**: Yes

### `/inbox`
- **File**: `app/inbox/page.tsx`
- **Purpose**: View collected bottles
- **URL**: `https://your-domain.com/inbox`
- **Protected**: Yes

### `/chat`
- **File**: `app/chat/page.tsx`
- **Purpose**: Chat with a specific bottle
- **URL**: `https://your-domain.com/chat?id=<bottle-id>`
- **Query Parameters**:
  - `id`: The ID of the bottle to chat with
- **Protected**: Yes

### `/catch`
- **File**: `app/catch/page.tsx`
- **Purpose**: Catch a random bottle (redirects to chat)
- **URL**: `https://your-domain.com/catch`
- **Protected**: Yes
- **Behavior**: Automatically catches a bottle and redirects to `/chat?id=<bottle-id>`

### `/profile`
- **File**: `app/profile/page.tsx`
- **Purpose**: User profile page
- **URL**: `https://your-domain.com/profile`
- **Protected**: Yes

## Navigation

### Using Next.js Router

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// Navigate to a page
router.push('/home');
router.push('/create');
router.push('/chat?id=123');

// Navigate back
router.back();
```

### Using Link Component

```typescript
import Link from 'next/link';

<Link href="/home">Home</Link>
<Link href="/chat?id=123">Chat</Link>
```

## Route Protection

Currently, route protection is handled client-side:

1. Root page (`app/page.tsx`) checks auth state and redirects
2. Each protected route can implement its own auth check
3. For production, consider implementing middleware for server-side protection

### Example: Protected Route

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { auth, isDemoMode } from '@/lib/firebase';

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isDemoMode && !auth?.currentUser) {
      router.push('/auth');
    }
  }, [router]);

  // Page content...
}
```

## Dynamic Routes

For dynamic routes, use brackets in folder names:

- `app/user/[id]/page.tsx` → `/user/123`
- `app/blog/[slug]/page.tsx` → `/blog/my-post`

Use `useParams()` to access dynamic segments:

```typescript
import { useParams } from 'next/navigation';

export default function UserPage() {
  const params = useParams();
  const userId = params.id; // '123'
}
```

## Search Parameters

Use `useSearchParams()` with Suspense:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ChatContent() {
  const searchParams = useSearchParams();
  const bottleId = searchParams.get('id');
  // ...
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
```

## Layouts

The root layout (`app/layout.tsx`) wraps all pages. You can create nested layouts:

- `app/dashboard/layout.tsx` → Layout for all `/dashboard/*` routes
- `app/dashboard/page.tsx` → Page at `/dashboard`

## Metadata

Set page metadata in each `page.tsx`:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
};

export default function Page() {
  // ...
}
```

Or dynamically:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dynamic Title',
  };
}
```

## Not Found Pages

Create `app/not-found.tsx` for custom 404 pages:

```typescript
export default function NotFound() {
  return <div>404 - Page Not Found</div>;
}
```

