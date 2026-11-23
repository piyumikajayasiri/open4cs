export type ExchangeRateRecord = {
  currencyPair: "USD/LKR";
  rate: number;
  source: string;
  sourceUrl?: string;
  sourceEvidence?: string;
  asOfDate: string;
  isOfficial: boolean;
  isAvailable: boolean;
};

/**
 * Validates and retrieves the active verified exchange rate for currency conversions.
 *
 * Strict Open 4Cs Currency Policy:
 * - Does NOT hard-code an unverified default rate.
 * - Requires explicit supporting source evidence, observation date, and non-zero numerical rate.
 * - When an exchange rate is not explicitly verified or configured, returns null.
 * - When null is returned, the system operates in LKR-only mode and excludes foreign references
 *   that cannot be converted reliably.
 */
export function getActiveExchangeRate(
  customRate?: Partial<ExchangeRateRecord> | null
): ExchangeRateRecord | null {
  if (customRate === null) {
    return null;
  }

  // 1. Check custom rate if explicitly supplied
  if (customRate && customRate.isAvailable !== false) {
    if (
      typeof customRate.rate === "number" &&
      customRate.rate > 0 &&
      customRate.source &&
      customRate.source.trim().length > 0 &&
      customRate.asOfDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(customRate.asOfDate.trim())
    ) {
      return {
        currencyPair: "USD/LKR",
        rate: customRate.rate,
        source: customRate.source.trim(),
        sourceUrl: customRate.sourceUrl?.trim(),
        sourceEvidence: customRate.sourceEvidence?.trim(),
        asOfDate: customRate.asOfDate.trim(),
        isOfficial: Boolean(customRate.isOfficial),
        isAvailable: true,
      };
    }
    // If partial/invalid custom rate was provided, do not guess
    return null;
  }

  // 2. Check environment configuration with required provenance fields
  const envRateStr = process.env.EXCHANGE_RATE_USD_LKR;
  const envSource = process.env.EXCHANGE_RATE_SOURCE;
  const envDate = process.env.EXCHANGE_RATE_DATE;

  if (envRateStr && envSource && envDate && /^\d{4}-\d{2}-\d{2}$/.test(envDate.trim())) {
    const parsedRate = Number(envRateStr);
    if (!Number.isNaN(parsedRate) && parsedRate > 0) {
      return {
        currencyPair: "USD/LKR",
        rate: parsedRate,
        source: envSource.trim(),
        sourceUrl: process.env.EXCHANGE_RATE_URL?.trim(),
        sourceEvidence: process.env.EXCHANGE_RATE_EVIDENCE?.trim(),
        asOfDate: envDate.trim(),
        isOfficial: process.env.EXCHANGE_RATE_OFFICIAL === "true",
        isAvailable: true,
      };
    }
  }

  // No verified exchange rate is actively configured -> default to null (LKR-only mode)
  return null;
}
