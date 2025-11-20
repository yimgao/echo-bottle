'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Wind } from 'lucide-react';
import { Header } from '@/components/visual/Header';
import { GlassCard } from '@/components/visual/GlassCard';
import { MOODS } from '@/constants/moods';
import type { ChatPageProps, Message } from '@/types';

export const ChatPage = ({ onBack, bottle, isWeb = false }: ChatPageProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: bottle.content, isUser: false, isSystem: true }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [repliesLeft, setRepliesLeft] = useState<number>(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || repliesLeft <= 0) return;
    const newUserMsg: Message = { id: Date.now(), text: inputValue, isUser: true };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setRepliesLeft(prev => prev - 1);
    setTimeout(() => {
      const responses = ["The sea is vast, but we are connected.", "I hear you.", "That resonates with me deeply.", "Sending warmth your way.", "Interesting perspective."];
      setMessages(prev => [...prev, { id: Date.now() + 1, text: responses[Math.floor(Math.random() * responses.length)], isUser: false }]);
    }, 2500);
  };

  const mood = MOODS.find(m => m.id === bottle.type) || MOODS[3];

  return (
    <div className={`h-full flex flex-col relative ${!isWeb ? 'pb-20 sm:pb-24' : ''}`}>
      <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${mood.color} opacity-10 blur-3xl pointer-events-none`} />
      {!isWeb && (
        <div className="p-4 z-10">
           <Header onBack={onBack} title="Drifting Connection" />
        </div>
      )}
      {isWeb && (
        <div className="p-4 sm:p-6 lg:p-8 z-10">
          <button 
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors mb-4 flex items-center gap-2 touch-target text-sm sm:text-base"
          >
            ← Back
          </button>
          <h2 className="text-2xl sm:text-3xl font-serif text-white/90">Drifting Connection</h2>
        </div>
      )}
      <div className={`flex-1 overflow-y-auto ${isWeb ? 'p-4 sm:p-6 lg:p-8' : 'p-4'} ${!isWeb ? 'pb-4' : ''} space-y-4 sm:space-y-6 custom-scrollbar z-10 max-w-4xl mx-auto w-full`}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div 
              className={`max-w-[85%] sm:max-w-[75%] p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-sm sm:text-base leading-relaxed backdrop-blur-md border shadow-sm ${
                msg.isSystem 
                  ? 'bg-white/5 border-white/10 text-center italic text-white/60 w-full mx-2 sm:mx-4 font-serif text-base sm:text-lg' 
                  : msg.isUser 
                    ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-50 rounded-tr-none' 
                    : 'bg-slate-800/40 border-white/10 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {repliesLeft === 0 && (
            <div className="text-center py-8 animate-fade-in">
                <div className="inline-block p-3 rounded-full bg-white/5 border border-white/10 mb-2">
                    <Wind size={20} className="text-white/40" />
                </div>
                <p className="text-sm text-white/40 font-serif italic">The waves have separated you...</p>
                <button onClick={onBack} className="mt-4 text-xs uppercase tracking-widest text-cyan-400 hover:text-cyan-300 font-bold">Return to Shore</button>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={`${isWeb ? 'p-4 sm:p-6 lg:p-8' : 'p-4 pb-6'} z-20 max-w-4xl mx-auto w-full`}>
         <GlassCard className="flex items-center gap-2 p-2 sm:p-3 pr-2 sm:pr-3 bg-slate-900/40">
            {repliesLeft > 0 ? (
                <>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Whisper back..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-transparent px-3 sm:px-4 py-2 sm:py-3 text-white placeholder:text-white/20 focus:outline-none text-sm sm:text-base min-h-[44px]"
                    />
                    <div className="text-[9px] sm:text-[10px] text-white/30 font-mono mr-1 sm:mr-2 shrink-0">
                        {repliesLeft} left
                    </div>
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-cyan-500/20 text-white transition-all disabled:opacity-20 active:scale-95 touch-target shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                </>
            ) : (
                <div className="w-full text-center py-3 text-white/30 text-xs sm:text-sm">Session Ended</div>
            )}
         </GlassCard>
      </div>
    </div>
  );
};
