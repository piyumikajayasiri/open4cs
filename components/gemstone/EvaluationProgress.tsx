type EvaluationProgressProps = {
  currentStep: number;
};

const steps = [
  { number: 1, label: "Gemstone" },
  { number: 2, label: "Color" },
  { number: 3, label: "Clarity" },
  { number: 4, label: "Cut" },
  { number: 5, label: "More Details" },
];

export default function EvaluationProgress({
  currentStep,
}: EvaluationProgressProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">
            Step {currentStep} of {steps.length}
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            We&apos;ll guide you through each part.
          </p>
        </div>

        <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
          {Math.round((currentStep / steps.length) * 100)}%
        </span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
          style={{
            width: `${(currentStep / steps.length) * 100}%`,
          }}
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {steps.map((step) => {
          const active = step.number === currentStep;
          const completed = step.number < currentStep;

          return (
            <div
              key={step.number}
              className="text-center"
            >
              <div
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  active
                    ? "bg-[var(--primary)] text-white"
                    : completed
                      ? "bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                      : "bg-[var(--surface-soft)] text-[var(--muted)]"
                }`}
              >
                {completed ? "✓" : step.number}
              </div>

              <p
                className={`mt-2 hidden text-xs sm:block ${
                  active
                    ? "font-semibold text-[var(--foreground)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
