"use client";

import React, { useState } from "react";
import Image from "next/image";
import FourCBreakdownView from "./FourCBreakdownView";
import ReliabilityAndColorSimilarityView from "./ReliabilityAndColorSimilarityView";
import SuggestedB2BPriceView from "./SuggestedB2BPriceView";
import RecommendationsView from "./RecommendationsView";
import EvaluationStatementView from "./EvaluationStatementView";

type EvaluationCompleteDashboardProps = {
  stoneId?: string;
  variety?: string;
  evaluationDate?: string;
  ruleVersion?: string;
  overallScore?: number;
  colorScore?: number;
  clarityScore?: number;
  cutScore?: number;
  caratScore?: number;
  caratAssessmentScore?: number;
  caratWeight?: number;
  colorLabel?: string;
  clarityLabel?: string;
  cutLabel?: string;
  caratLabel?: string;
  priceRangeMin?: string;
  priceRangeMax?: string;
  pricePerCarat?: string;
  comparablesCount?: number;
  evaluationId?: string;
  priceStatus?: string;
  initialTab?: string;
  length?: string | number;
  width?: string | number;
  depth?: string | number;
  ratio?: string | number;
  depthPercentage?: string | number;
  colorSimilarity?: number;
  hue?: string;
  tone?: string;
  saturation?: string;
  distribution?: string;
  zoning?: string;
  nakedEye?: string;
  loupe10x?: string;
  inclusionType?: string;
  severity?: string;
  symmetry?: string;
  polish?: string;
  windowing?: string;
  extinction?: string;
  bulging?: string;
  treatmentStatus?: string;
  originValue?: string;
  originReliability?: string;
  onDownloadPdf?: () => void;
  onCompare?: () => void;
  onSave?: () => void;
};

