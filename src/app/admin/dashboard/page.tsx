"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitFork,
  Plus,
  Layers,
  Gem,
  TrendingUp,
  Scale,
  LayoutGrid,
  PenLine,
  FileText,
  Users,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import ToastNotification, {
  ToastMessage,
  ToastType,
} from "@/components/ui/ToastNotification";

interface PendingApproval {
  id: string;
  code: string;
  title: string;
  category: string;
  subtitle: string;
  status: "Pending" | "Approved" | "Revision Requested";
  submittedBy: string;
  submittedAt: string;
  impact: string;
  rationale: string;
  details: string;
}

interface RecentActivityItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
}

const INITIAL_PENDING_APPROVALS: PendingApproval[] = [
  {
    id: "pa-1",
    code: "PM-4.3",
    title: "PM-4.3 unheated premiur",
    category: "Pricing",
    subtitle: "Pricing · needs 2nd reviewer",
    status: "Pending",
    submittedBy: "Dr. K. Mendis",
    submittedAt: "Today, 10:14 AM",
    impact: "+4.5% base price tier for Ceylon unheated cornflower blue sapphires",
    rationale:
      "Recent Colombo auction lots indicate persistent premium divergence between heated and verified natural unheated corundum.",
    details:
      "Adjusts Rule PR-UNHEAT-01 multiplier from 1.35x to 1.41x for stones >= 2.00 ct with accredited laboratory spectrographic proof.",
  },
  {
    id: "pa-2",
    code: "TRT-02",
    title: "TRT-02 diffusion modifier",
    category: "Treatment",
    subtitle: "Treatment · lab evidence attached",
    status: "Pending",
    submittedBy: "Prof. S. Wickramasinghe",
    submittedAt: "Yesterday, 4:30 PM",
    impact: "-15% additional valuation penalty on beryllium lattice diffusion",
    rationale:
      "Consumer market acceptance for surface and lattice diffusion has dropped sharply in international B2B exchanges.",
    details:
      "Enforces mandatory deep lattice diffusion penalty across all corundum varieties regardless of face-up color saturation score.",
  },
  {
    id: "pa-3",
    code: "CAT-STAR",
    title: "Star sapphire support s",
    category: "Catalogue",
    subtitle: "Catalogue · field study Q4",
    status: "Pending",
    submittedBy: "Data Desk (E. Alwis)",
    submittedAt: "Oct 28, 2026",
    impact: "Introduces Asterism rating parameters (6-ray sharpness & centering)",
    rationale:
      "Ratnapura field study completed with 140 benchmark star sapphire lots now classified and photographed.",
    details:
      "Adds asterism sub-tier into the 4C Evaluation Rules with ray straightness and dome symmetry coefficients.",
  },
  {
    id: "pa-4",
    code: "REC-11",
    title: "REC-11 recut wording",
    category: "Recommendations",
    subtitle: "Recommendations · ready",
    status: "Pending",
    submittedBy: "Master Cutter N. Perera",
    submittedAt: "Oct 26, 2026",
    impact: "Refined advisory warnings for stones with heavy belly bulge (>72% depth)",
    rationale:
      "Clarifies trader vs student instructions when windowed stones could recover up to +18% value via pavilion re-proportioning.",
    details:
      "Updates recommendation engine output message template for excessive depth penalties to give actionable recut yield estimates.",
  },
];

const RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: "act-1",
    title: "Rule COL-03 saturation band widened",
    subtitle: "Dr. Mendis · 2h ago",
    icon: <PenLine className="w-4 h-4 text-blue-600" />,
    iconBg: "bg-blue-50",
  },
  {
    id: "act-2",
    title: "12 Ceylon blue references added",
    subtitle: "Data desk · Yesterday",
    icon: <Gem className="w-4 h-4 text-emerald-600" />,
    iconBg: "bg-emerald-50",
  },
  {
    id: "act-3",
    title: "PM-4.2 heated modifier - 4% approved",
    subtitle: "Pricing board · Sep 22",
    icon: <FileText className="w-4 h-4 text-amber-600" />,
    iconBg: "bg-amber-50",
  },
  {
    id: "act-4",
    title: "34 new student accounts",
    subtitle: "System · Sep 21",
    icon: <Users className="w-4 h-4 text-indigo-600" />,
    iconBg: "bg-indigo-50",
  },
];

