"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvaluationDraft } from "@/context/EvaluationDraftContext";
import BasicInformation from "@/components/gemstone/BasicInformation";
import CaratSection from "@/components/gemstone/CaratSection";

export default function GemstoneStepPage() {
  const router = useRouter();
  const { draft, updateDraft } = useEvaluationDraft();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/evaluate/color");
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Step 1 of 6 · Gemstone Information
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Select Your Gemstone Variety & Weight
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose the CAGS-supported variety closest to your stone and record calibrated carat weight.
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
        {/* Variety Selection & Basic ID */}
        <BasicInformation
          variety={draft.variety}
          caratWeight={draft.caratWeight}
          gemstoneCode={draft.stoneId}
          shape={draft.shape}
          onVarietyChange={(val) => updateDraft({ variety: val })}
          onCaratWeightChange={(val) => updateDraft({ caratWeight: val })}
          onGemstoneCodeChange={(val) => updateDraft({ stoneId: val })}
          onShapeChange={(val) => updateDraft({ shape: val })}
          stepMode="gemstone"
        />

        {/* Carat Band & Market Characteristics */}
        <CaratSection
          caratWeight={draft.caratWeight}
          onCaratWeightChange={(val) => updateDraft({ caratWeight: val })}
        />

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel & Exit
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
          >
            <span>Continue to Color Evaluation</span>
            <span>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
