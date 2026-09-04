import React from 'react';
import { ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface NavbarProps {
  onTriggerDemoFail?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <header className="h-16 border-b border-slate-800 glass-panel sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-white tracking-tight">Recover<span className="text-emerald-400">AI</span></span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Enterprise AI Agent
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden md:block">Controlled AI Revenue Recovery Agent</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 flex items-center gap-2 text-amber-300 text-xs font-mono">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Razorpay Test Mode Active</span>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-emerald-400">
            MA
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-slate-200">Merchant Store</div>
            <div className="text-[10px] text-slate-400">admin@merchant.in</div>
          </div>
        </div>
      </div>
    </header>
  );
};
