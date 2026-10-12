"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvaluationDraft, InformationReliabilityType } from "@/context/EvaluationDraftContext";
import AdditionalInformationSection from "@/components/gemstone/AdditionalInformationSection";
import InformationReliabilityCard from "@/components/gemstone/InformationReliabilityCard";

export default function AdditionalStepPage() {
  const router = useRouter();
  const { draft, updateDraft } = useEvaluationDraft();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/evaluate/review");
  };

  const handleReliabilityChange = (
    field: "measurements" | "treatment" | "origin",
    value: string
  ) => {
    updateDraft({
      informationReliability: {
        ...draft.informationReliability,
        [field]: value as InformationReliabilityType,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Step 5 of 6 · Additional Factors
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Treatment, Origin & Reliability
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record thermal enhancement, geographic origin, supporting lab certificates, and data reliability levels.
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
            <AdditionalInformationSection
              treatmentStatus={draft.treatmentStatus}
              treatmentType={draft.treatmentType}
              originValue={draft.originValue}
              originReliability={draft.originReliability}
              informationReliability={draft.informationReliability}
              onTreatmentStatusChange={(val) => updateDraft({ treatmentStatus: val })}
              onTreatmentTypeChange={(val) => updateDraft({ treatmentType: val })}
              onOriginValueChange={(val) => updateDraft({ originValue: val })}
              onOriginReliabilityChange={(val) => updateDraft({ originReliability: val })}
              onInformationReliabilityChange={handleReliabilityChange}
            />
          </div>

          {/* Educational Visual Guide (4 cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <InformationReliabilityCard
              measurementReliability={draft.informationReliability.measurements}
              treatmentReliability={draft.informationReliability.treatment}
              originReliability={draft.informationReliability.origin}
            />
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Link
            href="/evaluate/cut"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <span>←</span>
            <span>Back to Cut</span>
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
          >
            <span>Continue to Review</span>
            <span>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
