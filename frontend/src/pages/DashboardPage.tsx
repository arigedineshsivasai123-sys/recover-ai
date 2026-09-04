import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, AlertCircle, TrendingUp, RefreshCw, Bot, Sparkles, ExternalLink, CheckCircle } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Pitch Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> AI Revenue Recovery Agent
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              RecoverAI Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Controlled AI agent that identifies money at risk, determines optimal recovery actions, and safely converts failed checkouts into recovered revenue.
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-2 transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="💰 Revenue Recovered"
          value={`₹${kpis ? kpis.recovered_revenue.toLocaleString() : '0'}`}
          subtext="₹31,200 recovered by RecoverAI"
          icon={DollarSign}
          variant="emerald"
          highlight={true}
        />

        <KPICard
          title="Revenue at Risk"
          value={`₹${kpis ? kpis.revenue_at_risk.toLocaleString() : '0'}`}
          subtext="Total failed / abandoned checkouts"
          icon={AlertCircle}
          variant="amber"
        />

        <KPICard
          title="Recovery Rate"
          value={`${kpis ? kpis.recovery_rate : 0}%`}
          subtext="Traditional baseline: 38.0%"
          icon={TrendingUp}
          variant="blue"
        />

        <KPICard
          title="Recovery Attempts"
          value={`${kpis ? kpis.recovery_attempts_count : 0}`}
          subtext={`${kpis ? kpis.successful_recoveries_count : 0} successfully recovered`}
          icon={Bot}
          variant="purple"
        />
      </div>

      {/* Opportunities Table */}
      <div className="glass-panel border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Revenue Recovery Opportunities</h2>
            <p className="text-xs text-slate-400">Transactions at risk requiring AI analysis or merchant action</p>
          </div>

          <button
            onClick={() => navigate('/opportunities')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline"
          >
            View All Opportunities <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Failure Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {opportunities.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-4 font-mono font-medium text-white">
                    {tx.txn_code}
                    <div className="text-[10px] text-slate-400 font-sans">{tx.item_name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{tx.customer?.name || 'Rahul Sharma'}</div>
                    <div className="text-[10px] text-slate-400">{tx.customer?.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ₹{tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                    {tx.failure_reason}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/opportunities?selected=${tx.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium transition inline-flex items-center gap-1"
                    >
                      Inspect & Recover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
