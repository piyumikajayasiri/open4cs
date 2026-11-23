"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  X,
  CheckCircle2,
  Upload,
  AlertCircle,
  FileText,
  Eye,
  Edit,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Archive,
  Layers,
  Coins,
  CheckSquare,
  Activity,
  TrendingUp,
  BarChart3,
  Scale,
  Award,
  Download,
} from "lucide-react";
import ToastNotification, { ToastMessage, ToastType } from "@/components/ui/ToastNotification";
import ReferenceGemstoneForm from "@/components/admin/ReferenceGemstoneForm";
import { ShadcnSelect } from "@/components/ui/select";

export interface FullReferenceRecord {
  _id: string;
  referenceId: string;
  lotId?: string;
  species?: string;
  variety: string;
  naturalStatus?: string;
  caratWeight: number;
  shape?: string;
  dimensions?: { length: number | null; width: number | null; depth: number | null };
  sourceColor?: string;
  color: {
    hue: string;
    tone: string;
    saturation: string;
    distribution: string;
    zoning: string;
  };
  claritySystem?: string;
  clarity: {
    nakedEye: string;
    loupe10x: string;
    inclusionType?: string;
    inclusionLocation?: string;
    severity: string;
  };
  cut: {
    length?: number | null;
    width?: number | null;
    depth?: number | null;
    symmetry: string;
    polish: string;
    windowing: string;
    extinction: string;
    bulging: string;
  };
  treatment: { status: string };
  treatmentEvidence?: string;
  claimedOrigin?: string;
  labOrigin?: string;
  origin: { value: string; reliability: string };
  originEvidence?: string;
  labName?: string;
  labReportNumber?: string;
  labReportUrl?: string;
  labCertificate?: string;
  referencePrice: number;
  pricePerCarat?: number;
  priceAmount?: number;
  currency: string;
  feesDisclosed?: string;
  taxesDisclosed?: string;
  source: string;
  sourceType?: string;
  sourceUrl?: string;
  publisher?: string;
  evidenceNotes?: string;
  sourceEvidence?: string;
  status: "ACTIVE" | "INACTIVE";
  verificationStatus: "Draft" | "Pending" | "Verified" | "Rejected" | "Archived";
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  reviewer?: string;
  reviewDate?: string;
  dataClassification: "Real" | "Demo";
  observationDate?: string;
  saleDate?: string;
  marketLocation?: string;
  transactionContext: string;
  marketContext: string;
  photoUrl?: string;
  limitations?: string;
  version?: number;
}

