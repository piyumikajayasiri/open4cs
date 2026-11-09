"use client";

import React, { useState } from "react";
import Link from "next/link";

export type ComparableGemstoneRecord = {
  id: string;
  color: string;
  clarity: string;
  cut: string;
  carat: number | string;
  treatment: "Heated" | "Unheated";
  refPrice: string;
  similarity: number;
  variety?: string;
  origin?: string;
};

type ComparableGemstonesViewProps = {
  stoneId?: string;
  variety?: string;
  caratWeight?: string | number;
  color?: string;
  clarity?: string;
  cut?: string;
  treatment?: string;
  toleranceRecordsCount?: number;
  snapshotDate?: string;
  comparables?: ComparableGemstoneRecord[];
  onSelectCompare?: (record: ComparableGemstoneRecord) => void;
  onOpenSideBySide?: () => void;
};

const DEFAULT_COMPARABLES: ComparableGemstoneRecord[] = [
  {
    id: "REF-1182",
    color: "Vivid Blue",
    clarity: "Eye-clean",
    cut: "Well cut",
    carat: "2.52",
    treatment: "Heated",
    refPrice: "LKR 640K/ct",
    similarity: 93,
    variety: "Ceylon Blue Sapphire",
    origin: "Sri Lanka",
  },
  {
    id: "REF-0934",
    color: "Vivid Blue",
    clarity: "Eye-clean",
    cut: "Well cut",
    carat: "2.38",
    treatment: "Heated",
    refPrice: "LKR 612K/ct",
    similarity: 91,
    variety: "Ceylon Blue Sapphire",
    origin: "Sri Lanka",
  },
  {
    id: "REF-1207",
    color: "Royal Blue",
    clarity: "Eye-clean",
    cut: "Excellent",
    carat: "2.61",
    treatment: "Unheated",
    refPrice: "LKR 890K/ct",
    similarity: 88,
    variety: "Ceylon Blue Sapphire",
    origin: "Sri Lanka",
  },
  {
    id: "REF-0771",
    color: "Cornflower",
    clarity: "Minor silk",
    cut: "Good",
    carat: "2.20",
    treatment: "Heated",
    refPrice: "LKR 545K/ct",
    similarity: 86,
    variety: "Ceylon Blue Sapphire",
    origin: "Sri Lanka",
  },
  {
    id: "REF-1099",
    color: "Vivid Blue",
    clarity: "Minor silk",
    cut: "Well cut",
    carat: "2.74",
    treatment: "Heated",
    refPrice: "LKR 598K/ct",
    similarity: 84,
    variety: "Ceylon Blue Sapphire",
    origin: "Sri Lanka",
  },
];

export default function ComparableGemstonesView({
  stoneId = "CEY-2026-0847",
  variety = "Ceylon Blue Sapphire",
  caratWeight = "2.45",
  color = "Vivid Blue",
  clarity = "Eye-clean",
  cut = "Well cut",
  treatment = "Heated",
  toleranceRecordsCount = 7,
  snapshotDate = "24 Sep 2026",
  comparables = DEFAULT_COMPARABLES,
  onSelectCompare,
  onOpenSideBySide,
}: ComparableGemstonesViewProps) {
  const [filterChips, setFilterChips] = useState<string[]>([
    "Ceylon Blue Sapphire",
    "Heated + Unheated",
    "2.0 – 3.0 ct",
    "Vivid ± 1 tone",
    "Eye-clean ± 1",
  ]);

  const [selectedRecord, setSelectedRecord] = useState<ComparableGemstoneRecord | null>(null);

  const removeChip = (chipToRemove: string) => {
    setFilterChips((prev) => prev.filter((c) => c !== chipToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comparable Gemstones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your stone pinned on top · {toleranceRecordsCount} reference records within tolerance · snapshot {snapshotDate}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition"
          >
            <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
          </button>

          <button
            type="button"
            onClick={onOpenSideBySide}
            className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B] px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <span>+</span>
            <span>Add to Comparison</span>
          </button>
        </div>
      </div>

      {/* Pinned Stone Banner */}
      <div className="rounded-2xl bg-[#0B1528] text-white p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-inner">
            {caratWeight}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              YOUR GEMSTONE · {stoneId}
            </span>
            <p className="text-sm font-bold text-white truncate mt-0.5">
              {variety} · {color} · {clarity} · {cut} · {caratWeight} ct · {treatment}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-800/80 border border-slate-700/60 px-3 py-1 text-xs font-medium text-slate-300 shrink-0">
          Anchor
        </span>
      </div>

      {/* Filter Pills Row */}
      {filterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <span>{chip}</span>
              <button
                type="button"
                onClick={() => removeChip(chip)}
                className="text-slate-400 hover:text-slate-700 font-bold ml-0.5"
                title={`Remove ${chip}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Comparable Gemstones Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">ID</th>
                <th className="py-3.5 px-4 font-bold">COLOR</th>
                <th className="py-3.5 px-4 font-bold">CLARITY</th>
                <th className="py-3.5 px-4 font-bold">CUT</th>
                <th className="py-3.5 px-4 font-bold">CARAT</th>
                <th className="py-3.5 px-4 font-bold">TREATMENT</th>
                <th className="py-3.5 px-4 font-bold">REF. PRICE</th>
                <th className="py-3.5 px-4 font-bold">SIMILARITY</th>
                <th className="py-3.5 px-4 text-right font-bold sr-only">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {comparables.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition"
                >
                  <td className="py-3.5 px-4 font-bold text-blue-600">
                    <span className="cursor-pointer hover:underline">
                      {item.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800">{item.color}</td>
                  <td className="py-3.5 px-4 text-slate-800">{item.clarity}</td>
                  <td className="py-3.5 px-4 text-slate-800">{item.cut}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.carat}</td>
                  <td className="py-3.5 px-4">
                    {item.treatment === "Unheated" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
                        Unheated
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
                        Heated
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.refPrice}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    {item.similarity}%
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecord(item);
                        if (onSelectCompare) onSelectCompare(item);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      View · Compare
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footnote */}
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Reference prices are observed B2B records — not offers. Unheated REF-1207 is shown for context and excluded from the heated-stone median.
      </p>

      {/* Selected Item Quick View Modal / Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {selectedRecord.id} Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Color & Saturation</span>
                <p className="font-bold text-slate-900">{selectedRecord.color}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Clarity Grade</span>
                <p className="font-bold text-slate-900">{selectedRecord.clarity}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Cut Quality</span>
                <p className="font-bold text-slate-900">{selectedRecord.cut}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Carat Weight</span>
                <p className="font-bold text-slate-900">{selectedRecord.carat} ct</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Treatment</span>
                <p className="font-bold text-slate-900">{selectedRecord.treatment}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Observed B2B Price</span>
                <p className="font-bold text-slate-900">{selectedRecord.refPrice}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {onOpenSideBySide && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecord(null);
                    onOpenSideBySide();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
                >
                  Side-by-Side Compare
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
