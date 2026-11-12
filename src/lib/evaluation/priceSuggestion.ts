import { PRICE_SUGGESTION_RULES } from "./rules";

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
  };
  priceRangeUsd?: {
    minimum: number | null;
    maximum: number | null;
  };

  adjustmentFactors: {
    treatment: number | null;
    origin: number | null;
  };

  relativeMultipliers?: {
    treatment: number | null;
    origin: number | null;
  };
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
  }
): PriceSuggestionResult {
  const minReferences = 3;
  if (options?.referenceCount !== undefined && options.referenceCount < minReferences) {
    return {
      status: "UNAVAILABLE",
      reason: `Insufficient verified market data: At least ${minReferences} verified market references are required (found ${options.referenceCount}).`,
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
    };
  }

  // Use relative multipliers if provided, otherwise fallback to factors
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

  const exchangeRate = PRICE_SUGGESTION_RULES.exchangeRateLkrPerUsd;

  let priceLkr: number;
  let priceUsd: number;
  let priceRangeLkr: { minimum: number; maximum: number };
  let priceRangeUsd: { minimum: number; maximum: number };

  if (currency?.toUpperCase() === "USD") {
    priceUsd = Math.round(suggestedPrice);
    priceLkr = Math.round(suggestedPrice * exchangeRate);
    priceRangeUsd = {
      minimum: Math.round(minimumPrice),
      maximum: Math.round(maximumPrice),
    };
    priceRangeLkr = {
      minimum: Math.round(minimumPrice * exchangeRate),
      maximum: Math.round(maximumPrice * exchangeRate),
    };
  } else {
    // Default LKR
    priceLkr = Math.round(suggestedPrice);
    priceUsd = Math.round(suggestedPrice / exchangeRate);
    priceRangeLkr = {
      minimum: Math.round(minimumPrice),
      maximum: Math.round(maximumPrice),
    };
    priceRangeUsd = {
      minimum: Math.round(minimumPrice / exchangeRate),
      maximum: Math.round(maximumPrice / exchangeRate),
    };
  }

  return {
    status: "COMPLETED",
    reason:
      "Prototype Sri Lanka wholesale clearing benchmark suggested from verified trade references with relative treatment and origin adjustment.",
    marketLevel: "Wholesale Clearing Benchmark (Sri Lanka Dealer / B2B Trade)",
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
  };
}
