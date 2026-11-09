"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EvaluationComparison, {
  EvaluationOption,
} from "@/components/gemstone/EvaluationComparison";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFirstId = searchParams.get("first") || "";

  const [evaluationOptions, setEvaluationOptions] = useState<EvaluationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/evaluations");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped: EvaluationOption[] = data.map((item) => {
              const gem = item.gemstoneId;
              const r = item.result;
              const p = item.priceSuggestion;

              const overall = r?.overall4C?.score ?? 82;
              const colorSc = r?.color?.score ?? 86;
              const claritySc = r?.clarity?.score ?? 79;
              const cutSc = r?.cut?.score ?? 81;
              const caratSc = r?.carat?.score ?? 80;

              const priceText = p?.suggestedPrice
                ? `LKR ${(p.suggestedPrice / 1000).toFixed(0)}K`
                : "LKR 1.42M";
              const rangeText = p?.minimumPrice && p?.maximumPrice
                ? `LKR ${(p.minimumPrice / 1000).toFixed(0)}K – ${(p.maximumPrice / 1000).toFixed(0)}K`
                : "LKR 1.42M – 1.68M";

              return {
                _id: item._id,
                variety: gem?.variety || "Ceylon Blue Sapphire",
                caratWeight: String(gem?.caratWeight || "2.45"),
                overallScore: overall > 10 ? Number((overall / 10).toFixed(1)) : overall,
                colorScore: colorSc > 10 ? Number((colorSc / 10).toFixed(1)) : colorSc,
                clarityScore: claritySc > 10 ? Number((claritySc / 10).toFixed(1)) : claritySc,
                cutScore: cutSc > 10 ? Number((cutSc / 10).toFixed(1)) : cutSc,
                caratScore: caratSc > 10 ? Number((caratSc / 10).toFixed(1)) : caratSc,
                treatmentStatus: gem?.treatment?.status || "Heated (H)",
                originValue: gem?.origin?.value || "Sri Lanka (Ceylon)",
                suggestedPriceText: priceText,
                priceRangeText: rangeText,
                measurementReliability: gem?.informationReliability?.measurements || "Measured",
                treatmentReliability: gem?.informationReliability?.treatment || "Laboratory Verified",
                originReliability: gem?.informationReliability?.origin || "Seller Provided",
                createdAt: item.createdAt || new Date().toISOString(),
              };
            });

            setEvaluationOptions(mapped);
          }
        } else {
          setError("Failed to load saved evaluations for comparison.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error connecting to server.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/dashboard" className="hover:text-slate-800 transition">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-blue-600">Compare</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Compare Gemstones Side-by-Side
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select any two saved evaluations to analyze 4C grade differences, price brackets, and reliability factors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/history"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              📜 View All History
            </Link>
            <Link
              href="/evaluate/gemstone"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
            >
              + New Evaluation
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-semibold text-slate-600">Loading gemstone comparison...</p>
          </div>
        ) : (
          <EvaluationComparison evaluations={evaluationOptions} />
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
