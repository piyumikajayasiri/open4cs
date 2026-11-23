"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type PriceBreakdownRow = {
  label: string;
  subInfo: string;
  adjustment: string;
  adjustmentType?: "positive" | "negative" | "neutral" | "capped";
  runningValue: string;
  ruleCitation: string;
};

export type ContributingComparableProp = {
  referenceId: string;
  caratWeight: number;
  currency: string;
  rawReferencePrice: number;
  rawPricePerCarat: number;
  normalizedPricePerCarat: number;
  treatmentStatus: string;
  treatmentMultiplier: number;
  originValue: string;
  originMultiplier: number;
  sizeMultiplier?: number;
  adjustedPricePerCarat: number;
  similarityScore: number;
  effectiveWeight: number;
  contributionPercentage: number;
  transactionContext: string;
  marketContext: string;
  observationDate: string;
  source: string;
};

type SuggestedB2BPriceViewProps = {
  stoneId?: string;
  ruleVersion?: string;
  snapshotDate?: string;
  priceRangeMin?: string;
  priceRangeMax?: string;
  pricePerCaratMin?: string;
  pricePerCaratMax?: string;
  caratWeight?: string | number;
  finalRangeText?: string;
  evidenceBasis?: string;
  marketContext?: string;
  comparablesCount?: number;
  dispersion?: number;
  contributingComparables?: ContributingComparableProp[];
  retailIndicativeRange?: {
    benchmark: string;
    minimum: string;
    maximum: string;
  };
  rows?: PriceBreakdownRow[];
};

const DEFAULT_ROWS: PriceBreakdownRow[] = [
  {
    label: "Baseline Rate",
    subInfo: "Real B2B wholesale clearing",
    adjustment: "—",
    adjustmentType: "neutral",
    runningValue: "Benchmark Rate",
    ruleCitation: "Open 4Cs Price/ct weighted aggregation",
  },
  {
    label: "Treatment Modifier",
    subInfo: "Per-comparable thermal normalization",
    adjustment: "Individual",
    adjustmentType: "neutral",
    runningValue: "Adjusted Rate",
    ruleCitation: "Rule TRT-01 relative multiplier",
  },
  {
    label: "Origin Modifier",
    subInfo: "Geographical corundum provenance",
    adjustment: "Individual",
    adjustmentType: "neutral",
    runningValue: "Adjusted Rate",
    ruleCitation: "Rule ORG-02 provenance index",
  },
  {
    label: "Carat Proximity & Recency",
    subInfo: "Size bracket & transaction recency factor",
    adjustment: "Multi-factor",
    adjustmentType: "positive",
    runningValue: "Weighted Rate",
    ruleCitation: "Weight-bracket calibration",
  },
];

