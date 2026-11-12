"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvaluationDraft } from "@/context/EvaluationDraftContext";
import LiveScoreSidebar from "@/components/gemstone/LiveScoreSidebar";
import { Scale, Info, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";

export default function CaratStepPage() {
  const router = useRouter();
  const { draft, updateDraft } = useEvaluationDraft();

  const caratNum = Number(draft.caratWeight);
  const lenNum = Number(draft.length);
  const widNum = Number(draft.width);
  const depNum = Number(draft.depth);

  const spreadRatio = useMemo(() => {
    if (caratNum > 0 && lenNum > 0 && widNum > 0 && depNum > 0) {
      return Number(((lenNum * widNum * depNum) / caratNum).toFixed(2));
    }
    return null;
  }, [caratNum, lenNum, widNum, depNum]);

  const weightTier = useMemo(() => {
    if (!caratNum || caratNum <= 0) return null;
    if (caratNum >= 3.0) return { label: "Major Rarity (≥ 3.00 ct)", color: "text-purple-700 bg-purple-50 border-purple-200" };
    if (caratNum >= 2.0) return { label: "Premium Investment (2.00 – 2.99 ct)", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (caratNum >= 1.0) return { label: "Fine Commercial (1.00 – 1.99 ct)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    return { label: "Calibrated Commercial (< 1.00 ct)", color: "text-slate-700 bg-slate-50 border-slate-200" };
  }, [caratNum]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caratNum || caratNum <= 0) {
      alert("Please provide a valid positive carat weight before proceeding.");
      return;
    }
    router.push("/evaluate/additional");
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Step 5 of 7 · Carat Weight & Proportions
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Carat Weight & Face-Up Spread
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record calibrated gem scale weight and verify weight-to-dimension spread consistency.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Draft auto-saved
          </span>
        </div>
      </div>

      <form onSubmit={handleContinue} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Inputs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Calibrated Carat Weight
                  </h2>
                  <p className="text-xs text-slate-400">
                    Measured using a calibrated 2-decimal or 3-decimal electronic gemological scale
                  </p>
                </div>
              </div>

              {/* Carat Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Carat Weight (ct) <span className="text-rose-500">*</span>
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="100"
                    value={draft.caratWeight}
                    onChange={(e) => updateDraft({ caratWeight: e.target.value })}
                    placeholder="e.g. 2.15"
                    required
                    className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                    ct
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  1 carat = exactly 0.200 grams (200 milligrams).
                </p>
              </div>

              {/* Weight Tier Indicator */}
              {weightTier && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Rarity Tier</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${weightTier.color}`}>
                      {weightTier.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Corundum exhibits geometric per-carat price jumps at significant benchmark boundaries (1.00 ct, 2.00 ct, 3.00 ct, 5.00 ct) due to natural crystal rarity in secondary alluvial gravels.
                  </p>
                </div>
              )}

              {/* Spread & Dimension Cross-Verification */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">
                    Dimension & Spread Cross-Verification
                  </span>
                </div>

                {lenNum > 0 && widNum > 0 && depNum > 0 ? (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block">Length</span>
                        <span className="font-bold text-slate-800 font-mono">{lenNum} mm</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block">Width</span>
                        <span className="font-bold text-slate-800 font-mono">{widNum} mm</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block">Depth</span>
                        <span className="font-bold text-slate-800 font-mono">{depNum} mm</span>
                      </div>
                    </div>

                    {spreadRatio && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-600">Calculated Spread Index:</span>
                        <span className="font-mono font-bold text-slate-900">{spreadRatio} mm³/ct</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Dimensions were not entered on the Cut step. Go back to Cut to calculate spread consistency.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Scoring (4 cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <LiveScoreSidebar activeStep="carat" />
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Link
            href="/evaluate/cut"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cut</span>
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <span>Continue to Treatment & Origin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