export default function EvaluationCompleteDashboard({
  stoneId = "CEY-2026-0847",
  variety = "Ceylon Blue Sapphire",
  evaluationDate = "24 Sep 2026",
  ruleVersion = "prototype-v1",
  overallScore = 8.2,
  colorScore = 8.6,
  clarityScore = 7.9,
  cutScore = 8.1,
  caratScore = 8.5,
  caratAssessmentScore = 85,
  caratWeight = 2.45,
  colorLabel = "Vivid Blue",
  clarityLabel = "Eye-clean",
  cutLabel = "Well Cut",
  caratLabel = "Liquid band",
  priceRangeMin = "1.42M",
  priceRangeMax = "1.68M",
  pricePerCarat = "580K – 686K",
  comparablesCount = 7,
  evaluationId,
  priceStatus = "UNAVAILABLE",
  initialTab = "overview",
  length,
  width,
  depth,
  ratio,
  depthPercentage,
  colorSimilarity,
  hue,
  tone,
  saturation,
  distribution,
  zoning,
  nakedEye,
  loupe10x,
  inclusionType,
  severity,
  symmetry,
  polish,
  windowing,
  extinction,
  bulging,
  treatmentStatus,
  originValue,
  originReliability,
  onDownloadPdf,
  onCompare,
  onSave,
}: EvaluationCompleteDashboardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const handleSaveClick = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    if (onSave) onSave();
  };

  // Map any legacy or specialized tab names to the 4 canonical sections:
  // Overview, 4C Breakdown, Market Evidence, Report
  const getCanonicalTab = (tab?: string): "overview" | "breakdown" | "market_evidence" | "report" => {
    if (tab === "breakdown") return "breakdown";
    if (tab === "market_evidence" || tab === "comparables" || tab === "pricing" || tab === "b2b_price") return "market_evidence";
    if (tab === "report" || tab === "statement") return "report";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<"overview" | "breakdown" | "market_evidence" | "report">(
    getCanonicalTab(initialTab)
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "breakdown", label: "4C Breakdown" },
    { id: "market_evidence", label: "Market Evidence" },
    { id: "report", label: "Report" },
  ] as const;

  const handleDownloadPdf = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    } else if (evaluationId) {
      window.open(`/api/evaluations/${evaluationId}/report`, "_blank");
    } else {
      window.print();
    }
  };

  const actualWeight = typeof caratWeight === "number" && caratWeight > 0 ? caratWeight : 2.45;

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Evaluation Complete
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {stoneId} · {variety} · Evaluated {evaluationDate} · Rule engine {ruleVersion}
          </p>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveClick}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span>{isSaved ? "✓" : "🔖"}</span> {isSaved ? "Saved!" : "Save"}
          </button>

          <button
            type="button"
            onClick={onCompare || (() => { window.location.href = "/evaluations"; })}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span>📊</span> Compare
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B] px-4 py-2 text-xs font-bold text-white flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs sm:text-sm font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 transition relative cursor-pointer ${
              activeTab === tab.id
                ? "text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: 4C Breakdown View */}
      {activeTab === "breakdown" && (
        <FourCBreakdownView
          stoneId={stoneId}
          ruleVersion={ruleVersion}
          colorScore={colorScore}
          colorLabel={colorLabel}
          clarityScore={clarityScore}
          clarityLabel={clarityLabel}
          cutScore={cutScore}
          cutLabel={cutLabel}
          caratScore={caratScore}
          caratAssessmentScore={caratAssessmentScore}
          caratWeight={actualWeight}
          caratLabel={caratLabel}
          length={length}
          width={width}
          depth={depth}
          ratio={ratio}
          depthPercentage={depthPercentage}
          colorSimilarity={colorSimilarity}
          hue={hue}
          tone={tone}
          saturation={saturation}
          distribution={distribution}
          zoning={zoning}
          nakedEye={nakedEye}
          loupe10x={loupe10x}
          inclusionType={inclusionType}
          severity={severity}
          symmetry={symmetry}
          polish={polish}
          windowing={windowing}
          extinction={extinction}
          bulging={bulging}
        />
      )}

      {/* Tab 2: Market Evidence (Suggested B2B Price & Verified Comparables) */}
      {activeTab === "market_evidence" && (
        <div className="space-y-8">
          <SuggestedB2BPriceView
            stoneId={stoneId}
            ruleVersion={ruleVersion}
            snapshotDate={evaluationDate}
            priceRangeMin={priceRangeMin}
            priceRangeMax={priceRangeMax}
            pricePerCaratMin={pricePerCarat.split("–")[0]?.trim() || "Unavailable"}
            pricePerCaratMax={pricePerCarat.split("–")[1]?.trim() || "Unavailable"}
            caratWeight={actualWeight.toFixed(2)}
            finalRangeText={
              priceStatus === "COMPLETED" && priceRangeMin !== "Unavailable"
                ? `LKR ${priceRangeMin} – ${priceRangeMax}`
                : "Unavailable"
            }
          />

          <ReliabilityAndColorSimilarityView
            stoneId={stoneId}
            snapshotDate={evaluationDate}
            caratWeight={`${actualWeight.toFixed(2)} ct`}
            color={colorLabel}
          />
        </div>
      )}

      {/* Tab 3: Official Report & Statement */}
      {activeTab === "report" && (
        <EvaluationStatementView
          stoneId={stoneId}
          variety={variety}
          caratWeight={actualWeight}
          overallScore={overallScore}
          suggestedPriceMin={priceRangeMin}
          suggestedPriceMax={priceRangeMax}
          comparablesCount={comparablesCount}
          onDownloadPdf={handleDownloadPdf}
          onCompare={onCompare}
          onSave={onSave}
        />
      )}

      {/* Tab 4: Overview (Default) */}
      {activeTab === "overview" && (
        <>
          {/* Row 1: 4 Mini 4C Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Color */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  COLOR (35%)
                </span>
                <span className="text-sm text-blue-500">💧</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {colorScore.toFixed(1)} · {colorLabel}
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, colorScore * 10)}%` }} />
              </div>
            </div>

            {/* Clarity */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  CLARITY (25%)
                </span>
                <span className="text-sm text-amber-500">🔍</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {clarityScore.toFixed(1)} · {clarityLabel}
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, clarityScore * 10)}%` }} />
              </div>
            </div>

            {/* Cut */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  CUT (20%)
                </span>
                <span className="text-sm text-indigo-500">✨</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {cutScore.toFixed(1)} · {cutLabel}
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, cutScore * 10)}%` }} />
              </div>
            </div>

            {/* Carat */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  CARAT (20%)
                </span>
                <span className="text-sm text-purple-500">⚖️</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900">
                  {(caratScore > 10 ? caratScore / 10 : caratScore).toFixed(1)} · {caratLabel}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Weight: {actualWeight.toFixed(2)} ct · Size assessment: {caratAssessmentScore ?? 85}/100
                </p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (caratAssessmentScore ?? 85))}%` }} />
              </div>
            </div>
          </div>

          {/* Row 2: Hero Overall Evaluation & Price Suggestion (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Dark Navy Banner (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl bg-[#0E172E] text-white p-6 sm:p-7 shadow-md flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-5">
                  OVERALL EVALUATION · NOT A PRICE
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  {/* Circular Score Badge */}
                  <div className="w-20 h-20 rounded-full border-2 border-slate-700 bg-[#162244] flex flex-col items-center justify-center flex-shrink-0 shadow-inner">
                    <span className="text-2xl font-black text-white leading-none">
                      {overallScore.toFixed(1)}
                    </span>
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 mt-1">
                      OVERALL
                    </span>
                  </div>

                  {/* Score Headline & Details */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Overall Composite Score: {overallScore.toFixed(1)} / 10
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1.5 max-w-xl">
                      The score summarises 4C gemmological quality only. Market value is suggested separately from verified wholesale reference comparables and pricing rules.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Characteristic Tag Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800">
                <span className="rounded-full bg-[#1E293B] text-slate-200 text-xs font-semibold px-3 py-1">
                  Weight: {actualWeight.toFixed(2)} ct
                </span>
                <span className="rounded-full bg-[#1E293B] text-slate-200 text-xs font-semibold px-3 py-1">
                  {colorLabel}
                </span>
                <span className="rounded-full bg-[#1E293B] text-slate-200 text-xs font-semibold px-3 py-1">
                  {clarityLabel}
                </span>
              </div>
            </div>

            {/* Right White Card: Suggested B2B Price Range (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  SUGGESTED B2B WHOLESALE PRICE RANGE
                </p>

                {priceRangeMin === "Unavailable" || priceStatus !== "COMPLETED" ? (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
                      Price Unavailable
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Insufficient verified wholesale market evidence (requires min 3 completed sales).
                    </p>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      LKR {priceRangeMin} – {priceRangeMax}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      LKR {pricePerCarat} per carat
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("market_evidence")}
                className="w-full bg-[#1A4545] hover:bg-[#133838] text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl shadow-xs transition mt-6 text-center cursor-pointer"
              >
                See market evidence →
              </button>
            </div>
          </div>

          {/* Row 3: Comparable Gemstones & Top Recommendations (Merged into Overview) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comparable Gemstones Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/60">
                <Image
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
                  alt="Comparable gemstone"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {comparablesCount} verified wholesale comparables found
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Natural corundum wholesale transaction evidence ({actualWeight.toFixed(2)} ct reference tier).
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("market_evidence")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition mt-1.5 inline-block cursor-pointer"
                >
                  View market evidence →
                </button>
              </div>
            </div>

            {/* Top Recommendations (Inside Overview) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Gemmological Recommendations
                </h4>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded px-2 py-0.5">
                  Provisional Guidance
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span>
                    <strong className="font-semibold text-slate-900">{colorLabel}</strong> — Color evaluation provides primary quality foundation.
                  </span>
                </div>

                <div className="flex items-start gap-2 text-xs text-amber-800">
                  <span>⚠️</span>
                  <span>
                    Request treatment and origin assessment from an accredited gemmological laboratory before commercial transaction.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Disclaimer Banner */}
          <div className="rounded-2xl border border-[#F6E7C4] bg-[#FEF9EE] p-4 sm:p-5 flex items-start gap-3">
            <span className="text-base text-amber-600 flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              This system provides an estimated B2B price suggestion based on the information provided, predefined evaluation and pricing rules, comparable gemstone data, and available reference information. It is not a professional laboratory valuation, gemstone certification, authentication, legally binding valuation, or guaranteed selling price.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
