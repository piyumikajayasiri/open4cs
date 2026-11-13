"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitFork,
  Plus,
  Layers,
  Gem,
  Scale,
  LayoutGrid,
  FileText,
  Users,
  X,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import ToastNotification, {
  ToastMessage,
  ToastType,
} from "@/components/ui/ToastNotification";

interface AuditLogItem {
  _id: string;
  action: string;
  performedBy?: {
    name?: string;
    email?: string;
  };
  summary: string;
  createdAt: string;
}

interface RuleVersionItem {
  _id: string;
  version: string;
  name: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: string;
}

interface DashboardMetrics {
  varietiesCount: number;
  referencesCount: number;
  pendingReferencesCount: number;
  usersCount: number;
  auditLogsCount: number;
  activeRuleset: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    varietiesCount: 0,
    referencesCount: 0,
    pendingReferencesCount: 0,
    usersCount: 0,
    auditLogsCount: 0,
    activeRuleset: "v4.2 Production Locked",
  });
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLogItem[]>([]);
  const [ruleVersions, setRuleVersions] = useState<RuleVersionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showRuleVersionsModal, setShowRuleVersionsModal] = useState(false);

  // Propose rule change form
  const [proposalVersion, setProposalVersion] = useState("");
  const [proposalName, setProposalName] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };

  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/status");
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.recentAuditLogs)) setRecentAuditLogs(data.recentAuditLogs);
        if (Array.isArray(data.ruleVersions)) setRuleVersions(data.ruleVersions);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const res = await fetch("/api/admin/status");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.metrics) setMetrics(data.metrics);
          if (Array.isArray(data.recentAuditLogs)) setRecentAuditLogs(data.recentAuditLogs);
          if (Array.isArray(data.ruleVersions)) setRuleVersions(data.ruleVersions);
        }
      } catch (err) {
        if (!ignore) console.error("Failed to load admin dashboard data:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  // Submit proposal to real API
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalVersion.trim() || !proposalName.trim() || !proposalDescription.trim()) {
      showToast("Please provide Rule Version identifier, Name, and Description.", "error");
      return;
    }

    setSubmittingProposal(true);
    try {
      const res = await fetch("/api/admin/rule-versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: proposalVersion.trim(),
          name: proposalName.trim(),
          description: proposalDescription.trim(),
          status: "DRAFT",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          `Rule version draft ${proposalVersion.trim().toUpperCase()} recorded successfully for research governance.`,
          "success"
        );
        setProposalVersion("");
        setProposalName("");
        setProposalDescription("");
        setShowProposeModal(false);
        fetchDashboardData();
      } else {
        showToast(data.error || "Failed to create rule version draft.", "error");
      }
    } catch {
      showToast("Network error submitting rule proposal.", "error");
    } finally {
      setSubmittingProposal(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Toast notifications */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            CAGS Administration
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Real-time database metrics, reference health, and audit trail at a glance
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowRuleVersionsModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
          >
            <GitFork className="w-4 h-4 text-slate-500" />
            <span>Rule Versions ({ruleVersions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProposeModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Propose Rule Version Draft</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm">Loading live database status...</p>
        </div>
      ) : (
        <>
          {/* ================= METRICS CARDS (5 Across) ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Supported Varieties */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition">
              <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center">
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="pt-1">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {metrics.varietiesCount}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                  Supported Varieties
                </div>
              </div>
              <div className="pt-1">
                <Link
                  href="/admin/gemstones"
                  className="text-xs text-blue-600 font-medium hover:underline inline-block"
                >
                  View Catalogue →
                </Link>
              </div>
            </div>

            {/* Card 2: Reference Gemstones */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition">
              <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center">
                <Gem className="w-4 h-4 text-blue-600" />
              </div>
              <div className="pt-1">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {metrics.referencesCount}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                  Reference Gemstones
                </div>
              </div>
              <div className="pt-1">
                <span className="text-xs text-amber-600 font-medium">
                  {metrics.pendingReferencesCount} pending verification
                </span>
              </div>
            </div>

            {/* Card 3: Registered Users */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition">
              <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="pt-1">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {metrics.usersCount}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                  Registered Accounts
                </div>
              </div>
              <div className="pt-1">
                <Link
                  href="/admin/users"
                  className="text-xs text-blue-600 font-medium hover:underline inline-block"
                >
                  Manage Users →
                </Link>
              </div>
            </div>

            {/* Card 4: Active Eval. Rules */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition">
              <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center">
                <Scale className="w-4 h-4 text-blue-600" />
              </div>
              <div className="pt-1">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  4C
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                  Active Weighting
                </div>
              </div>
              <div className="pt-1">
                <span className="text-xs text-emerald-600 font-medium">
                  35/25/20/20 in force
                </span>
              </div>
            </div>

            {/* Card 5: Audit Log Trail */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition">
              <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
              </div>
              <div className="pt-1">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {metrics.auditLogsCount}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                  Recorded Audit Events
                </div>
              </div>
              <div className="pt-1">
                <Link
                  href="/admin/audit"
                  className="text-xs text-blue-600 font-medium hover:underline inline-block"
                >
                  View Audit Trail →
                </Link>
              </div>
            </div>
          </div>

          {/* ================= LOWER TWO-COLUMN GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Card: Rule Versions (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Rule Governance & Draft Versions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Production evaluation engine is locked to v4.2. Research drafts require code-level publication.
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  v4.2 Production Locked
                </span>
              </div>

              <div className="space-y-3">
                {ruleVersions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-sm font-semibold text-slate-800">
                      Standard Governance Active
                    </p>
                    <p className="text-xs text-slate-500">
                      The core evaluation engine operates on the verified v4.2 production ruleset. No unreviewed drafts pending.
                    </p>
                  </div>
                ) : (
                  ruleVersions.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {item.version} — {item.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{item.description}</p>
                      <p className="text-[10px] text-slate-400">
                        Recorded on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Card: Recent Live Audit Activity (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Recent Database Audit Trail
                </h2>
                <Link
                  href="/admin/audit"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Full audit trail →
                </Link>
              </div>

              <div className="space-y-4">
                {recentAuditLogs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No recent audit activity recorded.
                  </div>
                ) : (
                  recentAuditLogs.map((act) => (
                    <div key={act._id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100/70 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                          {act.summary}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                          {act.performedBy?.name || "System"} ·{" "}
                          {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= RULE VERSIONS MODAL ================= */}
      {showRuleVersionsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Governed Rule Versions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Published and research draft rule configurations in MongoDB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRuleVersionsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">
                    v4.2 — Production Authoritative
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Color 35% · Clarity 25% · Cut 20% · Carat 20%. Fixed deterministic weighting engine.
                </p>
              </div>

              {ruleVersions.map((rv) => (
                <div key={rv._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {rv.version} — {rv.name}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                      {rv.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{rv.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowRuleVersionsModal(false)}
                className="px-5 py-2 text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROPOSE RULE VERSION DRAFT MODAL ================= */}
      {showProposeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Propose Rule Version Draft
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record a formal research draft. Production engine remains v4.2 until code publish.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Version Identifier (e.g. v4.3-draft)
                </label>
                <input
                  type="text"
                  value={proposalVersion}
                  onChange={(e) => setProposalVersion(e.target.value)}
                  placeholder="v4.3-draft"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposal Name
                </label>
                <input
                  type="text"
                  value={proposalName}
                  onChange={(e) => setProposalName(e.target.value)}
                  placeholder="2026 Corundum Refinement Proposal"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Gemmological Rationale
                </label>
                <textarea
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  placeholder="Document the proposed research revisions and supporting references..."
                  rows={4}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs sm:text-sm font-semibold disabled:opacity-50"
                >
                  {submittingProposal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Draft</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
