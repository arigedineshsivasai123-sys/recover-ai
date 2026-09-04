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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Revenue Recovery Analytics</h1>
        <p className="text-xs text-slate-500">Performance insights, recovery breakdown, and AI vs baseline benchmark</p>
      </div>

      {/* AI vs Baseline Comparison Card */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-[#0A122E] border border-blue-900/60 rounded-2xl p-6 text-white space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-blue-800/40 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Award className="w-4 h-4" /> Performance Benchmark
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">AI Agent vs Baseline Recovery</h2>
          </div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-3 py-1 rounded-full font-semibold">
            Demo Benchmark — simulated dataset
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-1">
            <div className="text-xs text-slate-300 uppercase font-bold">Baseline Recovery</div>
            <div className="text-3xl font-extrabold text-slate-300">4 / 10 <span className="text-xs font-normal text-slate-400">(40%)</span></div>
            <div className="text-[11px] text-slate-400">Standard unsegmented retries</div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/30 to-emerald-500/20 p-5 rounded-xl border border-blue-400/40 space-y-1 shadow-lg">
            <div className="text-xs text-blue-300 uppercase font-bold flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-400" /> RecoverAI Agent
            </div>
            <div className="text-4xl font-extrabold text-emerald-400">7 / 10 <span className="text-xs font-normal text-emerald-300">(70%)</span></div>
            <div className="text-[11px] text-emerald-300">Contextual AI + Safety Engine</div>
          </div>

          <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-1">
            <div className="text-xs text-slate-300 uppercase font-bold">Relative Improvement</div>
            <div className="text-3xl font-extrabold text-cyan-300 flex items-center justify-center gap-1">
              +75% <ArrowUpRight className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="text-[11px] text-cyan-200">Measured on Seed Dataset</div>
          </div>
        </div>
      </div>

      {/* Safety Control Rule Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 text-xs shadow-sm">
        <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <span className="font-extrabold text-slate-900">Controlled AI Architecture:</span>{' '}
          <span className="text-slate-600">
            The AI agent recommends actions but <strong>CANNOT directly authorize or execute payments</strong>. All recommendations must pass the Deterministic Safety Engine and receive Customer/Merchant confirmation before backend initiates Razorpay checkout.
          </span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery by Action */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Revenue Recovered by Action
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">PAYMENT RETRY</span>
                <span className="text-emerald-600 font-bold">₹18,200 recovered</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '58%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">REMINDER</span>
                <span className="text-blue-600 font-bold">₹8,500 recovered</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '27%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">ALTERNATIVE METHOD</span>
                <span className="text-purple-600 font-bold">₹4,500 recovered</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Failure Reasons Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Failure Reason Distribution
          </h3>

          <div className="space-y-3 text-xs">
            {analytics?.failure_reason_breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-800 font-medium">{item.reason}</span>
                <span className="bg-blue-50 text-blue-700 font-mono px-2.5 py-1 rounded text-[11px] font-bold border border-blue-200/60">
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
