"use client";

import React, { useEffect, useState } from "react";
import PortalSidebar from "@/components/layout/PortalSidebar";
import MyEvaluationHistoryView, {
  EvaluationHistoryRecord,
} from "@/components/gemstone/MyEvaluationHistoryView";

type ApiEvaluationRecord = {
  _id: string;
  ruleVersion?: string;
  status?: string;
  createdAt?: string;
  gemstoneId?: {
    _id?: string;
    variety?: string;
    caratWeight?: number;
  };
  result?: {
    overall4C?: { score: number | null };
  };
  priceSuggestion?: {
    minimumPrice?: number | null;
    maximumPrice?: number | null;
  };
};

export default function HistoryPage() {
  const [records, setRecords] = useState<EvaluationHistoryRecord[] | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const evalRes = await fetch("/api/evaluations");
        if (evalRes.ok) {
          const evalData = await evalRes.json();
          if (Array.isArray(evalData) && evalData.length > 0) {
            const mapped: EvaluationHistoryRecord[] = evalData.map((e: ApiEvaluationRecord) => {
              const score = e.result?.overall4C?.score
                ? Number((e.result.overall4C.score > 10 ? e.result.overall4C.score / 10 : e.result.overall4C.score).toFixed(1))
                : null;

              const isDraft = e.status === "DRAFT" || !score;
              const scoreLabel = score ? `${score} Excellent` : "Draft";

              const minPrice = e.priceSuggestion?.minimumPrice
                ? (e.priceSuggestion.minimumPrice / 1000).toFixed(0) + "K"
                : null;
              const maxPrice = e.priceSuggestion?.maximumPrice
                ? (e.priceSuggestion.maximumPrice / 1000).toFixed(0) + "K"
                : null;

              const suggestedRange =
                minPrice && maxPrice ? `LKR ${minPrice} – ${maxPrice}` : "—";

              const date = e.createdAt
                ? new Date(e.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "Sep 24, 2026";

              const status =
                e.status === "ARCHIVED"
                  ? "Archived"
                  : isDraft
                  ? "Draft"
                  : "Complete";

              return {
                id: `EV-${e._id.slice(-8).toUpperCase()}`,
                variety: e.gemstoneId?.variety || "Ceylon Blue Sapphire",
                score,
                scoreLabel,
                isDraft,
                suggestedRange,
                date,
                status,
              };
            });
            setRecords(mapped);
            return;
          }
        }
      } catch {
        // use default fallback
      }
      setRecords(undefined as unknown as EvaluationHistoryRecord[]); // Will use defaults in component
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Left Portal Sidebar */}
      <PortalSidebar activeItem="history" />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        <MyEvaluationHistoryView
          records={records && records.length > 0 ? records : undefined}
          totalCount={records && records.length > 0 ? records.length : 48}
        />
      </main>
    </div>
  );
}
