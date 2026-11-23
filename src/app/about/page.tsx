import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Gem, Globe2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Open 4Cs",
  description:
    "Learn about the Ceylon Academy of Gemmological Science (CAGS), its courses and facilities, and the Open 4Cs project.",
};

const academyDetails = [
  {
    title: "Our founder",
    description:
      "CAGS was founded by Umesh Wariyapperuma, a gemmologist with qualifications from British and German gemmological associations and experience in gemstone testing and trading.",
  },
  {
    title: "Courses and training",
    description:
      "The academy offers courses in trading gemmology, gem cutting, Geuda heat treatment, and computer-aided jewellery design.",
  },
  {
    title: "Hands-on gem laboratory",
    description:
      "Students examine natural and synthetic specimens using microscopes, refractometers, and UV testing equipment. They learn to observe features such as inclusions and compare properties that help identify gemstones.",
  },
];

const focusAreas = [
  {
    title: "Gemstone education",
    description:
      "The Gemstone Guide explains gemstone varieties, identification, and the principles behind the 4Cs.",
    Icon: BookOpen,
  },
  {
    title: "The 4Cs framework",
    description:
      "Open 4Cs shows how color, clarity, cut, and carat weight contribute to a gemstone evaluation.",
    Icon: Gem,
  },
  {
    title: "Sri Lankan gemstones",
    description:
      "The project covers selected corundum varieties, including blue sapphire, padparadscha sapphire, and ruby.",
    Icon: Globe2,
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#F8FAFC] text-slate-900">
      <section className="border-b border-slate-200 bg-white py-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          <div className="space-y-6 lg:col-span-7">
            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              About Us
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
              The Ceylon Academy of Gemmological Science (CAGS) offers
              practical gemmology training for students, enthusiasts, and
              trade professionals in Sri Lanka.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B1530] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Contact Us
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-5">
            <h2 className="text-xl font-bold tracking-tight">
              The Open 4Cs project
            </h2>

            <p className="mt-2 leading-relaxed text-slate-600">
              Open 4Cs is an educational tool for evaluating gemstones and
              exploring indicative wholesale price ranges. It shows how your
              observations contribute to the evaluation score.
            </p>

            <Link
              href="/guide"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
            >
              Read the Gemstone Guide
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="cags-heading"
        className="border-b border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h2
            id="cags-heading"
            className="text-3xl font-extrabold tracking-tight"
          >
            Get to know CAGS
          </h2>

          <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
            Based in Malabe, CAGS combines classroom teaching with practical
            gemstone examination. Students learn to identify stones, use
            gem-testing instruments, and understand how gemstones are assessed
            in the trade.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {academyDetails.map(({ title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>

          <a
            href="https://cags.lk/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
          >
            Visit the official CAGS website
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section
        aria-labelledby="focus-heading"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <h2
          id="focus-heading"
          className="text-3xl font-extrabold tracking-tight"
        >
          What we focus on
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {focusAreas.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}