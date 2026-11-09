import Link from "next/link";

export default function LearnPage() {
  return (
    <main>
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
            Beginner Guide
          </span>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Understand gemstone evaluation before you begin
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Open 4Cs uses four main areas — Color, Clarity, Cut, and
            Carat Weight — together with additional information such as
            treatment, origin, and information reliability.
          </p>

          <Link
            href="/#evaluation"
            className="mt-7 inline-flex rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-dark)]"
          >
            Start an Evaluation
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
            The Four Cs
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Four areas used in the evaluation
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
            You do not need to be a gemmologist to use the system.
            The evaluation form will guide you through each area.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <LearnCard
            number="01"
            title="Color"
            simple="What does the gemstone's color look like?"
            description="The system considers characteristics such as hue, tone, saturation, color distribution, and zoning."
          />

          <LearnCard
            number="02"
            title="Clarity"
            simple="How visible are inclusions inside the gemstone?"
            description="Clarity considers observations made with the naked eye and, when available, a 10× loupe. Inclusion visibility, type, location, and severity can provide useful information."
          />

          <LearnCard
            number="03"
            title="Cut"
            simple="How well is the gemstone shaped and finished?"
            description="Cut considers measurements and visible characteristics such as proportions, symmetry, polish, windowing, extinction, and bulging."
          />

          <LearnCard
            number="04"
            title="Carat Weight"
            simple="How much does the gemstone weigh?"
            description="Carat is a unit used for gemstone weight. The system evaluates carat weight together with other gemstone information rather than treating weight alone as value."
          />
        </div>
      </section>

      <section className="bg-[var(--surface-soft)]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              More than the 4Cs
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Additional information matters too
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <InfoCard
              title="Treatment"
              description="Some gemstones may have received treatments that alter or improve certain characteristics. If you do not have reliable treatment information, it is better to choose Unknown than to guess."
            />

            <InfoCard
              title="Origin"
              description="Origin refers to the geographic source associated with a gemstone. Reliable origin information may require supporting evidence, so the system allows you to report when origin is unknown."
            />

            <InfoCard
              title="Information Reliability"
              description="The system records how information was obtained, such as measured, user observed, seller provided, laboratory verified, or unverified."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="text-2xl">✓</div>

            <h2 className="mt-4 text-2xl font-bold">
              What Open 4Cs can do
            </h2>

            <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--muted)]">
              <p>• Guide you through structured gemstone observations.</p>
              <p>• Produce rule-based educational 4C scores.</p>
              <p>• Compare an evaluation with available reference gemstones.</p>
              <p>• Produce a B2B price suggestion when suitable reference data is available.</p>
              <p>• Provide rule-based recommendations and explain the result.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="text-2xl">!</div>

            <h2 className="mt-4 text-2xl font-bold text-amber-900">
              What Open 4Cs cannot do
            </h2>

            <div className="mt-5 space-y-3 text-sm leading-6 text-amber-800">
              <p>• It does not replace professional gemstone certification.</p>
              <p>• It does not guarantee a gemstone&apos;s selling price.</p>
              <p>• It does not independently authenticate geographic origin.</p>
              <p>• It does not independently detect gemstone treatments.</p>
              <p>• It does not replace examination by a qualified gemmologist or laboratory.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-white">
        <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:px-8">
          <h2 className="text-3xl font-bold">
            Ready to evaluate a gemstone?
          </h2>

          <p className="mx-auto mt-3 max-w-xl leading-7 text-[var(--muted)]">
            The form will guide you through the process one step at a
            time, with explanations whenever a gemstone term may be
            unfamiliar.
          </p>

          <Link
            href="/#evaluation"
            className="mt-7 inline-flex rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-dark)]"
          >
            Start Gemstone Evaluation
          </Link>
        </div>
      </section>
    </main>
  );
}

function LearnCard({
  number,
  title,
  simple,
  description,
}: {
  number: string;
  title: string;
  simple: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <span className="text-sm font-bold text-[var(--primary)]">
        {number}
      </span>

      <h3 className="mt-2 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 font-semibold">
        {simple}
      </p>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </article>
  );
}

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-6">
      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </article>
  );
}
