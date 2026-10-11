"use client";

import React from "react";
import Link from "next/link";
import { useEvaluationDraft } from "@/context/EvaluationDraftContext";

export default function EvaluateIndexPage() {
  const { draft, resetDraft } = useEvaluationDraft();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Introduction Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Deterministic 4Cs Evaluation Framework
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Start Your Gemstone Evaluation
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              Open 4Cs guides you step-by-step through standard gemmological observation protocols. Follow each stage to calculate traceable scores and B2B benchmark price suggestions.
            </p>
          </div>
        </div>

        {/* 6 Steps Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600">Step 1</span>
              <span className="text-sm">💎</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Gemstone Variety</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select supported Ceylon corundum variety and input calibrated carat weight.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600">Step 2</span>
              <span className="text-sm">💧</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Color Evaluation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hue family, tone scale (1–10), saturation grade, and color zoning checks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600">Step 3</span>
              <span className="text-sm">🔍</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Clarity Evaluation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Naked eye and 10× loupe protocol, inclusion location and severity grading.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600">Step 4</span>
              <span className="text-sm">✂️</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Cut & Proportions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Millimeter dimensions, auto-calculated L:W ratio, depth %, symmetry and polish.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600">Step 5</span>
              <span className="text-sm">📋</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Additional Factors</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thermal treatment, geographic origin, recut potential, and reliability documentation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600">Step 6</span>
              <span className="text-sm">🏁</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Review & Execute</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify all entered observation parameters before running the evaluation engine.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <button
            type="button"
            onClick={resetDraft}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Reset Draft to Defaults
          </button>

          <Link
            href="/evaluate/gemstone"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 text-sm shadow-md shadow-blue-500/20 transition"
          >
            <span>Begin Evaluation — Step 1</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
