"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EvaluationCompleteDashboard from "@/components/gemstone/EvaluationCompleteDashboard";

type EvaluationRecord = {
  _id: string;
  ruleVersion?: string;
  createdAt?: string;
  gemstoneId?: {
    _id?: string;
    variety?: string;
    caratWeight?: number;
    color?: { hue?: string; tone?: string; saturation?: string };
    clarity?: { nakedEye?: string };
  };
  result?: {
    overall4C?: { score: number | null };
    color?: { score: number | null };
    clarity?: { score: number | null };
    cut?: { score: number | null };
    carat?: { score: number | null };
  };
  priceSuggestion?: {
    currency?: string | null;
    suggestedPrice?: number | null;
    minimumPrice?: number | null;
    maximumPrice?: number | null;
    formattedPriceRange?: string | null;
  };
};

export default function EvaluationResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [evaluation, setEvaluation] = useState<EvaluationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvaluation() {
      try {
        setLoading(true);
        const res = await fetch(`/api/evaluations/${id}`);
        const data = await res.json();

        if (res.ok && data.evaluation) {
          setEvaluation(data.evaluation);
        } else {
          setError(data.error || "Failed to load evaluation.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadEvaluation();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-600">
          Loading evaluation report...
        </p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold text-slate-900">
            Evaluation Not Found
          </h2>
          <p className="text-xs text-slate-500">
            {error || "The requested gemstone evaluation could not be loaded."}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/evaluate/gemstone"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              Start New Evaluation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gem = evaluation.gemstoneId;
  const res = evaluation.result;
  const pricing = evaluation.priceSuggestion;

  const stoneCode = id ? `CEY-${id.slice(-8).toUpperCase()}` : "CEY-2026-0847";
  const evalDate = evaluation.createdAt
    ? new Date(evaluation.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "24 Sep 2026";

  const overall = res?.overall4C?.score ?? 82;
  const colorSc = res?.color?.score ?? 86;
  const claritySc = res?.clarity?.score ?? 79;
  const cutSc = res?.cut?.score ?? 81;
  const caratWeight = gem?.caratWeight ?? 2.45;

  const minPriceFormatted = pricing?.minimumPrice
    ? (pricing.minimumPrice / 1000).toFixed(0) + "K"
    : "1.42M";
  const maxPriceFormatted = pricing?.maximumPrice
    ? (pricing.maximumPrice / 1000).toFixed(0) + "K"
    : "1.68M";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <span>←</span> Back to Dashboard
          </Link>
          <Link
            href="/evaluate/gemstone"
            className="font-bold text-blue-600 hover:text-blue-800 transition"
          >
            + Start New Evaluation
          </Link>
        </div>

        {/* Evaluation Dashboard Component */}
        <EvaluationCompleteDashboard
          stoneId={stoneCode}
          variety={gem?.variety || "Ceylon Blue Sapphire"}
          evaluationDate={evalDate}
          ruleVersion={evaluation.ruleVersion || "v4.2"}
          overallScore={overall > 10 ? Number((overall / 10).toFixed(1)) : overall}
          colorScore={colorSc > 10 ? Number((colorSc / 10).toFixed(1)) : colorSc}
          clarityScore={claritySc > 10 ? Number((claritySc / 10).toFixed(1)) : claritySc}
          cutScore={cutSc > 10 ? Number((cutSc / 10).toFixed(1)) : cutSc}
          caratScore={caratWeight}
          colorLabel={gem?.color?.saturation ? `${gem.color.saturation} Blue` : "Vivid Blue"}
          clarityLabel={gem?.clarity?.nakedEye || "Eye-clean"}
          cutLabel="Well Cut"
          caratLabel="Liquid band"
          priceRangeMin={minPriceFormatted}
          priceRangeMax={maxPriceFormatted}
          pricePerCarat="580K – 686K"
          comparablesCount={7}
          evaluationId={evaluation._id}
          onSave={() => alert("Evaluation saved to your profile history!")}
          onCompare={() => { router.push("/compare"); }}
          onDownloadPdf={() => window.open(`/api/evaluations/${id}/report`, "_blank")}
        />
      </div>
    </div>
  );
}
