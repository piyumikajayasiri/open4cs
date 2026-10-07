import Link from "next/link";
import GemstoneForm from "@/components/gemstone/GemstoneForm";

export default function Home() {
  return (
    <main className="bg-[#F8FAFC] text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 border border-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                Rule-based • Educational • B2B reference
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
                Evaluate Your Gemstone. <br />
                <span className="text-blue-600">Understand Its Value.</span>
              </h1>

              <p className="max-w-2xl text-lg text-slate-600 leading-relaxed">
                A structured 4Cs gemstone evaluation and B2B price suggestion
                platform for selected Sri Lankan-origin corundum gemstones.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <a
                  href="#evaluation"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1530] px-6 py-3.5 font-semibold text-white hover:bg-slate-800 transition shadow-sm"
                >
                  Start Evaluation
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-800 hover:bg-slate-50 transition"
                >
                  Learn How It Works
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg><span>Not a certification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg><span>Built for students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg><span>Transparent rules</span>
                </div>
              </div>
            </div>

            {/* Right Column Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Evaluation Preview</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">CEY-2026-0847</span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 text-[11px] border border-emerald-200">
                    Rule v4.2
                  </span>
                </div>

                {/* Image Showcase */}
                <div className="relative overflow-hidden rounded-xl bg-slate-950 h-52 flex items-center justify-center p-2 group">
                  <div className="grid grid-cols-2 gap-3 w-full h-full">
                    <div className="relative rounded-lg overflow-hidden bg-gradient-to-tr from-blue-900 via-indigo-950 to-slate-900 flex items-center justify-center">
                      <div className="w-24 h-32 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 shadow-lg shadow-blue-500/50 transform rotate-12 flex items-center justify-center border border-blue-400/40">
                        <div className="w-16 h-24 rounded-full bg-blue-400/30 blur-xs"></div>
                      </div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex items-center justify-center">
                      <div className="w-20 h-28 rounded-2xl bg-gradient-to-b from-sky-400 via-blue-600 to-slate-800 shadow-lg shadow-sky-500/40 border border-sky-300/30 flex items-center justify-center">
                        <div className="w-12 h-18 rounded-xl bg-white/20 blur-xs"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white border border-slate-700/50">
                    Corundum / Natural Blue Sapphire
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">COLOR</span>
                      <span className="text-slate-900">Vivid Blue • 8.6</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: "86%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">CLARITY</span>
                      <span className="text-slate-900">Eye-clean • 7.9</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "79%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">CUT</span>
                      <span className="text-slate-900">Well-cut • 8.1</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: "81%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Price Box */}
                <div className="rounded-xl bg-[#0B1530] p-4 text-white flex items-center justify-between">
                  <div>
                    <p className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase">
                      SUGGESTED B2B RANGE
                    </p>
                    <p className="text-lg font-bold tracking-tight mt-0.5 text-white">
                      LKR 1.42M – 1.68M
                    </p>
                  </div>
                  <span className="rounded-md bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 border border-slate-700">
                    Base 2.14ct
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 2: THE FRAMEWORK */}
      <section id="framework" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              THE FRAMEWORK
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Structured 4Cs Evaluation
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Color Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold mb-4">
                💧
              </div>
              <h3 className="text-xl font-bold text-slate-900">Color</h3>
              <p className="mt-1 text-xs font-semibold text-blue-600">
                Hue • Tone • Saturation • Distribution • Zoning
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Hue family & secondary tones
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Tone scale 1–10 reference
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Saturation grade panel
                </li>
              </ul>
            </div>

            {/* Clarity Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold mb-4">
                🔍
              </div>
              <h3 className="text-xl font-bold text-slate-900">Clarity</h3>
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                Naked eye + 10x loupe protocol
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Visibility & inclusion type
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Location & severity matrix
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Student observation guide
                </li>
              </ul>
            </div>

            {/* Cut Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold mb-4">
                ✂️
              </div>
              <h3 className="text-xl font-bold text-slate-900">Cut</h3>
              <p className="mt-1 text-xs font-semibold text-purple-600">
                Dimensions • Proportions • Finish
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> L/W ratio & depth % auto-calc
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Symmetry • Polish • Windowing
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Extinction & bulging checks
                </li>
              </ul>
            </div>

            {/* Carat Weight Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold mb-4">
                ⚖️
              </div>
              <h3 className="text-xl font-bold text-slate-900">Carat Weight</h3>
              <p className="mt-1 text-xs font-semibold text-indigo-600">
                Weight in market context
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Calibrated weight entry
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Size characteristics
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Market-size categories
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: HOW IT WORKS - Dark Container */}
      <section id="how-it-works" className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-[#0B1530] text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  HOW IT WORKS
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
                  From stone to suggestion <br className="hidden sm:inline" />
                  in six steps
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                  Every calculation is traceable to a published rule version and
                  reference record — no black boxes.
                </p>
                <a
                  href="#evaluation"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-900 hover:bg-slate-100 transition shadow-sm"
                >
                  Start your first evaluation
                </a>
              </div>

              {/* 6 Steps List */}
              <div className="lg:col-span-6 space-y-3">
                {[
                  { num: "01", text: "Select Gemstone" },
                  { num: "02", text: "Enter Information" },
                  { num: "03", text: "Evaluate 4Cs" },
                  { num: "04", text: "Compare Similar Gemstones" },
                  { num: "05", text: "Generate Price Suggestion" },
                  { num: "06", text: "Review Recommendations" },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="flex items-center gap-4 rounded-2xl bg-slate-900/60 p-4 border border-slate-800/80 hover:bg-slate-800/60 transition"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/30 text-blue-400 font-bold text-xs border border-blue-500/30">
                      {step.num}
                    </span>
                    <span className="font-semibold text-slate-100 text-sm">
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Highlights & Yellow Disclaimer Banner */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-3">
                🛡️
              </div>
              <h4 className="font-bold text-slate-900 text-base">Structured evaluation</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Same protocol for every stone, from classroom to trading desk.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3">
                📄
              </div>
              <h4 className="font-bold text-slate-900 text-base">Transparent calculations</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                See each adjustment, rule version and data source.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 mb-3">
                🏛️
              </div>
              <h4 className="font-bold text-slate-900 text-base">Comparable context</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Reference stones and historical ranges beside your result.
              </p>
            </div>
          </div>

          {/* Yellow Disclaimer Banner */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
              !
            </span>
            <p className="text-xs leading-5 text-amber-900">
              This system provides an estimated B2B price suggestion based on the information provided,
              predefined evaluation and pricing rules, comparable gemstone data, and available reference information.
              It is not a professional laboratory valuation, gemstone certification, authentication, legally binding valuation,
              or guaranteed selling price.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Interactive Gemstone Evaluation Form Anchor */}
      <section
        id="evaluation"
        className="scroll-mt-20 border-t border-slate-200 bg-white py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <span className="inline-flex rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
              Interactive Evaluation Engine
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Start Your Gemstone Evaluation
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Follow the guided steps below to record your gemstone observation and generate explainable 4C scores & pricing suggestions.
            </p>
          </div>

          <GemstoneForm />
        </div>
      </section>
    </main>
  );
}
