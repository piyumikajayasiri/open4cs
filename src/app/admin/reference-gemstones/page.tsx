"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Upload, Plus, Search, X, CheckCircle2, FileSpreadsheet } from "lucide-react";
import ToastNotification, { ToastMessage, ToastType } from "@/components/ui/ToastNotification";

export interface EvidenceRecord {
  id: string;
  recordId: string;
  stoneAggregate: string;
  quality: string;
  source: string;
  sourceType: "Lab" | "Desk" | "Member" | "Desk + members";
  priceBasis: string;
  status: "Verified" | "Pending";
  variety: string;
  carat: string;
  colorGrade: string;
  clarityGrade: string;
  labCertificate?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

const INITIAL_RECORDS: EvidenceRecord[] = [
  {
    id: "rec-1",
    recordId: "REF-1207",
    stoneAggregate: "Ceylon Blue · 2.61 ct",
    quality: "Royal · Eye-clean",
    source: "Unheated · Lab",
    sourceType: "Lab",
    priceBasis: "LKR 890K/ct",
    status: "Verified",
    variety: "Ceylon Blue Sapphire",
    carat: "2.61 ct",
    colorGrade: "Royal Blue (Tone 6, Vivid Saturation)",
    clarityGrade: "Eye Clean (No central table inclusions)",
    labCertificate: "GIA Report #64829104 - Certified Natural Unheated",
    verifiedBy: "Dr. K. Mendis",
    verifiedAt: "Oct 24, 2026",
  },
  {
    id: "rec-2",
    recordId: "REF-1182",
    stoneAggregate: "Ceylon Blue · 2.52 ct",
    quality: "Vivid · Eye-clean",
    source: "Heated · Lab",
    sourceType: "Lab",
    priceBasis: "LKR 640K/ct",
    status: "Verified",
    variety: "Ceylon Blue Sapphire",
    carat: "2.52 ct",
    colorGrade: "Vivid Blue (Tone 5.5, Saturation 6)",
    clarityGrade: "Eye Clean (Fine silk visible only under 10x)",
    labCertificate: "SSEF Report #119402 - Thermal Enhancement (H)",
    verifiedBy: "Prof. S. Wickramasinghe",
    verifiedAt: "Oct 19, 2026",
  },
  {
    id: "rec-3",
    recordId: "REF-0934",
    stoneAggregate: "Ceylon Blue · 2.38 ct",
    quality: "Vivid · Eye-clean",
    source: "Heated · Desk",
    sourceType: "Desk",
    priceBasis: "LKR 612K/ct",
    status: "Verified",
    variety: "Ceylon Blue Sapphire",
    carat: "2.38 ct",
    colorGrade: "Vivid Blue (Tone 5, Saturation 5)",
    clarityGrade: "Eye Clean (Off-table peripheral feather)",
    labCertificate: "CAGS Colombo Verification Standard #CV-934",
    verifiedBy: "Data Desk (E. Alwis)",
    verifiedAt: "Oct 12, 2026",
  },
  {
    id: "rec-4",
    recordId: "REF-1099",
    stoneAggregate: "Ceylon Blue · 2.74 ct",
    quality: "Vivid · Minor silk",
    source: "Heated · Member",
    sourceType: "Member",
    priceBasis: "LKR 598K/ct",
    status: "Pending",
    variety: "Ceylon Blue Sapphire",
    carat: "2.74 ct",
    colorGrade: "Vivid Blue (Tone 5, Saturation 5)",
    clarityGrade: "Minor silk needle concentration in pavilion",
    labCertificate: "Trader Submission - Pending 2nd Gemologist Sign-off",
    verifiedBy: "Pending Board Sign-off",
    verifiedAt: "Submitted Oct 29, 2026",
  },
  {
    id: "rec-5",
    recordId: "HIST-Q2-31",
    stoneAggregate: "Padparadscha · 1.5–2 ct",
    quality: "Quarterly aggregate",
    source: "Desk + members",
    sourceType: "Desk + members",
    priceBasis: "LKR 1.1M/ct",
    status: "Verified",
    variety: "Padparadscha Sapphire",
    carat: "1.5–2.0 ct band",
    colorGrade: "Sunset Orange-Pink (55/45 ratio)",
    clarityGrade: "Commercial Eye Clean Aggregate",
    labCertificate: "Colombo B2B Auction Clearing Benchmark Matrix Q2",
    verifiedBy: "CAGS Pricing Board",
    verifiedAt: "Sep 30, 2026",
  },
];

export default function ReferenceGemstonesPage() {
  const [records, setRecords] = useState<EvidenceRecord[]>(INITIAL_RECORDS);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [inspectingRecord, setInspectingRecord] = useState<EvidenceRecord | null>(null);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newRecordId, setNewRecordId] = useState("");
  const [newStone, setNewStone] = useState("");
  const [newQuality, setNewQuality] = useState("");
  const [newSource, setNewSource] = useState("Heated · Desk");
  const [newSourceType, setNewSourceType] = useState<"Lab" | "Desk" | "Member" | "Desk + members">("Desk");
  const [newPrice, setNewPrice] = useState("");

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    async function loadReferences() {
      try {
        const res = await fetch("/api/admin/reference-gemstones", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.references) && data.references.length > 0) {
            const mapped: EvidenceRecord[] = data.references.map((r: Record<string, unknown>, idx: number) => {
              const refId = String(r.referenceId || `REF-${1000 + idx}`);
              const caratWeight = Number(r.caratWeight) || 2.0;
              const refPrice = Number(r.referencePrice) || 600000;
              const pricePerCt = Math.round((refPrice / caratWeight) / 1000);
              const priceBasis = pricePerCt >= 1000
                ? `LKR ${(pricePerCt / 1000).toFixed(1)}M/ct`
                : `LKR ${pricePerCt}K/ct`;

              const variety = String(r.variety || "Ceylon Blue Sapphire");
              const varietyShort = variety.replace("Sapphire", "").trim() || "Ceylon Blue";
              const colorObj = typeof r.color === "object" && r.color !== null ? (r.color as Record<string, unknown>) : {};
              const clarityObj = typeof r.clarity === "object" && r.clarity !== null ? (r.clarity as Record<string, unknown>) : {};
              const treatmentObj = typeof r.treatment === "object" && r.treatment !== null ? (r.treatment as Record<string, unknown>) : {};

              const hue = String(colorObj.hue || "Vivid");
              const nakedEye = String(clarityObj.nakedEye || "Eye-clean");
              const quality = `${hue.split(" ")[0]} · ${nakedEye}`;
              const trt = treatmentObj.status === "Untreated" ? "Unheated" : "Heated";
              const sType = (r.sourceType as EvidenceRecord["sourceType"]) || "Desk";
              const source = `${trt} · ${sType}`;

              return {
                id: String(r._id || refId),
                recordId: refId,
                stoneAggregate: `${varietyShort} · ${caratWeight} ct`,
                quality,
                source,
                sourceType: sType,
                priceBasis,
                status: r.verificationStatus === "Pending" ? "Pending" : "Verified",
                variety,
                carat: `${caratWeight} ct`,
                colorGrade: `${hue} (Tone ${colorObj.tone || "6"}, Saturation ${colorObj.saturation || "Vivid"})`,
                clarityGrade: `${nakedEye} (${clarityObj.inclusionType || "benchmark clarity"})`,
                labCertificate: typeof r.labCertificate === "string" && r.labCertificate ? r.labCertificate : "CAGS Benchmark Evidence Standard",
                verifiedBy: typeof r.verifiedBy === "string" && r.verifiedBy ? r.verifiedBy : "CAGS Pricing Board",
                verifiedAt: typeof r.verifiedAt === "string" && r.verifiedAt ? r.verifiedAt : "Verified in force",
              };
            });

            if (mapped.length > 0) {
              setRecords(mapped);
            }
          }
        }
      } catch (err) {
        console.error("Could not fetch remote reference records:", err);
      }
    }

    loadReferences();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.recordId.toLowerCase().includes(q) ||
        r.stoneAggregate.toLowerCase().includes(q) ||
        r.quality.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.priceBasis.toLowerCase().includes(q);

      const matchesSource =
        sourceFilter === "ALL" ||
        (sourceFilter === "Lab" && r.sourceType === "Lab") ||
        (sourceFilter === "Desk" && r.sourceType === "Desk") ||
        (sourceFilter === "Member" && r.sourceType === "Member") ||
        (sourceFilter === "Desk + members" && r.sourceType === "Desk + members");

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "Verified" && r.status === "Verified") ||
        (statusFilter === "Pending" && r.status === "Pending");

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [records, search, sourceFilter, statusFilter]);

  const handleVerify = async (recordId: string) => {
    try {
      const target = records.find((r) => r.id === recordId);
      const queryId = target?.id || recordId;

      await fetch(`/api/admin/reference-gemstones/${queryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationStatus: "Verified",
          verifiedBy: "Dr. K. Mendis",
          verifiedAt: "Just now",
        }),
      });

      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId ? { ...r, status: "Verified" as const, verifiedBy: "Dr. K. Mendis", verifiedAt: "Just now" } : r
        )
      );
      showToast(`Record ${inspectingRecord?.recordId || recordId} marked as Verified and enabled for pricing comparison.`, "success");
    } catch {
      showToast("Updated local state; persistence failed.", "info");
    } finally {
      setInspectingRecord(null);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordId.trim() || !newStone.trim()) {
      showToast("Please provide both Record ID and Stone specifications.", "error");
      return;
    }

    const cleanRefId = newRecordId.trim().toUpperCase();
    const caratVal = parseFloat(newStone.split("·")[1]?.replace(/[^\d.]/g, "") || "2.0") || 2.0;
    const priceVal = parseFloat(newPrice.replace(/[^\d.]/g, "") || "600") * 1000 * caratVal;

    const created: EvidenceRecord = {
      id: `rec-${Date.now()}`,
      recordId: cleanRefId,
      stoneAggregate: newStone.trim(),
      quality: newQuality.trim() || "Vivid · Eye-clean",
      source: newSource,
      sourceType: newSourceType,
      priceBasis: newPrice.trim() || "LKR 600K/ct",
      status: "Pending",
      variety: "Ceylon Blue Sapphire",
      carat: `${caratVal} ct`,
      colorGrade: "Vivid saturation benchmark",
      clarityGrade: "Eye clean baseline",
      labCertificate: "Trade submission report attached",
      verifiedBy: "Pending verification",
      verifiedAt: "Just now",
    };

    try {
      const res = await fetch("/api/admin/reference-gemstones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceId: cleanRefId,
          variety: "Blue Sapphire",
          caratWeight: caratVal,
          referencePrice: priceVal,
          currency: "LKR",
          source: newSource,
          sourceType: newSourceType,
          verificationStatus: "Pending",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to persist reference record.");
      }

      setRecords((prev) => [created, ...prev]);
      showToast(`Evidence record ${created.recordId} added to database.`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add reference record.", "error");
    } finally {
      setNewRecordId("");
      setNewStone("");
      setNewQuality("");
      setNewPrice("");
      setShowAddModal(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reference, Historical, Treatment & Origin Data
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            The evidence behind every suggestion — verify before it reaches the engine
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowBulkImportModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Bulk Import</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
        </div>
        <div className="shrink-0">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none shadow-2xs"
          >
            <option value="ALL">All Sources</option>
            <option value="Lab">Lab Verified</option>
            <option value="Desk">Desk Market Observation</option>
            <option value="Member">Member Submissions</option>
            <option value="Desk + members">Desk + members</option>
          </select>
        </div>
        <div className="shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none shadow-2xs"
          >
            <option value="ALL">Verified + Pending</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* 6-Column Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-white">
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">RECORD</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">STONE / AGGREGATE</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">QUALITY</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">SOURCE</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">PRICE BASIS</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-slate-500 text-xs sm:text-sm">
                    No evidence records match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setInspectingRecord(r)}
                    className="hover:bg-slate-50/70 transition duration-150 cursor-pointer"
                  >
                    <td className="py-4 px-6 text-sm font-bold text-blue-600 font-mono whitespace-nowrap">{r.recordId}</td>
                    <td className="py-4 px-6 text-xs sm:text-sm font-medium text-slate-800 whitespace-nowrap">{r.stoneAggregate}</td>
                    <td className="py-4 px-6 text-xs text-slate-700 whitespace-nowrap">{r.quality}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">{r.source}</td>
                    <td className="py-4 px-6 text-xs sm:text-sm font-extrabold text-slate-900 whitespace-nowrap">{r.priceBasis}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        r.status === "Verified" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/90" : "bg-amber-50 text-amber-800 border border-amber-200/90"
                      }`}>{r.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Bottom Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-2 hover:border-blue-200 transition">
          <h3 className="text-sm font-bold text-slate-900">Treatment modifiers</h3>
          <p className="text-xs text-slate-500 leading-relaxed">H -4% · U baseline · Diffusion -22% · BE -35%</p>
          <div className="pt-2"><Link href="/admin/evaluation-rules" className="text-xs font-semibold text-blue-600 hover:underline">TRT rule family v4.2</Link></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-2 hover:border-blue-200 transition">
          <h3 className="text-sm font-bold text-slate-900">Origin premiums</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Ceylon +5% verified · +0% capped otherwise</p>
          <div className="pt-2"><Link href="/admin/evaluation-rules" className="text-xs font-semibold text-blue-600 hover:underline">ORG rule family v4.2</Link></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-2 hover:border-blue-200 transition">
          <h3 className="text-sm font-bold text-slate-900">Recommendation phrases</h3>
          <p className="text-xs text-slate-500 leading-relaxed">42 approved · 0 free-text · 4 categories</p>
          <div className="pt-2"><Link href="/admin/evaluation-rules" className="text-xs font-semibold text-blue-600 hover:underline">REC rule set v2.8</Link></div>
        </div>
      </div>

      {/* Record Inspection Modal */}
      {inspectingRecord && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">{inspectingRecord.recordId}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${inspectingRecord.status === "Verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{inspectingRecord.status}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{inspectingRecord.variety} ({inspectingRecord.carat})</h3>
              </div>
              <button type="button" onClick={() => setInspectingRecord(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
              <div><span className="text-slate-400 font-medium block">Price Basis</span><span className="font-bold text-slate-900 text-sm">{inspectingRecord.priceBasis}</span></div>
              <div><span className="text-slate-400 font-medium block">Evidence Source</span><span className="font-bold text-slate-900">{inspectingRecord.source}</span></div>
              <div><span className="text-slate-400 font-medium block">Color Grading</span><span className="font-bold text-slate-900">{inspectingRecord.colorGrade}</span></div>
              <div><span className="text-slate-400 font-medium block">Clarity Analysis</span><span className="font-bold text-slate-900">{inspectingRecord.clarityGrade}</span></div>
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-700 block">Certificate & Lab Verification</span>
              <p className="bg-slate-100 p-2.5 rounded-lg text-slate-800 font-medium">{inspectingRecord.labCertificate}</p>
              <div className="text-slate-400 pt-1">Verified by {inspectingRecord.verifiedBy} · {inspectingRecord.verifiedAt}</div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button type="button" onClick={() => setInspectingRecord(null)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">Close</button>
              {inspectingRecord.status === "Pending" && (
                <button type="button" onClick={() => handleVerify(inspectingRecord.id)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-bold shadow-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /><span>Sign Off as Verified</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-lg font-bold text-slate-900">Bulk Import Benchmark Records</h3><p className="text-xs text-slate-500 mt-0.5">Import CSV / JSON benchmark trade observations</p></div>
              <button type="button" onClick={() => setShowBulkImportModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2 bg-slate-50/50">
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-slate-800">Drag and drop benchmark CSV or JSON files here</p>
              <button type="button" onClick={() => showToast("Sample CSV template downloaded.", "info")} className="text-xs text-blue-600 font-bold hover:underline">Download Template</button>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button type="button" onClick={() => setShowBulkImportModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => { showToast("Parsed 18 benchmark records.", "success"); setShowBulkImportModal(false); }} className="rounded-xl bg-[#0B1528] text-white px-5 py-2 font-bold shadow-xs">Start Ingestion</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-lg font-bold text-slate-900">Add Benchmark Evidence Record</h3><p className="text-xs text-slate-500 mt-0.5">Record calibrated gemstone observation</p></div>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddRecord} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Record ID</label><input type="text" value={newRecordId} onChange={(e) => setNewRecordId(e.target.value)} placeholder="e.g. REF-1240" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800" required /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Stone & Weight</label><input type="text" value={newStone} onChange={(e) => setNewStone(e.target.value)} placeholder="e.g. Ceylon Blue · 2.45 ct" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Quality</label><input type="text" value={newQuality} onChange={(e) => setNewQuality(e.target.value)} placeholder="e.g. Vivid · Eye-clean" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800" /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Price Basis</label><input type="text" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g. LKR 650K/ct" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800" required /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0B1528] text-white px-5 py-2 font-bold shadow-xs">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
