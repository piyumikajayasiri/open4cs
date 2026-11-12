import { PRICE_SUGGESTION_RULES } from "./rules";
import type { ExchangeRateRecord } from "../currency/exchangeRate";

export type PriceSuggestionResult = {
  status: "COMPLETED" | "UNAVAILABLE";
  reason: string;
  marketLevel?: string;

  currency: string | null;
  referencePrice: number | null;
  suggestedPrice: number | null;
  priceRange: {
    minimum: number | null;
    maximum: number | null;
  };

  priceLkr?: number | null;
  priceUsd?: number | null;
  priceRangeLkr?: {
    minimum: number | null;
    maximum: number | null;
  } | null;
  priceRangeUsd?: {
    minimum: number | null;
    maximum: number | null;
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

export function calculatePriceSuggestion(
  referencePrice: number | null,
  currency: string | null,
  treatmentFactor: number | null,
  originFactor: number | null,
  options?: {
    referenceCount?: number;
    relativeTreatmentMultiplier?: number;
    relativeOriginMultiplier?: number;
    exchangeRate?: ExchangeRateRecord | null;
    isRealMarketData?: boolean;
    dataClassification?: "Real" | "Demo";
  }
): PriceSuggestionResult {
  const minReferences = 3;
  if (options?.referenceCount !== undefined && options.referenceCount < minReferences) {
    return {
      status: "UNAVAILABLE",
      reason: `Insufficient verified market data: At least ${minReferences} verified market references are required (found ${options.referenceCount}). Demo records are excluded from real commercial valuation.`,
      currency,
      referencePrice,
      suggestedPrice: null,
      priceRange: {
        minimum: null,
        maximum: null,
      },
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
      priceRange: {
        minimum: null,
        maximum: null,
      },
      adjustmentFactors: {
        treatment: treatmentFactor,
        origin: originFactor,
      },
      exchangeRate: null,
    };
  }

  // Use relative multipliers if provided to eliminate double-counting
  const effectiveTreatmentMultiplier =
    options?.relativeTreatmentMultiplier ?? treatmentFactor;
  const effectiveOriginMultiplier =
    options?.relativeOriginMultiplier ?? originFactor;

  const suggestedPrice =
    referencePrice *
    effectiveTreatmentMultiplier *
    effectiveOriginMultiplier;

  const minimumPrice =
    suggestedPrice *
    (1 - PRICE_SUGGESTION_RULES.rangePercentage);

  const maximumPrice =
    suggestedPrice *
    (1 + PRICE_SUGGESTION_RULES.rangePercentage);

  const priceLkr = Math.round(suggestedPrice);
  const priceRangeLkr = {
    minimum: Math.round(minimumPrice),
    maximum: Math.round(maximumPrice),
  };

  // Explicit, dated currency handling: Only compute USD if a valid, dated exchange rate is provided
  let priceUsd: number | null = null;
  let priceRangeUsd: { minimum: number; maximum: number } | null = null;
  let exchangeRateInfo: PriceSuggestionResult["exchangeRate"] = null;

  if (
    options?.exchangeRate &&
    options.exchangeRate.isAvailable &&
    typeof options.exchangeRate.rate === "number" &&
    options.exchangeRate.rate > 0
  ) {
    const rate = options.exchangeRate.rate;
    priceUsd = Math.round(priceLkr / rate);
    priceRangeUsd = {
      minimum: Math.round(minimumPrice / rate),
      maximum: Math.round(maximumPrice / rate),
    };
    exchangeRateInfo = {
      rate: options.exchangeRate.rate,
      source: options.exchangeRate.source,
      asOfDate: options.exchangeRate.asOfDate,
      isAvailable: true,
    };
  }

  const isDemo = options?.dataClassification === "Demo" || options?.isRealMarketData === false;
  const marketLevel = isDemo
    ? "Indicative Research Benchmark (Demonstration / Academic Data)"
    : "Indicative Wholesale Market Range (Verified Commercial References)";

  const provisionalAssumptions: string[] = [];
  if (Math.abs(effectiveTreatmentMultiplier - 1.0) > 0.001) {
    provisionalAssumptions.push(
      `Relative treatment factor ${effectiveTreatmentMultiplier.toFixed(2)} applied as a provisional Open 4Cs modelling assumption; heat premiums vary widely by saturation and rough clarity.`
    );
  }
  if (Math.abs(effectiveOriginMultiplier - 1.0) > 0.001) {
    provisionalAssumptions.push(
      `Relative origin factor ${effectiveOriginMultiplier.toFixed(2)} applied as a provisional Open 4Cs modelling assumption; origin premiums vary across dealer networks.`
    );
  }

  return {
    status: "COMPLETED",
    reason: isDemo
      ? "Provisional benchmark calculated from pedagogical demonstration references. For academic evaluation purposes only."
      : "Indicative market price range suggested from verified commercial trade references with relative treatment and origin adjustment.",
    marketLevel,
    currency: currency || "LKR",
    referencePrice,
    suggestedPrice: Number(suggestedPrice.toFixed(2)),
    priceRange: {
      minimum: Number(minimumPrice.toFixed(2)),
      maximum: Number(maximumPrice.toFixed(2)),
    },
    priceLkr,
    priceUsd,
    priceRangeLkr,
    priceRangeUsd,
    adjustmentFactors: {
      treatment: treatmentFactor,
      origin: originFactor,
    },
    relativeMultipliers: {
      treatment: Number(effectiveTreatmentMultiplier.toFixed(3)),
      origin: Number(effectiveOriginMultiplier.toFixed(3)),
    },
    exchangeRate: exchangeRateInfo,
    provisionalAssumptions: provisionalAssumptions.length > 0 ? provisionalAssumptions : undefined,
  };
}
