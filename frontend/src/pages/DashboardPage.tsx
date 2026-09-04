import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  BarChart2, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Target, 
  Zap, 
  ShieldCheck, 
  Activity,
  Layers,
  ChevronDown
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { DashboardKPIs, Transaction } from '../types';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [opportunities, setOpportunities] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiRes, oppRes] = await Promise.all([
        api.getDashboardKPIs(),
        api.getOpportunities(),
      ]);
      setKpis(kpiRes);
      setOpportunities(oppRes);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenueCombined = kpis
    ? kpis.recovered_revenue + kpis.revenue_at_risk
    : 1248320;

  return (
    <div className="space-y-6">
      {/* 1. Hero Header Banner matching Reference Image */}
      <div className="bg-gradient-to-r from-[#09102A] via-[#0E1C44] to-[#0A122E] border border-blue-900/40 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="text-[11px] font-extrabold text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> AI-POWERED REVENUE RECOVERY
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Recover Lost Revenue <br className="hidden sm:inline" />
                with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Intelligence</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                Identify, analyze, and recover failed payments using AI — with safety, control, and complete transparency.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/opportunities')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
              >
                Analyze Failed Payments <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/analytics')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition"
              >
                View Insights
              </button>
            </div>
          </div>

          {/* Center 3D Visual Cards Graphic */}
          <div className="lg:col-span-3 hidden sm:flex items-center justify-center py-2">
            <div className="relative flex items-center gap-2">
              {/* Failed Card Graphic */}
              <div className="w-28 h-20 bg-gradient-to-br from-indigo-950 to-blue-900 border border-rose-500/40 rounded-2xl p-3 shadow-xl transform -rotate-6 flex flex-col justify-between">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-extrabold text-rose-300">Failed</div>
              </div>

              {/* Arrow */}
              <div className="text-blue-400 font-mono text-xs font-bold animate-pulse">
                ──►
              </div>

              {/* Recovered Card Graphic */}
              <div className="w-28 h-20 bg-gradient-to-br from-blue-900 to-indigo-900 border border-emerald-500/50 rounded-2xl p-3 shadow-xl transform rotate-6 flex flex-col justify-between">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-extrabold text-emerald-300">Recovered</div>
              </div>
            </div>
          </div>

          {/* Right Highlights Column */}
          <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-blue-900/40 pt-4 lg:pt-0 lg:pl-6 space-y-2.5">
            <div className="text-xs font-bold text-white mb-2">
              Smarter Payments. <br />
              <span className="text-blue-400">Stronger Businesses.</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Higher Recovery Rates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Safer Transactions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>More Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Happier Customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue (Recovered + Paid)"
          value={`₹${totalRevenueCombined.toLocaleString()}`}
          subtext="Combined checkout volume"
          icon={DollarSign}
          variant="blue"
          badgeText="↑ 12.5%"
          badgeIsUp={true}
        />

        <KPICard
          title="Recovered Revenue"
          value={`₹${kpis ? kpis.recovered_revenue.toLocaleString() : '2,36,450'}`}
          subtext={`${kpis ? kpis.successful_recoveries_count : 4} recoveries completed`}
          icon={CheckCircle2}
          variant="emerald"
          badgeText="↑ 18.3%"
          badgeIsUp={true}
        />

        <KPICard
          title="Failed Payments"
          value={`₹${kpis ? kpis.revenue_at_risk.toLocaleString() : '34,195'}`}
          subtext={`${kpis ? kpis.recovery_attempts_count : 10} opportunities at risk`}
          icon={AlertCircle}
          variant="amber"
          badgeText="↓ 6.2%"
          badgeIsUp={false}
        />

        <KPICard
          title="Recovery Success Rate"
          value={`${kpis ? kpis.recovery_rate : 68.4}%`}
          subtext="vs 38.0% traditional baseline"
          icon={TrendingUp}
          variant="purple"
          badgeText="↑ 9.1%"
          badgeIsUp={true}
        />
      </div>

      {/* 3. Analytics Chart & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recovery Analytics Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Recovery Analytics</h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-3 py-1.5 font-medium cursor-pointer transition">
              <span>Last 7 days</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-2">
            <div className="h-56 flex items-end justify-between gap-3 px-2">
              {[
                { date: 'Aug 29', recovered: 75, failed: 45 },
                { date: 'Aug 30', recovered: 95, failed: 50 },
                { date: 'Aug 31', recovered: 115, failed: 60 },
                { date: 'Sep 1', recovered: 100, failed: 40 },
                { date: 'Sep 2', recovered: 85, failed: 65 },
                { date: 'Sep 3', recovered: 130, failed: 55 },
                { date: 'Sep 4', recovered: 180, failed: 95 },
              ].map((item) => (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Recovered Bar */}
                    <div
                      className="w-1/2 bg-blue-600 rounded-t-md transition-all duration-300 hover:bg-blue-500"
                      style={{ height: `${(item.recovered / 180) * 100}%` }}
                      title={`Recovered: ₹${item.recovered * 1000}`}
                    />
                    {/* Failed Bar */}
                    <div
                      className="w-1/2 bg-slate-300 rounded-t-md transition-all duration-300 hover:bg-slate-400"
                      style={{ height: `${(item.failed / 180) * 100}%` }}
                      title={`Failed: ₹${item.failed * 1000}`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{item.date}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-slate-700">Recovered Amount</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-slate-600">Failed Amount</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
              </div>

              <button
                onClick={() => navigate('/opportunities')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 transition"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {opportunities.slice(0, 4).map((tx, idx) => {
                const times = ['2 mins ago', '12 mins ago', '18 mins ago', '25 mins ago'];
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-1 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        tx.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-600' :
                        tx.status === 'MERCHANT_APPROVAL' ? 'bg-amber-50 text-amber-600' :
                        tx.status === 'AI_ANALYZED' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.status === 'RECOVERED' ? <CheckCircle2 className="w-4 h-4" /> :
                         tx.status === 'MERCHANT_APPROVAL' ? <AlertCircle className="w-4 h-4" /> :
                         tx.status === 'AI_ANALYZED' ? <Layers className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {tx.status === 'RECOVERED' ? 'Payment Recovered' :
                           tx.status === 'MERCHANT_APPROVAL' ? 'High Value Transaction' :
                           tx.status === 'AI_ANALYZED' ? 'AI Analysis Completed' : 'Payment Failed'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          Txn #{tx.txn_code}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-900">
                        ₹{tx.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">{times[idx] || 'recently'}</span>
                        <StatusBadge status={tx.status} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom AI Banner matching Reference Image */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/60 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              AI-Driven. Human-Approved. Business-Ready.
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              RecoverAI helps you turn failed payments into real revenue — safely and intelligently.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/opportunities')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition shrink-0"
        >
          Start Recovering Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
