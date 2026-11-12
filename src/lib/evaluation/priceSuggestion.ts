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
      priceRange: {
        minimum: null,
        maximum: null,
      },
      priceLkr: null,
      priceUsd: null,
      priceRangeLkr: null,
      priceRangeUsd: null,
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
      priceRange: {
        minimum: null,
        maximum: null,
      },
      priceLkr: null,
      priceUsd: null,
      priceRangeLkr: null,
      priceRangeUsd: null,
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
      priceLkr: null,
      priceUsd: null,
      priceRangeLkr: null,
      priceRangeUsd: null,
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

  // Currency Normalization:
  // Determine if rate is available
  const hasRate = Boolean(
    options?.exchangeRate &&
      options.exchangeRate.isAvailable &&
      typeof options.exchangeRate.rate === "number" &&
      options.exchangeRate.rate > 0
  );
  const fxRate = hasRate ? (options!.exchangeRate!.rate as number) : null;

  let priceLkr: number | null = null;
  let priceUsd: number | null = null;
  let priceRangeLkr: { minimum: number; maximum: number } | null = null;
  let priceRangeUsd: { minimum: number; maximum: number } | null = null;
  let exchangeRateInfo: PriceSuggestionResult["exchangeRate"] = null;

  const normCurrency = (currency || "LKR").toUpperCase().trim();

  if (normCurrency === "USD") {
    if (!fxRate) {
      // Cannot reliably normalize USD to regional LKR without a verified exchange rate
      return {
        status: "UNAVAILABLE",
        reason:
          "Market price suggestion is unavailable: Reference price is denominated in USD but no verified USD/LKR exchange rate is available for conversion to regional LKR.",
        currency,
        referencePrice,
        suggestedPrice: null,
        priceRange: { minimum: null, maximum: null },
        priceLkr: null,
        priceUsd: null,
        priceRangeLkr: null,
        priceRangeUsd: null,
        adjustmentFactors: {
          treatment: treatmentFactor,
          origin: originFactor,
        },
        exchangeRate: null,
      };
    }

    priceUsd = Math.round(suggestedPrice);
    priceRangeUsd = {
      minimum: Math.round(minimumPrice),
      maximum: Math.round(maximumPrice),
    };
    priceLkr = Math.round(suggestedPrice * fxRate);
    priceRangeLkr = {
      minimum: Math.round(minimumPrice * fxRate),
      maximum: Math.round(maximumPrice * fxRate),
    };
    exchangeRateInfo = {
      rate: fxRate,
      source: options!.exchangeRate!.source,
      asOfDate: options!.exchangeRate!.asOfDate,
      isAvailable: true,
    };
  } else {
    // Standard regional LKR base
    priceLkr = Math.round(suggestedPrice);
    priceRangeLkr = {
      minimum: Math.round(minimumPrice),
      maximum: Math.round(maximumPrice),
    };

    if (fxRate) {
      priceUsd = Math.round(priceLkr / fxRate);
      priceRangeUsd = {
        minimum: Math.round(minimumPrice / fxRate),
        maximum: Math.round(maximumPrice / fxRate),
      };
      exchangeRateInfo = {
        rate: fxRate,
        source: options!.exchangeRate!.source,
        asOfDate: options!.exchangeRate!.asOfDate,
        isAvailable: true,
      };
    }
  }

  const marketLevel = "Indicative Wholesale Market Range (Verified Commercial References)";

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
    reason:
      "Indicative market price range suggested from verified commercial trade references with relative treatment and origin adjustment.",
    marketLevel,
    currency: normCurrency,
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
    provisionalAssumptions:
      provisionalAssumptions.length > 0 ? provisionalAssumptions : undefined,
  };
}
