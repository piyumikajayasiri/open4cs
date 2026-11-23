"use client";

import React, { useState } from "react";
import ReportStudioHeader from "./ReportStudioHeader";
import ReportDocumentSheet from "./ReportDocumentSheet";
import ToastNotification, { ToastMessage, ToastType } from "../ui/ToastNotification";

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

export const DEFAULT_REPORT_DATA: ReportDetailData = {
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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
      addToast("Report link copied to clipboard!", "success");
    }
  };

  const handleRegenerateAction = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      if (onRegenerate) {
        onRegenerate();
      }
      addToast(`New snapshot generated for ${report.reportId} under Rule Engine v4.2.`, "info");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Top Header Bar Component */}
      <ReportStudioHeader
        reportId={report.reportId}
        variety={report.variety}
        backHref="/evaluations"
        backLabel="Back to Evaluations"
        isLabVerified={true}
        onShare={handleShare}
        onDownloadPdf={handleDownload}
      />

      {/* Main Preview Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Reusable A4 Document Sheet (8 cols) */}
        <div className="lg:col-span-8 flex justify-center">
          <ReportDocumentSheet report={report} />
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

          {/* View Revision History Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowRevisionModal(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              View Revision History
            </button>
          </div>
        </div>
      </div>

      {/* Revision History Modal Dialog */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Revision History
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Archived snapshots for {report.reportId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Current Snapshot (v4.2)</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{report.date} · Initial appraisal</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/60 flex items-center justify-between text-slate-600">
                <div>
                  <p className="font-medium text-slate-800">Draft Preview</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">20 Sep 2026 · Pre-lab verification</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Archived
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
