"use client";

import React from "react";
import Link from "next/link";

type ReportStudioHeaderProps = {
  reportId: string;
  variety: string;
  backHref?: string;
  backLabel?: string;
  isLabVerified?: boolean;
  onShare?: () => void;
  onDownloadPdf?: () => void;
};

export default function ReportStudioHeader({
  reportId,
  variety,
  backHref = "/evaluations",
  backLabel = "Back to Evaluations",
  isLabVerified = true,
  onShare,
  onDownloadPdf,
}: ReportStudioHeaderProps) {
  return (
    <header className="bg-[#070D1E] text-white px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between">
      {/* Left Section: Back Navigation & Studio Identification */}
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{backLabel}</span>
        </Link>

        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">
              Open 4Cs Studio
            </p>
            <p className="text-[10px] text-slate-400 mt-1 leading-none">
              Report <span className="text-slate-300 font-semibold">{reportId}</span> · {variety}
            </p>
          </div>
        </div>
      </div>

      {/* Right Section: Verification Badge & Actions */}
      <div className="flex items-center gap-3">
        {isLabVerified && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#064E3B] text-[#34D399] border border-emerald-800/60">
            Lab Verified
          </span>
        )}

        <button
          type="button"
          onClick={onShare}
          className="rounded-lg border border-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>

        <button
          type="button"
          onClick={onDownloadPdf}
          className="rounded-lg bg-[#0284C7] hover:bg-[#0369A1] px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>
    </header>
  );
}
