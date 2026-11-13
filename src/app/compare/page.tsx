"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PortalSidebar from "@/components/layout/PortalSidebar";
import GemstoneCompareMatrixView, { GemstoneCompareItem } from "@/components/gemstone/GemstoneCompareMatrixView";
import { Loader2 } from "lucide-react";

interface EvaluationApiItem {
  _id: string;
  createdAt: string;
  gemstoneId?: {
    _id?: string;
    variety?: string;
    caratWeight?: number;
    color?: { hue?: string };
    clarity?: { nakedEye?: string };
    cut?: { symmetry?: string };
    treatment?: { status?: string };
    origin?: { value?: string; reliability?: string };
    informationReliability?: { origin?: string };
  };
  result?: {
    overall4C?: { score?: number; grade?: string };
    color?: { score?: number };
    clarity?: { score?: number };
    cut?: { score?: number };
    carat?: { score?: number };
  };
  bestReferenceMatch?: {
    similarity?: number;
  };
  priceSuggestion?: {
    status?: string;
    currency?: string;
    min?: number;
    max?: number;
  };
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stones, setStones] = useState<GemstoneCompareItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserEvaluations() {
      try {
        const res = await fetch("/api/evaluations");
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw)) {
            const mapped: GemstoneCompareItem[] = raw.map((item: EvaluationApiItem) => {
              const gem = item.gemstoneId || {};
              const resObj = item.result || {};
              const price = item.priceSuggestion || {};

              const colorScore = resObj.color?.score ? (resObj.color.score / 10).toFixed(1) : "—";
              const clarityScore = resObj.clarity?.score ? (resObj.clarity.score / 10).toFixed(1) : "—";
              const cutScore = resObj.cut?.score ? (resObj.cut.score / 10).toFixed(1) : "—";
              const overallScore = resObj.overall4C?.score ? (resObj.overall4C.score / 10).toFixed(1) : "—";

              let rangeText = "Unavailable (No Real Market Evidence)";
              if (price.status === "COMPLETED" && price.min && price.max) {
                rangeText = `${price.currency || "LKR"} ${Math.round(price.min).toLocaleString()} – ${Math.round(price.max).toLocaleString()}`;
              }

              return {
                id: item._id,
                variety: gem.variety || "Natural Sapphire",
                carat: `${gem.caratWeight || "—"} ct`,
                origin: `${gem.origin?.value || "Unknown"} (${gem.origin?.reliability || "unverified"})`,
                color: `${colorScore} ${gem.color?.hue || ""}`,
                colorSimilarity: item.bestReferenceMatch?.similarity
                  ? `${Math.round(item.bestReferenceMatch.similarity)}%`
                  : "—",
                clarity: `${clarityScore} ${gem.clarity?.nakedEye || ""}`,
                cut: `${cutScore} ${gem.cut?.symmetry || ""}`,
                treatment: gem.treatment?.status || "Unknown",
                isTreatmentBold: gem.treatment?.status === "Untreated",
                overallEvaluation: `${overallScore} (${resObj.overall4C?.grade || "Provisional"})`,
                suggestedRange: rangeText,
                informationReliability: gem.informationReliability?.origin || "Provisional user-observed",
              };
            });
            setStones(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch evaluations for compare:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserEvaluations();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      <PortalSidebar activeItem="compare" />

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm">Loading your saved evaluations...</p>
          </div>
        ) : (
          <GemstoneCompareMatrixView
            stones={stones}
            onAddEvaluation={() => router.push("/evaluate/gemstone")}
          />
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