export default function SuggestedB2BPriceView({
  stoneId = "CEY-2026-0847",
  ruleVersion = "v4.2",
  snapshotDate = "24 Sep 2026",
  priceRangeMin = "1.42M",
  priceRangeMax = "1.68M",
  pricePerCaratMin = "580K",
  pricePerCaratMax = "686K",
  caratWeight = "2.45",
  finalRangeText = "LKR 1.42M – 1.68M",
  evidenceBasis = "Wholesale Completed Sales",
  marketContext = "Wholesale B2B Clearing",
  comparablesCount = 4,
  dispersion = 8.5,
  contributingComparables = [],
  retailIndicativeRange,
  rows = DEFAULT_ROWS,
}: SuggestedB2BPriceViewProps) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isEvidenceListOpen, setIsEvidenceListOpen] = useState(false);

  const isUnavailable = priceRangeMin === "Unavailable" || finalRangeText.includes("Unavailable");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {evidenceBasis}
            </span>
            <span className="text-xs text-slate-400 font-mono">{marketContext}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Suggested B2B Market Price
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {stoneId} · Transparent price-per-carat valuation based on verified market transaction references
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200/80 shadow-2xs">
            Rule {ruleVersion} · Snapshot {snapshotDate}
          </span>
        </div>
      </div>

      {isUnavailable ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Market Price Suggestion: Unavailable — insufficient verified market evidence.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            In accordance with Open 4Cs data integrity standards, commercial wholesale price suggestions require at least 3 verified real-market transaction references. Demonstration and synthetic dealer estimates are strictly excluded from commercial price suggestions.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 max-w-lg mx-auto text-left space-y-1.5">
            <p className="font-semibold text-slate-800">4C Quality Assessment Status:</p>
            <p className="text-emerald-700 font-medium">✓ 4C Quality Assessment is fully completed and operational.</p>
            <p className="text-slate-500">Your gemstone scores, proportion analysis, and laboratory recommendations remain available and documented in your evaluation report.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Banner: Dark Container with Headline Price Range & Per Carat Rate */}
          <div className="rounded-2xl bg-[#0B1528] text-white p-8 sm:p-10 text-center shadow-md space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{evidenceBasis} · {comparablesCount} Verified Comparables</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                ESTIMATED B2B WHOLESALE PRICE RANGE
              </span>
              <p className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                <span>LKR {priceRangeMin}</span>
                <span className="text-lg sm:text-2xl font-semibold text-slate-400 lowercase">to</span>
                <span>LKR {priceRangeMax}</span>
              </p>
            </div>

            <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
              <span className="inline-block rounded-full bg-blue-900/60 border border-blue-700/60 px-4 py-1.5 text-xs font-bold text-blue-200">
                LKR {pricePerCaratMin} – {pricePerCaratMax} / carat ({caratWeight} ct)
              </span>
              <span className="inline-block rounded-full bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300">
                Data Dispersion Range: ±{dispersion}%
              </span>
            </div>

            <p className="text-[11px] text-slate-400 pt-1 max-w-2xl mx-auto leading-relaxed">
              Based on: Loose faceted completed wholesale sales · Individual per-comparable treatment &amp; origin normalization · Price-per-carat weighted aggregation.
            </p>
          </div>

          {/* Indicative Retail Benchmark Card (If Available) */}
          {retailIndicativeRange && (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-blue-50/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                    Indicative Retail Benchmark
                  </span>
                  <span className="text-xs text-slate-500">Consumer Asking Price Upper Bound</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  LKR {retailIndicativeRange.minimum} – {retailIndicativeRange.maximum}
                </h3>
                <p className="text-xs text-slate-500">
                  Reflects standard retail jewellery catalog asking prices with dealer inventory markup (~75% above wholesale clearing).
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block font-medium">Estimated Retail Mean</span>
                <span className="text-sm font-bold text-indigo-900 font-mono">
                  LKR {retailIndicativeRange.benchmark}
                </span>
              </div>
            </div>
          )}

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Price Breakdown Table (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Price calculation methodology
                  </h3>
                  <p className="text-xs text-slate-500">Per-comparable normalization and weighted price-per-carat aggregation</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  v4.2 Engine
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {rows.map((row, index) => (
                  <div
                    key={index}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="w-56 shrink-0">
                      <p className="font-bold text-slate-900">{row.label}</p>
                      <p className="text-[11px] text-slate-500">{row.subInfo}</p>
                    </div>

                    <div className="w-24 text-left sm:text-center shrink-0">
                      <span
                        className={`font-extrabold ${
                          row.adjustmentType === "positive"
                            ? "text-emerald-600"
                            : row.adjustmentType === "negative"
                            ? "text-red-500"
                            : "text-slate-600"
                        }`}
                      >
                        {row.adjustment}
                      </span>
                    </div>

                    <div className="w-28 text-left sm:text-right shrink-0">
                      <span className="font-extrabold text-slate-900">
                        {row.runningValue}
                      </span>
                    </div>

                    <div className="flex-1 text-left sm:text-right">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {row.ruleCitation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Range Highlight Box */}
              <div className="rounded-xl bg-slate-50/80 border border-slate-200/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
                <span className="text-xs font-semibold text-slate-600">
                  Final Suggested B2B Range (Dispersion-calibrated ±{dispersion}%)
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {finalRangeText}
                </span>
              </div>

              {/* Collapsible calculation explanation */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition"
                >
                  {isExplanationOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>How was this price suggestion calculated?</span>
                </button>
                {isExplanationOpen && (
                  <div className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <p>
                      <strong>1. Price Per Carat Normalization:</strong> Each comparable gemstone transaction is divided by its carat weight to establish native trading value per carat (Price/ct = Total Price / Carat Weight).
                    </p>
                    <p>
                      <strong>2. Per-Comparable Individual Adjustments:</strong> Treatment and origin adjustments are calculated individually for each comparable relative to the candidate stone before any aggregation takes place (Adjusted Price/ct = Price/ct &times; Treatment Mult &times; Origin Mult).
                    </p>
                    <p>
                      <strong>3. Multi-Factor Weighting:</strong> Weights combine 4C similarity score, observation recency, and weight-bracket proximity ($W = S \times R \times P$).
                    </p>
                    <p>
                      <strong>4. Data Dispersion Range:</strong> The suggested range reflects actual price dispersion (weighted variance) among the matched comparables rather than an arbitrary fixed percentage.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Calculation Flow & Scientific Disclaimer (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Calculation Flow Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase tracking-wider">
                  Transparent Pipeline
                </h3>

                <div className="space-y-1.5 text-center text-xs font-semibold text-slate-700">
                  <div className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    1. Verified Market Sales
                  </div>
                  <div className="text-slate-400 text-xs">↓</div>
                  <div className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    2. Per-Carat Normalization
                  </div>
                  <div className="text-slate-400 text-xs">↓</div>
                  <div className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    3. Individual 4C &amp; Origin Multipliers
                  </div>
                  <div className="text-slate-400 text-xs">↓</div>
                  <div className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    4. Weighted Price Dispersion
                  </div>
                  <div className="text-slate-400 text-xs">↓</div>
                  <div className="py-2.5 px-3 rounded-xl bg-[#0B1528] text-white font-bold shadow-xs">
                    Suggested Wholesale Range
                  </div>
                </div>
              </div>

              {/* Disclaimer Banner */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  This system provides an estimated B2B wholesale price suggestion based on verified loose corundum transactions. It is not an insurance appraisal or guaranteed clearing amount.
                </p>
              </div>
            </div>

          </div>

          {/* Contributing Market References Section */}
          {contributingComparables.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Contributing Market References ({contributingComparables.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Underlying completed sale transactions used to synthesize the benchmark price
                  </p>
                </div>

                <button
                  onClick={() => setIsEvidenceListOpen(!isEvidenceListOpen)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>{isEvidenceListOpen ? "Hide Details" : "View Contributing References"}</span>
                  {isEvidenceListOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isEvidenceListOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-bold text-slate-500">REF ID</th>
                        <th className="py-2.5 px-3 font-bold text-slate-500">WEIGHT</th>
                        <th className="py-2.5 px-3 font-bold text-slate-500">BASE PRICE/CT</th>
                        <th className="py-2.5 px-3 font-bold text-slate-500">ADJUSTED/CT</th>
                        <th className="py-2.5 px-3 font-bold text-slate-500">SIMILARITY</th>
                        <th className="py-2.5 px-3 font-bold text-slate-500">CONTRIBUTION</th>
                        <th className="py-2.5 px-3 font-bold text-slate-500">SOURCE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {contributingComparables.map((comp) => (
                        <tr key={comp.referenceId} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-bold text-blue-600">{comp.referenceId}</td>
                          <td className="py-2.5 px-3">{comp.caratWeight} ct</td>
                          <td className="py-2.5 px-3">{comp.currency} {comp.rawPricePerCarat.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{comp.currency} {comp.adjustedPricePerCarat.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-emerald-700 font-bold">{comp.similarityScore}%</td>
                          <td className="py-2.5 px-3">{comp.contributionPercentage}%</td>
                          <td className="py-2.5 px-3 font-sans text-slate-600 truncate max-w-xs" title={comp.source}>
                            {comp.source}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
