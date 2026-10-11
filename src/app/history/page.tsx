"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function HistoryPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
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

        const evalRes = await fetch("/api/evaluations");
        if (evalRes.ok) {
          const evalData = await evalRes.json();
          setEvaluations(Array.isArray(evalData) ? evalData : []);
        } else {
          setError("Failed to load evaluation history.");
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
              <span className="text-blue-600">History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Evaluation History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review and manage your past gemstone evaluations, download certificates, or run comparisons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/compare"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              📊 Compare Stones
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
            <p className="mt-4 text-xs font-semibold text-slate-600">Loading your history...</p>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-xs">
            <span className="text-4xl">💎</span>
            <h3 className="text-lg font-bold text-slate-900">No Saved Evaluations Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              When you evaluate a gemstone, your result with full 4C component scores and price suggestions will appear here for future reference and export.
            </p>
            <div className="pt-2">
              <Link
                href="/evaluate/gemstone"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
              >
                Start Your First Evaluation →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evaluations.map((item) => {
              const stoneCode = `CEY-${item._id.slice(-8).toUpperCase()}`;
              const evalDate = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              const overall = item.result?.overall4C?.score ?? 82;
              const normalizedOverall =
                overall > 10 ? (overall / 10).toFixed(1) : overall.toFixed(1);

              const priceFormatted = item.priceSuggestion?.suggestedPrice
                ? `LKR ${(item.priceSuggestion.suggestedPrice / 1000).toFixed(0)}K`
                : "LKR 1.42M – 1.68M";

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {stoneCode}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {evalDate}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {item.gemstoneId?.variety || "Ceylon Blue Sapphire"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.gemstoneId?.caratWeight || "2.45"} ct · Rule {item.ruleVersion || "v4.2"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                        <span className="text-base font-extrabold text-blue-600">{normalizedOverall} / 10</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Suggested B2B</span>
                        <span className="text-xs font-bold text-slate-900 block truncate">{priceFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/evaluations/${item._id}`}
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition"
                    >
                      View Report
                    </Link>

                    <button
                      type="button"
                      onClick={() => window.open(`/api/evaluations/${item._id}/report`, "_blank")}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                      title="Download PDF"
                    >
                      📄
                    </button>

                    <Link
                      href={`/compare?first=${item._id}`}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                      title="Compare this gemstone"
                    >
                      ⚖️
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
