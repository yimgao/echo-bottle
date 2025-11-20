import { Frown, Smile, Heart, MessageSquare } from 'lucide-react';

export const MOODS = [
  { 
    id: 'sad', 
    icon: Frown, 
    label: 'Melancholy', 
    color: 'from-blue-400 to-indigo-500', 
    text: 'text-blue-100', 
    border: 'border-blue-300/50' 
  },
  { 
    id: 'happy', 
    icon: Smile, 
    label: 'Joy', 
    color: 'from-amber-300 to-orange-400', 
    text: 'text-amber-100', 
    border: 'border-amber-300/50' 
  },
  { 
    id: 'love', 
    icon: Heart, 
    label: 'Love', 
    color: 'from-rose-300 to-pink-500', 
    text: 'text-rose-100', 
    border: 'border-rose-300/50' 
  },
  { 
    id: 'talk', 
    icon: MessageSquare, 
    label: 'Curious', 
    color: 'from-teal-300 to-emerald-500', 
    text: 'text-teal-100', 
    border: 'border-teal-300/50' 
  },
];

export const SYSTEM_BOTTLES = [
  { id: 'sys1', content: "Sometimes I feel like I'm the only one looking at the moon.", type: 'sad', unread: true },
  { id: 'sys2', content: "Just got my dream job! Needed to tell someone!", type: 'happy', unread: true },
  { id: 'sys3', content: "What is your favorite memory from childhood?", type: 'talk', unread: false },
  { id: 'sys4', content: "I wish I had said 'I love you' one more time.", type: 'love', unread: true },
];

