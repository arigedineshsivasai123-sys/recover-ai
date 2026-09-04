import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertOctagon, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  BarChart2, 
  History, 
  Settings, 
  ExternalLink,
  Zap
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Failed Payments', path: '/opportunities', icon: AlertOctagon },
    { label: 'AI Agent', path: '/ai-agent', icon: Sparkles },
    { label: 'Recovery Actions', path: '/opportunities?view=actions', icon: RefreshCw },
    { label: 'Transactions', path: '/opportunities?view=transactions', icon: FileText },
    { label: 'Risk & Safety', path: '/settings?tab=safety', icon: ShieldCheck },
    { label: 'Analytics', path: '/analytics', icon: BarChart2 },
    { label: 'Audit Trail', path: '/audit', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isNavActive = (itemPath: string) => {
    const basePath = itemPath.split('?')[0];
    if (basePath === '/') {
      return location.pathname === '/';
    }
    return location.pathname === basePath;
  };

  return (
    <aside className="w-64 bg-[#070D22] border-r border-blue-950/60 h-[calc(100vh-4rem)] sticky top-16 p-4 flex flex-col justify-between hidden md:flex shrink-0 overflow-y-auto z-30">
      <div className="space-y-6">
        {/* Navigation List */}
        <nav className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const active = isNavActive(item.path);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo & Customer Portal Widget */}
      <div className="space-y-4 pt-4 border-t border-blue-950/80">
        <div className="bg-gradient-to-br from-blue-900/60 via-indigo-950/80 to-[#0A122E] border border-blue-700/30 rounded-2xl p-4 text-white relative overflow-hidden shadow-xl group">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-400" /> Every Payment Counts
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Turn missed payments into new opportunities with AI.
            </p>
            <div className="pt-1">
              <NavLink
                to="/recover/TXN_1024"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 hover:text-white transition"
              >
                Test Customer Recovery <ExternalLink className="w-3 h-3" />
              </NavLink>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="px-2 text-[10px] text-slate-500 space-y-0.5">
          <div className="font-semibold text-slate-400">RecoverAI v1.0</div>
          <div>Built for a stronger tomorrow.</div>
        </div>
      </div>
    </aside>
  );
};