export default function AdminDashboardPage() {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    INITIAL_PENDING_APPROVALS
  );
  const [selectedApproval, setSelectedApproval] =
    useState<PendingApproval | null>(null);

  // Modals state
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showRuleVersionsModal, setShowRuleVersionsModal] = useState(false);

  // Propose rule change form
  const [proposalCategory, setProposalCategory] = useState("Pricing");
  const [proposalCode, setProposalCode] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalRationale, setProposalRationale] = useState("");
  const [proposalImpact, setProposalImpact] = useState("");

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Approval handlers
  const handleApprove = (approvalId: string) => {
    setPendingApprovals((prev) =>
      prev.filter((item) => item.id !== approvalId)
    );
    showToast(
      `Approval signed off for ${selectedApproval?.code || "item"}. CAGS Board sign-off recorded.`,
      "success"
    );
    setSelectedApproval(null);
  };

  const handleRequestRevision = (approvalId: string) => {
    setPendingApprovals((prev) =>
      prev.map((item) =>
        item.id === approvalId
          ? { ...item, status: "Revision Requested", subtitle: `${item.category} · revision requested` }
          : item
      )
    );
    showToast(
      `Revision request dispatched to author for ${selectedApproval?.code || "item"}.`,
      "info"
    );
    setSelectedApproval(null);
  };

  const handleReject = (approvalId: string) => {
    setPendingApprovals((prev) =>
      prev.filter((item) => item.id !== approvalId)
    );
    showToast(
      `Proposal ${selectedApproval?.code || ""} rejected and archived.`,
      "error"
    );
    setSelectedApproval(null);
  };

  // Submit proposal
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle.trim() || !proposalCode.trim()) {
      showToast("Please provide both a Rule Code and Title.", "error");
      return;
    }

    const newApproval: PendingApproval = {
      id: `pa-${Date.now()}`,
      code: proposalCode.trim().toUpperCase(),
      title: `${proposalCode.trim().toUpperCase()} ${proposalTitle.trim()}`,
      category: proposalCategory,
      subtitle: `${proposalCategory} · board review queued`,
      status: "Pending",
      submittedBy: "CAGS Admin",
      submittedAt: "Just now",
      impact: proposalImpact || "Rule parameter modification",
      rationale: proposalRationale || "Standard administrative update.",
      details: proposalRationale || "Proposed rule change pending board review.",
    };

    setPendingApprovals((prev) => [newApproval, ...prev]);
    showToast(
      `Rule change proposal ${newApproval.code} submitted successfully for Board sign-off!`,
      "success"
    );

    // Reset form
    setProposalCode("");
    setProposalTitle("");
    setProposalRationale("");
    setProposalImpact("");
    setShowProposeModal(false);
  };

  const pendingCount = pendingApprovals.filter(
    (a) => a.status === "Pending"
  ).length;

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
            Rule integrity, reference data health and pending approvals at a glance
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowRuleVersionsModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
          >
            <GitFork className="w-4 h-4 text-slate-500" />
            <span>Rule Versions</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProposeModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Propose Rule Change</span>
          </button>
        </div>
      </div>

      {/* ================= METRICS CARDS (5 Across) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Supported Varieties */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition">
          <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center">
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              5
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Supported Varieties
            </div>
          </div>
          <div className="pt-1">
            <Link
              href="/admin/gemstones"
              className="text-xs text-emerald-600 font-medium hover:underline inline-block"
            >
              1 pending review
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
              594
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Reference Gemstones
            </div>
          </div>
          <div className="pt-1">
            <span className="text-xs text-emerald-600 font-medium">
              +18 this month
            </span>
          </div>
        </div>

        {/* Card 3: Historical Records */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition">
          <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              1,204
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Historical Records
            </div>
          </div>
          <div className="pt-1">
            <Link
              href="/admin/historical-pricing"
              className="text-xs text-blue-600 font-medium hover:underline inline-block"
            >
              Across 5 varieties
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
              32
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Active Eval. Rules
            </div>
          </div>
          <div className="pt-1">
            <span className="text-xs text-emerald-600 font-medium">
              v4.2 in force
            </span>
          </div>
        </div>

        {/* Card 5: Active Pricing Rules */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition">
          <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-blue-600" />
          </div>
          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              18
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Active Pricing Rules
            </div>
          </div>
          <div className="pt-1">
            <span className="text-xs text-emerald-600 font-medium">
              PM-4.2 in force
            </span>
          </div>
        </div>
      </div>

      {/* ================= LOWER TWO-COLUMN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Pending approvals (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Pending approvals
            </h2>
            <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              {pendingCount} awaiting board sign-off
            </span>
          </div>

          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  All approvals clear!
                </p>
                <p className="text-xs text-slate-500">
                  No pending rules awaiting board sign-off at this time.
                </p>
              </div>
            ) : (
              pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50/70 hover:bg-slate-50/90 rounded-xl p-3.5 sm:p-4 border border-slate-100/90 flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        item.status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : item.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.status}
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedApproval(item)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Card: Recent activity (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          <h2 className="text-base font-bold text-slate-900">
            Recent activity
          </h2>

          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${act.iconBg}`}
                >
                  {act.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {act.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    {act.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= REVIEW APPROVAL MODAL ================= */}
      {selectedApproval && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {selectedApproval.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {selectedApproval.category} Rule
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedApproval.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Submitted by {selectedApproval.submittedBy} ·{" "}
                  {selectedApproval.submittedAt}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Impact Box */}
            <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-4 space-y-1">
              <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                System Impact
              </h4>
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                {selectedApproval.impact}
              </p>
            </div>

            {/* Rationale & Details */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700">Rationale</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedApproval.rationale}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700">
                  Engine Implementation Details
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedApproval.details}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleReject(selectedApproval.id)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-2 rounded-xl transition"
              >
                Reject & Archive
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRequestRevision(selectedApproval.id)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Request Revisions
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedApproval.id)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Sign-off</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROPOSE RULE CHANGE MODAL ================= */}
      {showProposeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Propose Rule Change
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit a parameter adjustment for CAGS Board peer review
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rule Category
                  </label>
                  <select
                    value={proposalCategory}
                    onChange={(e) => setProposalCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Pricing">Pricing Matrix</option>
                    <option value="Color">Color Evaluation</option>
                    <option value="Clarity">Clarity Standards</option>
                    <option value="Cut">Cut Proportions</option>
                    <option value="Treatment">Treatment Modifier</option>
                    <option value="Origin">Origin Premium</option>
                    <option value="Catalogue">Catalogue Variety</option>
                    <option value="Recommendations">Recommendations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rule Code / ID
                  </label>
                  <input
                    type="text"
                    value={proposalCode}
                    onChange={(e) => setProposalCode(e.target.value)}
                    placeholder="e.g. PM-4.4 or COL-05"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Change Title
                </label>
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="e.g. Unheated Padparadscha benchmark tier update"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Impact / Adjustment
                </label>
                <input
                  type="text"
                  value={proposalImpact}
                  onChange={(e) => setProposalImpact(e.target.value)}
                  placeholder="e.g. +6% premium adjustment for Certified Natural stones"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Market Justification & Rationale
                </label>
                <textarea
                  value={proposalRationale}
                  onChange={(e) => setProposalRationale(e.target.value)}
                  rows={3}
                  placeholder="Explain why this rule change is warranted and reference supporting trade lot data..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold transition shadow-xs"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= RULE VERSIONS QUICK VIEW MODAL ================= */}
      {showRuleVersionsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Active Rule Engine Versions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  CAGS verified rule sets currently in production force
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRuleVersionsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Evaluation Engine Core
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Color, Clarity, Cut & Carat scoring algorithms
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-2.5 py-0.5 rounded-md">
                  v4.2 in force
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Pricing Matrix Engine
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Colombo benchmark B2B curve & origin modifiers
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-2.5 py-0.5 rounded-md">
                  PM-4.2 in force
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Color Spectrum Standard (Rule COL-03)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tone 5-6 vivid saturation +9% premium
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs px-2.5 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Treatment Modifier Table (Rule TRT-04)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Laboratory verified unheated natural premium
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs px-2.5 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/admin/evaluation-rules"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>View Full Rule Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setShowRuleVersionsModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
