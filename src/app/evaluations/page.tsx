"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/layout/PortalSidebar";
import {
  FileText,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Download,
  GitCompare,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { ShadcnSelect } from "@/components/ui/select";

interface EvaluationItem {
  _id: string;
  createdAt: string;
  status: string;
  ruleVersion: string;
  gemstoneId?: {
    _id?: string;
    variety?: string;
    caratWeight?: number;
    color?: { hue?: string; tone?: string; saturation?: string };
    clarity?: { nakedEye?: string };
  };
  result?: {
    overall4C?: { score: number | null };
    color?: { score: number | null };
    clarity?: { score: number | null };
    cut?: { score: number | null };
    carat?: { score: number | null };
  };
  priceSuggestion?: {
    currency?: string | null;
    suggestedPrice?: number | null;
    minimumPrice?: number | null;
    maximumPrice?: number | null;
    formattedPriceRange?: string | null;
  };
}

export default function MyEvaluationsPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVariety, setFilterVariety] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvaluations() {
      try {
        setLoading(true);
        const res = await fetch("/api/evaluations", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setEvaluations(data);
          } else {
            setEvaluations([]);
          }
        } else {
          setEvaluations([]);
        }
      } catch (err) {
        console.error("Failed to load evaluations:", err);
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvaluations();
  }, []);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      const variety = item.gemstoneId?.variety || "Gemstone";
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        variety.toLowerCase().includes(q) ||
        item._id.toLowerCase().includes(q);

      const matchesVariety =
        filterVariety === "ALL" ||
        variety.toLowerCase().includes(filterVariety.toLowerCase());

      return matchesSearch && matchesVariety;
    });
  }, [evaluations, search, filterVariety]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDownloadPdf = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setDownloadingId(id);
      const res = await fetch(`/api/evaluations/${id}/report`);
      if (!res.ok) {
        alert("Failed to generate PDF report.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Open4Cs-Assessment-Report-${id.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Error downloading PDF report.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCompareSelected = () => {
    if (selectedIds.length < 2) return;
    router.push(`/compare?ids=${selectedIds.join(",")}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      <PortalSidebar activeItem="my_evaluations" />

      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0E2A47]">
                User Portfolio
              </span>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                My Evaluations
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Evidence-based 4C assessments, market price indications, and official reports.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/evaluate/gemstone"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0E2A47] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Evaluation</span>
              </Link>
            </div>
          </div>

          {/* Search, Filter & Secondary Compare Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search evaluations by variety or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0E2A47]"
                />
              </div>

              <div className="w-full sm:w-56 shrink-0">
                <ShadcnSelect
                  value={filterVariety}
                  onValueChange={setFilterVariety}
                  options={[
                    { value: "ALL", label: "All Varieties" },
                    { value: "Blue Sapphire", label: "Blue Sapphire" },
                    { value: "Padparadscha", label: "Padparadscha" },
                    { value: "Ruby", label: "Ruby" },
                    { value: "Yellow Sapphire", label: "Yellow Sapphire" },
                    { value: "Pink Sapphire", label: "Pink Sapphire" },
                    { value: "White Sapphire", label: "White Sapphire" },
                  ]}
                />
              </div>
            </div>

            {/* Secondary Compare Action Bar (appears when 2+ items selected) */}
            {selectedIds.length >= 2 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl transition">
                <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>{selectedIds.length} evaluations selected for comparison</span>
                </div>
                <button
                  type="button"
                  onClick={handleCompareSelected}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare Selected Gemstones</span>
                </button>
              </div>
            )}
          </div>

          {/* Evaluations List */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold">Loading your evaluation history...</p>
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No evaluations found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search || filterVariety !== "ALL"
                  ? "No evaluations matched your search criteria."
                  : "You haven't completed any gemstone evaluations yet. Start your first assessment."}
              </p>
              <div>
                <Link
                  href="/evaluate/gemstone"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0E2A47] hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Evaluation</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredEvaluations.map((item) => {
                const isSelected = selectedIds.includes(item._id);
                const score = item.result?.overall4C?.score ?? null;
                const formattedScore = score !== null ? Number(score).toFixed(1) : "—";
                const isComplete = item.status === "COMPLETED" || score !== null;
                const minPrice = item.priceSuggestion?.minimumPrice;
                const maxPrice = item.priceSuggestion?.maximumPrice;
                const priceAvailable = minPrice !== null && minPrice !== undefined && maxPrice !== null && maxPrice !== undefined;
                const priceFormatted = priceAvailable
                  ? `LKR ${(minPrice / 1000).toFixed(0)}K – ${(maxPrice / 1000).toFixed(0)}K`
                  : "Insufficient verified price data";

                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";

                return (
                  <div
                    key={item._id}
                    className={`bg-white rounded-2xl border transition p-5 hover:border-slate-300 hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                      isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                    }`}
                  >
                    {/* Left: Checkbox + Stone Info */}
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item._id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Select for comparison"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            EV-{item._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-400">{dateStr}</span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {item.ruleVersion || "v4.2"}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                          {item.gemstoneId?.variety || "Corundum Gemstone"}
                        </h3>

                        <p className="text-xs text-slate-500 mt-0.5">
                          Weight: <span className="font-semibold text-slate-700">{item.gemstoneId?.caratWeight || "—"} ct</span>
                          {item.gemstoneId?.color?.hue && (
                            <> · Color: <span className="font-semibold text-slate-700">{item.gemstoneId.color.hue}</span></>
                          )}
                          {item.gemstoneId?.clarity?.nakedEye && (
                            <> · Clarity: <span className="font-semibold text-slate-700">{item.gemstoneId.clarity.nakedEye}</span></>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Middle: 4C Score Breakdown + Price Evidence */}
                    <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Provisional Score
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black text-slate-900">
                            {formattedScore}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">/100</span>
                        </div>
                      </div>

                      <div className="min-w-[140px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Market Price Evidence
                        </span>
                        <div className="text-xs font-bold text-slate-800 mt-1">
                          {priceFormatted}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadPdf(e, item._id)}
                        disabled={downloadingId === item._id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        title="Download Open 4Cs Assessment Report (PDF)"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingId === item._id ? "Generating..." : "Report PDF"}</span>
                      </button>

                      <Link
                        href={`/evaluations/${item._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E2A47] hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
