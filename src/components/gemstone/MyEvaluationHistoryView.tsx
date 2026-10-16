"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type EvaluationHistoryRecord = {
  id: string;
  variety: string;
  score: number | null;
  scoreLabel: string;
  isDraft?: boolean;
  suggestedRange: string;
  date: string;
  status: "Complete" | "Draft" | "Archived";
};

const DEFAULT_HISTORY_RECORDS: EvaluationHistoryRecord[] = [
  {
    id: "EV-2026-0847",
    variety: "Ceylon Blue Sapphire",
    score: 8.2,
    scoreLabel: "8.2 Excellent",
    suggestedRange: "LKR 1.42M – 1.68M",
    date: "Sep 24, 2026",
    status: "Complete",
  },
  {
    id: "EV-2026-0841",
    variety: "Padparadscha",
    score: 7.8,
    scoreLabel: "7.8 Very Good",
    suggestedRange: "LKR 2.05M – 2.40M",
    date: "Sep 21, 2026",
    status: "Complete",
  },
  {
    id: "EV-2026-0839",
    variety: "Pink Sapphire",
    score: null,
    scoreLabel: "Draft",
    isDraft: true,
    suggestedRange: "—",
    date: "Sep 19, 2026",
    status: "Draft",
  },
  {
    id: "EV-2026-0832",
    variety: "Yellow Sapphire",
    score: 7.1,
    scoreLabel: "7.1 Good",
    suggestedRange: "LKR 310K – 385K",
    date: "Sep 14, 2026",
    status: "Complete",
  },
  {
    id: "EV-2026-0815",
    variety: "Ceylon Blue Sapphire",
    score: 6.8,
    scoreLabel: "6.8 Good",
    suggestedRange: "LKR 890K – 1.02M",
    date: "Sep 08, 2026",
    status: "Complete",
  },
  {
    id: "EV-2026-0798",
    variety: "White Sapphire",
    score: 7.4,
    scoreLabel: "7.4 Very Good",
    suggestedRange: "LKR 220K – 288K",
    date: "Aug 29, 2026",
    status: "Archived",
  },
];

type MyEvaluationHistoryViewProps = {
  records?: EvaluationHistoryRecord[];
  totalCount?: number;
};

export default function MyEvaluationHistoryView({
  records = DEFAULT_HISTORY_RECORDS,
  totalCount = 48,
}: MyEvaluationHistoryViewProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTimeframe, setSelectedTimeframe] = useState("90_days");

  const varieties = useMemo(() => {
    const set = new Set(records.map((r) => r.variety));
    return Array.from(set);
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.suggestedRange.toLowerCase().includes(searchTerm.toLowerCase());

      // Variety filter
      const matchesVariety =
        selectedVariety === "All" || rec.variety === selectedVariety;

      // Status filter
      const matchesStatus =
        selectedStatus === "All" || rec.status === selectedStatus;

      return matchesSearch && matchesVariety && matchesStatus;
    });
  }, [records, searchTerm, selectedVariety, selectedStatus]);

  const handleDownloadPdf = (id: string) => {
    window.open(`/api/evaluations/${id}/report`, "_blank");
  };

  const handleCompare = (id: string) => {
    router.push(`/compare?id=${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Evaluation History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {totalCount} evaluations · filter by variety, status or date
          </p>
        </div>

        <div>
          <Link
            href="/evaluate/gemstone"
            className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B] px-4 py-2.5 text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-sm transition"
          >
            <span className="text-base leading-none font-normal">+</span>
            New Evaluation
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input (5 cols on lg) */}
        <div className="lg:col-span-5 relative">
          <input
            type="text"
            placeholder="Search by ID, variety, report..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
          />
        </div>

        {/* Variety Dropdown (2-3 cols on lg) */}
        <div className="lg:col-span-2">
          <select
            value={selectedVariety}
            onChange={(e) => setSelectedVariety(e.target.value)}
            aria-label="Filter by Variety"
            className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs cursor-pointer"
          >
            <option value="All">All Varieties</option>
            {varieties.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown (2-3 cols on lg) */}
        <div className="lg:col-span-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by Status"
            className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Complete">Complete</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Timeframe Dropdown (3 cols on lg) */}
        <div className="lg:col-span-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            aria-label="Filter by Timeframe"
            className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs cursor-pointer"
          >
            <option value="90_days">Last 90 days</option>
            <option value="30_days">Last 30 days</option>
            <option value="6_months">Last 6 months</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Evaluations Table Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="py-3.5 px-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  EVALUATION ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  VARIETY
                </th>
                <th className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  OVERALL
                </th>
                <th className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  SUGGESTED RANGE
                </th>
                <th className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  DATE
                </th>
                <th className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  STATUS
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No evaluations match your current filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Evaluation ID Link */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <Link
                        href={`/evaluations/${item.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition"
                      >
                        {item.id}
                      </Link>
                    </td>

                    {/* Variety */}
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-800">
                      {item.variety}
                    </td>

                    {/* Overall Score Pill */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.isDraft ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                          Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F7F5] text-[#0D9488]">
                          {item.scoreLabel}
                        </span>
                      )}
                    </td>

                    {/* Suggested Range */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {item.suggestedRange}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-400">
                      {item.date}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.status === "Complete" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                          Complete
                        </span>
                      ) : item.status === "Draft" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309]">
                          Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          Archived
                        </span>
                      )}
                    </td>

                    {/* Action Icons */}
                    <td className="py-4 px-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        {/* View Eye */}
                        <Link
                          href={`/evaluations/${item.id}`}
                          title="View Evaluation"
                          className="p-1.5 hover:text-blue-600 transition rounded-lg hover:bg-slate-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>

                        {/* Compare */}
                        <button
                          type="button"
                          onClick={() => handleCompare(item.id)}
                          title="Compare Gemstone"
                          className="p-1.5 hover:text-slate-800 transition rounded-lg hover:bg-slate-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>

                        {/* Download PDF */}
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(item.id)}
                          title="Download PDF"
                          className="p-1.5 hover:text-slate-800 transition rounded-lg hover:bg-slate-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
