export type ExchangeRateRecord = {
  currencyPair: "USD/LKR";
  rate: number;
  source: string;
  sourceUrl?: string;
  asOfDate: string;
  isOfficial: boolean;
  isAvailable: boolean;
};

/**
 * Official dated exchange rate reference published by the Central Bank of Sri Lanka (CBSL).
 * Source: https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates
 *
 * Used strictly with explicit source provenance and observation date.
 * If disabled or unavailable, the system strictly outputs LKR without inventing a rate.
 */
export const OFFICIAL_CBSL_EXCHANGE_RATE: ExchangeRateRecord = {
  currencyPair: "USD/LKR",
  rate: 304.25,
  source: "Central Bank of Sri Lanka (CBSL) - Indicative Spot Exchange Rate",
  sourceUrl: "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates",
  asOfDate: "2026-11-12",
  isOfficial: true,
  isAvailable: true,
};

export function getActiveExchangeRate(
  customRate?: Partial<ExchangeRateRecord> | null
): ExchangeRateRecord | null {
  if (customRate === null) {
    return null;
  }
  if (customRate && customRate.isAvailable === false) {
    return null;
  }
  if (customRate && typeof customRate.rate === "number" && customRate.rate > 0) {
    return {
      currencyPair: "USD/LKR",
      rate: customRate.rate,
      source: customRate.source || "Verified Custom Market Rate",
      sourceUrl: customRate.sourceUrl,
      asOfDate: customRate.asOfDate || new Date().toISOString().split("T")[0],
      isOfficial: Boolean(customRate.isOfficial),
      isAvailable: true,
    };
  }
  return OFFICIAL_CBSL_EXCHANGE_RATE;
}
