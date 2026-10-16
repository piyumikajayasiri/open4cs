"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type PersonaType = "student" | "trader" | "gemologist";

type EvaluationStatementViewProps = {
  stoneId?: string;
  variety?: string;
  caratWeight?: number;
  overallScore?: number;
  overallScoreLabel?: string;
  suggestedPriceMin?: string;
  suggestedPriceMax?: string;
  comparablesCount?: number;
  similarityRange?: string;
  initialPersona?: PersonaType;
  onDownloadPdf?: () => void;
  onStartNew?: () => void;
  onSave?: () => void;
  onCompare?: () => void;
};

const STATEMENTS: Record<PersonaType, { badge: string; text: string }> = {
  trader: {
    badge: "Trader statement",
    text: "“This 2.45 ct heated Ceylon blue sapphire scored 8.2 (Excellent) with colour-led strength at 91% reference similarity. Against 5 heated comparables (LKR 545K–640K/ct), the suggested B2B range is LKR 1.42M–1.68M. Origin premium is capped pending lab confirmation — verify origin before closing.”",
  },
  student: {
    badge: "Student statement",
    text: "“This Ceylon blue sapphire demonstrates textbook vivid saturation with medium-dark tone (score 8.2/10). The 2.45 ct stone exhibits standard heat treatment characteristics with natural silk inclusions confirming Ceylon origin indicators. Current market references place this quality grade in the upper quartile.”",
  },
  gemologist: {
    badge: "Gemologist statement",
    text: "“Comprehensive gemological evaluation indicates a 2.45 ct natural corundum (variety: blue sapphire), heated, displaying vivid royal blue coloration with exceptional facet symmetry and eye-clean clarity. Microscopic observation reveals rutile silk needles consistent with Sri Lankan provenance. Benchmark parity establishes an evaluation score of 8.2 with high confidence.”",
  },
};

export default function EvaluationStatementView({
  stoneId = "CEY-2026-0847",
  variety = "Ceylon Blue Sapphire",
  caratWeight = 2.45,
  overallScore = 8.2,
  overallScoreLabel = "Excellent",
  suggestedPriceMin = "1.42M",
  suggestedPriceMax = "1.68M",
  comparablesCount = 7,
  similarityRange = "84-93%",
  initialPersona = "trader",
  onDownloadPdf,
  onStartNew,
  onSave,
  onCompare,
}: EvaluationStatementViewProps) {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>(initialPersona);
  const [showExplanation, setShowExplanation] = useState(false);

  const activeStatement = STATEMENTS[selectedPersona];

  const handleDownload = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    } else {
      window.print();
    }
  };

  const handleStartNew = () => {
    if (onStartNew) {
      onStartNew();
    } else {
      router.push("/evaluate/gemstone");
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      alert("Evaluation statement saved to your account!");
    }
  };

  const handleCompare = () => {
    if (onCompare) {
      onCompare();
    } else {
      router.push("/compare");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Evaluation Statement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Wording adapts to your category · generated from results, reliability and comparables — never hand-written
          </p>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition"
          >
            <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>

          <button
            type="button"
            onClick={handleStartNew}
            className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B] px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <span className="text-sm leading-none font-normal">+</span>
            Start New
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Statement Card & Final Result Summary (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Statement Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-6">
            {/* Header: Persona Badge on Left, Persona Switcher on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#1E293B] text-white">
                  {activeStatement.badge}
                </span>
              </div>

              {/* Segmented Persona Selector */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedPersona("student")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    selectedPersona === "student"
                      ? "bg-[#0E172E] text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
                  </svg>
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPersona("trader")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    selectedPersona === "trader"
                      ? "bg-[#0E172E] text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Trader
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPersona("gemologist")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    selectedPersona === "gemologist"
                      ? "bg-[#0E172E] text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" stroke="currentColor" />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" stroke="currentColor" />
                  </svg>
                  Gemologist
                </button>
              </div>
            </div>

            {/* Statement Text */}
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
              {activeStatement.text}
            </p>

            {/* Accordion Toggle: How this statement was generated */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showExplanation ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
                How this statement was generated
              </button>

              {showExplanation && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2.5 animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-900">1. Algorithmic Quality Grading:</span>
                    <span>Synthesized from rule engine v4.2 incorporating 4C subscores (Color: 8.6, Clarity: 7.9, Cut: 8.1, Carat: 2.45 ct).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-900">2. Reference Market Calibrations:</span>
                    <span>Matched against 7 Ceylon blue sapphire comparables in the 2.1–2.8 ct bracket displaying 84%–93% similarity.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-900">3. Prevailing Sri Lankan B2B Indices:</span>
                    <span>Derived from 12-month local wholesale records averaging LKR 580K–686K per carat.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-900">4. Verification & Advisory Rule REC-v2.8:</span>
                    <span>Origin premium capped at +0% pending certified lab report; depth watch flagged at 72.1%.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Final Result Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Final result summary
            </h3>

            {/* 3 Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Overall */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  OVERALL
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {overallScore.toFixed(1)} {overallScoreLabel}
                </p>
              </div>

              {/* Card 2: Suggested Range */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  SUGGESTED RANGE
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  LKR {suggestedPriceMin} – {suggestedPriceMax}
                </p>
              </div>

              {/* Card 3: Comparables */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  COMPARABLES
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {comparablesCount} stones · {similarityRange}
                </p>
              </div>
            </div>

            {/* Row of 3 Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold py-3 text-center transition shadow-2xs"
              >
                Save Evaluation
              </button>

              <button
                type="button"
                onClick={handleCompare}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold py-3 text-center transition shadow-2xs"
              >
                Compare
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold py-3 text-center transition shadow-2xs"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Key strengths & concerns + Advisory Disclaimer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Key Strengths & Concerns */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Key strengths &amp; concerns
            </h4>

            <div className="space-y-3">
              {/* Strength Item */}
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
                  ✓
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Vivid saturation · eye-clean · excellent polish
                </p>
              </div>

              {/* Concern / Watch Item */}
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
                  !
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Origin unverified · depth 72.1% watch
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Legal / Advisory Disclaimer */}
          <div className="rounded-2xl border border-[#F6E7C4] bg-[#FEF9EE] p-5 shadow-2xs flex items-start gap-3">
            <span className="text-base text-amber-600 flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-amber-900/90 leading-relaxed font-normal">
              This system provides an estimated B2B price suggestion based on the information provided, predefined evaluation and pricing rules, comparable gemstone data, and available reference information. It is not a professional laboratory valuation, gemstone certification, authentication, legally binding valuation, or guaranteed selling price.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
