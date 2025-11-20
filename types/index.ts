import { ReactNode } from 'react';
import { MOODS } from '@/constants/moods';

// User types
export interface User {
  name: string;
  id: string;
  type?: string;
}

// Bottle/Message types
export type MoodType = typeof MOODS[number]['id'];

export interface Bottle {
  id: string;
  content: string;
  type: MoodType;
  createdAt?: {
    seconds: number;
    nanoseconds?: number;
  } | Date;
  unread?: boolean;
  senderId?: string;
}

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isSystem?: boolean;
}

// Page navigation types
export type PageType = 'auth' | 'home' | 'create' | 'inbox' | 'chat' | 'profile';

export type NavigationDestination = PageType | 'catch';

// Component prop types
export interface AuthPageProps {
  onLogin: (type: 'google' | 'anon' | 'email') => Promise<void> | void;
  isLoading?: boolean;
  loadingType?: 'google' | 'anon' | 'email' | null;
  errorMessage?: string | null;
  onGuestAccess?: () => void;
}

export interface HomePageProps {
  onNavigate: (dest: NavigationDestination) => void;
  unreadCount: number;
  onLogout: () => void;
  isWeb?: boolean;
  availableBottles?: number;
  guestStatus?: {
    isGuest: boolean;
    actionsRemaining: number;
    totalActions: number;
    hasReachedLimit: boolean;
  };
}

export interface CreatePageProps {
  onNavigate: (page: PageType) => void;
  onSend: (data: { text: string; mood: MoodType }) => Promise<void> | void;
  isWeb?: boolean;
}

export interface InboxPageProps {
  onNavigate: (page: PageType) => void;
  bottles: Bottle[];
  onOpenBottle: (bottle: Bottle) => void;
  isLoading: boolean;
  isWeb?: boolean;
}

export interface ChatPageProps {
  onBack: () => void;
  bottle: Bottle;
  isWeb?: boolean;
}

export interface ProfilePageProps {
  user: User | null;
  onLogout: () => void;
  isWeb?: boolean;
}

export interface WebLayoutProps {
  children: ReactNode;
  page: PageType;
  onNavigate: (dest: NavigationDestination) => void;
  unreadCount: number;
  onLogout: () => void;
}

export interface FloatingDockProps {
  activePage: PageType;
  onNavigate: (dest: NavigationDestination) => void;
  unreadCount: number;
}

export interface OceanBackgroundProps {
  isWeb?: boolean;
}

export interface HeaderProps {
  onBack?: () => void;
  title?: string;
  rightElement?: ReactNode;
}

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: string;
}

export interface BubblesProps {
  count?: number;
  isWeb?: boolean;
}

export interface FloatingBottlesProps {
  count?: number;
}

export interface ParticleFieldProps {}

export interface TextParticlesProps {
  active?: boolean;
}

export interface LightRaysProps {}

export interface OceanWavesProps {}

// Firebase types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AuthStateCallback {
  (user: User | null): void;
}

export interface BottlesCallback {
  (bottles: Bottle[]): void;
}

// Service function types
export type Unsubscribe = () => void;

