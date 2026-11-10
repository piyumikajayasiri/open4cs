"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  Plus,
  Pencil,
  Eye,
  Sliders,
  History,
  X,
  CheckCircle2,
} from "lucide-react";
import ToastNotification, {
  ToastMessage,
  ToastType,
} from "@/components/ui/ToastNotification";

export interface EvaluationRuleItem {
  id: string;
  ruleId: string;
  category: "Color" | "Clarity" | "Cut" | "Pricing";
  description: string;
  effect: string;
  effectType: "positive" | "negative";
  version: string;
  status: "Active" | "Pending" | "Archived";
  triggerCondition: string;
  rationale: string;
  lastUpdated: string;
  author: string;
}

const BENCHMARK_CARDS = [
  { label: "2.0–2.99 CT HEATED", value: "LKR 545–640K/ct", subtext: "+9% vivid cap", subtextColor: "text-emerald-600" },
  { label: "1.0–1.99 CT HEATED", value: "LKR 380–460K/ct", subtext: "+7% vivid cap", subtextColor: "text-emerald-600" },
  { label: "3.0–4.99 CT HEATED", value: "LKR 700–860K/ct", subtext: "-3% band soften", subtextColor: "text-emerald-600" },
  { label: "UNHEATED PREMIUM", value: "+18% over heated", subtext: "Lab cert required", subtextColor: "text-slate-500" },
  { label: "ORIGIN PREMIUM", value: "+5% Ceylon verified", subtext: "Capped at 0 if not", subtextColor: "text-slate-500" },
];

const INITIAL_RULES: EvaluationRuleItem[] = [
  {
    id: "r-1",
    ruleId: "COL-03",
    category: "Color",
    description: "Vivid saturation + tone 5–6 premium",
    effect: "+9%",
    effectType: "positive",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Tone between 5.0 and 6.0 AND Saturation === 'Vivid'",
    rationale: "Colombo lot data shows a consistent 9% price premium for medium-deep vivid blue corundum without extinction.",
    lastUpdated: "Sep 22, 2026",
    author: "Dr. K. Mendis",
  },
  {
    id: "r-2",
    ruleId: "CLA-02",
    category: "Clarity",
    description: "Eye-clean with off-table silk",
    effect: "+3%",
    effectType: "positive",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Naked eye clarity === 'Eye Clean' AND Rutile silk off-center",
    rationale: "Microscopic silk outside the central table facet softens dispersion positively without impeding light return.",
    lastUpdated: "Sep 18, 2026",
    author: "Prof. S. Wickramasinghe",
  },
  {
    id: "r-3",
    ruleId: "CUT-02",
    category: "Cut",
    description: "Depth > 70% penalty",
    effect: "-2%",
    effectType: "negative",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Depth percentage > 70.0%",
    rationale: "Excess pavilion depth traps dead weight that yields no face-up millimeter spread, resulting in trade discount.",
    lastUpdated: "Sep 14, 2026",
    author: "Master Cutter N. Perera",
  },
  {
    id: "r-4",
    ruleId: "TRT-01",
    category: "Pricing",
    description: "Heated (H) verified modifier",
    effect: "-4%",
    effectType: "negative",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Treatment === 'Heated (H)' without diffusion",
    rationale: "Traditional heat treatment benchmark baseline adjustment relative to prime natural unheated standard.",
    lastUpdated: "Sep 22, 2026",
    author: "CAGS Pricing Board",
  },
  {
    id: "r-5",
    ruleId: "ORG-02",
    category: "Pricing",
    description: "Ceylon premium capped if unverified",
    effect: "+0-5%",
    effectType: "positive",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Origin === 'Sri Lanka' AND Lab Report !== 'Accredited'",
    rationale: "Unverified trade origin declarations are restricted to conservative baseline ranges to maintain pricing integrity.",
    lastUpdated: "Aug 30, 2026",
    author: "CAGS Audit Committee",
  },
  {
    id: "r-6",
    ruleId: "PM-4.3",
    category: "Pricing",
    description: "Unheated premium revision",
    effect: "+18%",
    effectType: "positive",
    version: "draft",
    status: "Pending",
    triggerCondition: "Treatment === 'Natural Unheated' AND Weight >= 2.00ct",
    rationale: "Elevates scarcity tier multiplier for verified untreated Ceylon blue sapphires following 2026 Q3 Colombo auction clearance.",
    lastUpdated: "Oct 28, 2026",
    author: "Dr. K. Mendis",
  },
];

type CategoryFilter = "All" | "Color" | "Clarity" | "Cut" | "Pricing";

