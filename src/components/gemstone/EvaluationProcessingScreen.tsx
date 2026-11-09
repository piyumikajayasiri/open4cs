"use client";

import React from "react";

type EvaluationProcessingScreenProps = {
  stoneId?: string;
  ruleVersion?: string;
  onComplete?: () => void;
};

export default function EvaluationProcessingScreen({
  stoneId = "CEY-2026-0847",
  ruleVersion = "v4.2",
}: EvaluationProcessingScreenProps) {
  const steps = [
    {
      title: "Validating information",
      detail: "12 fields · 0 errors",
      status: "done",
    },
    {
      title: "Evaluating Color",
      detail: "Rule COL-03 · 8.6",
      status: "done",
    },
    {
      title: "Evaluating Clarity",
      detail: "Rule CLA-02 · 7.9",
      status: "done",
    },
    {
      title: "Evaluating Cut",
      detail: "Rule CUT-02 · 8.1",
      status: "done",
    },
    {
      title: "Evaluating Carat Weight",
      detail: "Band 2.00–2.99 ct",
      status: "done",
    },
    {
      title: "Finding Comparable Gemstones",
      detail: "Scanning 214 Ceylon blue records...",
      status: "working",
    },
    {
      title: "Calculating Price Suggestion",
      detail: "Pricing matrix PM-4.2 queued",
      status: "queued",
    },
    {
      title: "Generating Recommendations",
      detail: "REC rule set queued",
      status: "queued",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col items-center">
      {/* Top Laboratory Flask Icon */}
      <div className="w-12 h-12 rounded-full bg-[#0F1B38] text-white flex items-center justify-center shadow-md mb-4">
        <svg
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M19.8 18.4L14 8.7V4h1c.6 0 1-.4 1-1s-.4-1-1-1H9c-.6 0-1 .4-1 1s.4 1 1 1h1v4.7L4.2 18.4C3.5 19.5 4.3 21 5.6 21h12.8c1.3 0 2.1-1.5 1.4-2.6zM6.5 19l4.5-7.5V4h2v7.5l4.5 7.5H6.5z" />
        </svg>
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
        Evaluating {stoneId}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-2 text-center mb-8">
        Rule engine {ruleVersion} · Reference snapshot 24 Sep 2026 · No AI models involved
      </p>

      {/* Checklist Card */}
      <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs divide-y divide-slate-100">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 ${
              step.status === "queued" ? "opacity-40" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-3.5">
              {/* Status Icon */}
              {step.status === "done" && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <svg
                    className="w-3 h-3 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {step.status === "working" && (
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0" />
              )}

              {step.status === "queued" && (
                <div className="w-5 h-5 rounded-full border border-slate-300 bg-white flex-shrink-0" />
              )}

              {/* Title and Detail */}
              <div>
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    step.status === "queued"
                      ? "text-slate-500"
                      : "text-slate-900"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {step.detail}
                </p>
              </div>
            </div>

            {/* Right Status Label */}
            <div>
              {step.status === "done" && (
                <span className="text-xs font-medium text-slate-400">
                  Done
                </span>
              )}

              {step.status === "working" && (
                <span className="text-xs font-semibold text-blue-600">
                  Working...
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Explanatory Banner */}
      <div className="w-full mt-6 rounded-xl border border-[#F0E6D2] bg-[#FBF7EE] py-3 px-4 text-center">
        <p className="text-xs text-[#7A6B48] font-medium">
          Deterministic rule evaluation — every step cites the rule and data it used.
        </p>
      </div>
    </div>
  );
}
