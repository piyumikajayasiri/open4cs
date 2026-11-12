"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Edit3, ShieldAlert, Sparkles, Scale, Check } from "lucide-react";

type ReviewSectionProps = {
  variety: string;
  caratWeight: string;
  length: string;
  width: string;
  depth: string;
  hue: string;
  tone: string;
  saturation: string;
  distribution: string;
  zoning: string;
  nakedEye: string;
  loupe10x: string;
  inclusionType: string;
  inclusionLocation?: string;
  severity: string;
  symmetry: string;
  polish: string;
  windowing?: string;
  extinction?: string;
  bulging?: string;
  treatmentStatus: string;
  treatmentType: string;
  originValue: string;
  originReliability: string;
  onEditStep: (stepNumber: number) => void;
  onRunEvaluation: () => void;
  onSaveDraft?: () => void;
  loading?: boolean;
};

export default function ReviewSection({
  variety,
  caratWeight,
  length,
  width,
  depth,
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
  treatmentStatus,
  originValue,
  originReliability,
  onEditStep,
  onRunEvaluation,
  loading = false,
}: ReviewSectionProps) {
  const displayVariety = variety || "Blue Sapphire";
  const hasCarat = Boolean(caratWeight && Number(caratWeight) > 0);
  const hasDimensions = Boolean(
    length && Number(length) > 0 &&
    width && Number(width) > 0 &&
    depth && Number(depth) > 0
  );

  const lVal = parseFloat(length);
  const wVal = parseFloat(width);
  const dVal = parseFloat(depth);
  const lwRatio = hasDimensions && wVal > 0 ? (lVal / wVal).toFixed(2) : null;
  const depthPercent = hasDimensions && wVal > 0 ? ((dVal / wVal) * 100).toFixed(1) : null;

  // Review Items for the 7 stages
  const reviewCards = [
    {
      id: "gemstone",
      title: "1. Gemstone Category & Origin Nature",
      subtitle: `${displayVariety} · Natural Corundum · Faceted Oval / Mixed Cut`,
      iconType: "check",
      step: 1,
    },
    {
      id: "color",
      title: "2. Color Observation",
      subtitle: `${saturation || "Vivid"} ${hue || "Blue"} · Tone ${tone || "6"} · Distribution ${distribution || "Even"} · Zoning ${zoning || "None"}`,
      iconType: hue && tone && saturation ? "check" : "warning",
      step: 2,
    },
    {
      id: "clarity",
      title: "3. Clarity Assessment",
      subtitle: `${nakedEye || "Eye-clean"} · 10× loupe: ${loupe10x || "Very slight"} ${inclusionType ? `(${inclusionType})` : ""} · Relief: ${severity || "Minor"}`,
      iconType: nakedEye && loupe10x ? "check" : "warning",
      step: 3,
    },
    {
      id: "cut",
      title: "4. Cut & Proportions",
      subtitle: hasDimensions
        ? `${length} × ${width} × ${depth} mm · L:W ${lwRatio} · Depth ${depthPercent}% · Symmetry ${symmetry || "Good"} · Polish ${polish || "Good"}`
        : "Dimensions incomplete — length, width, and depth required",
      iconType: hasDimensions ? "check" : "warning",
      step: 4,
    },
    {
      id: "carat",
      title: "5. Carat Weight",
      subtitle: hasCarat
        ? `${caratWeight} ct calibrated electronic scale weight`
        : "Carat weight required",
      iconType: hasCarat ? "check" : "warning",
      step: 5,
    },
    {
      id: "treatment_origin",
      title: "6. Treatment & Geographic Origin",
      subtitle: `${treatmentStatus || "Heated"} · Origin: ${originValue || "Sri Lanka"} (${originReliability || "Unverified evidence"})`,
      iconType: "check",
      step: 6,
    },
  ];

  const canSubmit = hasCarat && hasDimensions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Stack of Review Cards (8 cols on large screens) */}
      <div className="lg:col-span-8 space-y-4">
        {reviewCards.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 transition hover:border-slate-300"
          >
            <div className="flex items-center gap-3.5">
              {card.iconType === "check" ? (
                <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {card.subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(card.step)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        ))}

        {/* Bottom Disclaimer Banner */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 flex items-start gap-3 mt-6">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed font-normal">
            <strong>Formal Notice:</strong> This Open 4Cs assessment report provides a rule-based evaluation and indicative price range derived from user-submitted grading observations and verified historical market references. It is not a gemological laboratory certificate, authentication guarantee, or legally binding appraisal.
          </p>
        </div>
      </div>

      {/* Right Column: Stone Summary & Action Card (4 cols on large screens) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Summary
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3" />
              Rule v4.2
            </span>
          </div>

          {/* Title and Identification */}
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {displayVariety}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasCarat ? `${caratWeight} ct` : "Carat pending"} · {hasDimensions ? `${length} × ${width} × ${depth} mm` : "Dimensions pending"}
            </p>
          </div>

          {/* Validation Checklist */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              {hasCarat ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>Carat weight recorded ({hasCarat ? `${caratWeight} ct` : "Required"})</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              {hasDimensions ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>Millimeter dimensions ({hasDimensions ? "Valid" : "Required"})</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Supported natural corundum variety</span>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <span className="text-blue-600 font-bold">ℹ</span>
              <span>Evidence tag: [{originReliability || "User Entered"}]</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onRunEvaluation}
              disabled={loading || !canSubmit}
              className={`w-full text-xs sm:text-sm font-bold py-3 rounded-xl shadow-md transition text-center cursor-pointer ${
                canSubmit && !loading
                  ? "bg-[#0B1528] hover:bg-slate-800 text-white shadow-slate-900/10"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {loading ? "Executing Evaluation Engine..." : "Run Evaluation & Generate Report"}
            </button>

            {!canSubmit && (
              <p className="text-[11px] text-amber-700 text-center">
                Please complete carat weight and dimensions to proceed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
