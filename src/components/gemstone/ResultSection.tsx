import type { ReactNode } from "react";

type ResultSectionProps = {
  title: string;
  description?: string;
  icon?: string;
  children: ReactNode;
};

export default function ResultSection({
  title,
  description,
  icon,
  children,
}: ResultSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg">
              {icon}
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}
