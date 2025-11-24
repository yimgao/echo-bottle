import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: {
    default: 'EchoBottle | 听见海的声音 - 匿名漂流瓶',
    template: '%s | EchoBottle'
  },
  description: 'EchoBottle 是一个唯美的匿名漂流瓶社区。在这片数字海洋中，你可以将秘密、愿望与心事装进瓶子投向远方，或是从潮汐中捞起陌生人的温暖回响。无需注册即可体验，让孤独的灵魂在此相遇。',
  keywords: [
    '漂流瓶', '匿名社交', '树洞', '心理倾诉', '解压', '情绪宣泄',
    'Message in a Bottle', 'Anonymous Chat', 'Mental Health', 'Emotional Support',
    'Digital Ocean', 'Secret Sharing', 'Confession', 'Mood Tracker'
  ],
  authors: [{ name: 'EchoBottle Team' }],
  creator: 'EchoBottle',
  publisher: 'EchoBottle',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://hi-echo-bottles.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EchoBottle - 你的心灵树洞',
    description: '倾听潮汐的低语。在这里，每一朵浪花都藏着一个故事。将你的心事写进漂流瓶，让命运带它去往世界的角落。你不再是一座孤岛。',
    url: 'https://hi-echo-bottles.vercel.app',
    siteName: 'EchoBottle',
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EchoBottle - 数字海洋中的漂流瓶',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EchoBottle | 投掷你的心事',
    description: '数字海洋里的心灵树洞。投掷一个瓶子，等待命运的回响。',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/og-image.jpg" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

