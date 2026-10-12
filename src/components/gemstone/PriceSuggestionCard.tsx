type PriceSuggestionCardProps = {
  suggestedPrice: number;
  minimumPrice: number;
  maximumPrice: number;
  currency: string;
};

export default function PriceSuggestionCard({
  suggestedPrice,
  minimumPrice,
  maximumPrice,
  currency,
}: PriceSuggestionCardProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[var(--primary-soft)] p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary-dark)]">
          Suggested B2B Price
        </p>

        <p className="mt-3 text-4xl font-bold text-[var(--primary-dark)] sm:text-5xl">
          {formatMoney(suggestedPrice)}
        </p>

        <p className="mt-2 font-semibold text-[var(--primary-dark)]">
          {currency}
        </p>

        <p className="mt-3 text-sm text-[var(--muted)]">
          Educational price suggestion based on the current evaluation
          rules and available reference data.
        </p>
      </div>

      <div>
        <p className="font-semibold">
          Suggested price range
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--muted)]">
              Lower estimate
            </p>

            <p className="mt-1 text-xl font-bold">
              {formatMoney(minimumPrice)} {currency}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--muted)]">
              Upper estimate
            </p>

            <p className="mt-1 text-xl font-bold">
              {formatMoney(maximumPrice)} {currency}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-semibold text-amber-900">
          What does this price mean?
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          This is a rule-based B2B price suggestion, not a guaranteed
          selling price, professional valuation, or gemstone
          certification. Actual market prices can differ.
        </p>
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}
