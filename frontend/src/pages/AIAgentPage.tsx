import React, { useEffect, useState } from 'react';
import { Bot, ShieldCheck, Sparkles, CheckCircle2, AlertOctagon, RefreshCw, Cpu, Layers } from 'lucide-react';
import { Transaction, AIAnalysisResult } from '../types';
import { api } from '../services/api';

export const AIAgentPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Transaction[]>([]);
  const [selectedTxId, setSelectedTxId] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getOpportunities().then((data) => {
      setOpportunities(data);
      if (data.length > 0) {
        setSelectedTxId(data[0].id);
        runAnalysis(data[0].id);
      }
    });
  }, []);

  const runAnalysis = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.analyzeTransaction(id);
      setAnalysisResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectedTx = opportunities.find((t) => t.id === selectedTxId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" /> AI Agent Reasoning Workbench
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold ${analysisResult?.demo_mode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {analysisResult?.demo_mode ? 'DEMO / FALLBACK AI ENGINE' : 'LIVE GEMINI AI'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Structured AI Recovery Agent</h1>
          <p className="text-sm text-slate-400">Contextual LLM analysis with deterministic safety controls</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTxId}
            onChange={(e) => {
              setSelectedTxId(e.target.value);
              runAnalysis(e.target.value);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {opportunities.map((t) => (
              <option key={t.id} value={t.id}>
                {t.txn_code} — {t.customer?.name} (₹{t.amount.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Context Payload Input */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Contextual Inputs to AI Layer
            </div>
            <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
              Input Payload
            </span>
          </div>

          {selectedTx && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Customer Order History</div>
                  <div className="font-bold text-white mt-1">{selectedTx.customer?.total_purchases || 1} Orders</div>
                  <div className="text-[10px] text-slate-500">{selectedTx.customer?.name}</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Cart Value</div>
                  <div className="font-bold text-emerald-400 mt-1">₹{selectedTx.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">{selectedTx.item_name}</div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Failure Code / Reason:</span>
                  <span className="font-mono text-rose-400 font-semibold">{selectedTx.failure_reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Attempt Count:</span>
                  <span className="font-mono text-slate-200">{selectedTx.attempt_count} / {selectedTx.max_attempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Merchant Safety Limit:</span>
                  <span className="font-mono text-slate-200">₹5,000 Auto Max</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis & Recommendation */}
        <div className="glass-panel border border-indigo-500/30 rounded-3xl p-6 space-y-5 bg-gradient-to-br from-indigo-950/20 to-slate-950">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Structured AI Agent Decision
            </div>
            {analysisResult?.demo_mode ? (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold">
                DEMO / FALLBACK AI ENGINE
              </span>
            ) : (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> LIVE GEMINI AI
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
              Running contextual reasoning pipeline...
            </div>
          ) : analysisResult ? (
            <div className="space-y-4 text-xs">
              {/* Probability Bar */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Recovery Probability</span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    {analysisResult.recovery_probability}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${analysisResult.recovery_probability}%` }}
                  />
                </div>
              </div>

              {/* Action & Explanation */}
              <div className="space-y-1.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Recommended Action</span>
                <div className="text-base font-bold text-white bg-slate-900 p-3 rounded-xl border border-slate-800">
                  {analysisResult.recommended_action}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">WHY THIS ACTION? (AI Explanation)</span>
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-slate-200 leading-relaxed font-sans">
                  {analysisResult.reason}
                </div>
              </div>

              {/* Safety Rule Checker */}
              <div className={`p-3.5 rounded-xl border ${analysisResult.safety_passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {analysisResult.safety_passed ? <CheckCircle2 className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
                  Deterministic Safety Engine Verdict
                </div>
                <div className="text-[11px] leading-tight">{analysisResult.safety_message}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
