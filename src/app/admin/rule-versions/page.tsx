"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitCompare,
  CheckCircle2,
  Upload,
  PenLine,
  Layers,
  X,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";
import ToastNotification, {
  ToastMessage,
  ToastType,
} from "@/components/ui/ToastNotification";

interface RuleVersionItem {
  id: string;
  version: string;
  title: string;
  subtitle: string;
  status: "Active" | "Archived" | "Pending";
  effectivePeriod: string;
  changes: string[];
  approvedBy: string;
}

interface AuditHistoryItem {
  id: string;
  title: string;
  subtitle: string;
  iconType: "check" | "upload" | "pen" | "pin";
  details: string;
}

interface ManagedUser {
  id: string;
  name: string;
  roleAffiliation: string;
  category: "Student" | "Trader" | "Gemologist" | "Professional";
  evals: string;
  status: "Active" | "Reviewer" | "Suspended";
}

const RULE_VERSIONS: RuleVersionItem[] = [
  {
    id: "ver-4.2",
    version: "v4.2",
    title: "Current - in force since Sep 01",
    subtitle: "COL-03 widened · PM heated -4% · ORG cap clarified · Pricing Board",
    status: "Active",
    effectivePeriod: "In force since Sep 01, 2026",
    changes: [
      "Rule COL-03: Widened tone 5–6 vivid saturation band (+9% premium).",
      "Rule TRT-01: Baseline standard heated modifier refined to -4%.",
      "Rule ORG-02: Origin premium capped at +5% for verified Ceylon stones.",
    ],
    approvedBy: "CAGS Pricing & Scientific Board",
  },
  {
    id: "ver-4.1",
    version: "v4.1",
    title: "Superseded Aug 01 – Sep 01",
    subtitle: "CUT-02 depth tolerance 68–72% · Pricing Board",
    status: "Archived",
    effectivePeriod: "Aug 01, 2026 – Sep 01, 2026",
    changes: [
      "CUT-02: Calibrated depth percentage threshold to 68–72% tolerance.",
      "Integrated preliminary Ratnapura field benchmark dataset.",
    ],
    approvedBy: "CAGS Pricing Board",
  },
  {
    id: "ver-4.0",
    version: "v4.0",
    title: "Superseded Jun 01 – Aug 01",
    subtitle: "Initial CAGS-approved launch set · CAGS Council",
    status: "Archived",
    effectivePeriod: "Jun 01, 2026 – Aug 01, 2026",
    changes: [
      "Initial production release with standardized 4C weighting models.",
      "Established Colombo B2B price curve algorithms.",
    ],
    approvedBy: "CAGS Council",
  },
  {
    id: "ver-4.3",
    version: "v4.3-draft",
    title: "Under review · 2 approvals left",
    subtitle: "Unheated premium +18% · REC-11 wording · Draft",
    status: "Pending",
    effectivePeriod: "Pending Q4 Board Quorum",
    changes: [
      "PM-4.3: Unheated premium revision to +18% over heated baseline.",
      "REC-11: Recommendation phrasing updates for windowed stones.",
    ],
    approvedBy: "Awaiting 2 review signatures",
  },
];

const AUDIT_HISTORY: AuditHistoryItem[] = [
  {
    id: "aud-1",
    title: "Approved REF-1099 verification",
    subtitle: "Sep 24 · 14:02 · Dr. Mendis · Reference data",
    iconType: "check",
    details: "Verified 2.74 ct Ceylon Blue sapphire lot evidence with minor silk inclusion mapping.",
  },
  {
    id: "aud-2",
    title: "Bulk import 12 records (HIST-Q3)",
    subtitle: "Sep 23 · 16:40 · Data desk · Historical pricing",
    iconType: "upload",
    details: "Ingested 12 Colombo auction clearing benchmark records into quarterly aggregate history.",
  },
  {
    id: "aud-3",
    title: "Signed PM-4.2 heated modifier",
    subtitle: "Sep 22 · 11:15 · Pricing board · Pricing matrix",
    iconType: "pen",
    details: "Board signed off on -4% thermal enhancement modifier across all corundum varieties.",
  },
  {
    id: "aud-4",
    title: "Rule snapshot pinned for 214 evaluations",
    subtitle: "Sep 21 · 09:03 · System · Engine",
    iconType: "pin",
    details: "Pinned version v4.2 snapshot ensuring immutability for 214 ongoing evaluation drafts.",
  },
];

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "usr-1",
    name: "Amaya Fernando",
    roleAffiliation: "Student · Uni of Moratuwa",
    category: "Student",
    evals: "142 evals",
    status: "Active",
  },
  {
    id: "usr-2",
    name: "Nimal Perera",
    roleAffiliation: "Trader · Beruwala",
    category: "Trader",
    evals: "48 evals",
    status: "Active",
  },
  {
    id: "usr-3",
    name: "Dr. S. Mendis",
    roleAffiliation: "Gemologist · Reviewer",
    category: "Gemologist",
    evals: "312 reviews",
    status: "Reviewer",
  },
  {
    id: "usr-4",
    name: "H. Okafor",
    roleAffiliation: "Professional · Exporter",
    category: "Professional",
    evals: "87 evals",
    status: "Suspended",
  },
];

