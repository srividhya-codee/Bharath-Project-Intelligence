import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock
} from 'lucide-react';
import { User } from '../../types';
import { UserMenu } from '../auth/UserMenu';

interface HeaderProps {
  currentUser?: User;
  onSelectUser?: (user: User) => void;
  onOpenAssistant: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAssistant
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) +
          ' • ' +
          now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) +
          ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0B1F3A] text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* National Flag Tri-Color Accent Ribbon */}
      <div className="h-1 w-full flex">
        <div className="h-full flex-1 bg-[#FF9933]" />
        <div className="h-full flex-1 bg-[#FFFFFF]" />
        <div className="h-full flex-1 bg-[#138808]" />
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Emblem & Official Portal Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow-inner">
            <span className="text-2xl" role="img" aria-label="India Flag">
              🇮🇳
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Bharat Project Intelligence
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                Government of India
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden sm:block">
              Government Infrastructure Monitoring & Decision Support
            </p>
          </div>
        </div>

        {/* Right Tools: Time, AI Assistant & User Profile */}
        <div className="flex items-center space-x-3">
          <span className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-300 mr-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeStr}</span>
          </span>

          {/* Integrated AI Assistant Trigger Button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#1565C0] hover:bg-[#1e88e5] text-white text-xs font-semibold shadow-sm transition border border-blue-400/30 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline">AI Intelligence Assistant</span>
            <span className="md:hidden">AI Assistant</span>
          </button>

          {/* Authenticated Officer Profile & Role Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
