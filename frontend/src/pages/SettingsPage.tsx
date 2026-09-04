import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, Check, Save } from 'lucide-react';
import { MerchantSettings } from '../types';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<MerchantSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    api.getSettings().then((data) => setSettings(data));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recovery Safety Rules & Merchant Controls</h1>
        <p className="text-xs text-slate-500">Configure deterministic financial safety rules enforced server-side</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="font-extrabold text-slate-900 text-base">Automatic Revenue Recovery</div>
            <div className="text-xs text-slate-500">Allow AI agent to execute automatic recovery flows within safety bounds</div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, auto_recovery_enabled: !settings.auto_recovery_enabled })}
            className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
              settings.auto_recovery_enabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Maximum Automatic Recovery Amount (₹)
            </label>
            <input
              type="number"
              value={settings.max_auto_amount}
              onChange={(e) => setSettings({ ...settings, max_auto_amount: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 shadow-sm"
            />
            <p className="text-[11px] text-slate-500">Transactions above this amount strictly require manual merchant approval.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Maximum Recovery Attempts Per Transaction
            </label>
            <input
              type="number"
              value={settings.max_attempts}
              onChange={(e) => setSettings({ ...settings, max_attempts: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 shadow-sm"
            />
            <p className="text-[11px] text-slate-500">Prevents customer fatigue and duplicate payment attempts.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Maximum Discount Percentage (%)
            </label>
            <input
              type="number"
              value={settings.max_discount}
              onChange={(e) => setSettings({ ...settings, max_discount: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Active Server Safety Policy
          </div>
          <ul className="list-disc list-inside text-slate-600 space-y-1 leading-relaxed font-medium">
            <li>Maximum automatic recovery amount: ₹{settings.max_auto_amount.toLocaleString()}</li>
            <li>Maximum retry attempts per transaction: {settings.max_attempts}</li>
            <li>Transactions above ₹{settings.approval_threshold.toLocaleString()} require merchant authorization</li>
            <li>AI engine CANNOT directly execute money transfers</li>
            <li>Every action is logged in an immutable audit trail</li>
          </ul>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Rules...' : 'Save Safety Rules'}
          </button>

          {savedMessage && (
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-bold">
              <Check className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
