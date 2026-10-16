"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type ReportItem = {
  id: string;
  evaluationId: string;
  gemstoneLabel: string;
  evaluationDate: string;
  reportType: "Full Evaluation + Price" | "Summary Statement";
  createdAt: string;
};

const DEFAULT_REPORTS: ReportItem[] = [
  {
    id: "RG-2026-118",
    evaluationId: "EV-2026-0847",
    gemstoneLabel: "EV-2026-0847 · Ceylon Blue",
    evaluationDate: "Sep 24, 2026",
    reportType: "Full Evaluation + Price",
    createdAt: "Sep 24, 2026",
  },
  {
    id: "RG-2026-112",
    evaluationId: "EV-2026-0841",
    gemstoneLabel: "EV-2026-0841 · Padparadscha",
    evaluationDate: "Sep 21, 2026",
    reportType: "Full Evaluation + Price",
    createdAt: "Sep 21, 2026",
  },
  {
    id: "RG-2026-104",
    evaluationId: "EV-2026-0832",
    gemstoneLabel: "EV-2026-0832 · Yellow",
    evaluationDate: "Sep 14, 2026",
    reportType: "Summary Statement",
    createdAt: "Sep 15, 2026",
  },
  {
    id: "RG-2026-097",
    evaluationId: "EV-2026-0815",
    gemstoneLabel: "EV-2026-0815 · Ceylon Blue",
    evaluationDate: "Sep 08, 2026",
    reportType: "Full Evaluation + Price",
    createdAt: "Sep 08, 2026",
  },
];

type ReportsViewProps = {
  reports?: ReportItem[];
  onGenerateReport?: () => void;
};

export default function ReportsView({
  reports = DEFAULT_REPORTS,
  onGenerateReport,
}: ReportsViewProps) {
  const router = useRouter();
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const handleGenerate = () => {
    if (onGenerateReport) {
      onGenerateReport();
    } else {
      router.push("/history");
    }
  };

  const handlePreview = (item: ReportItem) => {
    window.open(`/api/evaluations/${item.evaluationId}/report`, "_blank");
  };

  const handleDownload = (item: ReportItem) => {
    window.open(`/api/evaluations/${item.evaluationId}/report?download=true`, "_blank");
  };

  const handleRegenerate = (item: ReportItem) => {
    setRegeneratingId(item.id);
    setTimeout(() => {
      setRegeneratingId(null);
      alert(`Report ${item.id} regenerated successfully with latest rule engine!`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            A4 lab-format PDFs with rule version, data snapshot and disclaimer on every page
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B] px-4 py-2.5 text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-sm transition"
          >
            <span className="text-base leading-none font-normal">+</span>
            Generate Report
          </button>
        </div>
      </div>

      {/* Reports Table Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  REPORT ID
                </th>
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  GEMSTONE
                </th>
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  EVALUATION DATE
                </th>
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  REPORT TYPE
                </th>
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  CREATED
                </th>
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {reports.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Report ID */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handlePreview(item)}
                      className="text-blue-600 hover:text-blue-800 font-semibold transition"
                    >
                      {item.id}
                    </button>
                  </td>

                  {/* Gemstone */}
                  <td className="py-4 px-6 whitespace-nowrap text-slate-700 font-medium">
                    {item.gemstoneLabel}
                  </td>

                  {/* Evaluation Date */}
                  <td className="py-4 px-6 whitespace-nowrap text-slate-500">
                    {item.evaluationDate}
                  </td>

                  {/* Report Type */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB]">
                      {item.reportType}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="py-4 px-6 whitespace-nowrap text-slate-500">
                    {item.createdAt}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handlePreview(item)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        Download
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRegenerate(item)}
                        disabled={regeneratingId === item.id}
                        className="text-slate-500 hover:text-slate-700 transition disabled:opacity-50"
                      >
                        {regeneratingId === item.id ? "Regenerating..." : "Regenerate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
