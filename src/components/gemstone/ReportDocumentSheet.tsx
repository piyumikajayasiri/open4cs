"use client";

import React from "react";
import { ReportDetailData } from "./ReportPreviewView";

type ReportDocumentSheetProps = {
  report: ReportDetailData;
};

export default function ReportDocumentSheet({ report }: ReportDocumentSheetProps) {
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
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200/80 p-8 sm:p-12 space-y-6 flex flex-col justify-between min-h-[840px]">
      {/* Document Header */}
      <div>
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0E172E] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
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
          <p className="text-xs text-slate-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
            {report.variety} · {report.caratWeight} {report.cutShape} · {report.treatment} · {report.origin}
          </p>
        </div>

        {/* 4 Mini 4C Score Cards */}
        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              COLOR
            </span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">
              {report.colorScore.toFixed(1)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              CLARITY
            </span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">
              {report.clarityScore.toFixed(1)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              CUT
            </span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">
              {report.cutScore.toFixed(1)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
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
  );
}
