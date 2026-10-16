"use client";

import React from "react";

export type RecommendationItem = {
  id: string;
  type: "strength" | "verification" | "concern";
  title: string;
  description: string;
};

type RecommendationsViewProps = {
  stoneId?: string;
  ruleSetVersion?: string;
  strengths?: RecommendationItem[];
  verifications?: RecommendationItem[];
  concerns?: RecommendationItem[];
};

const DEFAULT_STRENGTHS: RecommendationItem[] = [
  {
    id: "rec-str-1",
    type: "strength",
    title: "Strong colour saturation",
    description:
      "Vivid saturation with even distribution — lead B2B positioning and photography on colour. Rule COL-03, 91% reference similarity.",
  },
  {
    id: "rec-str-2",
    type: "strength",
    title: "Clean face-up appearance",
    description:
      "Eye-clean with off-table silk only. No durability flags under Rule CLA-02.",
  },
];

const DEFAULT_VERIFICATIONS: RecommendationItem[] = [
  {
    id: "rec-ver-1",
    type: "verification",
    title: "Treatment information is seller provided on origin",
    description:
      "Origin premium capped at +0% until a laboratory report confirms Ceylon origin. Professional verification is recommended before a commercial transaction.",
  },
  {
    id: "rec-ver-2",
    type: "verification",
    title: "Depth 72.1% — possible recut consideration",
    description:
      "Stone faces up true to weight, so recutting is not recommended now. If depth exceeds 75% on re-measure, seek a cutter's opinion; Rule CUT-05.",
  },
];

const DEFAULT_CONCERNS: RecommendationItem[] = [
  {
    id: "rec-con-1",
    type: "concern",
    title: "Borderline-dark tone in warm light",
    description:
      "Tone 6 can read dark under shop lighting. View in daylight-equivalent light before final negotiation.",
  },
];

export default function RecommendationsView({
  stoneId = "CEY-2026-0847",
  ruleSetVersion = "REC rule set v2.8",
  strengths = DEFAULT_STRENGTHS,
  verifications = DEFAULT_VERIFICATIONS,
  concerns = DEFAULT_CONCERNS,
}: RecommendationsViewProps) {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {stoneId} · Only statements the rules and evidence support
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            {ruleSetVersion}
          </span>
        </div>
      </div>

      {/* Section 1: STRENGTHS */}
      {strengths.length > 0 && (
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            STRENGTHS
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {strengths.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-start gap-4 hover:border-slate-300 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  {idx === 0 ? (
                    // Star icon
                    <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: VERIFICATION REQUIRED · FURTHER ASSESSMENT */}
      {verifications.length > 0 && (
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            VERIFICATION REQUIRED · FURTHER ASSESSMENT
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {verifications.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-start gap-4 hover:border-slate-300 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  {idx === 0 ? (
                    // Flask / Beaker icon
                    <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  ) : (
                    // Ruler / edit pen icon
                    <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: POTENTIAL CONCERNS */}
      {concerns.length > 0 && (
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            POTENTIAL CONCERNS
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {concerns.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-start gap-4 hover:border-slate-300 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                  {/* Moon icon */}
                  <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </div>

                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
