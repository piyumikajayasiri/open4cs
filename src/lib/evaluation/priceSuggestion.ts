import type { ExchangeRateRecord } from "../currency/exchangeRate";
import type { ComparableAggregationResult, ContributingComparable } from "./comparablePrice";

export type PriceSuggestionResult = {
  status: "COMPLETED" | "UNAVAILABLE";
  reason: string;
  marketLevel?: string;

  currency: string | null;
  referencePrice: number | null;
  suggestedPrice: number | null;
  pricePerCarat: number | null;

  priceRange: {
    minimum: number | null;
    maximum: number | null;
  };

  priceLkr?: number | null;
  priceUsd?: number | null;
  pricePerCaratLkr?: number | null;
  pricePerCaratUsd?: number | null;

  priceRangeLkr?: {
    minimum: number | null;
    maximum: number | null;
  } | null;
  priceRangeUsd?: {
    minimum: number | null;
    maximum: number | null;
  } | null;

  priceRangePerCaratLkr?: {
    minimum: number | null;
    maximum: number | null;
  } | null;
  priceRangePerCaratUsd?: {
    minimum: number | null;
    maximum: number | null;
  } | null;

  rangePercentage?: number | null;
  dispersion?: number | null;

  evidenceBasis?: "Wholesale Completed Sales" | "Auction Results" | "Retail Asking Prices" | "Demonstration Data" | "None";
  marketContext?: string;
  comparablesUsedCount?: number;
  contributingComparables?: ContributingComparable[];

  retailIndicativeRangeLkr?: {
    minimum: number;
    maximum: number;
    benchmark: number;
  } | null;
  retailIndicativeRangeUsd?: {
    minimum: number;
    maximum: number;
    benchmark: number;
  } | null;

  adjustmentFactors: {
    treatment: number | null;
    origin: number | null;
  };

  relativeMultipliers?: {
    treatment: number | null;
    origin: number | null;
  };

  exchangeRate?: {
    rate: number;
    source: string;
    asOfDate: string;
    isAvailable: boolean;
  } | null;

  provisionalAssumptions?: string[];
};

export type CalculatePriceSuggestionOptions = {
  referenceCount?: number;
  relativeTreatmentMultiplier?: number;
  relativeOriginMultiplier?: number;
  exchangeRate?: ExchangeRateRecord | null;
  isRealMarketData?: boolean;
  dataClassification?: "Real" | "Demo";
  aggregationResult?: ComparableAggregationResult | null;
  evidenceBasis?: "Wholesale Completed Sales" | "Auction Results" | "Retail Asking Prices" | "Demonstration Data" | "None";
  marketContext?: string;
  candidateCaratWeight?: number;
  retailMarkupFactor?: number;
};

