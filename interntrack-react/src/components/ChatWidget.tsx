import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Bot } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatWidget() {
  const token = useAuthStore(state => state.accessToken);
  const navigate = useNavigate();

  if (!token) return null;

  return (
    <button 
      onClick={() => navigate('/chat')}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 bg-purple text-white rounded-full flex items-center justify-center hover:bg-purple/90 transition-all duration-normal hover:scale-105 z-40 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 focus:ring-offset-base shadow-[0_0_20px_rgba(124,58,237,0.4)]"
      )}
      title="Ouvrir le Chatbot"
    >
      <Bot className="h-6 w-6" />
    </button>
  );
}
