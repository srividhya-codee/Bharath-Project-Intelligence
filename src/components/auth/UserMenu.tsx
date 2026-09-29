import React, { useState, useRef, useEffect } from 'react';
import {
  LogOut,
  ChevronDown,
  Building2,
  MapPin,
  KeyRound,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserMenu: React.FC = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Officer Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 rounded-full bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white font-bold text-[11px]">
          {user.name.charAt(0)}
        </div>
        <div className="text-left hidden lg:block">
          <div className="font-semibold text-white leading-tight truncate max-w-[140px]">
            {user.name}
          </div>
          <div className="text-[10px] text-amber-300 font-medium">
            {isSuperAdmin ? 'National Super Administrator' : user.role}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
      </button>

      {/* Profile & Logout Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800">
          {/* Header Badge */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
            <div className="flex items-center space-x-2 mb-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isSuperAdmin
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                }`}
              >
                {user.role}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Session Active
              </span>
            </div>

            <div className="font-bold text-sm text-[#0B1F3A]">
              {user.name}
            </div>

            <div className="text-xs text-[#1565C0] font-semibold mt-0.5">
              {isSuperAdmin
                ? 'Authorized: National Super Administrator'
                : user.designation || 'Authorized Government Officer'}
            </div>

            <div className="text-[11px] text-slate-500 font-mono mt-1">
              {user.email}
            </div>
          </div>

          {/* Scope and Permissions Info */}
          <div className="px-2 py-2 space-y-2 text-xs border-b border-slate-100 mb-2">
            <div className="flex items-start space-x-2 text-slate-600">
              <Building2 className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ministry / Department</span>
                <span className="truncate block font-medium text-slate-800">
                  {user.ministryName || 'National Pan-India Scope'}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2 text-slate-600">
              <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Jurisdiction Scope</span>
                <span className="truncate block font-medium text-slate-800">
                  {user.stateName || 'All States & Union Territories'}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Monitored Project Scope</span>
                <span className="truncate block font-medium text-slate-800">
                  {isSuperAdmin
                    ? 'Full Portfolio (All 18 National Projects)'
                    : `Scoped: ${user.allowedProjectCodes?.join(', ') || 'Assigned corridor'}`}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer border border-red-200"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>{isLoggingOut ? 'Logging out...' : 'Sign Out / Logout'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
