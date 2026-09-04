import React, { useState } from 'react';
import { Play, Sparkles, RefreshCw, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface DemoControlsProps {
  onRefreshData: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({ onRefreshData }) => {
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSimulateFailedPayment = async () => {
    setLoading(true);
    try {
      const tx = await api.simulateFailedPayment();
      setLastAction(`Simulated payment failure created: ${tx.txn_code} (₹${tx.amount})`);
      onRefreshData();
    } catch (e: any) {
      setLastAction(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAIAnalysisOnFirst = async () => {
    setLoading(true);
    try {
      const opps = await api.getOpportunities('PAYMENT_FAILED');
      if (opps.length === 0) {
        setLastAction('No unanalyzed failed payment found. Click [Simulate Failed Payment] first!');
        return;
      }
      const tx = opps[0];
      const aiRes = await api.analyzeTransaction(tx.id);
      setLastAction(`AI Analyzed ${tx.txn_code}: Score ${aiRes.recovery_probability}% -> ${aiRes.recommended_action}`);
      onRefreshData();
    } catch (e: any) {
      setLastAction(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await api.resetDemoDatabase();
      setLastAction('Demo state reset to clean seed data!');
      onRefreshData();
    } catch (e: any) {
      setLastAction(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[92vw] glass-panel border border-emerald-500/30 rounded-2xl p-3 shadow-2xl shadow-emerald-950/40 text-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-slate-100 shrink-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>🎬 RecoverAI Interactive Demo Bar</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={handleSimulateFailedPayment}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium flex items-center gap-1.5 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Simulate Failed Payment
          </button>

          <button
            onClick={handleRunAIAnalysisOnFirst}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5" /> Run AI Analysis
          </button>

          <button
            onClick={handleResetDemo}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Demo
          </button>
        </div>
      </div>

      {lastAction && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{lastAction}</span>
        </div>
      )}
    </div>
  );
};
