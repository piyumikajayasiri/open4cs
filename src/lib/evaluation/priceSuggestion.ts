import { PRICE_SUGGESTION_RULES } from "./rules";

export type PriceSuggestionResult = {
  status: "COMPLETED" | "UNAVAILABLE";
  reason: string;

  currency: string | null;
  referencePrice: number | null;
  suggestedPrice: number | null;
  priceRange: {
    minimum: number | null;
    maximum: number | null;
  };

  adjustmentFactors: {
    treatment: number | null;
    origin: number | null;
  };
};

export function calculatePriceSuggestion(
  referencePrice: number | null,
  currency: string | null,
  treatmentFactor: number | null,
  originFactor: number | null
): PriceSuggestionResult {
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

  const suggestedPrice =
    referencePrice *
    treatmentFactor *
    originFactor;

  const minimumPrice =
    suggestedPrice *
    (1 - PRICE_SUGGESTION_RULES.rangePercentage);

  const maximumPrice =
    suggestedPrice *
    (1 + PRICE_SUGGESTION_RULES.rangePercentage);

  return {
    status: "COMPLETED",
    reason:
      "Prototype B2B price suggestion calculated from the reference price, treatment adjustment, and origin adjustment.",
    currency,
    referencePrice,
    suggestedPrice: Number(
      suggestedPrice.toFixed(2)
    ),
    priceRange: {
      minimum: Number(minimumPrice.toFixed(2)),
      maximum: Number(maximumPrice.toFixed(2)),
    },
    adjustmentFactors: {
      treatment: treatmentFactor,
      origin: originFactor,
    },
  };
}