export default function ReferenceGemstonesPage() {
  const [references, setReferences] = useState<FullReferenceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [varietyFilter, setVarietyFilter] = useState("ALL");
  const [classificationFilter, setClassificationFilter] = useState("ALL");
  const [marketContextFilter, setMarketContextFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Panels
  const [inspectingRecord, setInspectingRecord] = useState<FullReferenceRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<FullReferenceRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showValidationAuditModal, setShowValidationAuditModal] = useState(false);
  const [runningAudit, setRunningAudit] = useState(false);
  const [auditData, setAuditData] = useState<{
    timestamp: string;
    summary: {
      totalRecords: number;
      realRecords: number;
      demoRecords: number;
      wholesaleCompleted: number;
      healthScore: number;
      overallLoocvMdape: number;
      overallLoocvMape: number;
      calibratedCategories: number;
    };
    varieties: Record<string, {
      totalCount: number;
      wholesaleCount: number;
      auctionCount: number;
      retailCount: number;
      status: "CALIBRATED" | "PROVISIONAL" | "UNAVAILABLE";
      loocvCount: number;
      loocvMdape: number;
      loocvMape: number;
      avgPricePerCaratLkr: number;
      dispersionPct: number;
      pricePerCaratMin: number;
      pricePerCaratMax: number;
      recentSaleDate?: string;
    }>;
  } | null>(null);
  const [rejectingRecord, setRejectingRecord] = useState<FullReferenceRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [syncingEvidence, setSyncingEvidence] = useState(false);

  // Import State
  const [importText, setImportText] = useState("");
  const [autoVerifyImport, setAutoVerifyImport] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    totalRows: number;
    validCount: number;
    errorCount: number;
    duplicateCount: number;
    validatedRows: Array<{
      rowIndex: number;
      referenceId: string;
      variety: string;
      caratWeight: number;
      referencePrice: number;
      pricePerCarat: number;
      currency: string;
      dataClassification: string;
      isValid: boolean;
      isDuplicate: boolean;
      duplicateReason?: string;
      errors: string[];
    }>;
  } | null>(null);
  const [importing, setImporting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const loadReferences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reference-gemstones", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.references)) {
          setReferences(data.references);
        }
      } else {
        showToast("Failed to fetch reference database records.", "error");
      }
    } catch (err) {
      console.error("Fetch references error:", err);
      showToast("Network error fetching reference records.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/reference-gemstones", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && Array.isArray(data.references)) {
          setReferences(data.references);
        }
      })
      .catch((err) => {
        console.error("Initial fetch references error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = references.length;
    const real = references.filter((r) => r.dataClassification === "Real" && r.status === "ACTIVE").length;
    const wholesaleCompleted = references.filter(
      (r) => r.dataClassification === "Real" && r.status === "ACTIVE" && r.transactionContext === "Completed Sale" && r.marketContext === "Wholesale"
    ).length;
    const pending = references.filter((r) => r.verificationStatus === "Pending").length;
    const demo = references.filter((r) => r.dataClassification === "Demo").length;

    return { total, real, wholesaleCompleted, pending, demo };
  }, [references]);

  // Filtered references
  const filteredReferences = useMemo(() => {
    return references.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.referenceId.toLowerCase().includes(q) ||
        r.variety.toLowerCase().includes(q) ||
        (r.source || "").toLowerCase().includes(q) ||
        (r.labCertificate || "").toLowerCase().includes(q) ||
        (r.labName || "").toLowerCase().includes(q) ||
        (r.marketLocation || "").toLowerCase().includes(q);

      const matchesVariety =
        varietyFilter === "ALL" || r.variety.toLowerCase().includes(varietyFilter.toLowerCase());

      const matchesClassification =
        classificationFilter === "ALL" || r.dataClassification === classificationFilter;

      const matchesMarket =
        marketContextFilter === "ALL" || r.marketContext === marketContextFilter;

      const matchesStatus =
        statusFilter === "ALL" || r.verificationStatus === statusFilter;

      return matchesSearch && matchesVariety && matchesClassification && matchesMarket && matchesStatus;
    });
  }, [references, search, varietyFilter, classificationFilter, marketContextFilter, statusFilter]);

  // Handle Verify Action
  const handleVerify = async (ref: FullReferenceRecord) => {
    try {
      const res = await fetch(`/api/admin/reference-gemstones/${encodeURIComponent(ref._id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: "Verified" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Reference ${ref.referenceId} verified and activated for pricing engine.`);
        if (inspectingRecord?._id === ref._id) {
          setInspectingRecord(data.reference);
        }
        loadReferences();
      } else {
        showToast(data.message || "Failed to verify reference record.", "error");
      }
    } catch {
      showToast("Network error verifying reference.", "error");
    }
  };

  // Handle Reject Action
  const handleReject = async () => {
    if (!rejectingRecord) return;
    try {
      const res = await fetch(`/api/admin/reference-gemstones/${encodeURIComponent(rejectingRecord._id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationStatus: "Rejected",
          rejectionReason: rejectionReason.trim() || "Criteria not met during review",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Reference ${rejectingRecord.referenceId} rejected.`, "error");
        setRejectingRecord(null);
        setRejectionReason("");
        if (inspectingRecord?._id === rejectingRecord._id) {
          setInspectingRecord(data.reference);
        }
        loadReferences();
      } else {
        showToast(data.message || "Failed to reject record.", "error");
      }
    } catch {
      showToast("Network error rejecting record.", "error");
    }
  };

  // Handle Archive Action
  const handleArchive = async (ref: FullReferenceRecord) => {
    if (!confirm(`Are you sure you want to deactivate and archive reference ${ref.referenceId}? It will be immediately excluded from commercial pricing.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/reference-gemstones/${encodeURIComponent(ref._id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Reference ${ref.referenceId} deactivated and archived.`);
        if (inspectingRecord?._id === ref._id) {
          setInspectingRecord(null);
        }
        loadReferences();
      } else {
        showToast(data.message || "Failed to archive record.", "error");
      }
    } catch {
      showToast("Network error archiving record.", "error");
    }
  };

  // Handle Run Live Validation Audit
  const handleRunValidationAudit = async () => {
    try {
      setRunningAudit(true);
      setShowValidationAuditModal(true);
      const res = await fetch("/api/admin/reference-gemstones/validate", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuditData(data);
      } else {
        showToast(data.message || "Failed to execute validation audit.", "error");
      }
    } catch {
      showToast("Network error running live validation audit.", "error");
    } finally {
      setRunningAudit(false);
    }
  };

  // Handle Sync Evidence to Registry File
  const handleSyncEvidence = async () => {
    try {
      setSyncingEvidence(true);
      const res = await fetch("/api/admin/reference-gemstones/sync-evidence", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Synced ${data.count} real market references from MongoDB into registry file.`);
      } else {
        showToast(data.message || "Failed to sync evidence file.", "error");
      }
    } catch {
      showToast("Network error syncing evidence file.", "error");
    } finally {
      setSyncingEvidence(false);
    }
  };

  // Handle Analyze Import Preview
  const handleAnalyzeImport = async () => {
    if (!importText.trim()) {
      showToast("Please paste CSV or JSON data to analyze.", "error");
      return;
    }

    try {
      setImporting(true);
      const payload: Record<string, unknown> = { mode: "preview", autoVerify: autoVerifyImport };

      const trimmed = importText.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed);
          payload.records = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          showToast("Invalid JSON syntax. Please check formatting.", "error");
          setImporting(false);
          return;
        }
      } else {
        payload.csvData = trimmed;
      }

      const res = await fetch("/api/admin/reference-gemstones/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportPreview(data);
        showToast(`Parsed ${data.totalRows} rows: ${data.validCount} valid, ${data.duplicateCount} duplicates, ${data.errorCount} errors.`);
      } else {
        showToast(data.message || "Failed to analyze import data.", "error");
      }
    } catch {
      showToast("Network error parsing import data.", "error");
    } finally {
      setImporting(false);
    }
  };

  // Handle Commit Import
  const handleCommitImport = async () => {
    if (!importPreview || importPreview.validCount === 0) {
      showToast("No valid rows ready to import.", "error");
      return;
    }

    try {
      setImporting(true);
      const payload: Record<string, unknown> = { mode: "commit", autoVerify: autoVerifyImport };

      const trimmed = importText.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        payload.records = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        payload.csvData = trimmed;
      }

      const res = await fetch("/api/admin/reference-gemstones/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Successfully imported ${data.insertedCount} new records and updated ${data.updatedCount}.`);
        setShowImportModal(false);
        setImportText("");
        setImportPreview(null);
        loadReferences();
      } else {
        showToast(data.message || "Failed to commit import.", "error");
      }
    } catch {
      showToast("Network error executing import.", "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              CAGS Pricing Governance
            </span>
            <span className="text-xs text-slate-400 font-mono">v4.2 Engine Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reference Gemstone Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Traceable market evidence database powering B2B valuation comparables. Maintain loose corundum completed sales, auction lots, and verified dealer parcels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadReferences()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-semibold shadow-2xs transition"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            id="admin-run-validation-audit-btn"
            onClick={handleRunValidationAudit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-3.5 py-2 text-xs font-bold shadow-2xs transition"
            title="Execute live cross-validation & benchmark health audit"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>Run Validation Audit</span>
          </button>

          <button
            id="admin-sync-evidence-btn"
            onClick={handleSyncEvidence}
            disabled={syncingEvidence}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-semibold shadow-2xs transition"
            title="Synchronize all MongoDB real market references into data/market-references-evidence.json"
          >
            <Download className={`w-3.5 h-3.5 text-emerald-600 ${syncingEvidence ? "animate-bounce" : ""}`} />
            <span>{syncingEvidence ? "Syncing..." : "Sync File"}</span>
          </button>

          <button
            id="admin-bulk-import-btn"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-semibold shadow-2xs transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Bulk Import (CSV/JSON)</span>
          </button>

          <button
            id="admin-add-record-btn"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-2xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reference</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Records</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{stats.total}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Stored database references</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Real Market</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{stats.real}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Documented real market</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Wholesale Sales</span>
            <Coins className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono">{stats.wholesaleCompleted}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Active commercial benchmark</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Review</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">{stats.pending}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting gemologist sign-off</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-purple-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Demo / Benchmark</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">{stats.demo}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Pedagogical test references</p>
        </div>
      </div>

      {/* Multi-Dimensional Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Text Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, variety, origin, lab..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Variety Filter */}
          <div>
            <ShadcnSelect
              value={varietyFilter}
              onValueChange={setVarietyFilter}
              options={[
                { value: "ALL", label: "All Varieties" },
                { value: "Blue Sapphire", label: "Blue Sapphire" },
                { value: "Padparadscha", label: "Padparadscha" },
                { value: "Ruby", label: "Ruby" },
              ]}
            />
          </div>

          {/* Classification Filter */}
          <div>
            <ShadcnSelect
              value={classificationFilter}
              onValueChange={setClassificationFilter}
              options={[
                { value: "ALL", label: "All Classifications" },
                { value: "Real", label: "Real Market Data Only" },
                { value: "Demo", label: "Demonstration / Pedagogical" },
              ]}
            />
          </div>

          {/* Market Context Filter */}
          <div>
            <ShadcnSelect
              value={marketContextFilter}
              onValueChange={setMarketContextFilter}
              options={[
                { value: "ALL", label: "All Market Contexts" },
                { value: "Wholesale", label: "Wholesale (B2B Clearing)" },
                { value: "Auction", label: "Auction Results" },
                { value: "Retail", label: "Retail Asking Prices" },
              ]}
            />
          </div>

          {/* Verification Status Filter */}
          <div>
            <ShadcnSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { value: "ALL", label: "All Review Statuses" },
                { value: "Verified", label: "Verified Only" },
                { value: "Pending", label: "Pending Sign-off" },
                { value: "Rejected", label: "Rejected" },
                { value: "Archived", label: "Archived / Inactive" },
              ]}
            />
          </div>
        </div>

        {/* Active Filter Indicators */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-800 font-mono">{filteredReferences.length}</strong> of{" "}
            <span className="font-mono">{references.length}</span> reference records
          </div>
          {(search || varietyFilter !== "ALL" || classificationFilter !== "ALL" || marketContextFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setVarietyFilter("ALL");
                setClassificationFilter("ALL");
                setMarketContextFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Structured Reference Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50">
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">RECORD ID</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">STONE &amp; CARAT</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">CONTEXT / MARKET</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">PRICE BASIS</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">LAB CERT / ORIGIN</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">STATUS</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredReferences.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center text-slate-500">
                    No reference records match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReferences.map((r) => {
                  const pricePerCt = r.pricePerCarat || (r.caratWeight > 0 ? Math.round(r.referencePrice / r.caratWeight) : r.referencePrice);
                  const isReal = r.dataClassification === "Real";

                  return (
                    <tr
                      key={r._id}
                      onClick={() => setInspectingRecord(r)}
                      className="cursor-pointer hover:bg-slate-50/80 transition duration-150"
                    >
                      {/* Record ID & Tag */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">{r.referenceId}</span>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isReal
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {r.dataClassification}
                          </span>
                        </div>
                        {r.lotId && <div className="text-[11px] text-slate-400 font-mono mt-0.5">{r.lotId}</div>}
                      </td>

                      {/* Variety & Carat */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{r.variety}</div>
                        <div className="text-xs text-slate-500 font-medium">
                          {r.caratWeight} ct · {r.shape || "Oval"} · {r.color.hue}
                        </div>
                      </td>

                      {/* Context & Market */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {r.transactionContext}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {r.marketContext} {r.marketLocation ? `· ${r.marketLocation}` : ""}
                        </div>
                      </td>

                      {/* Price Basis */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">
                          {r.currency} {pricePerCt.toLocaleString()} / ct
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Total: {r.currency} {r.referencePrice.toLocaleString()}
                        </div>
                      </td>

                      {/* Lab Cert & Origin */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-800">
                          {r.labName || r.labCertificate || "Trade Register Inspection"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {r.origin.value} ({r.treatment.status})
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                            r.verificationStatus === "Verified"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : r.verificationStatus === "Pending"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : r.verificationStatus === "Rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {r.verificationStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-5 whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectingRecord(r)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
                            title="Inspect complete gemological specs & evidence"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditingRecord(r)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="Edit reference specifications"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {r.verificationStatus === "Pending" && (
                            <button
                              onClick={() => handleVerify(r)}
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                              title="Approve & Verify immediately"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {r.verificationStatus !== "Archived" && (
                            <button
                              onClick={() => handleArchive(r)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                              title="Archive reference"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT DETAIL MODAL / DRAWER */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-blue-600">{inspectingRecord.referenceId}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      inspectingRecord.dataClassification === "Real"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {inspectingRecord.dataClassification}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">v{inspectingRecord.version || 1}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {inspectingRecord.variety} · {inspectingRecord.caratWeight} ct ({inspectingRecord.shape || "Oval"})
                </h3>
              </div>
              <button
                onClick={() => setInspectingRecord(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4C Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Color</span>
                <div className="font-semibold text-xs text-slate-800 mt-0.5">{inspectingRecord.color.hue}</div>
                <div className="text-[11px] text-slate-500">
                  Tone {inspectingRecord.color.tone} · Sat {inspectingRecord.color.saturation}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clarity</span>
                <div className="font-semibold text-xs text-slate-800 mt-0.5">{inspectingRecord.clarity.nakedEye}</div>
                <div className="text-[11px] text-slate-500">10x: {inspectingRecord.clarity.loupe10x}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cut &amp; Polish</span>
                <div className="font-semibold text-xs text-slate-800 mt-0.5">
                  {inspectingRecord.cut.symmetry} / {inspectingRecord.cut.polish}
                </div>
                <div className="text-[11px] text-slate-500">
                  {inspectingRecord.dimensions?.length ? `${inspectingRecord.dimensions.length}×${inspectingRecord.dimensions.width} mm` : "Standard cut"}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Carat Weight</span>
                <div className="font-semibold text-xs text-slate-800 mt-0.5">{inspectingRecord.caratWeight} ct</div>
                <div className="text-[11px] text-slate-500">{inspectingRecord.species || "Corundum"}</div>
              </div>
            </div>

            {/* Pricing & Market Layer Breakdown */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Market Price &amp; Valuation Context</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400">Price Per Carat</span>
                  <div className="font-mono font-bold text-sm text-blue-600">
                    {inspectingRecord.currency}{" "}
                    {(
                      inspectingRecord.pricePerCarat ||
                      Math.round(inspectingRecord.referencePrice / inspectingRecord.caratWeight)
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Total Price</span>
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {inspectingRecord.currency} {inspectingRecord.referencePrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Transaction Context</span>
                  <div className="text-xs font-bold text-slate-800">{inspectingRecord.transactionContext}</div>
                </div>
              </div>
              {inspectingRecord.feesDisclosed && (
                <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <strong>Fees / Taxes:</strong> {inspectingRecord.feesDisclosed}
                </div>
              )}
            </div>

            {/* Lab Verification & Provenance */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Laboratory Certification &amp; Origin</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Origin / Reliability:</span>
                  <div className="font-semibold text-slate-800">
                    {inspectingRecord.origin.value} ({inspectingRecord.origin.reliability} confidence)
                  </div>
                  {inspectingRecord.originEvidence && (
                    <div className="text-[11px] text-slate-500 mt-0.5">{inspectingRecord.originEvidence}</div>
                  )}
                </div>

                <div>
                  <span className="text-slate-400">Treatment Enhancement:</span>
                  <div className="font-semibold text-slate-800">{inspectingRecord.treatment.status}</div>
                  {inspectingRecord.treatmentEvidence && (
                    <div className="text-[11px] text-slate-500 mt-0.5">{inspectingRecord.treatmentEvidence}</div>
                  )}
                </div>
              </div>

              {(inspectingRecord.labName || inspectingRecord.labCertificate) && (
                <div className="bg-slate-50 p-2.5 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Lab Report: </span>
                    <strong className="text-slate-800">
                      {inspectingRecord.labName || inspectingRecord.labCertificate}{" "}
                      {inspectingRecord.labReportNumber ? `#${inspectingRecord.labReportNumber}` : ""}
                    </strong>
                  </div>
                  {inspectingRecord.labReportUrl && (
                    <a
                      href={inspectingRecord.labReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-semibold"
                    >
                      <span>View Report</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Source & Audit Metadata */}
            <div className="text-xs text-slate-500 space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <div>
                <strong>Source:</strong> {inspectingRecord.source} ({inspectingRecord.sourceType || "Trade Registry"})
              </div>
              {inspectingRecord.sourceEvidence && <div><strong>Evidence Notes:</strong> {inspectingRecord.sourceEvidence}</div>}
              <div>
                <strong>Verification State:</strong>{" "}
                <span className="font-semibold text-slate-800">{inspectingRecord.verificationStatus}</span>
                {inspectingRecord.verifiedBy ? ` by ${inspectingRecord.verifiedBy}` : ""}{" "}
                {inspectingRecord.verifiedAt ? `on ${new Date(inspectingRecord.verifiedAt).toLocaleDateString()}` : ""}
              </div>
              {inspectingRecord.rejectionReason && (
                <div className="text-rose-600 font-medium">
                  <strong>Rejection Reason:</strong> {inspectingRecord.rejectionReason}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  const toEdit = inspectingRecord;
                  setInspectingRecord(null);
                  setEditingRecord(toEdit);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Specs</span>
              </button>

              {inspectingRecord.verificationStatus === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      setRejectingRecord(inspectingRecord);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    id="admin-sign-off-btn"
                    onClick={() => handleVerify(inspectingRecord)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve &amp; Activate</span>
                  </button>
                </>
              )}

              {inspectingRecord.verificationStatus !== "Archived" && (
                <button
                  onClick={() => handleArchive(inspectingRecord)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold transition"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD REFERENCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add New Reference Gemstone</h3>
                <p className="text-xs text-slate-500">
                  Register a verified market observation, auction hammer, or trade parcel clearing record.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ReferenceGemstoneForm
              isModal={true}
              onSuccess={() => {
                showToast("New market reference gemstone registered successfully.");
                setShowAddModal(false);
                loadReferences();
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* EDIT REFERENCE MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Edit Reference: {editingRecord.referenceId}
                </h3>
                <p className="text-xs text-slate-500">
                  Modifying this record will automatically increment its version and append an immutable entry to the audit log.
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ReferenceGemstoneForm
              isModal={true}
              isEdit={true}
              recordDbId={editingRecord._id}
              initialData={{
                referenceId: editingRecord.referenceId,
                variety: editingRecord.variety,
                caratWeight: String(editingRecord.caratWeight),
                dataClassification: editingRecord.dataClassification,
                transactionContext: editingRecord.transactionContext as "Completed Sale" | "Asking Price" | "",
                marketContext: editingRecord.marketContext as "Wholesale" | "Retail" | "Auction" | "",
                length: editingRecord.cut.length ? String(editingRecord.cut.length) : "",
                width: editingRecord.cut.width ? String(editingRecord.cut.width) : "",
                depth: editingRecord.cut.depth ? String(editingRecord.cut.depth) : "",
                hue: editingRecord.color.hue,
                tone: editingRecord.color.tone,
                saturation: editingRecord.color.saturation,
                distribution: editingRecord.color.distribution,
                zoning: editingRecord.color.zoning,
                nakedEye: editingRecord.clarity.nakedEye,
                loupe10x: editingRecord.clarity.loupe10x,
                severity: editingRecord.clarity.severity,
                inclusionType: editingRecord.clarity.inclusionType || "",
                symmetry: editingRecord.cut.symmetry,
                polish: editingRecord.cut.polish,
                windowing: editingRecord.cut.windowing,
                extinction: editingRecord.cut.extinction,
                bulging: editingRecord.cut.bulging,
                treatmentStatus: editingRecord.treatment.status,
                originValue: editingRecord.origin.value,
                originReliability: editingRecord.origin.reliability,
                referencePrice: String(editingRecord.referencePrice),
                currency: editingRecord.currency as "LKR" | "USD",
                source: editingRecord.source,
                sourceEvidence: editingRecord.sourceEvidence || "",
                labCertificate: editingRecord.labCertificate || "",
                observationDate: editingRecord.observationDate || new Date().toISOString().split("T")[0],
              }}
              onSuccess={() => {
                showToast(`Reference ${editingRecord.referenceId} updated to a new version.`);
                setEditingRecord(null);
                loadReferences();
              }}
              onCancel={() => setEditingRecord(null)}
            />
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Reject Reference {rejectingRecord.referenceId}</h3>
            </div>
            <p className="text-xs text-slate-600">
              Please state why this reference record is rejected. This reason will be permanently archived in the audit trail.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Inconclusive origin determination; insufficient clarity disclosure; anomalous price spike"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectingRecord(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Bulk Reference Import (CSV / JSON)</h3>
                <p className="text-xs text-slate-500">
                  Import multiple research lots with pre-validation, duplicate detection, and preview.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                  setImportText("");
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Paste CSV or JSON Array Data
                </label>
                <span className="text-[11px] text-slate-400">Headers: referenceId, variety, carat, price, currency, treatment, origin</span>
              </div>
              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportPreview(null);
                }}
                rows={7}
                placeholder={`referenceId,variety,carat,price,currency,treatment,origin,source\nREF-BRW-2026-01,Blue Sapphire,2.40,1500000,LKR,Heated,Sri Lanka,Beruwala Gem Exchange\nREF-RAT-2026-02,Blue Sapphire,2.15,1900000,LKR,Untreated,Sri Lanka,Ratnapura Trade`}
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs font-mono text-slate-800 outline-none focus:border-blue-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={autoVerifyImport}
                    onChange={(e) => setAutoVerifyImport(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Auto-verify records immediately on import</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAnalyzeImport}
                    disabled={importing || !importText.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Analyze &amp; Preview</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Results Table */}
            {importPreview && (
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Validation Preview</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                      Total: {importPreview.totalRows}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                      Valid: {importPreview.validCount}
                    </span>
                    {importPreview.duplicateCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                        Duplicates: {importPreview.duplicateCount}
                      </span>
                    )}
                    {importPreview.errorCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono">
                        Errors: {importPreview.errorCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase text-slate-400">Row</th>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase text-slate-400">Ref ID</th>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase text-slate-400">Stone</th>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase text-slate-400">Price Basis</th>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase text-slate-400">Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {importPreview.validatedRows.map((vr) => (
                        <tr key={vr.rowIndex} className={!vr.isValid ? "bg-rose-50/60" : vr.isDuplicate ? "bg-amber-50/60" : ""}>
                          <td className="py-2 px-3 text-slate-500">{vr.rowIndex}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{vr.referenceId}</td>
                          <td className="py-2 px-3">{vr.variety} ({vr.caratWeight}ct)</td>
                          <td className="py-2 px-3">
                            {vr.currency} {vr.pricePerCarat.toLocaleString()}/ct
                          </td>
                          <td className="py-2 px-3">
                            {vr.isValid && !vr.isDuplicate ? (
                              <span className="text-emerald-700 font-semibold">Ready to import</span>
                            ) : vr.isDuplicate ? (
                              <span className="text-amber-700 font-semibold" title={vr.duplicateReason}>
                                Duplicate (will update)
                              </span>
                            ) : (
                              <span className="text-rose-700 font-semibold" title={vr.errors.join("; ")}>
                                Error: {vr.errors[0]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setImportPreview(null);
                      setImportText("");
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                  <button
                    id="admin-confirm-import-btn"
                    onClick={handleCommitImport}
                    disabled={importing || importPreview.validCount === 0}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
                  >
                    {importing ? "Importing..." : `Commit Import (${importPreview.validCount} valid)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIVE VALIDATION AUDIT MODAL */}
      {showValidationAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs">
                  <Activity className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Market Reference Validation &amp; Calibration Audit
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      LOOCV Engine Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live Leave-One-Out Cross-Validation on verified wholesale corundum transactions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunValidationAudit}
                  disabled={runningAudit}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  title="Re-run validation audit"
                >
                  <RefreshCw className={`w-4 h-4 ${runningAudit ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setShowValidationAuditModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading Indicator */}
            {runningAudit && !auditData && (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600">
                  Executing LOOCV cross-validation across verified wholesale records...
                </p>
              </div>
            )}

            {/* Audit Results */}
            {auditData && (
              <div className="space-y-6">
                {/* Top KPI Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 rounded-2xl p-4 border border-indigo-100 shadow-2xs">
                    <div className="flex items-center justify-between text-indigo-700 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Health Score</span>
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="text-3xl font-black text-indigo-900 font-mono">
                      {auditData.summary.healthScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                    </div>
                    <p className="text-[11px] text-indigo-700/80 mt-1">
                      {auditData.summary.healthScore >= 90 ? "Excellent calibration health" : "Good calibration health"}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center justify-between text-emerald-700 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Overall MdAPE</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-black text-emerald-700 font-mono">
                      {auditData.summary.overallLoocvMdape}%
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Median LOOCV error on real sales
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center justify-between text-blue-700 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Real Evidence</span>
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-3xl font-black text-blue-700 font-mono">
                      {auditData.summary.realRecords}{" "}
                      <span className="text-xs font-normal text-slate-400">/ {auditData.summary.totalRecords}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {Math.round((auditData.summary.realRecords / auditData.summary.totalRecords) * 100)}% verified real transactions
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-600 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Wholesale Sales</span>
                      <Coins className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 font-mono">
                      {auditData.summary.wholesaleCompleted}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {auditData.summary.calibratedCategories}/3 categories calibrated (N &ge; 4)
                    </p>
                  </div>
                </div>

                {/* Category-by-Category Calibration Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Category LOOCV Benchmarks &amp; Calibration Status</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Audit run: {new Date(auditData.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {Object.entries(auditData.varieties).map(([varietyName, vm]) => (
                      <div
                        key={varietyName}
                        className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-sm font-extrabold text-slate-900">{varietyName}</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              vm.status === "CALIBRATED"
                                ? "bg-emerald-100 text-emerald-800"
                                : vm.status === "PROVISIONAL"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {vm.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Wholesale Completed:</span>
                            <span className="font-mono font-bold text-slate-900">{vm.wholesaleCount} verified</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-500">Benchmark Rate:</span>
                            <span className="font-mono font-bold text-indigo-700">
                              LKR {vm.avgPricePerCaratLkr.toLocaleString()} / ct
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-500">Clearing Spread:</span>
                            <span className="font-mono text-slate-700 text-[11px]">
                              {Math.round(vm.pricePerCaratMin / 1000)}k – {Math.round(vm.pricePerCaratMax / 1000)}k / ct
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-500">Market Dispersion:</span>
                            <span className="font-mono font-semibold text-slate-700">{vm.dispersionPct}%</span>
                          </div>

                          <div className="flex justify-between pt-1 border-t border-slate-100">
                            <span className="text-slate-700 font-semibold">LOOCV MdAPE:</span>
                            <span className="font-mono font-black text-emerald-700">
                              {vm.loocvMdape > 0 ? `${vm.loocvMdape}%` : "—"}
                            </span>
                          </div>

                          {vm.recentSaleDate && (
                            <div className="text-[10px] text-slate-400 text-right">
                              Latest trade: {vm.recentSaleDate}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Methodological Safeguards */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    <Scale className="w-3.5 h-3.5 text-slate-600" />
                    <span>Engine Integrity &amp; Calibration Rules</span>
                  </div>
                  <ul className="grid sm:grid-cols-3 gap-2 text-[11px] leading-relaxed pt-1">
                    <li className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                      <strong className="text-slate-800 block mb-0.5">Size-Tier Scaling:</strong>
                      Adjusts price-per-carat non-linearly across natural corundum weight tiers (&lt;2ct: 1.0, 2–3ct: 1.15, 3–5ct: 1.35, &ge;5ct: 1.65).
                    </li>
                    <li className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                      <strong className="text-slate-800 block mb-0.5">Outlier Suppression:</strong>
                      Automatically dampens comparables deviating &gt;65% from the peer median by 0.4&times; when pool &ge; 5 records.
                    </li>
                    <li className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                      <strong className="text-slate-800 block mb-0.5">Zero Synthetic Bias:</strong>
                      100% of commercial valuations rely solely on verified completed wholesale sales backed by accredited laboratory reports.
                    </li>
                  </ul>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `open4cs-validation-audit-${new Date().toISOString().split("T")[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export Audit Report (JSON)</span>
                  </button>

                  <button
                    onClick={() => setShowValidationAuditModal(false)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                  >
                    Close Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
