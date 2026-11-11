"use client";

import React, { useState } from "react";
import { Building, Mail, Coins, ShieldCheck, Save } from "lucide-react";
import ToastNotification, { ToastMessage, ToastType } from "@/components/ui/ToastNotification";

export default function AdminSettingsPage() {
  const [orgName, setOrgName] = useState("Ceylon Academy of Gemmological Science (CAGS)");
  const [adminEmail, setAdminEmail] = useState("admin@cags.lk");
  const [currency, setCurrency] = useState("LKR — Sri Lankan Rupee");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("CAGS Administration settings saved successfully.", "success");
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-5xl mx-auto">
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">System & Governance Settings</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">Manage Ceylon Academy of Gemmological Science portal configuration</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Organization Profile</h2>
              <p className="text-xs text-slate-500">Issuing authority for gemstone evaluation reports</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Authority</label>
              <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CAGS Admin Contact</label>
              <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <Coins className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Engine Valuation Defaults</h2>
              <p className="text-xs text-slate-500">Benchmark currency and 4C weighting models</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 cursor-pointer">
                <option value="LKR — Sri Lankan Rupee">LKR — Sri Lankan Rupee</option>
                <option value="USD — US Dollar">USD — US Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Ruleset</label>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-700 flex justify-between items-center">
                <span>Color 35% · Clarity 25% · Cut 20% · Carat 20%</span>
                <span className="font-bold text-emerald-600">v4.2 Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
