import type { ReactNode } from "react";

type EvaluationDetailsCardProps = {
  children: ReactNode;
};

export default function EvaluationDetailsCard({
  children,
}: EvaluationDetailsCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[var(--surface-soft)] p-5">
        <h3 className="font-bold">
          Want to see how this result was calculated?
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          The main result above gives you the easiest summary. You can
          open the technical details below to see additional evaluation
          information.
        </p>
      </div>

      <details className="group overflow-hidden rounded-2xl border border-[var(--border)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold">
          <span>View technical evaluation details</span>

          <span
            aria-hidden="true"
            className="text-xl text-[var(--primary)] transition-transform group-open:rotate-180"
          >
            ↓
          </span>
        </summary>

        <div className="border-t border-[var(--border)] bg-white p-5">
          {children}
        </div>
      </details>

      <p className="text-xs leading-5 text-[var(--muted)]">
        These details are provided for transparency and are not a
        professional laboratory report or gemstone certificate.
      </p>
    </div>
  );
}
