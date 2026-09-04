import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Bot, BarChart3, History, Settings, ExternalLink } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Opportunities', path: '/opportunities', icon: ShoppingCart },
    { label: 'AI Agent Workbench', path: '/ai-agent', icon: Bot },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Audit Trail', path: '/audit', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 glass-panel h-[calc(100vh-4rem)] sticky top-16 p-4 flex flex-col justify-between hidden md:flex shrink-0 overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Customer Portal
          </div>
          <p className="text-[11px] text-slate-400 mb-2">Test customer payment recovery link experience</p>
          <NavLink
            to="/recover/TXN_1024"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 hover:underline"
          >
            View Customer Page <ExternalLink className="w-3 h-3" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
