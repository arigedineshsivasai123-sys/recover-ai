import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Bot, ShieldCheck, CheckCircle2, ExternalLink, X, AlertCircle, RefreshCw, Sparkles, Check } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { Transaction, AIAnalysisResult } from '../types';
import { api } from '../services/api';

export const OpportunitiesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.getOpportunities(statusFilter, search);
      setOpportunities(data);

      const selectedId = searchParams.get('selected');
      if (selectedId) {
        const found = data.find((t) => t.id === selectedId || t.txn_code === selectedId);
        if (found) setSelectedTx(found);
      }
    } catch (e: any) {
      console.error('Failed to fetch opportunities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [search, statusFilter, searchParams]);

  const handleAnalyze = async (txId: string) => {
    setAnalyzing(true);
    setToast(null);
    try {
      const res = await api.analyzeTransaction(txId);
      setAiResult(res);
      setToast({
        type: 'success',
        message: `AI Analysis Complete! Score: ${res.recovery_probability}% | Recommendation: ${res.recommended_action}`
      });

      // Reload opportunities list & updated transaction details
      const opps = await api.getOpportunities(statusFilter, search);
      setOpportunities(opps);

      const updatedDetail = await api.getOpportunityDetail(txId);
      setSelectedTx(updatedDetail);
    } catch (e: any) {
      console.error('AI Analysis API Error:', e);
      setToast({
        type: 'error',
        message: e.message || 'AI Analysis request failed. Please check network connection.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = async (txId: string) => {
    try {
      await api.approveRecovery(txId);
      setToast({
        type: 'success',
        message: 'Recovery Action Authorized! Customer payment flow activated.'
      });
      loadOpportunities();
      if (selectedTx) {
        const updated = await api.getOpportunityDetail(txId);
        setSelectedTx(updated);
      }
    } catch (e: any) {
      setToast({
        type: 'error',
        message: e.message || 'Approval failed.'
      });
    }
  };

  // Derive latest recommendation details
  const latestAttempt = selectedTx?.attempts && selectedTx.attempts.length > 0
    ? selectedTx.attempts[selectedTx.attempts.length - 1]
    : null;

  const currentProbability = (aiResult && aiResult.transaction_id === selectedTx?.id)
    ? aiResult.recovery_probability
    : latestAttempt?.ai_probability;

  const currentAction = (aiResult && aiResult.transaction_id === selectedTx?.id)
    ? aiResult.recommended_action
    : latestAttempt?.action;

  const currentReason = (aiResult && aiResult.transaction_id === selectedTx?.id)
    ? aiResult.reason
    : latestAttempt?.reason;

  const currentRiskLevel = (aiResult && aiResult.transaction_id === selectedTx?.id)
    ? aiResult.risk_level
    : latestAttempt?.risk_level || 'LOW';

  const safetyMessage = (aiResult && aiResult.transaction_id === selectedTx?.id)
    ? aiResult.safety_message
    : (selectedTx?.ai_analyzed ? `SAFETY CHECK PASSED: Amount ₹${selectedTx.amount.toLocaleString()} <= ₹5,000 limit` : null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Revenue Recovery Opportunities</h1>
          <p className="text-sm text-slate-400">Identify failed payments and execute controlled recovery actions</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by TXN ID, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAYMENT_FAILED">PAYMENT FAILED</option>
            <option value="AI_ANALYZED">AI ANALYZED</option>
            <option value="RECOVERY_APPROVED">RECOVERING</option>
            <option value="RECOVERED">RECOVERED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunities Table */}
        <div className={`glass-panel border border-slate-800 rounded-3xl p-5 ${selectedTx ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Failure Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {opportunities.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      setSelectedTx(tx);
                      setToast(null);
                    }}
                    className={`hover:bg-slate-900/60 cursor-pointer transition ${
                      selectedTx?.id === tx.id ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-white">
                      {tx.customer?.name || 'Rahul Sharma'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{tx.txn_code}</td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{tx.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{tx.failure_reason}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                          setToast(null);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Transaction Inspector Drawer */}
        {selectedTx && (
          <div className="glass-panel border border-slate-800 rounded-3xl p-6 space-y-5 relative">
            <button
              onClick={() => {
                setSelectedTx(null);
                setToast(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Transaction Detail</span>
              <h2 className="text-xl font-bold text-white font-mono mt-1">{selectedTx.txn_code}</h2>
              <p className="text-xs text-slate-400">{selectedTx.item_name}</p>
            </div>

            {/* Notification Toast */}
            {toast && (
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fade-in ${
                toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                  <span>{toast.message}</span>
                </div>
                <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer</span>
                <span className="text-slate-200 font-medium">{selectedTx.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-bold">₹{selectedTx.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Status</span>
                <StatusBadge status={selectedTx.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Failure Reason</span>
                <span className="text-rose-400 font-medium max-w-[180px] text-right">{selectedTx.failure_reason}</span>
              </div>
            </div>

            {/* AI Recommendation Card */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-300">
                  <Bot className="w-4 h-4 text-indigo-400" /> AI Recommendation
                </div>
                {currentProbability !== undefined && currentProbability !== null && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> {currentProbability}% Probability
                  </span>
                )}
              </div>

              {currentAction ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recommended Strategy:</span>
                    <span className="font-bold text-white bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded text-xs">
                      {currentAction}
                    </span>
                  </div>
                  <div className="text-slate-200 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed font-sans">
                    "{currentReason}"
                  </div>

                  {safetyMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{safetyMessage}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Click below to trigger RecoverAI structured contextual analysis.</p>
              )}
            </div>

            {/* Interactive Trigger Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleAnalyze(selectedTx.id)}
                disabled={analyzing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Executing AI Analysis...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Analyze with RecoverAI</span>
                  </>
                )}
              </button>

              {(selectedTx.status === 'AI_ANALYZED' || currentAction === 'MERCHANT_APPROVAL') && (
                <button
                  onClick={() => handleApprove(selectedTx.id)}
                  className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <ShieldCheck className="w-4 h-4" /> Approve Recovery Action
                </button>
              )}

              <button
                onClick={() => navigate(`/recover/${selectedTx.txn_code}`)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition"
              >
                Open Customer Checkout Link <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
