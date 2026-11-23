"use client";

import React, { useMemo } from "react";
import { useEvaluationDraft } from "@/context/EvaluationDraftContext";
import { evaluateColor } from "@/lib/evaluation/evaluateColor";
import { evaluateClarity } from "@/lib/evaluation/evaluateClarity";
import { evaluateCut } from "@/lib/evaluation/evaluateCut";
import { evaluateCarat } from "@/lib/evaluation/evaluateCarat";
import { FOUR_C_WEIGHTS } from "@/lib/evaluation/rules";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Scale,
  Scissors,
  Palette,
  Eye,
} from "lucide-react";

type ActiveTab = "all" | "color" | "clarity" | "cut" | "carat";

export default function LiveScoreSidebar({ activeStep }: { activeStep?: ActiveTab }) {
  const { draft } = useEvaluationDraft();

  // Evaluate Color
  const colorEval = useMemo(() => {
    if (!draft.variety) {
      return { status: "NEED_INFO", score: null, missing: ["Select gemstone variety"] };
    }
    const missing: string[] = [];
    if (!draft.hue) missing.push("Hue selection");
    if (!draft.tone) missing.push("Tone (1-9)");
    if (!draft.saturation) missing.push("Saturation (1-6)");
    if (!draft.distribution) missing.push("Color distribution");
    if (!draft.zoning) missing.push("Color zoning");

    if (missing.length > 0) {
      return { status: "NEED_INFO", score: null, missing };
    }

    const res = evaluateColor({
      variety: draft.variety,
      hue: draft.hue,
      tone: draft.tone,
      saturation: draft.saturation,
      distribution: draft.distribution,
      zoning: draft.zoning,
    });

    // Extract positive and deductions
    const positives: string[] = [];
    const deductions: string[] = [];

    if (draft.saturation.toLowerCase().includes("vivid") || draft.saturation.toLowerCase().includes("strong")) {
      positives.push(`High saturation (${draft.saturation})`);
    } else {
      deductions.push(`Moderate/weak saturation (${draft.saturation})`);
    }

    if (draft.tone === "5" || draft.tone === "6" || draft.tone.toLowerCase().includes("medium")) {
      positives.push(`Optimal tone 5-6`);
    } else {
      deductions.push(`Tone ${draft.tone} deviates from preferred medium 5-6`);
    }

    if (draft.distribution === "Even") {
      positives.push("Uniform color distribution");
    } else {
      deductions.push(`${draft.distribution} color distribution`);
    }

    if (draft.zoning === "None") {
      positives.push("No color zoning detected");
    } else {
      deductions.push(`${draft.zoning} zoning observed`);
    }

    return {
      status: res.status,
      score: res.score,
      reason: res.reason,
      positives,
      deductions,
      missing,
    };
  }, [draft.variety, draft.hue, draft.tone, draft.saturation, draft.distribution, draft.zoning]);

  // Evaluate Clarity
  const clarityEval = useMemo(() => {
    const missing: string[] = [];
    if (!draft.nakedEye) missing.push("Naked eye visibility");
    if (!draft.loupe10x) missing.push("10x magnification observation");
    if (!draft.severity) missing.push("Inclusion severity rating");

    if (missing.length > 0) {
      return { status: "NEED_INFO", score: null, missing };
    }

    const res = evaluateClarity({
      nakedEye: draft.nakedEye,
      loupe10x: draft.loupe10x,
      inclusionType: draft.inclusionType || "",
      inclusionLocation: draft.inclusionLocation || "",
      severity: draft.severity,
    });

    const positives: string[] = [];
    const deductions: string[] = [];

    if (draft.nakedEye.toLowerCase().includes("clean")) {
      positives.push("Eye-clean (no unaided inclusions visible)");
    } else {
      deductions.push(`Inclusions visible to unaided eye (${draft.nakedEye})`);
    }

    if (
      draft.loupe10x.toLowerCase().includes("very slight") ||
      draft.loupe10x.toLowerCase().includes("clean") ||
      draft.loupe10x.toLowerCase().includes("minute")
    ) {
      positives.push("Minor/sparse inclusions under 10x magnification");
    } else {
      deductions.push(`Noticeable inclusions under 10x (${draft.loupe10x})`);
    }

    return {
      status: res.status,
      score: res.score,
      reason: res.reason,
      positives,
      deductions,
      missing,
    };
  }, [draft.nakedEye, draft.loupe10x, draft.inclusionType, draft.inclusionLocation, draft.severity]);

  // Evaluate Cut
  const cutEval = useMemo(() => {
    const missing: string[] = [];
    const len = Number(draft.length);
    const wid = Number(draft.width);
    const dep = Number(draft.depth);

    if (!len || len <= 0) missing.push("Length (mm)");
    if (!wid || wid <= 0) missing.push("Width (mm)");
    if (!dep || dep <= 0) missing.push("Depth (mm)");
    if (!draft.symmetry) missing.push("Symmetry rating");
    if (!draft.polish) missing.push("Polish rating");
    if (!draft.windowing) missing.push("Windowing observation");
    if (!draft.extinction) missing.push("Extinction observation");
    if (!draft.bulging) missing.push("Bulging observation");

    if (missing.length > 0) {
      return { status: "NEED_INFO", score: null, missing };
    }

    const res = evaluateCut({
      length: len,
      width: wid,
      depth: dep,
      symmetry: draft.symmetry,
      polish: draft.polish,
      windowing: draft.windowing,
      extinction: draft.extinction,
      bulging: draft.bulging,
    });

    const positives: string[] = [];
    const deductions: string[] = [];

    if (draft.windowing === "None") {
      positives.push("No light leakage / windowing");
    } else {
      deductions.push(`${draft.windowing} windowing present`);
    }

    if (draft.extinction === "None" || draft.extinction.toLowerCase().includes("minimal")) {
      positives.push("Minimal extinction (brilliant light return)");
    } else {
      deductions.push(`${draft.extinction} extinction dark zones`);
    }

    if (draft.symmetry === "Excellent" || draft.symmetry === "Good") {
      positives.push(`Strong symmetry (${draft.symmetry})`);
    } else {
      deductions.push(`Sub-optimal symmetry (${draft.symmetry})`);
    }

    return {
      status: res.status,
      score: res.score,
      measurements: res.measurements,
      positives,
      deductions,
      missing,
    };
  }, [
    draft.length,
    draft.width,
    draft.depth,
    draft.symmetry,
    draft.polish,
    draft.windowing,
    draft.extinction,
    draft.bulging,
  ]);

  // Evaluate Carat
  const caratEval = useMemo(() => {
    const missing: string[] = [];
    const weight = Number(draft.caratWeight);
    const len = Number(draft.length);
    const wid = Number(draft.width);
    const dep = Number(draft.depth);

    if (!weight || weight <= 0) missing.push("Carat weight (ct)");
    if (!len || len <= 0 || !wid || wid <= 0 || !dep || dep <= 0) {
      missing.push("Dimensions (length × width × depth mm)");
    }

    if (missing.length > 0) {
      return { status: "NEED_INFO", score: null, missing };
    }

    const res = evaluateCarat({
      caratWeight: weight,
      length: len,
      width: wid,
      depth: dep,
    });

    const positives: string[] = [];
    const deductions: string[] = [];

    if (weight >= 3.0) {
      positives.push(`Major rarity tier (≥ 3.0 ct)`);
    } else if (weight >= 1.5) {
      positives.push(`Substantial commercial tier (≥ 1.5 ct)`);
    } else {
      positives.push(`Accurate calibrated weight (${weight.toFixed(2)} ct)`);
    }

    if (res.sizeConsistency && res.sizeConsistency >= 45 && res.sizeConsistency <= 65) {
      positives.push("Proportional face-up spread to weight ratio");
    } else if (res.sizeConsistency && res.sizeConsistency < 45) {
      deductions.push("Heavy belly / excess pavilion weight reducing spread");
    }

    return {
      status: res.status,
      score: res.score,
      sizeConsistency: res.sizeConsistency,
      positives,
      deductions,
      missing,
    };
  }, [draft.caratWeight, draft.length, draft.width, draft.depth]);

  // Composite 4C Score calculation
  const composite = useMemo(() => {
    const validScores: { name: string; score: number; weight: number }[] = [];

    if (typeof colorEval.score === "number") {
      validScores.push({ name: "Color", score: colorEval.score, weight: FOUR_C_WEIGHTS.color });
    }
    if (typeof clarityEval.score === "number") {
      validScores.push({ name: "Clarity", score: clarityEval.score, weight: FOUR_C_WEIGHTS.clarity });
    }
    if (typeof cutEval.score === "number") {
      validScores.push({ name: "Cut", score: cutEval.score, weight: FOUR_C_WEIGHTS.cut });
    }
    if (typeof caratEval.score === "number") {
      validScores.push({ name: "Carat", score: caratEval.score, weight: FOUR_C_WEIGHTS.carat });
    }

    const completeCount = validScores.length;
    const isFullyAssessed = completeCount === 4;

    if (isFullyAssessed) {
      const overall =
        (colorEval.score! * FOUR_C_WEIGHTS.color) +
        (clarityEval.score! * FOUR_C_WEIGHTS.clarity) +
        (cutEval.score! * FOUR_C_WEIGHTS.cut) +
        (caratEval.score! * FOUR_C_WEIGHTS.carat);

      let gradeBand = "Commercial";
      let gradeColor = "text-amber-700 bg-amber-50 border-amber-200";
      if (overall >= 90) {
        gradeBand = "Exceptional / Gem Quality";
        gradeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
      } else if (overall >= 80) {
        gradeBand = "Fine Quality";
        gradeColor = "text-blue-700 bg-blue-50 border-blue-200";
      } else if (overall < 65) {
        gradeBand = "Promotional Quality";
        gradeColor = "text-slate-700 bg-slate-50 border-slate-200";
      }

      return {
        isComplete: true,
        completeCount: 4,
        overallScore: Number(overall.toFixed(1)),
        gradeBand,
        gradeColor,
      };
    }

    return {
      isComplete: false,
      completeCount,
      overallScore: null,
      gradeBand: "In Progress",
      gradeColor: "text-slate-600 bg-slate-100 border-slate-200",
    };
  }, [colorEval.score, clarityEval.score, cutEval.score, caratEval.score]);

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-4">
      {/* ================= COMPOSITE SCORE SUMMARY BANNER ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Live Provisional Score
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            Rule v4.2
          </span>
        </div>

        {composite.isComplete ? (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {composite.overallScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <div className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${composite.gradeColor}`}>
              {composite.gradeBand}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Assessment Progress</span>
              <span className="font-bold text-blue-600">{composite.completeCount} of 4 4Cs</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(composite.completeCount / 4) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Complete each 4C factor to reveal the comprehensive composite score.
            </p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Weights: 35% Color · 25% Clarity · 20% Cut · 20% Carat</span>
        </div>
      </div>

      {/* ================= 4C FACTOR BREAKDOWNS ================= */}
      <div className="space-y-3">
        {/* 1. COLOR CARD */}
        <div
          className={`bg-white rounded-xl border p-4 transition ${
            activeStep === "color"
              ? "border-blue-500/80 ring-2 ring-blue-500/10 shadow-xs"
              : "border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-900">Color (35%)</span>
            </div>
            {typeof colorEval.score === "number" ? (
              <span className="text-xs font-bold text-slate-900 font-mono">
                {colorEval.score} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Pending
              </span>
            )}
          </div>

          {typeof colorEval.score === "number" ? (
            <div className="space-y-1.5 text-[11px]">
              {colorEval.positives?.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
              {colorEval.deductions?.map((d, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-500">
                  <span className="text-amber-600 font-bold">−</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 text-[10px] block mb-1">
                More information needed:
              </span>
              {colorEval.missing?.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 text-amber-700">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. CLARITY CARD */}
        <div
          className={`bg-white rounded-xl border p-4 transition ${
            activeStep === "clarity"
              ? "border-blue-500/80 ring-2 ring-blue-500/10 shadow-xs"
              : "border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-bold text-slate-900">Clarity (25%)</span>
            </div>
            {typeof clarityEval.score === "number" ? (
              <span className="text-xs font-bold text-slate-900 font-mono">
                {clarityEval.score} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Pending
              </span>
            )}
          </div>

          {typeof clarityEval.score === "number" ? (
            <div className="space-y-1.5 text-[11px]">
              {clarityEval.positives?.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
              {clarityEval.deductions?.map((d, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-500">
                  <span className="text-amber-600 font-bold">−</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 text-[10px] block mb-1">
                More information needed:
              </span>
              {clarityEval.missing?.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 text-amber-700">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. CUT CARD */}
        <div
          className={`bg-white rounded-xl border p-4 transition ${
            activeStep === "cut"
              ? "border-blue-500/80 ring-2 ring-blue-500/10 shadow-xs"
              : "border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Cut (20%)</span>
            </div>
            {typeof cutEval.score === "number" ? (
              <span className="text-xs font-bold text-slate-900 font-mono">
                {cutEval.score} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Pending
              </span>
            )}
          </div>

          {typeof cutEval.score === "number" ? (
            <div className="space-y-1.5 text-[11px]">
              {cutEval.measurements?.depthPercentage && (
                <div className="text-[10px] text-slate-500 mb-1">
                  Depth ratio: {cutEval.measurements.depthPercentage}% · L/W: {cutEval.measurements.lengthToWidthRatio}
                </div>
              )}
              {cutEval.positives?.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
              {cutEval.deductions?.map((d, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-500">
                  <span className="text-amber-600 font-bold">−</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 text-[10px] block mb-1">
                More information needed:
              </span>
              {cutEval.missing?.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 text-amber-700">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. CARAT CARD */}
        <div
          className={`bg-white rounded-xl border p-4 transition ${
            activeStep === "carat"
              ? "border-blue-500/80 ring-2 ring-blue-500/10 shadow-xs"
              : "border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">Carat (20%)</span>
            </div>
            {typeof caratEval.score === "number" ? (
              <span className="text-xs font-bold text-slate-900 font-mono">
                {caratEval.score} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Pending
              </span>
            )}
          </div>

          {typeof caratEval.score === "number" ? (
            <div className="space-y-1.5 text-[11px]">
              {caratEval.sizeConsistency && (
                <div className="text-[10px] text-slate-500 mb-1">
                  Spread indicator: {caratEval.sizeConsistency} mm³/ct
                </div>
              )}
              {caratEval.positives?.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
              {caratEval.deductions?.map((d, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-500">
                  <span className="text-amber-600 font-bold">−</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 text-[10px] block mb-1">
                More information needed:
              </span>
              {caratEval.missing?.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 text-amber-700">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= HONEST DISCLAIMER NOTE ================= */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
        <span className="font-bold text-slate-700 block">Provisional Observation Note</span>
        <p>
          Scores reflect algorithmic calculations from user-entered grading parameters. Not a laboratory grading certificate or certified appraisal.
        </p>
      </div>
    </aside>
  );
}
