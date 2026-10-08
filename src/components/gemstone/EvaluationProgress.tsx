"use client";

type EvaluationProgressProps = {
  currentStep: number;
  onStepClick?: (step: number) => void;
};

const steps = [
  { number: 1, label: "Gemstone" },
  { number: 2, label: "Basic Info" },
  { number: 3, label: "Color" },
  { number: 4, label: "Clarity" },
  { number: 5, label: "Cut" },
  { number: 6, label: "Carat" },
  { number: 7, label: "Factors" },
  { number: 8, label: "Review" },
];

export default function EvaluationProgress({
  currentStep,
  onStepClick,
}: EvaluationProgressProps) {
  return (
    <div className="w-full bg-white py-3 px-2 rounded-2xl border border-slate-100 shadow-xs overflow-x-auto">
      <div className="flex items-center justify-between min-w-[680px] px-2">
        {steps.map((step, index) => {
          const active = step.number === currentStep;
          const completed = step.number < currentStep;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              {/* Step Node Button */}
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(step.number)}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <span
                  className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-all duration-200 ${
                    completed
                      ? "bg-emerald-600 text-white"
                      : active
                      ? "bg-[#070D1E] text-white shadow-sm ring-4 ring-slate-100"
                      : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
                  }`}
                >
                  {completed ? "✓" : step.number}
                </span>

                <span
                  className={`text-xs whitespace-nowrap transition-colors ${
                    active
                      ? "font-bold text-slate-900"
                      : completed
                      ? "font-semibold text-slate-700"
                      : "font-medium text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connecting Line (except for last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`h-[2px] flex-1 mx-3 rounded-full transition-colors ${
                    step.number < currentStep ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
