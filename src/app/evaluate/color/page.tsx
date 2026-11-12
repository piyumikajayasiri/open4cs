"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvaluationDraft } from "@/context/EvaluationDraftContext";
import ColorSection from "@/components/gemstone/ColorSection";
import ColorVisualGuide from "@/components/gemstone/ColorVisualGuide";
import LiveScoreSidebar from "@/components/gemstone/LiveScoreSidebar";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function ColorStepPage() {
  const router = useRouter();
  const { draft, updateDraft } = useEvaluationDraft();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/evaluate/clarity");
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Step 2 of 7 · Color Evaluation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Evaluate Gemstone Color
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assess primary hue, tone darkness (scale 1–9), saturation intensity (1–6), and color distribution uniformity.
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
            <ColorSection
              hue={draft.hue}
              tone={draft.tone}
              saturation={draft.saturation}
              distribution={draft.distribution}
              zoning={draft.zoning}
              onHueChange={(val) => updateDraft({ hue: val })}
              onToneChange={(val) => updateDraft({ tone: val })}
              onSaturationChange={(val) => updateDraft({ saturation: val })}
              onDistributionChange={(val) => updateDraft({ distribution: val })}
              onZoningChange={(val) => updateDraft({ zoning: val })}
            />

            <div className="pt-4">
              <ColorVisualGuide />
            </div>
          </div>

          {/* Educational Visual Guide & Live Score (4 cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <LiveScoreSidebar activeStep="color" />
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Link
            href="/evaluate/gemstone"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Gemstone</span>
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <span>Continue to Clarity Evaluation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
