"use client";

import { useState } from "react";
import EvaluationComparison from "./EvaluationComparison";

export type EvaluationHistoryItem = {
  _id: string;
  gemstoneId:
    | string
    | {
        _id: string;
        variety: string;
        caratWeight: number;
        treatment?: { status?: string };
        origin?: { value?: string; reliability?: string };
        informationReliability?: {
          measurements?: string;
          treatment?: string;
          origin?: string;
        };
      };
  ruleVersion: string;
  status: string;

  result: {
    overall4C?: {
      score: number | null;
    };
    color?: {
      score: number | null;
    };
    clarity?: {
      score: number | null;
    };
    cut?: {
      score: number | null;
    };
    carat?: {
      score: number | null;
    };
    treatment?: {
      status?: string;
      rawStatus?: string;
    };
    origin?: {
      value?: string;
      reliability?: string;
    };
    informationReliability?: {
      measurements?: string;
      treatment?: string;
      origin?: string;
    };
  };

  priceSuggestion: {
    status: string;
    currency: string | null;
    suggestedPrice: number | null;
    minimumPrice?: number | null;
    maximumPrice?: number | null;
    priceRange?: {
      minimum: number | null;
      maximum: number | null;
    };
  } | null;

  createdAt: string;
};

type EvaluationHistoryProps = {
  evaluations: EvaluationHistoryItem[];
};

