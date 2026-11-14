"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/layout/PortalSidebar";
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
    status?: string | null;
    available?: boolean | null;
    currency?: string | null;
    suggestedPrice?: number | null;
    minimumPrice?: number | null;
    maximumPrice?: number | null;
    min?: number | null;
    max?: number | null;
    formattedPriceRange?: string | null;
  };
  referenceDataSufficiency?: {
    status?: string;
    availableReferences?: number;
    requiredReferences?: number;
  };
  bestReferenceMatch?: Record<string, unknown> | null;
  assessmentSnapshot?: Record<string, unknown>;
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
      // If demo or CEY-2026-0847 requested, load the reference record directly
      if (id === "CEY-2026-0847" || id === "demo" || id === "breakdown" || id === "reliability" || id === "similarity" || id === "pricing" || id === "b2b-price" || id === "market-price" || id === "price" || id === "recommendations" || id === "advice" || id === "statement") {
        setEvaluation({
          _id: "CEY-2026-0847",
          ruleVersion: "v4.2",
          createdAt: "2026-09-24T10:00:00.000Z",
          gemstoneId: {
            variety: "Ceylon Blue Sapphire",
            caratWeight: 2.45,
            color: { hue: "Blue", tone: "Medium Dark", saturation: "Vivid" },
            clarity: { nakedEye: "Eye-clean" },
          },
          result: {
            overall4C: { score: 82 },
            color: { score: 86 },
            clarity: { score: 79 },
            cut: { score: 81 },
            carat: { score: 2.45 },
          },
          priceSuggestion: {
            currency: "USD",
            suggestedPrice: 1550000,
            minimumPrice: 1420000,
            maximumPrice: 1680000,
            formattedPriceRange: "$1.42M – $1.68M",
          },
        });
        setLoading(false);
        return;
      }

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
  const snap = (evaluation.assessmentSnapshot as Record<string, unknown> | null) || null;
  const cutSnap = (snap?.cut as Record<string, unknown> | null) || null;
  const colorSnap = (snap?.color as Record<string, unknown> | null) || null;
  const claritySnap = (snap?.clarity as Record<string, unknown> | null) || null;

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
  const caratSc = res?.carat?.score ?? 85;
  const caratWeight = gem?.caratWeight ?? (typeof snap?.caratWeight === "number" ? snap.caratWeight : 2.45);

  const lengthVal = (gem as unknown as { cut?: { length?: number } })?.cut?.length ?? (typeof cutSnap?.length === "number" ? cutSnap.length : undefined);
  const widthVal = (gem as unknown as { cut?: { width?: number } })?.cut?.width ?? (typeof cutSnap?.width === "number" ? cutSnap.width : undefined);
  const depthVal = (gem as unknown as { cut?: { depth?: number } })?.cut?.depth ?? (typeof cutSnap?.depth === "number" ? cutSnap.depth : undefined);
  const symmetryVal = (gem as unknown as { cut?: { symmetry?: string } })?.cut?.symmetry ?? (typeof cutSnap?.symmetry === "string" ? cutSnap.symmetry : undefined);
  const polishVal = (gem as unknown as { cut?: { polish?: string } })?.cut?.polish ?? (typeof cutSnap?.polish === "string" ? cutSnap.polish : undefined);
  const windowingVal = (gem as unknown as { cut?: { windowing?: string } })?.cut?.windowing ?? (typeof cutSnap?.windowing === "string" ? cutSnap.windowing : undefined);
  const extinctionVal = (gem as unknown as { cut?: { extinction?: string } })?.cut?.extinction ?? (typeof cutSnap?.extinction === "string" ? cutSnap.extinction : undefined);
  const bulgingVal = (gem as unknown as { cut?: { bulging?: string } })?.cut?.bulging ?? (typeof cutSnap?.bulging === "string" ? cutSnap.bulging : undefined);

  const hueVal = gem?.color?.hue ?? (typeof colorSnap?.hue === "string" ? colorSnap.hue : undefined);
  const toneVal = gem?.color?.tone ?? (typeof colorSnap?.tone === "string" || typeof colorSnap?.tone === "number" ? String(colorSnap.tone) : undefined);
  const saturationVal = gem?.color?.saturation ?? (typeof colorSnap?.saturation === "string" ? colorSnap.saturation : undefined);
  const distributionVal = (gem as unknown as { color?: { distribution?: string } })?.color?.distribution ?? (typeof colorSnap?.distribution === "string" ? colorSnap.distribution : undefined);
  const zoningVal = (gem as unknown as { color?: { zoning?: string } })?.color?.zoning ?? (typeof colorSnap?.zoning === "string" ? colorSnap.zoning : undefined);

  const nakedEyeVal = gem?.clarity?.nakedEye ?? (typeof claritySnap?.nakedEye === "string" ? claritySnap.nakedEye : undefined);
  const loupe10xVal = (gem as unknown as { clarity?: { loupe10x?: string } })?.clarity?.loupe10x ?? (typeof claritySnap?.loupe10x === "string" ? claritySnap.loupe10x : undefined);
  const inclusionTypeVal = (gem as unknown as { clarity?: { inclusionType?: string } })?.clarity?.inclusionType ?? (typeof claritySnap?.inclusionType === "string" ? claritySnap.inclusionType : undefined);
  const severityVal = (gem as unknown as { clarity?: { severity?: string } })?.clarity?.severity ?? (typeof claritySnap?.severity === "string" ? claritySnap.severity : undefined);

  const treatmentStatusVal = (gem as unknown as { treatment?: { status?: string } })?.treatment?.status ?? (typeof (snap?.treatment as { status?: string })?.status === "string" ? (snap?.treatment as { status?: string }).status : undefined);
  const originVal = (gem as unknown as { origin?: { value?: string } })?.origin?.value ?? (typeof (snap?.origin as { value?: string })?.value === "string" ? (snap?.origin as { value?: string }).value : undefined);
  const originReliabilityVal = (gem as unknown as { origin?: { reliability?: string } })?.origin?.reliability ?? (typeof (snap?.origin as { reliability?: string })?.reliability === "string" ? (snap?.origin as { reliability?: string }).reliability : undefined);
  const simVal = (evaluation.bestReferenceMatch as { similarity?: number } | null)?.similarity
    ? Math.round(Number((evaluation.bestReferenceMatch as { similarity?: number }).similarity))
    : undefined;

  const minVal = pricing?.min ?? pricing?.minimumPrice ?? null;
  const maxVal = pricing?.max ?? pricing?.maximumPrice ?? null;

  const isPricingAvailable =
    (pricing?.status === "COMPLETED" || pricing?.available === true) &&
    typeof minVal === "number" &&
    typeof maxVal === "number";

  const minPriceFormatted = isPricingAvailable && minVal !== null
    ? minVal >= 1000000
      ? (minVal / 1000000).toFixed(2) + "M"
      : (minVal / 1000).toFixed(0) + "K"
    : "Unavailable";

  const maxPriceFormatted = isPricingAvailable && maxVal !== null
    ? maxVal >= 1000000
      ? (maxVal / 1000000).toFixed(2) + "M"
      : (maxVal / 1000).toFixed(0) + "K"
    : "Unavailable";

  const perCaratFormatted =
    isPricingAvailable && minVal !== null && maxVal !== null && caratWeight > 0
      ? `${Math.round(minVal / caratWeight / 1000)}K – ${Math.round(maxVal / caratWeight / 1000)}K`
      : "Unavailable";

  const availableRefCounts =
    evaluation.referenceDataSufficiency?.availableReferences ??
    (evaluation.bestReferenceMatch ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Left Portal Sidebar */}
      <PortalSidebar activeItem="my_evaluations" />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        <EvaluationCompleteDashboard
          stoneId={stoneCode}
          variety={gem?.variety || "Ceylon Blue Sapphire"}
          evaluationDate={evalDate}
          ruleVersion={evaluation.ruleVersion || "prototype-v1"}
          overallScore={overall > 10 ? Number((overall / 10).toFixed(1)) : overall}
          colorScore={colorSc > 10 ? Number((colorSc / 10).toFixed(1)) : colorSc}
          clarityScore={claritySc > 10 ? Number((claritySc / 10).toFixed(1)) : claritySc}
          cutScore={cutSc > 10 ? Number((cutSc / 10).toFixed(1)) : cutSc}
          caratScore={caratSc > 10 ? Number((caratSc / 10).toFixed(1)) : caratSc}
          caratAssessmentScore={Math.round(caratSc)}
          caratWeight={caratWeight}
          colorLabel={saturationVal ? `${saturationVal} ${hueVal || "Blue"}` : "Vivid Blue"}
          clarityLabel={nakedEyeVal || "Eye-clean"}
          cutLabel="Well Cut"
          caratLabel="Liquid band"
          priceRangeMin={minPriceFormatted}
          priceRangeMax={maxPriceFormatted}
          pricePerCarat={perCaratFormatted}
          priceStatus={pricing?.status || "UNAVAILABLE"}
          initialTab={
            id === "statement" || id === "report"
              ? "report"
              : id === "recommendations" || id === "advice"
              ? "overview"
              : id === "b2b-price" || id === "market-price" || id === "price" || id === "pricing" || id === "reliability" || id === "similarity"
              ? "market_evidence"
              : "overview"
          }
          comparablesCount={availableRefCounts}
          evaluationId={evaluation._id}
          length={lengthVal}
          width={widthVal}
          depth={depthVal}
          symmetry={symmetryVal}
          polish={polishVal}
          windowing={windowingVal}
          extinction={extinctionVal}
          bulging={bulgingVal}
          hue={hueVal}
          tone={toneVal}
          saturation={saturationVal}
          distribution={distributionVal}
          zoning={zoningVal}
          nakedEye={nakedEyeVal}
          loupe10x={loupe10xVal}
          inclusionType={inclusionTypeVal}
          severity={severityVal}
          treatmentStatus={treatmentStatusVal}
          originValue={originVal}
          originReliability={originReliabilityVal}
          colorSimilarity={simVal}
          onSave={() => undefined}
          onCompare={() => { router.push("/compare"); }}
          onDownloadPdf={() => window.open(`/api/evaluations/${id}/report`, "_blank")}
        />
      </main>
    </div>
  );
}
