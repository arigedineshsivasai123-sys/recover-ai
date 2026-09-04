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
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><Bot className="w-3 h-3 text-indigo-600" /> AI AGENT</span>;
      case 'Customer':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><User className="w-3 h-3 text-blue-600" /> CUSTOMER</span>;
      case 'Merchant':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-amber-600" /> MERCHANT</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold">SYSTEM</span>;
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Audit Trail & Event Stream</h1>
          <p className="text-xs text-slate-500">Immutable ledger of every AI decision, safety check, and payment action</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 shadow-sm"
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
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:col-span-2 space-y-4 min-w-0 shadow-sm">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedLog?.id === log.id
                    ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {getActorBadge(log.actor)}
                    <span className="font-mono text-[11px] text-blue-700 font-extrabold">{log.event_type}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-slate-800 leading-relaxed font-sans font-medium">{log.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Log Inspector */}
        {selectedLog && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 lg:sticky lg:top-24 min-w-0 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <Terminal className="w-4 h-4 text-blue-600" /> Event Metadata Inspector
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Event ID</span>
                <span className="font-mono text-slate-700 text-[10px] font-semibold">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Event Type</span>
                <span className="font-mono text-blue-700 font-bold">{selectedLog.event_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Actor</span>
                <span className="font-semibold text-slate-800">{selectedLog.actor}</span>
              </div>
              {selectedLog.amount && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-extrabold text-slate-900">₹{selectedLog.amount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Raw JSON Metadata</span>
              <pre className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[450px] overflow-y-auto">
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
