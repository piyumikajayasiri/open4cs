"use client";

import React, { useState } from "react";
import Link from "next/link";
import PortalSidebar from "@/components/layout/PortalSidebar";
import {
  BookOpen,
  Gem,
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Globe2,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

type GuideTab = "categories" | "identification" | "four_cs" | "treatment_origin";

interface GemCategoryCard {
  name: string;
  species: string;
  description: string;
  colorRange: string;
  evaluationStatus: "Engine Supported" | "Evaluation not yet supported" | "Educational Only (Asterism)";
  isEngineSupported: boolean;
  notes: string;
}

const CATEGORIES: GemCategoryCard[] = [
  {
    name: "Blue Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "The classic blue variety of corundum, colored primarily by iron (Fe²⁺) and titanium (Ti⁴⁺) intervalence charge transfer.",
    colorRange: "Pastel to deep navy blue; vivid royal and cornflower hues historically celebrated in trade.",
    evaluationStatus: "Engine Supported",
    isEngineSupported: true,
    notes: "Calibrated deterministic 4C rules with market comparison benchmarks.",
  },
  {
    name: "Padparadscha Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "An exceptionally rare, delicate blend of pink and orange corundum resembling the color of a lotus blossom.",
    colorRange: "Delicate pinkish-orange to orangish-pink without dominant brown or secondary muddy tones.",
    evaluationStatus: "Engine Supported",
    isEngineSupported: true,
    notes: "Requires dual color criteria balance. User selection is a reported claim, not laboratory confirmation.",
  },
  {
    name: "Ruby",
    species: "Corundum (Al₂O₃)",
    description: "The red variety of corundum colored primarily by chromium (Cr³⁺).",
    colorRange: "Orangish-red to purplish-red; pure vivid red traditionally referred to as 'pigeon blood'.",
    evaluationStatus: "Engine Supported",
    isEngineSupported: true,
    notes: "Calibrated chromium color bands and inclusion tolerance models.",
  },
  {
    name: "Yellow Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Yellow to golden corundum colored by trivalent iron (Fe³⁺) or color centers.",
    colorRange: "Light lemon yellow to rich golden and canary yellow.",
    evaluationStatus: "Evaluation not yet supported",
    isEngineSupported: false,
    notes: "Does not use Blue Sapphire rules. Evaluation rules currently in committee review.",
  },
  {
    name: "Pink Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Corundum with lower chromium concentration than ruby, exhibiting pastel to hot pink tones.",
    colorRange: "Baby pink, pastel pink, to vivid magenta pink.",
    evaluationStatus: "Evaluation not yet supported",
    isEngineSupported: false,
    notes: "Evaluation not yet supported. Distinct saturation curves prevent Blue Sapphire rule application.",
  },
  {
    name: "Purple Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Violet to purple corundum containing combinations of chromium, iron, and titanium.",
    colorRange: "Lavender, violetish-purple, to royal purple.",
    evaluationStatus: "Evaluation not yet supported",
    isEngineSupported: false,
    notes: "Evaluation not yet supported. Awaiting validated trade price curves.",
  },
  {
    name: "White / Colourless Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Chemically pure aluminum oxide corundum completely free of trace chromophore elements.",
    colorRange: "Completely colorless; cut proportions drive brilliant dispersion.",
    evaluationStatus: "Evaluation not yet supported",
    isEngineSupported: false,
    notes: "Evaluation not yet supported. Cut-weighted model pending board approval.",
  },
  {
    name: "Star Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Phenomenal corundum exhibiting 6-ray asterism caused by dense intersecting rutile silk needles.",
    colorRange: "Semi-translucent to opaque cabochon cuts displaying a mobile central star.",
    evaluationStatus: "Educational Only (Asterism)",
    isEngineSupported: false,
    notes: "Requires asterism sharpness and cabochon dome curvature criteria rather than faceted 4Cs.",
  },
];

export default function GemstoneGuidePage() {
  const [activeTab, setActiveTab] = useState<GuideTab>("categories");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      <PortalSidebar activeItem="guide" />

      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0E2A47]">
                Knowledge & Methodology
              </span>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Gemstone Guide & 4C Methodology
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Evidence-based classification of corundum, honest coverage bounds, and evaluation principles.
              </p>
            </div>

            <Link
              href="/evaluate/gemstone"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0E2A47] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition self-start sm:self-auto"
            >
              <span>Evaluate Supported Stone</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "categories"
                  ? "bg-[#0E2A47] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Gem className="w-4 h-4" />
              <span>Gemstone Categories</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("identification")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "identification"
                  ? "bg-[#0E2A47] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Identification Guidance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("four_cs")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "four_cs"
                  ? "bg-[#0E2A47] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>4C Evaluation Explanations</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("treatment_origin")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "treatment_origin"
                  ? "bg-[#0E2A47] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Treatment & Origin</span>
            </button>
          </div>

          {/* TAB 1: GEMSTONE CATEGORIES */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Honest Coverage Policy</p>
                  <p>
                    Open 4Cs only computes automated scores for categories with calibrated, board-evidenced rules (currently loose faceted Blue Sapphire, Padparadscha, and Ruby). Other sapphire colors are not subjected to arbitrary blue-sapphire rules. Diamonds, emeralds, and spinels are excluded from the corundum evaluation engine.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.name}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                          <span className="text-[11px] font-mono font-medium text-slate-400">
                            {cat.species}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${
                            cat.isEngineSupported
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {cat.evaluationStatus}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {cat.description}
                      </p>

                      <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Characteristic Palette
                        </span>
                        <p className="text-slate-700">{cat.colorRange}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-[11px] text-slate-500 italic">
                        {cat.notes}
                      </p>
                      {cat.isEngineSupported && (
                        <Link
                          href={`/evaluate/gemstone?variety=${encodeURIComponent(cat.name)}`}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          <span>Evaluate this variety</span>
                          <span>→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: IDENTIFICATION GUIDANCE */}
          {activeTab === "identification" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Essential Gemmological Boundaries
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Open 4Cs enforces strict scientific separation between physical observations, commercial descriptors, and origin hypotheses.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">1</span>
                    <h3 className="text-sm font-bold text-slate-900">Species vs. Variety vs. Origin</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Species:</strong> Corundum (Al₂O₃ crystallising in the trigonal system).<br />
                    <strong>Variety:</strong> Classified purely by hue (Blue Sapphire, Padparadscha, Ruby).<br />
                    <strong>Origin:</strong> “Ceylon” is an origin claim (Sri Lanka), <em>never a separate species or variety</em>. Origin does not alter basic physical constants (RI 1.762–1.770, SG ~4.00).
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">2</span>
                    <h3 className="text-sm font-bold text-slate-900">“Royal Blue” and “Cornflower Blue”</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Color terminology like “Royal Blue” or “Cornflower” are trade descriptors for specific saturation and tone bands. They <strong>do not prove geographic origin</strong>, do not replace a laboratory origin opinion, and must not automatically trigger an unevidenced price multiplier.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs">3</span>
                    <h3 className="text-sm font-bold text-slate-900">Padparadscha Evidence Rigor</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Padparadscha requires subtle pastel balance between pink and orange with low brown modifier. A user selecting “Padparadscha” in a questionnaire is an unconfirmed submission; laboratory spectrophotometry is mandatory for trade authentication.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">4</span>
                    <h3 className="text-sm font-bold text-slate-900">Natural vs. Laboratory-Grown</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Photographs and smartphone screens <strong>cannot determine natural origin</strong> or detect synthetic growth features (flux, flame fusion, or hydrothermal). Open 4Cs accepts stated user provenance honestly without certifying natural origin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 4C EVALUATION EXPLANATIONS */}
          {activeTab === "four_cs" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Open 4Cs Colored Gemstone Assessment Model
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Colored gemstones lack the rigid diamond D–Z and IF–I3 grading tables. The Open 4Cs system applies an evidence-backed provisional mathematical model:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-900">Color (35%)</span>
                    <span className="text-xs font-mono font-bold text-blue-600">Dominant</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Assesses Hue primary/secondary balance, Tone (depth of darkness 1–9), Saturation (greyish to vivid), color distribution, and zoning.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-teal-900">Clarity (25%)</span>
                    <span className="text-xs font-mono font-bold text-teal-600">Type II</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Colored gemstones are Type II (inclusions expected). Evaluates naked-eye transparency, 10× magnification relief, and off-table inclusion location.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-900">Cut (20%)</span>
                    <span className="text-xs font-mono font-bold text-indigo-600">Proportions</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Calculates length-to-width ratios, pavilion depth percentage (avoiding dead weight or windowing), symmetry, polish, and extinction.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-900">Carat (20%)</span>
                    <span className="text-xs font-mono font-bold text-purple-600">Scarcity</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Reflects non-linear natural rarity across carat tiers (0.5ct, 1.0ct, 2.0ct, 3.0ct+) rather than simple mass.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <p className="font-bold text-slate-800 mb-1">Academic Model Disclosure</p>
                <p>
                  The 35% / 25% / 20% / 20% composite model is an explicit provisional algorithm developed for university research. While guided by GIA quality factor publications, exact numerical weights represent university modeling choices and are clearly labelled provisional on all statements and reports.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TREATMENT & ORIGIN EXPLANATIONS */}
          {activeTab === "treatment_origin" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Treatment Impact & Geographic Provenance
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Enhancement status and country of origin are major valuation drivers in commercial corundum markets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Thermal & Chemical Treatments</span>
                  </h3>

                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block">Natural Unheated (U)</span>
                      Gemstone has not undergone thermal modification. Retains microscopic intact crystals and fine rutile silk. Demands significant market rarity premiums.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block">Traditional Heating (H)</span>
                      High-temperature heating dissolves silk and intensifies blue/red coloration. Common commercial practice widely accepted with minor discount relative to unheated.
                    </div>

                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-900">
                      <span className="font-bold block">Diffusion Treatment (Be / Ti)</span>
                      Lattice diffusion alters surface or bulk color through foreign chemical additives. Must be fully disclosed; trade value is heavily discounted (-22% to -35%).
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-blue-600" />
                    <span>Geographic Origin Provenance</span>
                  </h3>

                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block">Sri Lanka (Ceylon)</span>
                      Historic source of brightly saturated, pastel to royal blue sapphires and padparadscha. Verified Ceylon stones enjoy a market premium.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block">Myanmar (Burma)</span>
                      Historically famed for Mogok rubies and velvety royal blue sapphires.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block">Madagascar (Ilakaka)</span>
                      Prolific contemporary deposit yielding material visually identical to Ceylon stones, differentiated only by trace element LA-ICP-MS spectroscopy.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