export default function EvaluationHistory({
  evaluations,
}: EvaluationHistoryProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownloadPdf(
    evaluationId: string,
    variety: string
  ) {
    try {
      setDownloadingId(evaluationId);
      setDownloadError("");

      const response = await fetch(
        `/api/evaluations/${evaluationId}/report`
      );

      if (!response.ok) {
        throw new Error(
          "The PDF report could not be downloaded."
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        `open4cs-${createFileName(variety)}-evaluation.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF report:", error);

      setDownloadError(
        "We couldn't download this report. Please try again."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Your Previous Evaluations
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Review gemstones you evaluated previously and compare your past
            results.
          </p>
        </div>

        {downloadError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm leading-6 text-red-700">
              {downloadError}
            </p>
          </div>
        )}

        {evaluations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center">
            <div className="text-3xl">
              💎
            </div>

            <h3 className="mt-3 font-bold">
              No previous evaluations yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              After you evaluate a gemstone, your saved evaluation will appear
              here for future reference.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => {
              const variety =
                typeof evaluation.gemstoneId === "object"
                  ? evaluation.gemstoneId.variety
                  : "Gemstone";
              const caratWeight =
                typeof evaluation.gemstoneId === "object"
                  ? `${evaluation.gemstoneId.caratWeight} ct`
                  : null;
              const formattedDate = new Date(evaluation.createdAt).toLocaleDateString(
                undefined,
                { year: "numeric", month: "short", day: "numeric" }
              );

              const overallScore = evaluation.result.overall4C?.score;
              const price = evaluation.priceSuggestion?.suggestedPrice;
              const currency = evaluation.priceSuggestion?.currency ?? "USD";

              return (
                <div
                  key={evaluation._id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--primary)]">
                        Gemstone Evaluation
                      </p>

                      <h3 className="mt-1 text-xl font-bold">
                        {variety} {caratWeight && `• ${caratWeight}`}
                      </h3>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {formattedDate}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--primary-soft)] px-4 py-3 text-center min-w-32">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Overall 4C Score
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[var(--primary-dark)]">
                        {overallScore !== null && overallScore !== undefined
                          ? Math.round(overallScore)
                          : "N/A"}{" "}
                        / 100
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
                      <p className="text-xs text-[var(--muted)]">Color</p>
                      <p className="mt-1 font-bold">
                        {evaluation.result.color?.score ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
                      <p className="text-xs text-[var(--muted)]">Clarity</p>
                      <p className="mt-1 font-bold">
                        {evaluation.result.clarity?.score ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
                      <p className="text-xs text-[var(--muted)]">Cut</p>
                      <p className="mt-1 font-bold">
                        {evaluation.result.cut?.score ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
                      <p className="text-xs text-[var(--muted)]">Carat</p>
                      <p className="mt-1 font-bold">
                        {evaluation.result.carat?.score ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs leading-5 text-[var(--muted)] max-w-md">
                        Download a report containing this saved evaluation&apos;s
                        observations, scores, price suggestion, recommendations, and
                        educational disclaimer.
                      </p>

                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(evaluation._id, variety)}
                        disabled={downloadingId === evaluation._id}
                        className="inline-flex items-center justify-center rounded-xl border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 shrink-0"
                      >
                        {downloadingId === evaluation._id
                          ? "Preparing PDF..."
                          : "Download PDF"}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)] pt-1 border-t border-dashed border-[var(--border)]">
                      <span>
                        Suggested Price:{" "}
                        <strong className="text-[var(--foreground)]">
                          {price !== null && price !== undefined
                            ? `${currency} ${price.toFixed(2)}`
                            : "Unavailable"}
                        </strong>
                      </span>

                      <span>Rule Version: {evaluation.ruleVersion}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <EvaluationComparison
        evaluations={evaluations.map((evaluation) => {
          const variety =
            typeof evaluation.gemstoneId === "object"
              ? evaluation.gemstoneId.variety
              : "Gemstone";

          const caratWeight =
            typeof evaluation.gemstoneId === "object" &&
            evaluation.gemstoneId.caratWeight
              ? `${evaluation.gemstoneId.caratWeight} ct`
              : "Not available";

          const treatmentStatus =
            evaluation.result.treatment?.status ||
            evaluation.result.treatment?.rawStatus ||
            (typeof evaluation.gemstoneId === "object"
              ? evaluation.gemstoneId.treatment?.status
              : null) ||
            "Unknown";

          const originValue =
            evaluation.result.origin?.value ||
            (typeof evaluation.gemstoneId === "object"
              ? evaluation.gemstoneId.origin?.value
              : null) ||
            "Unknown";

          const price = evaluation.priceSuggestion?.suggestedPrice;
          const minPrice =
            evaluation.priceSuggestion?.priceRange?.minimum ??
            evaluation.priceSuggestion?.minimumPrice;
          const maxPrice =
            evaluation.priceSuggestion?.priceRange?.maximum ??
            evaluation.priceSuggestion?.maximumPrice;
          const currency = evaluation.priceSuggestion?.currency ?? "USD";

          const suggestedPriceText =
            price !== null && price !== undefined && price > 0
              ? `${currency} ${price.toFixed(2)}`
              : "Not available";

          const priceRangeText =
            minPrice !== null &&
            minPrice !== undefined &&
            minPrice > 0 &&
            maxPrice !== null &&
            maxPrice !== undefined &&
            maxPrice > 0
              ? `${currency} ${minPrice.toFixed(2)} – ${currency} ${maxPrice.toFixed(
                  2
                )}`
              : "Not available";

          const measurementReliability =
            evaluation.result.informationReliability?.measurements ||
            (typeof evaluation.gemstoneId === "object"
              ? evaluation.gemstoneId.informationReliability?.measurements
              : null) ||
            "Unverified";

          const treatmentReliability =
            evaluation.result.informationReliability?.treatment ||
            (typeof evaluation.gemstoneId === "object"
              ? evaluation.gemstoneId.informationReliability?.treatment
              : null) ||
            "Unverified";

          const originReliability =
            evaluation.result.informationReliability?.origin ||
            (typeof evaluation.gemstoneId === "object"
              ? evaluation.gemstoneId.informationReliability?.origin
              : null) ||
            "Unverified";

          return {
            _id: evaluation._id,
            variety,
            caratWeight,
            overallScore: evaluation.result.overall4C?.score ?? 0,
            colorScore: evaluation.result.color?.score ?? 0,
            clarityScore: evaluation.result.clarity?.score ?? 0,
            cutScore: evaluation.result.cut?.score ?? 0,
            caratScore: evaluation.result.carat?.score ?? 0,
            treatmentStatus,
            originValue,
            suggestedPriceText,
            priceRangeText,
            measurementReliability,
            treatmentReliability,
            originReliability,
            createdAt: evaluation.createdAt,
          };
        })}
      />
    </div>
  );
}

function createFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
