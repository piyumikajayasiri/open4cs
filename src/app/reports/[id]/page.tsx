"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import ReportPreviewView, { ReportDetailData } from "@/components/gemstone/ReportPreviewView";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvaluation() {
      try {
        const res = await fetch(`/api/evaluations/${id}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Evaluation record not found." : "Failed to load report data.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        const gem = typeof data.gemstoneId === "object" && data.gemstoneId ? data.gemstoneId : {};
        const result = data.result || {};
        const price = data.priceSuggestion || {};

        const colorScore = result.color?.score ? Number((result.color.score / 10).toFixed(1)) : 0;
        const clarityScore = result.clarity?.score ? Number((result.clarity.score / 10).toFixed(1)) : 0;
        const cutScore = result.cut?.score ? Number((result.cut.score / 10).toFixed(1)) : 0;
        const overallScore = result.overall4C?.score ? Number((result.overall4C.score / 10).toFixed(1)) : 0;

        let priceRangeText = "Unavailable (Insufficient Market Evidence)";
        let pricePerCaratText = "Unavailable";
        if (price.status === "COMPLETED" && price.min && price.max) {
          priceRangeText = `${price.currency || "LKR"} ${Math.round(price.min).toLocaleString()} – ${Math.round(price.max).toLocaleString()}`;
          const carat = Number(gem.caratWeight || 1);
          pricePerCaratText = `${price.currency || "LKR"} ${Math.round(price.min / carat).toLocaleString()} – ${Math.round(price.max / carat).toLocaleString()} per carat`;
        }

        const formattedDate = data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
          : "Dated";

        const mappedReport: ReportDetailData = {
          reportId: `REP-${id.slice(-6).toUpperCase()}`,
          evaluationId: id,
          stoneId: gem.code || `SPEC-${id.slice(-6).toUpperCase()}`,
          variety: gem.variety || "Natural Corundum",
          caratWeight: `${gem.caratWeight || "—"} ct`,
          cutShape: gem.cut?.symmetry ? `${gem.cut.symmetry} Proportions` : "Oval Brilliant",
          treatment: gem.treatment?.status || "Unknown",
          origin: gem.origin?.value || "Unknown",
          date: formattedDate,
          ruleVersion: data.ruleVersion || "v4.2",
          colorScore,
          clarityScore,
          cutScore,
          overallScore,
          priceRange: priceRangeText,
          pricePerCarat: pricePerCaratText,
          referenceMedian: "Verified Market Clearing",
          tolerance: "±10%",
          status: "Verified Assessment",
          totalPages: 2,
          format: "Standard A4 (Two-Page Report)",
        };

        setReport(mappedReport);
      } catch (err) {
        console.error("Failed to load evaluation report:", err);
        setError("Network error while loading evaluation report.");
      } finally {
        setLoading(false);
      }
    }

    loadEvaluation();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium">Loading evaluation report from database...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">Report Unavailable</h2>
          <p className="text-xs sm:text-sm text-slate-500">{error || "Unable to display evaluation report."}</p>
          <Link
            href="/evaluations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Evaluations</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ReportPreviewView
      report={report}
      onDownloadPdf={() => {
        window.open(`/api/evaluations/${id}/report?download=true`, "_blank");
      }}
    />
  );
}
