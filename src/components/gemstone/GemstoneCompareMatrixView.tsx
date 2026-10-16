"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type GemstoneCompareItem = {
  id: string;
  variety: string;
  carat: string;
  origin: string;
  color: string;
  colorSimilarity: string;
  clarity: string;
  cut: string;
  treatment: string;
  isTreatmentBold?: boolean;
  overallEvaluation: string;
  suggestedRange: string;
  informationReliability: string;
};

const DEFAULT_STONES: GemstoneCompareItem[] = [
  {
    id: "EV-2026-0847",
    variety: "Ceylon Blue Sapphire",
    carat: "2.45 ct",
    origin: "Sri Lanka (unverified)",
    color: "8.6 Vivid Blue",
    colorSimilarity: "91%",
    clarity: "7.9 Eye-clean",
    cut: "8.1 Well cut",
    treatment: "Heated",
    isTreatmentBold: false,
    overallEvaluation: "8.2 Excellent",
    suggestedRange: "LKR 1.42M – 1.68M",
    informationReliability: "Mixed — verify origin",
  },
  {
    id: "EV-2026-0841",
    variety: "Padparadscha",
    carat: "1.87 ct",
    origin: "Sri Lanka (lab-verified)",
    color: "8.9 Lotus blend",
    colorSimilarity: "88%",
    clarity: "8.2 Eye-clean",
    cut: "7.8 Good",
    treatment: "Unheated",
    isTreatmentBold: true,
    overallEvaluation: "8.4 Excellent",
    suggestedRange: "LKR 2.05M – 2.40M",
    informationReliability: "High — lab-verified",
  },
  {
    id: "EV-2026-0832",
    variety: "Yellow Sapphire",
    carat: "3.10 ct",
    origin: "Sri Lanka (seller)",
    color: "7.0 Golden",
    colorSimilarity: "79%",
    clarity: "6.5 Minor Inclusions",
    cut: "7.2 Good",
    treatment: "Heated",
    isTreatmentBold: false,
    overallEvaluation: "7.1 Good",
    suggestedRange: "LKR 310K – 385K",
    informationReliability: "Medium — seller data",
  },
];

type GemstoneCompareMatrixViewProps = {
  stones?: GemstoneCompareItem[];
  onAddEvaluation?: () => void;
};

export default function GemstoneCompareMatrixView({
  stones = DEFAULT_STONES,
  onAddEvaluation,
}: GemstoneCompareMatrixViewProps) {
  const router = useRouter();
  const [selectedStoneId, setSelectedStoneId] = useState<string>(stones[0]?.id || "EV-2026-0847");

  const handleAdd = () => {
    if (onAddEvaluation) {
      onAddEvaluation();
    } else {
      router.push("/history");
    }
  };

  const attributes = [
    {
      key: "variety",
      label: "VARIETY",
      highlight: false,
      render: (s: GemstoneCompareItem) => (
        <span className="font-semibold text-slate-900">{s.variety}</span>
      ),
    },
    {
      key: "origin",
      label: "ORIGIN",
      highlight: true,
      render: (s: GemstoneCompareItem) => (
        <span className="text-slate-800 font-medium">{s.origin}</span>
      ),
    },
    {
      key: "color",
      label: "COLOR",
      highlight: false,
      render: (s: GemstoneCompareItem) => (
        <span className="text-slate-800 font-medium">{s.color}</span>
      ),
    },
    {
      key: "colorSimilarity",
      label: "COLOR SIMILARITY",
      highlight: true,
      render: (s: GemstoneCompareItem) => (
        <span className="text-slate-800 font-medium">{s.colorSimilarity}</span>
      ),
    },
    {
      key: "clarity",
      label: "CLARITY",
      highlight: false,
      render: (s: GemstoneCompareItem) => (
        <span className="text-slate-800 font-medium">{s.clarity}</span>
      ),
    },
    {
      key: "cut",
      label: "CUT",
      highlight: true,
      render: (s: GemstoneCompareItem) => (
        <span className="text-slate-800 font-medium">{s.cut}</span>
      ),
    },
    {
      key: "treatment",
      label: "TREATMENT",
      highlight: false,
      render: (s: GemstoneCompareItem) => (
        <span className={s.isTreatmentBold ? "font-bold text-slate-900" : "text-slate-800 font-medium"}>
          {s.treatment}
        </span>
      ),
    },
    {
      key: "overallEvaluation",
      label: "OVERALL EVALUATION",
      highlight: true,
      render: (s: GemstoneCompareItem) => (
        <span className="font-semibold text-slate-900">{s.overallEvaluation}</span>
      ),
    },
    {
      key: "suggestedRange",
      label: "SUGGESTED B2B RANGE",
      highlight: false,
      render: (s: GemstoneCompareItem) => (
        <span className="font-bold text-slate-900">{s.suggestedRange}</span>
      ),
    },
    {
      key: "informationReliability",
      label: "INFORMATION RELIABILITY",
      highlight: true,
      render: (s: GemstoneCompareItem) => (
        <span className="text-slate-800 font-medium">{s.informationReliability}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Compare Gemstones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Side-by-side context only — the system never declares a winner
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5 shadow-2xs transition"
          >
            <span className="text-base leading-none font-normal">+</span>
            Add Evaluation
          </button>
        </div>
      </div>

      {/* Top 3 Stone Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stones.map((stone) => {
          const isSelected = selectedStoneId === stone.id;

          return (
            <div
              key={stone.id}
              onClick={() => setSelectedStoneId(stone.id)}
              className={`rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 cursor-pointer transition ${
                isSelected
                  ? "border-2 border-blue-600 bg-white shadow-xs"
                  : "border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs"
              }`}
            >
              {/* Gem Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>

              {/* Stone ID & Info */}
              <div>
                <p className="text-sm font-bold text-slate-900 tracking-tight">
                  {stone.id}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {stone.variety.split(" ")[0]} · {stone.carat}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Matrix Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Dark Navy Table Header */}
            <thead>
              <tr className="bg-[#0E172E] text-white">
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 w-1/4">
                  ATTRIBUTE
                </th>
                {stones.map((stone) => (
                  <th
                    key={stone.id}
                    className="py-3.5 px-5 text-[11px] font-extrabold uppercase tracking-wider text-white w-1/4"
                  >
                    {stone.id}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Rows with Alternating Warm Highlights for Differing Attributes */}
            <tbody className="text-xs sm:text-sm divide-y divide-slate-100/70">
              {attributes.map((attr) => (
                <tr
                  key={attr.key}
                  className={
                    attr.highlight
                      ? "bg-[#FEF9EE] hover:bg-[#FDF4E1] transition-colors"
                      : "bg-white hover:bg-slate-50/60 transition-colors"
                  }
                >
                  {/* Attribute Name */}
                  <td className="py-3.5 px-6 font-extrabold text-[11px] text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {attr.label}
                  </td>

                  {/* Columns for each stone */}
                  {stones.map((stone) => (
                    <td key={stone.id} className="py-3.5 px-5 whitespace-nowrap">
                      {attr.render(stone)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Informational Note */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-normal pt-1">
        <span className="text-slate-400 text-sm">ⓘ</span>
        <span>
          Highlighted rows differ across stones. Differences are informational — suitability depends on your B2B intent.
        </span>
      </div>
    </div>
  );
}