export default function RuleVersionsPage() {
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [selectedVersion, setSelectedVersion] = useState<RuleVersionItem | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite user form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCategory, setInviteCategory] = useState<"Student" | "Trader" | "Gemologist" | "Professional">("Trader");
  const [inviteAffiliation, setInviteAffiliation] = useState("");

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      showToast("Please provide both Name and Email.", "error");
      return;
    }

    const newUser: ManagedUser = {
      id: `usr-${Date.now()}`,
      name: inviteName.trim(),
      roleAffiliation: `${inviteCategory} · ${inviteAffiliation.trim() || "Colombo"}`,
      category: inviteCategory,
      evals: "0 evals",
      status: inviteCategory === "Gemologist" ? "Reviewer" : "Active",
    };

    setUsers((prev) => [...prev, newUser]);
    showToast(`Invitation dispatched to ${inviteEmail.trim()} with ${inviteCategory} access.`, "success");
    setInviteName("");
    setInviteEmail("");
    setInviteAffiliation("");
    setShowInviteModal(false);
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Versions, Audit & Users
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Governance trail: what changed, who approved it, and who can evaluate
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowCompareModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition duration-150 cursor-pointer"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Versions</span>
          </button>
        </div>
      </div>

      {/* ================= TOP TWO-COLUMN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Card: Rule versions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4">Rule versions</h2>

            <div className="divide-y divide-slate-100">
              {RULE_VERSIONS.map((ver) => (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="font-mono font-bold text-blue-600 text-sm shrink-0 mt-0.5">
                      {ver.version}
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {ver.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                        {ver.subtitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-md font-semibold shrink-0 ${
                      ver.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/90"
                        : ver.status === "Pending"
                        ? "bg-amber-50 text-amber-800 border border-amber-200/90"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {ver.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Audit history */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4">Audit history</h2>

            <div className="space-y-4">
              {AUDIT_HISTORY.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 text-emerald-600">
                    {item.iconType === "check" && <CheckCircle2 className="w-4 h-4" />}
                    {item.iconType === "upload" && <Upload className="w-4 h-4" />}
                    {item.iconType === "pen" && <PenLine className="w-4 h-4" />}
                    {item.iconType === "pin" && <Layers className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM CARD: USER MANAGEMENT ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">User management</h2>

          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Invite user
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((u) => (
            <div
              key={u.id}
              className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4"
            >
              {/* User Name */}
              <div className="w-44 sm:w-56 font-bold text-slate-900 text-xs sm:text-sm truncate">
                {u.name}
              </div>

              {/* Role & Affiliation */}
              <div className="flex-1 text-xs text-slate-500 truncate hidden sm:block">
                {u.roleAffiliation}
              </div>

              {/* Activity Counts */}
              <div className="text-xs text-slate-700 font-medium whitespace-nowrap text-right w-24">
                {u.evals}
              </div>

              {/* Status Badge */}
              <div className="w-24 text-right">
                <span
                  className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                    u.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : u.status === "Reviewer"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {u.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= COMPARE VERSIONS MODAL ================= */}
      {showCompareModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Version Diff: v4.2 vs v4.1
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Algorithm weight and pricing tolerance changes
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">v4.1 (Superseded)</span>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px]">Archived</span>
                </div>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>Tone 5 vivid: +6% premium</li>
                  <li>Heated baseline modifier: -5%</li>
                  <li>Depth ratio tolerance: 68–72%</li>
                  <li>Origin cap: uncalibrated</li>
                </ul>
              </div>

              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">v4.2 (Current Active)</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">In Force</span>
                </div>
                <ul className="space-y-1.5 text-emerald-900 list-disc list-inside">
                  <li>Tone 5–6 vivid: +9% premium (+3% jump)</li>
                  <li>Heated baseline modifier: -4% (+1% market adjustment)</li>
                  <li>Depth ratio tolerance: 55–68% optimal</li>
                  <li>Origin cap: +5% max for verified Ceylon</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Ratified by CAGS Scientific Board quorum</span>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VERSION DETAIL MODAL ================= */}
      {selectedVersion && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">
                    {selectedVersion.version}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {selectedVersion.effectivePeriod}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedVersion.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedVersion(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Release Highlights</span>
              <ul className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-700 list-disc list-inside">
                {selectedVersion.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <div className="text-slate-400 pt-1">
                Approved by {selectedVersion.approvedBy}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end text-xs">
              <button
                type="button"
                onClick={() => setSelectedVersion(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= INVITE USER MODAL ================= */}
      {showInviteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Invite New User</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grant evaluation or gemologist reviewer privileges
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Ruwan Jayasuriya"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. ruwan@gemtrade.lk"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Category</label>
                  <select
                    value={inviteCategory}
                    onChange={(e) => setInviteCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="Student">Student</option>
                    <option value="Trader">Trader</option>
                    <option value="Gemologist">Gemologist (Reviewer)</option>
                    <option value="Professional">Professional Exporter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Affiliation / Org</label>
                  <input
                    type="text"
                    value={inviteAffiliation}
                    onChange={(e) => setInviteAffiliation(e.target.value)}
                    placeholder="e.g. Beruwala Market"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0B1528] text-white px-5 py-2 font-bold shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
