"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvaluationDraft } from "@/context/EvaluationDraftContext";
import ClaritySection from "@/components/gemstone/ClaritySection";
import ClarityVisualGuide from "@/components/gemstone/ClarityVisualGuide";

export default function ClarityStepPage() {
  const router = useRouter();
  const { draft, updateDraft } = useEvaluationDraft();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/evaluate/cut");
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Step 3 of 6 · Clarity Evaluation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Evaluate Gemstone Clarity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record naked-eye visibility and 10× loupe protocol, inclusion location matrix, and severity rating.
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
            <ClaritySection
              nakedEye={draft.nakedEye}
              loupe10x={draft.loupe10x}
              inclusionType={draft.inclusionType}
              inclusionLocation={draft.inclusionLocation}
              severity={draft.severity}
              onNakedEyeChange={(val) => updateDraft({ nakedEye: val })}
              onLoupe10xChange={(val) => updateDraft({ loupe10x: val })}
              onInclusionTypeChange={(val) => updateDraft({ inclusionType: val })}
              onInclusionLocationChange={(val) => updateDraft({ inclusionLocation: val })}
              onSeverityChange={(val) => updateDraft({ severity: val })}
            />
          </div>

          {/* Educational Visual Guide (4 cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <ClarityVisualGuide />
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Link
            href="/evaluate/color"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <span>←</span>
            <span>Back to Color</span>
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
          >
            <span>Continue to Cut Evaluation</span>
            <span>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
