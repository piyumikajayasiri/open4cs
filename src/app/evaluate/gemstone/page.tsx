"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEvaluationDraft } from "@/context/EvaluationDraftContext";
import BasicInformation, { GEMSTONE_VARIETIES } from "@/components/gemstone/BasicInformation";
import { ArrowRight, AlertTriangle } from "lucide-react";

export default function GemstoneStepPage() {
  const router = useRouter();
  const { draft, updateDraft } = useEvaluationDraft();

  const isSupportedVariety = useMemo(() => {
    const found = GEMSTONE_VARIETIES.find(
      (v) =>
        v.id.toLowerCase() === draft.variety.toLowerCase() ||
        v.name.toLowerCase() === draft.variety.toLowerCase() ||
        (draft.variety.toLowerCase().includes("blue") && v.id === "Blue Sapphire") ||
        (draft.variety.toLowerCase().includes("pad") && v.id === "Padparadscha") ||
        (draft.variety.toLowerCase().includes("ruby") && v.id === "Ruby")
    );
    return found ? found.isSupported : false;
  }, [draft.variety]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupportedVariety) {
      alert("Evaluation is currently supported only for Blue Sapphire, Padparadscha, and Ruby.");
      return;
    }
    router.push("/evaluate/color");
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Step 1 of 7 · Gemstone Category & Origin Nature
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Gemstone Variety & Photographic Evidence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select the corundum variety, natural geological status, and attach optional photographic references.
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
        <BasicInformation
          variety={draft.variety}
          onVarietyChange={(val) => updateDraft({ variety: val })}
          gemstoneCode={draft.stoneId}
          onGemstoneCodeChange={(val) => updateDraft({ stoneId: val })}
          naturalStatus={draft.naturalStatus || "Natural"}
          onNaturalStatusChange={(val) => updateDraft({ naturalStatus: val })}
          shape={draft.shape || "Oval · Mixed Cut"}
          onShapeChange={(val) => updateDraft({ shape: val })}
          photoUrl={draft.photoUrl || ""}
          onPhotoChange={(val) => updateDraft({ photoUrl: val })}
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
            disabled={!isSupportedVariety}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition ${
              isSupportedVariety
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
            }`}
          >
            <span>Continue to Color Evaluation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
