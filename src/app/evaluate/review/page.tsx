"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvaluationDraft } from "@/context/EvaluationDraftContext";
import ReviewSection from "@/components/gemstone/ReviewSection";
import EvaluationProcessingScreen from "@/components/gemstone/EvaluationProcessingScreen";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function ReviewStepPage() {
  const router = useRouter();
  const { draft, submitEvaluation, isSubmitting, submitError } = useEvaluationDraft();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEditStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        router.push("/evaluate/gemstone");
        break;
      case 2:
        router.push("/evaluate/color");
        break;
      case 3:
        router.push("/evaluate/clarity");
        break;
      case 4:
        router.push("/evaluate/cut");
        break;
      case 5:
        router.push("/evaluate/carat");
        break;
      case 6:
        router.push("/evaluate/additional");
        break;
      case 7:
      default:
        router.push("/evaluate/review");
    }
  };

  const handleRunEvaluation = async () => {
    setLocalError(null);
    const result = await submitEvaluation();
    if (result.success && result.evaluationId) {
      // Redirect to dedicated evaluation results dashboard
      router.push(`/evaluations/${result.evaluationId}`);
    } else {
      setLocalError(result.error || "Evaluation failed. Please review your observation inputs.");
    }
  };

  if (isSubmitting) {
    return <EvaluationProcessingScreen />;
  }

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Step 7 of 7 · Review & Save
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Review Your Gemstone Observations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Confirm all recorded 4C metrics, origin factors, and photo evidence before executing the deterministic evaluation engine.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            All 7 stages complete
          </span>
        </div>
      </div>

      {(localError || submitError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{localError || submitError}</span>
        </div>
      )}

      {/* Review Section Summary Cards */}
      <ReviewSection
        variety={draft.variety}
        naturalStatus={draft.naturalStatus}
        caratWeight={draft.caratWeight}
        length={draft.length}
        width={draft.width}
        depth={draft.depth}
        hue={draft.hue}
        tone={draft.tone}
        saturation={draft.saturation}
        distribution={draft.distribution}
        zoning={draft.zoning}
        nakedEye={draft.nakedEye}
        loupe10x={draft.loupe10x}
        inclusionType={draft.inclusionType}
        inclusionLocation={draft.inclusionLocation}
        severity={draft.severity}
        symmetry={draft.symmetry}
        polish={draft.polish}
        windowing={draft.windowing}
        extinction={draft.extinction}
        bulging={draft.bulging}
        treatmentStatus={draft.treatmentStatus}
        treatmentType={draft.treatmentType}
        originValue={draft.originValue}
        originReliability={draft.originReliability}
        onEditStep={handleEditStep}
        onRunEvaluation={handleRunEvaluation}
        loading={isSubmitting}
      />

      {/* Bottom Back Button */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <Link
          href="/evaluate/additional"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Treatment & Origin</span>
        </Link>
      </div>
    </div>
  );
}
