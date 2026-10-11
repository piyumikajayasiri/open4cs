"use client";

import React from "react";
import Image from "next/image";

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
  inclusionLocation: string;
  severity: string;
  symmetry: string;
  polish: string;
  windowing: string;
  extinction: string;
  bulging: string;
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
  onSaveDraft,
  loading = false,
}: ReviewSectionProps) {
  const displayVariety = variety || "Ceylon Blue Sapphire";
  const displayCarat = caratWeight || "2.45";
  const displayLength = length || "8.42";
  const displayWidth = width || "6.31";
  const displayDepth = depth || "4.55";

  // Calculated values
  const lVal = parseFloat(displayLength) || 8.42;
  const wVal = parseFloat(displayWidth) || 6.31;
  const dVal = parseFloat(displayDepth) || 4.55;
  const lwRatio = wVal > 0 ? (lVal / wVal).toFixed(2) : "1.33";
  const depthPercent = wVal > 0 ? ((dVal / wVal) * 100).toFixed(1) : "72.1";

  // Review Items for the left stack
  const reviewCards = [
    {
      id: "gemstone",
      title: "Gemstone Information",
      subtitle: `${displayVariety} · Oval · ${displayLength} × ${displayWidth} × ${displayDepth} mm`,
      iconType: "check",
      step: 1,
    },
    {
      id: "color",
      title: "Color",
      subtitle: `${saturation || "Vivid"} ${hue || "Blue"} · Tone ${tone || "6"} · ${distribution || "Even"} · 8.6 provisional`,
      iconType: "check",
      step: 3,
    },
    {
      id: "clarity",
      title: "Clarity",
      subtitle: `${nakedEye || "Eye-clean"} · ${inclusionType ? "Minor " + inclusionType : "Minor silk"} · 7.9 provisional`,
      iconType: "check",
      step: 4,
    },
    {
      id: "cut",
      title: "Cut",
      subtitle: `L:W ${lwRatio} · Depth ${depthPercent}% · 8.1 provisional`,
      iconType: "check",
      step: 5,
    },
    {
      id: "carat",
      title: "Carat Weight",
      subtitle: `${displayCarat} ct · Liquid commercial band`,
      iconType: "check",
      step: 6,
    },
    {
      id: "treatment_origin",
      title: "Treatment & Origin",
      subtitle: `${treatmentStatus || "Heated (H)"} lab-verified · Origin ${originValue || "Sri Lanka (Ceylon)"} (${originReliability || "seller-provided"})`,
      iconType: "warning",
      step: 7,
    },
  ];

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
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  ⚠️
                </div>
              )}

              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {card.subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(card.step)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-blue-50"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>
          </div>
        ))}

        {/* Bottom Disclaimer Banner */}
        <div className="rounded-2xl border border-[#F6E7C4] bg-[#FEF9EE] p-4 sm:p-5 flex items-start gap-3 mt-6">
          <span className="text-base text-amber-600 flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-xs text-amber-900/90 leading-relaxed font-normal">
            This system provides an estimated B2B price suggestion based on the information provided, predefined evaluation and pricing rules, comparable gemstone data, and available reference information. It is not a professional laboratory valuation, gemstone certification, authentication, legally binding valuation, or guaranteed selling price.
          </p>
        </div>
      </div>

      {/* Right Column: Stone Summary & Action Card (4 cols on large screens) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          {/* Real Gemstone Photo */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-inner">
            <Image
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
              alt="Ceylon Blue Sapphire"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* Title and Identification */}
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {displayVariety}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              CEY-2026-0847 · {displayCarat} ct · Oval
            </p>
          </div>

          {/* Validation Checklist */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="text-emerald-500 font-bold">✔</span>
              <span>Required information complete</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="text-emerald-500 font-bold">✔</span>
              <span>Measurements valid</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="text-emerald-500 font-bold">✔</span>
              <span>Supported gemstone variety</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
              <span>⚠️</span>
              <span>Treatment information requires verification</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onRunEvaluation}
              disabled={loading}
              className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-bold py-3 rounded-xl shadow-md transition disabled:opacity-50 text-center"
            >
              {loading ? "Evaluating..." : "Run Evaluation"}
            </button>

            <button
              type="button"
              onClick={onSaveDraft || (() => alert("Draft saved!"))}
              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold py-3 rounded-xl transition text-center"
            >
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