export default function EvaluationRulesPage() {
  const [rules, setRules] = useState<EvaluationRuleItem[]>(INITIAL_RULES);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");

  // Modals state
  const [viewingRule, setViewingRule] = useState<EvaluationRuleItem | null>(null);
  const [editingRule, setEditingRule] = useState<EvaluationRuleItem | null>(null);
  const [auditingRule, setAuditingRule] = useState<EvaluationRuleItem | null>(null);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);

  // Edit form state
  const [editDescription, setEditDescription] = useState("");
  const [editEffect, setEditEffect] = useState("");

  // Propose form state
  const [newRuleId, setNewRuleId] = useState("");
  const [newCategory, setNewCategory] = useState<"Color" | "Clarity" | "Cut" | "Pricing">("Color");
  const [newDescription, setNewDescription] = useState("");
  const [newEffect, setNewEffect] = useState("+5%");
  const [newRationale, setNewRationale] = useState("");

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Filter rules by active category
  const filteredRules = useMemo(() => {
    if (activeCategory === "All") return rules;
    return rules.filter((r) => r.category === activeCategory);
  }, [rules, activeCategory]);

  const counts = useMemo(() => ({
    all: rules.length,
    color: rules.filter((r) => r.category === "Color").length,
    clarity: rules.filter((r) => r.category === "Clarity").length,
    cut: rules.filter((r) => r.category === "Cut").length,
    pricing: rules.filter((r) => r.category === "Pricing").length,
  }), [rules]);

  const handleOpenEdit = (rule: EvaluationRuleItem) => {
    setEditingRule(rule);
    setEditDescription(rule.description);
    setEditEffect(rule.effect);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setRules((prev) =>
      prev.map((r) =>
        r.id === editingRule.id
          ? { ...r, description: editDescription.trim() || r.description, effect: editEffect.trim() || r.effect, lastUpdated: "Just now" }
          : r
      )
    );
    showToast(`Rule ${editingRule.ruleId} parameter updated successfully.`, "success");
    setEditingRule(null);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleId.trim() || !newDescription.trim()) {
      showToast("Please provide both Rule ID and Description.", "error");
      return;
    }
    const createdRule: EvaluationRuleItem = {
      id: `r-${Date.now()}`,
      ruleId: newRuleId.trim().toUpperCase(),
      category: newCategory,
      description: newDescription.trim(),
      effect: newEffect.trim(),
      effectType: newEffect.startsWith("-") ? "negative" : "positive",
      version: "draft",
      status: "Pending",
      triggerCondition: `${newCategory} threshold criteria verified`,
      rationale: newRationale || "Submitted for CAGS Board sign-off.",
      lastUpdated: "Just now",
      author: "CAGS Admin",
    };
    setRules((prev) => [createdRule, ...prev]);
    showToast(`Proposal for ${createdRule.ruleId} submitted for Board review!`, "success");
    setNewRuleId("");
    setNewDescription("");
    setNewEffect("+5%");
    setNewRationale("");
    setShowProposeModal(false);
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            4C Rules & Pricing Matrix
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Every adjustment the engine can apply — versioned, evidenced and board-approved
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowVersionHistoryModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Version History</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProposeModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Propose Rule</span>
          </button>
        </div>
      </div>

      {/* ================= CATEGORY FILTER PILLS ================= */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {(["All", "Color", "Clarity", "Cut", "Pricing"] as const).map((cat) => {
          const count = cat === "All" ? counts.all : counts[cat.toLowerCase() as keyof typeof counts];
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                active ? "bg-[#0B1528] text-white shadow-2xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat === "All" ? "All Rules" : cat} ({count})
            </button>
          );
        })}
      </div>

      {/* ================= 6-COLUMN RULES TABLE ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-white">
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">RULE ID</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">DESCRIPTION</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">EFFECT</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">VERSION</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">STATUS</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-slate-500 text-xs sm:text-sm">
                    No rules found for category: {activeCategory}
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/70 transition duration-150">
                    <td className="py-4 px-6 text-sm font-bold text-blue-600 font-mono whitespace-nowrap">{rule.ruleId}</td>
                    <td className="py-4 px-6 text-xs sm:text-sm font-medium text-slate-800 whitespace-nowrap">{rule.description}</td>
                    <td className="py-4 px-6 text-xs sm:text-sm font-bold whitespace-nowrap">
                      <span className={rule.effectType === "negative" ? "text-red-500" : "text-emerald-600"}>
                        {rule.effect}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-600 whitespace-nowrap">{rule.version}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        rule.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/90"
                          : "bg-amber-50 text-amber-800 border border-amber-200/90"
                      }`}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rule)}
                          title={`Edit ${rule.ruleId}`}
                          className="p-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingRule(rule)}
                          title={`View ${rule.ruleId} details`}
                          className="p-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuditingRule(rule)}
                          title={`Audit trail for ${rule.ruleId}`}
                          className="p-1.5 rounded-lg hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Sliders className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 5 BENCHMARK CARDS ROW ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
        {BENCHMARK_CARDS.map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1 hover:border-blue-200 transition">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight pt-0.5">{card.value}</div>
            <p className={`text-xs font-medium pt-0.5 ${card.subtextColor}`}>{card.subtext}</p>
          </div>
        ))}
      </div>

      {/* ================= VIEW RULE DETAILS MODAL ================= */}
      {viewingRule && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">
                    {viewingRule.ruleId}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{viewingRule.category} Engine Rule</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{viewingRule.description}</h3>
              </div>
              <button type="button" onClick={() => setViewingRule(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
              <div><span className="text-slate-400 font-medium block">Effect Modifier</span><span className={`font-bold text-sm ${viewingRule.effectType === "negative" ? "text-red-500" : "text-emerald-600"}`}>{viewingRule.effect}</span></div>
              <div><span className="text-slate-400 font-medium block">Rule Version</span><span className="font-bold text-slate-900">{viewingRule.version}</span></div>
              <div><span className="text-slate-400 font-medium block">Status</span><span className="font-bold text-slate-900">{viewingRule.status}</span></div>
              <div><span className="text-slate-400 font-medium block">Board Sign-off</span><span className="font-bold text-slate-900">{viewingRule.author}</span></div>
            </div>

            <div className="space-y-2 text-xs">
              <div><span className="font-bold text-slate-700 block">Trigger Condition</span><p className="font-mono bg-slate-100 p-2.5 rounded-lg text-slate-800 mt-1">{viewingRule.triggerCondition}</p></div>
              <div className="pt-1"><span className="font-bold text-slate-700 block">Market Rationale</span><p className="text-slate-600 leading-relaxed mt-1">{viewingRule.rationale}</p></div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Last updated: {viewingRule.lastUpdated}</span>
              <button type="button" onClick={() => setViewingRule(null)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT RULE MODAL ================= */}
      {editingRule && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-lg font-bold text-slate-900">Edit Rule Parameters</h3><p className="text-xs font-mono text-blue-600 font-bold mt-0.5">{editingRule.ruleId}</p></div>
              <button type="button" onClick={() => setEditingRule(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div><label className="block text-xs font-bold text-slate-700 mb-1">Description</label><input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800" required /></div>
              <div><label className="block text-xs font-bold text-slate-700 mb-1">Effect Modifier</label><input type="text" value={editEffect} onChange={(e) => setEditEffect(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800" required /></div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditingRule(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0B1528] text-white px-5 py-2 text-xs font-bold shadow-xs">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= RULE AUDIT MODAL ================= */}
      {auditingRule && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-lg font-bold text-slate-900">Audit Trail: {auditingRule.ruleId}</h3><p className="text-xs text-slate-500 mt-0.5">{auditingRule.description}</p></div>
              <button type="button" onClick={() => setAuditingRule(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div><div className="font-bold text-slate-900">v4.2 Production Force Sign-off</div><div className="text-slate-500 mt-0.5">Effect confirmed at {auditingRule.effect} by CAGS Board quorum.</div><div className="text-[10px] text-slate-400 mt-1">Signed by {auditingRule.author} · {auditingRule.lastUpdated}</div></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <History className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div><div className="font-bold text-slate-900">v4.1 Initial Calibration</div><div className="text-slate-500 mt-0.5">Field-tested across 120 Colombo auction lots with ±1.5% pricing deviation.</div><div className="text-[10px] text-slate-400 mt-1">Logged by System Desk · Aug 12, 2026</div></div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button type="button" onClick={() => setAuditingRule(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VERSION HISTORY MODAL ================= */}
      {showVersionHistoryModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-lg font-bold text-slate-900">Engine Version History</h3><p className="text-xs text-slate-500 mt-0.5">CAGS algorithm and pricing matrix releases</p></div>
              <button type="button" onClick={() => setShowVersionHistoryModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div><div className="font-bold text-slate-900">Release v4.2 (Active)</div><div className="text-[11px] text-slate-500">Tone 5–6 vivid saturation band (+9%), refined unheated multiplier.</div></div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded text-xs">Active</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div><div className="font-bold text-slate-900">Release v4.1</div><div className="text-[11px] text-slate-500">Integrated Ratnapura field study; calibrated eye-clean silk threshold.</div></div>
                <span className="bg-slate-100 text-slate-600 border border-slate-300 font-medium px-2.5 py-0.5 rounded text-xs">Archived</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button type="button" onClick={() => setShowVersionHistoryModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROPOSE RULE MODAL ================= */}
      {showProposeModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-lg font-bold text-slate-900">Propose Evaluation Rule</h3><p className="text-xs text-slate-500 mt-0.5">Submit a new rule for Board sign-off</p></div>
              <button type="button" onClick={() => setShowProposeModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitProposal} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800">
                    <option value="Color">Color</option>
                    <option value="Clarity">Clarity</option>
                    <option value="Cut">Cut</option>
                    <option value="Pricing">Pricing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rule ID Code</label>
                  <input type="text" value={newRuleId} onChange={(e) => setNewRuleId(e.target.value)} placeholder="e.g. COL-04" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rule Description</label>
                <input type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="e.g. Center-table rutile cloud modifier" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Effect (e.g. +6%, -3%)</label>
                <input type="text" value={newEffect} onChange={(e) => setNewEffect(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rationale</label>
                <textarea value={newRationale} onChange={(e) => setNewRationale(e.target.value)} rows={2} placeholder="Supporting trade or lab observations..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowProposeModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0B1528] text-white px-5 py-2 text-xs font-bold shadow-xs">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
