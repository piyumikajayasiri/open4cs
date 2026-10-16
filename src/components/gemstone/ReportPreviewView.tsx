"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type ReportDetailData = {
  reportId: string;
  evaluationId: string;
  stoneId: string;
  variety: string;
  caratWeight: string;
  cutShape: string;
  treatment: string;
  origin: string;
  date: string;
  ruleVersion: string;
  colorScore: number;
  clarityScore: number;
  cutScore: number;
  overallScore: number;
  priceRange: string;
  pricePerCarat: string;
  referenceMedian: string;
  tolerance: string;
  status: string;
  totalPages: number;
  format: string;
};

const DEFAULT_REPORT_DATA: ReportDetailData = {
  reportId: "RG-2026-118",
  evaluationId: "EV-2026-0847",
  stoneId: "CEY-2026-0847",
  variety: "Ceylon Blue Sapphire",
  caratWeight: "2.45 ct",
  cutShape: "Oval",
  treatment: "Heated (lab-verified)",
  origin: "Sri Lanka (seller-provided origin)",
  date: "24 Sep 2026",
  ruleVersion: "v4.2",
  colorScore: 8.6,
  clarityScore: 7.9,
  cutScore: 8.1,
  overallScore: 8.2,
  priceRange: "LKR 1.42M – 1.68M",
  pricePerCarat: "LKR 580K – 686K per carat",
  referenceMedian: "LKR 612K/ct",
  tolerance: "±6%",
  status: "Ready to Export",
  totalPages: 4,
  format: "Standard A4 (PDF/A)",
};

type ReportPreviewViewProps = {
  report?: ReportDetailData;
  onDownloadPdf?: () => void;
  onRegenerate?: () => void;
  onShare?: () => void;
};

export default function ReportPreviewView({
  report = DEFAULT_REPORT_DATA,
  onDownloadPdf,
  onRegenerate,
  onShare,
}: ReportPreviewViewProps) {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDownload = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    } else {
      window.open(`/api/evaluations/${report.evaluationId}/report?download=true`, "_blank");
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert("Report link copied to clipboard!");
    }
  };

  const handleRegenerateAction = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      alert(`New snapshot generated for ${report.reportId} under Rule Engine v4.2.`);
    }, 1000);
  };

  const tocItems = [
    { title: "1. Gemstone Information", page: "p. 1–4" },
    { title: "2. 4C Evaluation (rules COL-03 · CLA-02 · CUT-02)", page: "p. 1–4" },
    { title: "3. Color Similarity — 91% vs Vivid Blue T6", page: "p. 1–4" },
    { title: "4. Information Reliability (Measured / Lab-verified / Seller-provided)", page: "p. 1–4" },
    { title: "5. Comparable Gemstones (5 heated records)", page: "p. 1–4" },
    { title: "6. Reference Data · 7. Historical Pricing (+8.4% / 12 mo)", page: "p. 1–4" },
    { title: "8. Price Adjustments · 9. Recommendations · 10. Trader Statement", page: "p. 1–4" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans">
      {/* Top Fixed Dark Header Bar */}
      <header className="bg-[#070D1E] text-white px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between">
        {/* Left: Back button & Report Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/reports"
            className="rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
          >
            <span>←</span> Back to Evaluations
          </Link>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">
                Open 4Cs Studio
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                Report {report.reportId} · {report.variety}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Lab Verified Badge & Action Buttons */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#064E3B] text-[#34D399] border border-emerald-800/60">
            Lab Verified
          </span>

          <button
            type="button"
            onClick={handleShare}
            className="rounded-lg border border-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-[#0284C7] hover:bg-[#0369A1] px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>
      </header>

      {/* Main Preview Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: A4 Document Sheet (8 cols) */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200/80 p-8 sm:p-12 space-y-6 flex flex-col justify-between min-h-[840px]">
            {/* Document Header */}
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0E172E] text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      Open 4Cs
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Gemstone Evaluation
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">
                    Report {report.reportId}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Evaluation {report.evaluationId}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {report.date} · Rule {report.ruleVersion}
                  </p>
                </div>
              </div>

              {/* Document Title & Subtitle */}
              <div className="text-center py-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Gemstone Evaluation and Price Suggestion Report
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 max-w-lg mx-auto">
                  {report.variety} · {report.caratWeight} {report.cutShape} · {report.treatment} · {report.origin}
                </p>
              </div>

              {/* 4 Mini 4C Score Cards */}
              <div className="grid grid-cols-4 gap-3 my-4">
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    COLOR
                  </span>
                  <span className="text-lg font-bold text-slate-900 block mt-0.5">
                    {report.colorScore.toFixed(1)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    CLARITY
                  </span>
                  <span className="text-lg font-bold text-slate-900 block mt-0.5">
                    {report.clarityScore.toFixed(1)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    CUT
                  </span>
                  <span className="text-lg font-bold text-slate-900 block mt-0.5">
                    {report.cutScore.toFixed(1)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    OVERALL
                  </span>
                  <span className="text-lg font-bold text-slate-900 block mt-0.5">
                    {report.overallScore.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Suggested B2B Market Price Range Box */}
              <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 sm:p-6 text-center my-6 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                  SUGGESTED B2B MARKET PRICE RANGE
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight my-1">
                  {report.priceRange}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {report.pricePerCarat} · Reference median {report.referenceMedian} · Tolerance {report.tolerance}
                </p>
              </div>

              {/* Table of Contents Sections */}
              <div className="space-y-2.5 pt-2">
                {tocItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                    <span className="font-medium">{item.title}</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-slate-300" />
                    <span className="text-slate-400 font-medium flex-shrink-0">{item.page}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Bottom Section: Disclaimer & Footer */}
            <div className="space-y-4 pt-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-[9px] text-slate-500 leading-relaxed">
                <strong className="font-semibold text-slate-700">Disclaimer:</strong> This system provides an estimated B2B price suggestion based on the information provided, predefined evaluation and pricing rules, comparable gemstone data, and available reference information. It is not a professional laboratory valuation, gemstone certification, authentication, legally binding valuation, or guaranteed selling price.
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                <span>
                  Rule engine {report.ruleVersion} · Snapshot {report.date}
                </span>
                <span>
                  Page 1 of {report.totalPages} · Open 4Cs · CAGS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Report Actions & Audit Specs (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Report Actions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage generation and export of this appraisal document.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>

              <button
                type="button"
                onClick={handleRegenerateAction}
                disabled={isRegenerating}
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {isRegenerating ? "Regenerating..." : "Regenerate Report"}
              </button>
            </div>

            {/* Audit & Snapshot Info Box */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 space-y-1">
              <h4 className="text-xs font-bold text-slate-900">
                Audit &amp; Snapshot Info
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Regenerating pins a new immutable snapshot — the original stays archived in audit history under {report.reportId}.
              </p>
            </div>

            {/* Spec Attributes List */}
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-emerald-600">{report.status}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Pages:</span>
                <span className="font-medium text-slate-900">{report.totalPages} pages</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-medium text-slate-900">{report.format}</span>
              </div>
            </div>
          </div>

          {/* View Revision History Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => alert("Displaying revision history for " + report.reportId)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              View Revision History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
