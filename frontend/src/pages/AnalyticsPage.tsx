import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { AnalyticsOverview } from '../types';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Revenue Recovery Analytics</h1>
        <p className="text-sm text-slate-400">Performance insights, recovery breakdown, and AI vs baseline benchmark</p>
      </div>

      {/* AI vs Baseline Comparison Card */}
      <div className="glass-panel border border-emerald-500/30 rounded-3xl p-6 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Award className="w-4 h-4" /> Performance Benchmark
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Agent vs Baseline Recovery</h2>
          </div>
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono px-3 py-1 rounded-full">
            Demo Benchmark — simulated dataset
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 uppercase font-semibold">Baseline Recovery</div>
            <div className="text-3xl font-extrabold text-slate-400">4 / 10 <span className="text-xs font-normal text-slate-500">(40%)</span></div>
            <div className="text-[11px] text-slate-500">Standard unsegmented retries</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-5 rounded-2xl border border-emerald-500/40 space-y-1 shadow-lg shadow-emerald-500/10">
            <div className="text-xs text-emerald-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5" /> RecoverAI Agent
            </div>
            <div className="text-4xl font-extrabold text-emerald-400">7 / 10 <span className="text-xs font-normal text-emerald-300">(70%)</span></div>
            <div className="text-[11px] text-emerald-300">Contextual AI + Safety Engine</div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 uppercase font-semibold">Relative Improvement</div>
            <div className="text-3xl font-extrabold text-teal-400 flex items-center justify-center gap-1">
              +75% <ArrowUpRight className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-[11px] text-teal-300">Measured on Seed Dataset</div>
          </div>
        </div>
      </div>

      {/* Safety Control Rule Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-xs">
        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold text-white">Controlled AI Architecture:</span>{' '}
          <span className="text-slate-300">
            The AI agent recommends actions but <strong>CANNOT directly authorize or execute payments</strong>. All recommendations must pass the Deterministic Safety Engine and receive Customer/Merchant confirmation before backend initiates Razorpay checkout.
          </span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery by Action */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Revenue Recovered by Action
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-200">PAYMENT RETRY</span>
                <span className="text-emerald-400 font-bold">₹18,200 recovered</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '58%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-200">REMINDER</span>
                <span className="text-blue-400 font-bold">₹8,500 recovered</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '27%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-200">ALTERNATIVE METHOD</span>
                <span className="text-purple-400 font-bold">₹4,500 recovered</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Failure Reasons Breakdown */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Failure Reason Distribution
          </h3>

          <div className="space-y-3 text-xs">
            {analytics?.failure_reason_breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-300">{item.reason}</span>
                <span className="bg-slate-800 text-slate-200 font-mono px-2.5 py-1 rounded text-[11px]">
                  {item.count} opportunities
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