export function calculatePriceSuggestion(
  referencePrice: number | null,
  currency: string | null,
  treatmentFactor: number | null,
  originFactor: number | null,
  options?: CalculatePriceSuggestionOptions
): PriceSuggestionResult {
  const minReferences = 3;

  // Strict Real Market Data Guard: Demo data must never produce commercial prices
  if (
    options?.dataClassification === "Demo" ||
    options?.isRealMarketData === false
  ) {
    return {
      status: "UNAVAILABLE",
      reason:
        "Market price suggestion is unavailable: Open 4Cs data integrity rules strictly require verified real-market completed sales. Demonstration records and dealer estimates are excluded from commercial price suggestions.",
      currency,
      referencePrice,
      suggestedPrice: null,
      pricePerCarat: null,
      priceRange: { minimum: null, maximum: null },
      priceLkr: null,
      priceUsd: null,
      priceRangeLkr: null,
      priceRangeUsd: null,
      evidenceBasis: "Demonstration Data",
      marketContext: options?.marketContext || "Wholesale",
      comparablesUsedCount: options?.referenceCount || 0,
      contributingComparables: [],
      adjustmentFactors: {
        treatment: treatmentFactor,
        origin: originFactor,
      },
      exchangeRate: null,
    };
  }

  if (
    options?.referenceCount !== undefined &&
    options.referenceCount < minReferences
  ) {
    return {
      status: "UNAVAILABLE",
      reason: `Insufficient verified market data: At least ${minReferences} verified market references are required (found ${options.referenceCount}). Demo records are excluded from real commercial valuation.`,
      currency,
      referencePrice,
      suggestedPrice: null,
      pricePerCarat: null,
      priceRange: { minimum: null, maximum: null },
      priceLkr: null,
      priceUsd: null,
      priceRangeLkr: null,
      priceRangeUsd: null,
      evidenceBasis: "None",
      marketContext: options?.marketContext || "Wholesale",
      comparablesUsedCount: options?.referenceCount || 0,
      contributingComparables: [],
      adjustmentFactors: {
        treatment: treatmentFactor,
        origin: originFactor,
      },
      exchangeRate: null,
    };
  }

  if (
    referencePrice === null ||
    referencePrice <= 0 ||
    treatmentFactor === null ||
    originFactor === null
  ) {
    return {
      status: "UNAVAILABLE",
      reason:
        "Price suggestion is unavailable because required reference or adjustment data is missing.",
      currency,
      referencePrice,
      suggestedPrice: null,
      pricePerCarat: null,
      priceRange: { minimum: null, maximum: null },
      priceLkr: null,
      priceUsd: null,
      priceRangeLkr: null,
      priceRangeUsd: null,
      evidenceBasis: "None",
      adjustmentFactors: {
        treatment: treatmentFactor,
        origin: originFactor,
      },
      exchangeRate: null,
    };
  }

  const agg = options?.aggregationResult;
  const candidateCarat = options?.candidateCaratWeight || 1.0;

  // Total suggested price and per carat
  let suggestedPrice = referencePrice;
  let pricePerCarat = agg?.benchmarkPricePerCarat || Math.round(suggestedPrice / candidateCarat);
  let minimumPrice = agg?.priceRangeTotal.minimum || Math.round(suggestedPrice * 0.90);
  let maximumPrice = agg?.priceRangeTotal.maximum || Math.round(suggestedPrice * 1.10);
  let minPerCarat = agg?.priceRangePerCarat.minimum || Math.round(pricePerCarat * 0.90);
  let maxPerCarat = agg?.priceRangePerCarat.maximum || Math.round(pricePerCarat * 1.10);

  // If using legacy path without pre-adjusted agg, apply multipliers
  if (!agg) {
    const effectiveTreatmentMultiplier =
      options?.relativeTreatmentMultiplier ?? treatmentFactor;
    const effectiveOriginMultiplier =
      options?.relativeOriginMultiplier ?? originFactor;

    suggestedPrice = Math.round(
      referencePrice * effectiveTreatmentMultiplier * effectiveOriginMultiplier
    );
    pricePerCarat = Math.round(suggestedPrice / candidateCarat);
    minimumPrice = Math.round(suggestedPrice * 0.90);
    maximumPrice = Math.round(suggestedPrice * 1.10);
    minPerCarat = Math.round(pricePerCarat * 0.90);
    maxPerCarat = Math.round(pricePerCarat * 1.10);
  }

  // Currency Normalization
  const hasRate = Boolean(
    options?.exchangeRate &&
      options.exchangeRate.isAvailable &&
      typeof options.exchangeRate.rate === "number" &&
      options.exchangeRate.rate > 0
  );
  const fxRate = hasRate ? (options!.exchangeRate!.rate as number) : null;

  let priceLkr: number | null = null;
  let priceUsd: number | null = null;
  let pricePerCaratLkr: number | null = null;
  let pricePerCaratUsd: number | null = null;
  let priceRangeLkr: { minimum: number; maximum: number } | null = null;
  let priceRangeUsd: { minimum: number; maximum: number } | null = null;
  let priceRangePerCaratLkr: { minimum: number; maximum: number } | null = null;
  let priceRangePerCaratUsd: { minimum: number; maximum: number } | null = null;
  let exchangeRateInfo: PriceSuggestionResult["exchangeRate"] = null;

  const normCurrency = (currency || "LKR").toUpperCase().trim();

  if (normCurrency === "USD") {
    if (!fxRate) {
      return {
        status: "UNAVAILABLE",
        reason:
          "Market price suggestion is unavailable: Reference price is denominated in USD but no verified USD/LKR exchange rate is available for conversion to regional LKR.",
        currency,
        referencePrice,
        suggestedPrice: null,
        pricePerCarat: null,
        priceRange: { minimum: null, maximum: null },
        priceLkr: null,
        priceUsd: null,
        priceRangeLkr: null,
        priceRangeUsd: null,
        adjustmentFactors: { treatment: treatmentFactor, origin: originFactor },
        exchangeRate: null,
      };
    }

    priceUsd = Math.round(suggestedPrice);
    pricePerCaratUsd = Math.round(pricePerCarat);
    priceRangeUsd = { minimum: Math.round(minimumPrice), maximum: Math.round(maximumPrice) };
    priceRangePerCaratUsd = { minimum: minPerCarat, maximum: maxPerCarat };

    priceLkr = Math.round(suggestedPrice * fxRate);
    pricePerCaratLkr = Math.round(pricePerCarat * fxRate);
    priceRangeLkr = { minimum: Math.round(minimumPrice * fxRate), maximum: Math.round(maximumPrice * fxRate) };
    priceRangePerCaratLkr = { minimum: Math.round(minPerCarat * fxRate), maximum: Math.round(maxPerCarat * fxRate) };

    exchangeRateInfo = {
      rate: fxRate,
      source: options!.exchangeRate!.source,
      asOfDate: options!.exchangeRate!.asOfDate,
      isAvailable: true,
    };
  } else {
    priceLkr = Math.round(suggestedPrice);
    pricePerCaratLkr = Math.round(pricePerCarat);
    priceRangeLkr = { minimum: Math.round(minimumPrice), maximum: Math.round(maximumPrice) };
    priceRangePerCaratLkr = { minimum: minPerCarat, maximum: maxPerCarat };

    if (fxRate) {
      priceUsd = Math.round(priceLkr / fxRate);
      pricePerCaratUsd = Math.round(pricePerCaratLkr / fxRate);
      priceRangeUsd = { minimum: Math.round(minimumPrice / fxRate), maximum: Math.round(maximumPrice / fxRate) };
      priceRangePerCaratUsd = { minimum: Math.round(minPerCarat / fxRate), maximum: Math.round(maxPerCarat / fxRate) };

      exchangeRateInfo = {
        rate: fxRate,
        source: options!.exchangeRate!.source,
        asOfDate: options!.exchangeRate!.asOfDate,
        isAvailable: true,
      };
    }
  }

  // Indicative retail asking price range (Wholesale + typical 75% retail trade markup)
  const retailFactor = options?.retailMarkupFactor || 1.75;
  const retailIndicativeRangeLkr = priceLkr
    ? {
        benchmark: Math.round(priceLkr * retailFactor),
        minimum: Math.round(priceLkr * (retailFactor - 0.20)),
        maximum: Math.round(priceLkr * (retailFactor + 0.35)),
      }
    : null;

  const retailIndicativeRangeUsd = priceUsd
    ? {
        benchmark: Math.round(priceUsd * retailFactor),
        minimum: Math.round(priceUsd * (retailFactor - 0.20)),
        maximum: Math.round(priceUsd * (retailFactor + 0.35)),
      }
    : null;

  return {
    status: "COMPLETED",
    reason: `Price calculated using ${options?.referenceCount ?? 0} verified market comparables with individual per-comparable adjustments and dispersion-based uncertainty.`,
    marketLevel: options?.marketContext || "Wholesale B2B Clearing",
    currency: normCurrency,
    referencePrice,
    suggestedPrice,
    pricePerCarat,
    priceRange: {
      minimum: minimumPrice,
      maximum: maximumPrice,
    },
    priceLkr,
    priceUsd,
    pricePerCaratLkr,
    pricePerCaratUsd,
    priceRangeLkr,
    priceRangeUsd,
    priceRangePerCaratLkr,
    priceRangePerCaratUsd,
    rangePercentage: agg?.rangePercentage ?? 10,
    dispersion: agg?.dispersion ?? 10,
    evidenceBasis: options?.evidenceBasis || "Wholesale Completed Sales",
    marketContext: options?.marketContext || "Wholesale",
    comparablesUsedCount: options?.referenceCount || 0,
    contributingComparables: agg?.contributingComparables || [],
    retailIndicativeRangeLkr,
    retailIndicativeRangeUsd,
    adjustmentFactors: {
      treatment: treatmentFactor,
      origin: originFactor,
    },
    relativeMultipliers: {
      treatment: options?.relativeTreatmentMultiplier ?? 1.0,
      origin: options?.relativeOriginMultiplier ?? 1.0,
    },
    exchangeRate: exchangeRateInfo,
    provisionalAssumptions: [
      "Prices are based on verified loose gemstone completed wholesale transactions.",
      "Dispersion range reflects observed comparable price variance rather than arbitrary fixed percentages.",
      "Treatment and origin adjustments applied on an individual per-comparable basis before aggregation.",
    ],
  };
}
