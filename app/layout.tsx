import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { GuestProvider } from '@/lib/context/GuestContext';

export const metadata: Metadata = {
  title: 'EchoBottle - Messages in the Tide',
  description: 'Share secrets, wishes, and dreams in digital bottles across the ocean',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#050a14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <GuestProvider>{children}</GuestProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

