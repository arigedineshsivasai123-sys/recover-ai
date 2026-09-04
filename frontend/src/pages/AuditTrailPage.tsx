import React, { useEffect, useState } from 'react';
import { History, Filter, Bot, User, ShieldCheck, CreditCard, DollarSign, Terminal } from 'lucide-react';
import { AuditLog } from '../types';
import { api } from '../services/api';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actorFilter, setActorFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditTrail({ actor: actorFilter });
      setLogs(data);
      if (data.length > 0 && !selectedLog) setSelectedLog(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actorFilter]);

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case 'AI':
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Bot className="w-3 h-3" /> AI AGENT</span>;
      case 'Customer':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><User className="w-3 h-3" /> CUSTOMER</span>;
      case 'Merchant':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> MERCHANT</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">SYSTEM</span>;
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Audit Trail & Event Stream</h1>
          <p className="text-sm text-slate-400">Immutable ledger of every AI decision, safety check, and payment action</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Actors</option>
            <option value="AI">AI Agent</option>
            <option value="Customer">Customer</option>
            <option value="Merchant">Merchant</option>
            <option value="System">System</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Timeline Log Stream */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-4 min-w-0">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedLog?.id === log.id
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {getActorBadge(log.actor)}
                    <span className="font-mono text-[11px] text-emerald-400 font-bold">{log.event_type}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-sans">{log.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Log Inspector */}
        {selectedLog && (
          <div className="glass-panel border border-slate-800 rounded-3xl p-6 space-y-4 lg:sticky lg:top-24 min-w-0">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
              <Terminal className="w-4 h-4 text-emerald-400" /> Event Metadata Inspector
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Event ID</span>
                <span className="font-mono text-slate-300 text-[10px]">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Event Type</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedLog.event_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Actor</span>
                <span>{selectedLog.actor}</span>
              </div>
              {selectedLog.amount && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-bold text-white">₹{selectedLog.amount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Raw JSON Metadata</span>
              <pre className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[500px] overflow-y-auto">
                {selectedLog.metadata_json
                  ? JSON.stringify(JSON.parse(selectedLog.metadata_json), null, 2)
                  : '{}'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
