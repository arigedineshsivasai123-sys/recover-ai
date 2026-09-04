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
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" /> AI Agent Reasoning Workbench
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold ${
              analysisResult?.demo_mode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {analysisResult?.demo_mode ? 'DEMO / FALLBACK AI ENGINE' : 'LIVE GEMINI AI'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Structured AI Recovery Agent</h1>
          <p className="text-xs text-slate-500">Contextual LLM analysis with deterministic safety controls</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTxId}
            onChange={(e) => {
              setSelectedTxId(e.target.value);
              runAnalysis(e.target.value);
            }}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 shadow-sm"
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
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Contextual Inputs to AI Layer
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              Input Payload
            </span>
          </div>

          {selectedTx && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="text-slate-500 text-[10px] font-medium">Customer Order History</div>
                  <div className="font-extrabold text-slate-900 mt-1">{selectedTx.customer?.total_purchases || 1} Orders</div>
                  <div className="text-[10px] text-slate-500">{selectedTx.customer?.name}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="text-slate-500 text-[10px] font-medium">Cart Value</div>
                  <div className="font-extrabold text-emerald-600 mt-1">₹{selectedTx.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">{selectedTx.item_name}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Failure Code / Reason:</span>
                  <span className="font-mono text-rose-600 font-bold">{selectedTx.failure_reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Attempt Count:</span>
                  <span className="font-mono text-slate-800 font-bold">{selectedTx.attempt_count} / {selectedTx.max_attempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant Safety Limit:</span>
                  <span className="font-mono text-slate-800 font-bold">₹5,000 Auto Max</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis & Recommendation */}
        <div className="bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-white border border-blue-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Structured AI Agent Decision
            </div>
            {analysisResult?.demo_mode ? (
              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                DEMO / FALLBACK AI ENGINE
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> LIVE GEMINI AI
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs animate-pulse">
              Running contextual reasoning pipeline...
            </div>
          ) : analysisResult ? (
            <div className="space-y-4 text-xs">
              {/* Probability Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Recovery Probability</span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    {analysisResult.recovery_probability}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${analysisResult.recovery_probability}%` }}
                  />
                </div>
              </div>

              {/* Action & Explanation */}
              <div className="space-y-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Recommended Action</span>
                <div className="text-base font-extrabold text-slate-900 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  {analysisResult.recommended_action}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">WHY THIS ACTION? (AI Explanation)</span>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans shadow-sm">
                  {analysisResult.reason}
                </div>
              </div>

              {/* Safety Rule Checker */}
              <div className={`p-3.5 rounded-xl border ${
                analysisResult.safety_passed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <div className="font-extrabold flex items-center gap-1.5 mb-1">
                  {analysisResult.safety_passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertOctagon className="w-4 h-4 text-amber-600" />}
                  Deterministic Safety Engine Verdict
                </div>
                <div className="text-[11px] leading-tight font-medium">{analysisResult.safety_message}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
