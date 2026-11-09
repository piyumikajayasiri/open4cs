"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EvaluationDraftProvider } from "@/context/EvaluationDraftContext";

const EVALUATION_STEPS = [
  { path: "/evaluate/gemstone", label: "Gemstone", stepNum: 1 },
  { path: "/evaluate/color", label: "Color", stepNum: 2 },
  { path: "/evaluate/clarity", label: "Clarity", stepNum: 3 },
  { path: "/evaluate/cut", label: "Cut", stepNum: 4 },
  { path: "/evaluate/additional", label: "Additional", stepNum: 5 },
  { path: "/evaluate/review", label: "Review", stepNum: 6 },
];

function EvaluationHeader() {
  const pathname = usePathname();

  const currentStep =
    EVALUATION_STEPS.find((s) => pathname?.startsWith(s.path)) ||
    EVALUATION_STEPS[0];

  return (
    <div className="border-b border-slate-200/80 bg-white sticky top-0 z-40 shadow-2xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand & Flow Name */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-semibold transition"
          >
            <span>←</span> Exit to Dashboard
          </Link>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Open 4Cs Engine
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-600">
              Rule v4.2 Deterministic
            </span>
          </div>
        </div>

        {/* Center / Right: Progress Steps */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {EVALUATION_STEPS.map((step) => {
            const isActive = pathname?.startsWith(step.path);
            const isCompleted = currentStep.stepNum > step.stepNum;

            return (
              <Link
                key={step.path}
                href={step.path}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : isCompleted
                    ? "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? "✓" : step.stepNum}
                </span>
                <span>{step.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EvaluateLayout({ children }: { children: ReactNode }) {
  return (
    <EvaluationDraftProvider>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <EvaluationHeader />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </EvaluationDraftProvider>
  );
}
