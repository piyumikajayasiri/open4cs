import GemstoneForm from "../../components/gemstone/GemstoneForm";

export default function Home() {
  return (
    <main>
      {/* Beginner introduction */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary-dark)]">
              Simple • Educational • Step by Step
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Understand Your Gemstone
              <span className="block text-[var(--primary)]">
                Through the 4Cs
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              You do not need to be a gemstone expert. We&apos;ll guide
              you through a simple evaluation of your gemstone&apos;s
              Color, Clarity, Cut, and Carat Weight.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#evaluation"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-dark)] sm:w-auto"
              >
                Start Gemstone Evaluation
              </a>

              <a
                href="/learn"
                className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white px-6 py-3 font-semibold transition hover:bg-[var(--surface-soft)] sm:w-auto"
              >
                Learn About the 4Cs
              </a>
            </div>

            <p className="mt-4 text-sm text-[var(--muted)]">
              No gemmological experience required.
            </p>
          </div>
        </div>
      </section>

      {/* Simple 4C explanation */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">
            What are the 4Cs?
          </h2>

          <p className="mt-2 text-[var(--muted)]">
            Four important characteristics used to understand a gemstone.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <C4Card
            letter="C"
            title="Color"
            description="Understand the gemstone's hue, tone, saturation, and color distribution."
          />

          <C4Card
            letter="C"
            title="Clarity"
            description="Look at how visible inclusions or internal features are in the gemstone."
          />

          <C4Card
            letter="C"
            title="Cut"
            description="Consider the gemstone's proportions, symmetry, polish, and visible cut effects."
          />

          <C4Card
            letter="C"
            title="Carat Weight"
            description="Consider the gemstone's weight together with its dimensions and size."
          />
        </div>
      </section>

      {/* Existing working evaluation system */}
      <section
        id="evaluation"
        className="scroll-mt-24 border-t border-[var(--border)] bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              Guided Evaluation
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Evaluate Your Gemstone
            </h2>

            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              Answer the questions using the information you know.
              If you are unsure about a gemstone term, we&apos;ll make
              it easier to understand as you move through the process.
            </p>
          </div>

          <GemstoneForm />
        </div>
      </section>
    </main>
  );
}

function C4Card({
  letter,
  title,
  description,
}: {
  letter: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg font-bold text-[var(--primary-dark)]">
        {letter}
      </div>

      <h3 className="mt-4 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}
