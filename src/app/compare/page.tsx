"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PortalSidebar from "@/components/layout/PortalSidebar";
import ComparableGemstonesView from "@/components/gemstone/ComparableGemstonesView";
import EvaluationComparison, {
  EvaluationOption,
} from "@/components/gemstone/EvaluationComparison";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "sidebyside" ? "sidebyside" : "comparable";

  const [viewMode, setViewMode] = useState<"comparable" | "sidebyside">(initialMode);
  const [evaluationOptions, setEvaluationOptions] = useState<EvaluationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          // If not logged in, we still allow viewing comparable gemstones in demo mode
          // or redirect if desired
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
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Left Portal Sidebar matching Figma */}
      <PortalSidebar activeItem="compare" />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        {/* Toggle between Comparable Gemstones and Side-by-Side Comparison */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("comparable")}
              className={`pb-2.5 transition relative ${
                viewMode === "comparable"
                  ? "text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Comparable Gemstones
            </button>
            <button
              type="button"
              onClick={() => setViewMode("sidebyside")}
              className={`pb-2.5 transition relative ${
                viewMode === "sidebyside"
                  ? "text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Side-by-Side Comparison
            </button>
          </div>

          <Link
            href="/evaluate/gemstone"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            + New Evaluation
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        {viewMode === "comparable" ? (
          <ComparableGemstonesView
            stoneId="CEY-2026-0847"
            variety="Ceylon Blue Sapphire"
            caratWeight="2.45"
            color="Vivid Blue"
            clarity="Eye-clean"
            cut="Well cut"
            treatment="Heated"
            toleranceRecordsCount={7}
            snapshotDate="24 Sep 2026"
            onOpenSideBySide={() => setViewMode("sidebyside")}
          />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-semibold text-slate-600">Loading gemstone comparison...</p>
          </div>
        ) : (
          <EvaluationComparison evaluations={evaluationOptions} />
        )}
      </main>
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
