import React from 'react';
import { Search, Bell, AlertCircle } from 'lucide-react';

interface NavbarProps {
  onSearchChange?: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <header className="h-16 bg-[#070D22] border-b border-blue-950/60 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-md">
      {/* Left Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-extrabold text-lg font-mono border border-blue-400/30">
          R
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-white tracking-tight">
              Recover<span className="text-blue-400">AI</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
            Recover Revenue. Grow Together.
          </p>
        </div>
      </div>

      {/* Center Search Input Bar */}
      <div className="hidden md:flex items-center relative max-w-md w-full mx-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search transactions, customers, or insights..."
          className="w-full bg-[#0F1838] border border-blue-900/40 focus:border-blue-500 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
        />
      </div>

      {/* Right User & System Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Razorpay Test Mode Active Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1 text-amber-300 text-xs font-mono">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Razorpay Test Mode</span>
        </div>

        {/* Notifications Icon Bell */}
        <button className="w-9 h-9 rounded-xl bg-[#0F1838] border border-blue-900/40 flex items-center justify-center text-slate-300 hover:text-white transition relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-[#070D22]" />
        </button>

        {/* Merchant User Avatar Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-blue-900/50">
          <div className="w-9 h-9 rounded-full bg-blue-600 border border-blue-400/40 flex items-center justify-center text-xs font-extrabold text-white shadow-md shadow-blue-600/20">
            D
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-tight">Dinesh</div>
            <div className="text-[10px] text-slate-400">Merchant</div>
          </div>
        </div>
      </div>
    </header>
  );
};
