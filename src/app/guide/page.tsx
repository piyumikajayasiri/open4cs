"use client";

import React, { useState } from "react";
import Link from "next/link";
import PortalSidebar from "@/components/layout/PortalSidebar";
import {
  Gem,
  Compass,
  SlidersHorizontal,
  Flame,
  Globe2,
  AlertTriangle,
  Info,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
} from "lucide-react";

type GuideTab = "categories" | "identification" | "four_cs" | "treatment_origin";

interface GemCategoryCard {
  name: string;
  varietyId: string;
  species: string;
  description: string;
  colorRange: string;
  evaluationStatus: "Engine Supported" | "Not Yet Supported" | "Educational Only";
  isEngineSupported: boolean;
  colorDot: string;
  notes: string;
}

const CATEGORIES: GemCategoryCard[] = [
  {
    name: "Blue Sapphire",
    varietyId: "Blue Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "The classic blue variety of corundum, colored primarily by iron (Fe²⁺) and titanium (Ti⁴⁺) intervalence charge transfer.",
    colorRange: "Pastel to deep navy blue; vivid royal and cornflower hues historically celebrated in trade.",
    evaluationStatus: "Engine Supported",
    isEngineSupported: true,
    colorDot: "bg-blue-600",
    notes: "Calibrated deterministic 4C rules with active market comparison benchmarks.",
  },
  {
    name: "Padparadscha",
    varietyId: "Padparadscha",
    species: "Corundum (Al₂O₃)",
    description: "An exceptionally rare, delicate blend of pink and orange corundum resembling the sacred color of a lotus blossom.",
    colorRange: "Delicate pinkish-orange to orangish-pink without dominant brown or secondary muddy tones.",
    evaluationStatus: "Engine Supported",
    isEngineSupported: true,
    colorDot: "bg-gradient-to-r from-amber-500 to-rose-400",
    notes: "Requires dual color criteria balance. User selection is a reported claim, not laboratory confirmation.",
  },
  {
    name: "Ruby",
    varietyId: "Ruby",
    species: "Corundum (Al₂O₃)",
    description: "The red variety of corundum colored primarily by trace chromium (Cr³⁺) substituting for aluminum in the crystal lattice.",
    colorRange: "Orangish-red to purplish-red; pure vivid red traditionally referred to in trade as 'pigeon blood'.",
    evaluationStatus: "Engine Supported",
    isEngineSupported: true,
    colorDot: "bg-rose-600",
    notes: "Calibrated chromium color bands and inclusion tolerance models.",
  },
  {
    name: "Yellow Sapphire",
    varietyId: "Yellow Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Yellow to golden corundum colored by trivalent iron (Fe³⁺) or natural trapped electron color centers.",
    colorRange: "Light lemon yellow to rich golden and canary yellow.",
    evaluationStatus: "Not Yet Supported",
    isEngineSupported: false,
    colorDot: "bg-amber-400",
    notes: "Does not use Blue Sapphire rules. Evaluation rules currently in committee review.",
  },
  {
    name: "Pink Sapphire",
    varietyId: "Pink Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Corundum with lower chromium concentration than ruby, exhibiting delicate pastel to hot magenta pink tones.",
    colorRange: "Baby pink, pastel pink, to vivid magenta pink.",
    evaluationStatus: "Not Yet Supported",
    isEngineSupported: false,
    colorDot: "bg-pink-500",
    notes: "Evaluation not yet supported. Distinct saturation curves prevent Blue Sapphire rule application.",
  },
  {
    name: "Purple Sapphire",
    varietyId: "Purple Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Violet to purple corundum containing combinations of chromium, iron, and titanium chromophores.",
    colorRange: "Lavender, violetish-purple, to royal purple.",
    evaluationStatus: "Not Yet Supported",
    isEngineSupported: false,
    colorDot: "bg-purple-600",
    notes: "Evaluation not yet supported. Awaiting validated trade price curves.",
  },
  {
    name: "White / Colourless Sapphire",
    varietyId: "White Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Chemically pure aluminum oxide corundum completely free of trace chromophore elements.",
    colorRange: "Completely colorless; cut proportions drive brilliant dispersion.",
    evaluationStatus: "Not Yet Supported",
    isEngineSupported: false,
    colorDot: "bg-slate-300",
    notes: "Evaluation not yet supported. Cut-weighted model pending board approval.",
  },
  {
    name: "Star Sapphire",
    varietyId: "Star Sapphire",
    species: "Corundum (Al₂O₃)",
    description: "Phenomenal corundum exhibiting 6-ray asterism caused by dense intersecting rutile silk needles.",
    colorRange: "Semi-translucent to opaque cabochon cuts displaying a mobile central star.",
    evaluationStatus: "Educational Only",
    isEngineSupported: false,
    colorDot: "bg-indigo-700",
    notes: "Requires asterism sharpness and cabochon dome curvature criteria rather than faceted 4Cs.",
  },
];

export default function GemstoneGuidePage() {
  const [activeTab, setActiveTab] = useState<GuideTab>("categories");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Left Navigation Sidebar */}
      <PortalSidebar activeItem="guide" />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0E2A47]">
              Knowledge &amp; Methodology
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Gemstone Guide &amp; 4C Methodology
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Evidence-based classification of corundum, honest coverage bounds, and evaluation principles.
            </p>
          </div>

          <Link
            href="/evaluate/gemstone"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0E2A47] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition self-start sm:self-auto cursor-pointer"
          >
            <span>Evaluate Supported Stone</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
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
            <span>Treatment &amp; Origin</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: GEMSTONE CATEGORIES */}
        {/* ========================================================================= */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Policy Alert Banner */}
            <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-3 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>Honest Coverage Policy</span>
                  <span className="text-[10px] bg-amber-200/70 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">
                    Scientific Boundaries
                  </span>
                </p>
                <p className="leading-relaxed text-amber-800">
                  Open 4Cs only computes automated scores for categories with calibrated gemmological research rules (currently loose faceted <strong>Blue Sapphire</strong>, <strong>Padparadscha</strong>, and <strong>Ruby</strong>). Other sapphire colors are not subjected to arbitrary blue-sapphire rules. Diamonds, emeralds, and spinels are excluded from this corundum evaluation engine.
                </p>
              </div>
            </div>

            {/* Categories Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition hover:shadow-md"
                >
                  <div className="space-y-3 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ${cat.colorDot}`} />
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {cat.name}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400">
                            {cat.species}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                          cat.isEngineSupported
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : cat.evaluationStatus === "Educational Only"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {cat.evaluationStatus}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Characteristic Palette */}
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-1 mt-auto">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Characteristic Palette
                      </span>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">
                        {cat.colorRange}
                      </p>
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div className="border-t border-slate-100 pt-3 mt-4 space-y-2.5">
                    <p className="text-[11px] text-slate-500 italic leading-snug">
                      {cat.notes}
                    </p>

                    {cat.isEngineSupported ? (
                      <Link
                        href={`/evaluate/gemstone?variety=${encodeURIComponent(cat.varietyId)}`}
                        className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition group cursor-pointer"
                      >
                        <span>Evaluate {cat.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-slate-50 text-slate-400 text-xs font-semibold">
                        <span>Evaluation Pending Review</span>
                        <span className="text-[10px] font-mono uppercase">Inactive</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: IDENTIFICATION GUIDANCE */}
        {/* ========================================================================= */}
        {activeTab === "identification" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-8 shadow-xs">
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Essential Gemmological Boundaries &amp; Rigor
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Open 4Cs enforces strict scientific separation between physical diagnostic observations, commercial trade descriptors, and origin hypotheses.
              </p>
            </div>

            {/* 4 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                    1
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Species vs. Variety vs. Origin</h3>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Classification Integrity</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <p><strong>Species:</strong> Corundum (Al₂O₃ crystallizing in the trigonal system, RI 1.762–1.770, SG ~4.00).</p>
                    <p><strong>Variety:</strong> Classified purely by hue (Blue Sapphire, Padparadscha, Ruby).</p>
                    <p><strong>Origin:</strong> “Ceylon” is an origin claim (Sri Lanka), <em>never a separate species or variety</em>. Origin does not alter physical optical constants.</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                    2
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">“Royal Blue” &amp; “Cornflower Blue”</h3>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Trade Descriptors</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <p>Color names like “Royal Blue” or “Cornflower” are trade descriptors for specific saturation and tone bands.</p>
                    <p>They <strong>do not prove geographic origin</strong>, do not replace a laboratory origin opinion, and must not automatically trigger unevidenced pricing multipliers.</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                    3
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Padparadscha Evidence Rigor</h3>
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Dual Chromophore Balance</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <p>Padparadscha requires a subtle pastel balance between pink and orange with low brown modifier.</p>
                    <p>A user selecting “Padparadscha” in a questionnaire is an unconfirmed submission; laboratory spectrophotometry is mandatory for trade authentication.</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                    4
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Natural vs. Laboratory-Grown</h3>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Independent Supply Curves</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <p>Photographs and smartphone screens <strong>cannot determine natural origin</strong> or detect synthetic growth features (flux, flame fusion, or hydrothermal).</p>
                    <p>Open 4Cs strictly restricts commercial price comparables to confirmed natural geological corundum.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Table of Corundum Physical & Optical Constants */}
            <div className="pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Fundamental Diagnostic Constants of Natural Corundum
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Chemical Formula</span>
                  <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">Al₂O₃</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Crystal System</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">Trigonal</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Refractive Index</span>
                  <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">1.762 – 1.770</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Birefringence</span>
                  <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">0.008 (Uniaxial -)</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Specific Gravity</span>
                  <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">3.99 – 4.01</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Mohs Hardness</span>
                  <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">9.0</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 4C EVALUATION EXPLANATIONS */}
        {/* ========================================================================= */}
        {activeTab === "four_cs" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-8 shadow-xs">
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Open 4Cs Colored Gemstone Assessment Model
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Colored gemstones lack the rigid diamond D–Z and IF–I3 grading tables. The Open 4Cs system applies an evidence-backed deterministic mathematical weighting model:
              </p>
            </div>

            {/* Composite Formula Banner */}
            <div className="bg-[#0E2A47] text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-300 block">
                    Composite Weighting Formula
                  </span>
                  <p className="text-sm sm:text-base font-bold font-mono text-white">
                    Overall 4C Score = (Color × 0.35) + (Clarity × 0.25) + (Cut × 0.20) + (Carat × 0.20)
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold whitespace-nowrap">
                Total: 100% (1.00)
              </span>
            </div>

            {/* 4 Deep Dive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Color Card */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-blue-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <h3 className="text-sm font-bold text-blue-950">1. Color Assessment (35%)</h3>
                    </div>
                    <span className="text-[10px] font-mono font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                      Dominant Weight
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    Color represents the single highest market price driver in fine corundum. The engine scores five interconnected sub-factors:
                  </p>

                  <ul className="text-xs text-slate-700 mt-3 space-y-1.5 list-disc list-inside">
                    <li><strong>Hue Selection:</strong> Variety-specific color boundary verification (Royal Blue, Cornflower, Pigeon Blood, Pinkish Orange). Cross-variety hues are strictly rejected.</li>
                    <li><strong>Tone (1–9 Scale):</strong> Optimal medium tones 5 &amp; 6 score 100 pts. Overly dark (8–9, &ldquo;inky&rdquo;) or pale (1–2) tones score lower due to poor brilliance.</li>
                    <li><strong>Saturation Scale:</strong> Vivid (100 pts), Strong (90 pts), Medium (70 pts), Greyish (40 pts).</li>
                    <li><strong>Distribution &amp; Zoning:</strong> Even face-up appearance (100 pts) vs noticeable zoning bands (50–70 pts).</li>
                  </ul>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100 text-[11px] text-blue-900 font-medium mt-3">
                  💡 <em>Color Sub-Factor Weights:</em> Hue (40%) · Tone (25%) · Saturation (20%) · Distribution (15%)
                </div>
              </div>

              {/* 2. Clarity Card */}
              <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-teal-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                      <h3 className="text-sm font-bold text-teal-950">2. Clarity Assessment (25%)</h3>
                    </div>
                    <span className="text-[10px] font-mono font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                      Type II Corundum
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    Natural corundum crystallizes with characteristic mineral inclusions (silk, crystals, feathers) as proof of natural origin:
                  </p>

                  <ul className="text-xs text-slate-700 mt-3 space-y-1.5 list-disc list-inside">
                    <li><strong>30 cm Unaided Naked Eye:</strong> Clean (100 pts), Slight (75 pts), Noticeable (55 pts), Obvious (35 pts).</li>
                    <li><strong>10× Loupe Magnification:</strong> VVS / Clean (100 pts), Minor VS (90 pts), SI (75 pts), I / Noticeable (35 pts).</li>
                    <li><strong>Inclusion Location:</strong> Off-table perimeter inclusions score higher than center-table reflective cracks.</li>
                    <li><strong>Inclusion Severity:</strong> None (100 pts), Minor (85 pts), Moderate (65 pts), Severe (40 pts).</li>
                  </ul>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100 text-[11px] text-teal-900 font-medium mt-3">
                  💡 <em>Clarity Protocol:</em> Evaluates unaided face-up eye transparency first, followed by 10× gemmological inspection.
                </div>
              </div>

              {/* 3. Cut Card */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-indigo-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      <h3 className="text-sm font-bold text-indigo-950">3. Cut &amp; Proportions (20%)</h3>
                    </div>
                    <span className="text-[10px] font-mono font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                      Proportions
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    Evaluates faceting craftsmanship, light return, and optical performance without wasteful native cutting:
                  </p>

                  <ul className="text-xs text-slate-700 mt-3 space-y-1.5 list-disc list-inside">
                    <li><strong>Length-to-Width (L:W) Ratio:</strong> Ideal oval range 1.15 to 1.55. Extremes flag round/square or overly elongated silhouettes.</li>
                    <li><strong>Depth Percentage:</strong> Ideal 55% to 68%. Shallow cuts (&lt;55%) cause center windowing (&ldquo;see-through fish eye&rdquo;); heavy cuts (&gt;76%) hide excess belly weight.</li>
                    <li><strong>Faceting Sub-Factors:</strong> Symmetry (25%), Polish (20%), Windowing (20%), Extinction (20%), Bulging (15%).</li>
                  </ul>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 font-medium mt-3">
                  💡 <em>Depth Formula:</em> Depth Percentage = (Depth / Width) × 100
                </div>
              </div>

              {/* 4. Carat Card */}
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-purple-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                      <h3 className="text-sm font-bold text-purple-950">4. Carat Weight &amp; Size (20%)</h3>
                    </div>
                    <span className="text-[10px] font-mono font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                      Non-Linear Scarcity
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    Gemstone value scales non-linearly with weight due to geological scarcity across calibrated commercial tiers:
                  </p>

                  <ul className="text-xs text-slate-700 mt-3 space-y-1.5 list-disc list-inside">
                    <li><strong>Rarity Tiers:</strong> &lt;0.50 ct (60 pts) · 0.50–0.99 ct (70 pts) · 1.00–1.99 ct (80 pts) · 2.00–2.99 ct (90 pts) · ≥3.00 ct (100 pts).</li>
                    <li><strong>Proportional Spread Test:</strong> Compares cubic volume (L × W × Depth) to carat weight.</li>
                    <li><strong>Size Consistency Adjustment:</strong> Balanced spreads receive +5 pts; heavy pavilion belly weight receives -5 pts penalty.</li>
                  </ul>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100 text-[11px] text-purple-900 font-medium mt-3">
                  💡 <em>Spread Formula:</em> Size Consistency = (Length × Width × Depth) / Carat Weight
                </div>
              </div>
            </div>

            {/* Academic Governance Footer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Academic Model &amp; Research Disclosure</span>
              </p>
              <p>
                The 35% Color / 25% Clarity / 20% Cut / 20% Carat composite weighting is an evidence-backed deterministic mathematical model developed for university research. While grounded in GIA, Gübelin, and SSEF colored stone literature, exact scoring curves are explicitly marked provisional on all generated certificates and PDF assessment reports.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TREATMENT & ORIGIN */}
        {/* ========================================================================= */}
        {activeTab === "treatment_origin" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-8 shadow-xs">
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Treatment Impact &amp; Geographic Provenance
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Enhancement status and country of origin are major commercial valuation drivers in wholesale corundum clearing markets.
              </p>
            </div>

            {/* Side-by-Side Treatment & Provenance Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Treatment Column */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Thermal &amp; Chemical Treatment Factors</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">Natural Untreated (U)</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]">Factor 1.00</span>
                    </div>
                    <p className="text-emerald-900 leading-relaxed">
                      Gemstone has not undergone thermal modification. Retains unaltered intersecting rutile silk needles and delicate crystal suites. Commands the highest rarity premium in Ratnapura and international auctions.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Traditional Heating (H)</span>
                      <span className="font-mono font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded text-[10px]">Factor 0.90</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      High-temperature annealing dissolves silk and deepens blue or red saturation. A standard, commercially accepted practice in Sri Lankan gem markets with an approximate 10% discount relative to unheated corundum.
                    </p>
                  </div>

                  <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/80 text-rose-900 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950">Lattice Diffusion (Be / Ti)</span>
                      <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px]">Factor 0.65 – 0.78</span>
                    </div>
                    <p className="text-rose-800 leading-relaxed">
                      Color centers altered artificially via foreign chemical diffusion (Beryllium or Titanium). Must be legally disclosed under CIBJO/FTC standards; traded at a substantial discount (-22% to -35%).
                    </p>
                  </div>
                </div>
              </div>

              {/* Geographic Provenance Column */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-blue-600" />
                  <span>Geographic Origin Provenance</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950">Sri Lanka (Ceylon)</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded text-[10px]">Baseline 1.00</span>
                    </div>
                    <p className="text-blue-900 leading-relaxed">
                      World-renowned source of brightly saturated, open-tone royal blue sapphires and delicate padparadscha from alluvial gravels (Ratnapura, Pelmadulla, Elahera). Enjoys consistent liquidity in regional trading centers.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Myanmar (Burma)</span>
                      <span className="font-mono font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded text-[10px]">Baseline 1.00</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Historically celebrated for marble-hosted rubies (&ldquo;Pigeon Blood&rdquo;) and velvety royal blue sapphires from the Mogok Stone Tract.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Madagascar (Ilakaka)</span>
                      <span className="font-mono font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded text-[10px]">Baseline 1.00</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Contemporary primary deposit producing material mineralogically and visually identical to Ceylon stones, differentiated only by trace element LA-ICP-MS spectroscopy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Relative Adjustment Model & Reliability Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>Relative Multiplier Principle</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To eliminate adjustment double-counting, Open 4Cs applies <strong>relative multipliers</strong> against the benchmark reference:
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 font-mono text-[11px] text-blue-900">
                  Relative Multiplier = Candidate Factor / Reference Factor
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  • Heated Candidate vs. Heated Reference: 0.90 / 0.90 = <strong>1.00</strong> (No double discount)<br />
                  • Untreated Candidate vs. Heated Reference: 1.00 / 0.90 ≈ <strong>1.11</strong> (Unheated premium)<br />
                  • Heated Candidate vs. Untreated Reference: 0.90 / 1.00 = <strong>0.90</strong> (Heat treatment discount)
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Origin Reliability Governance</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Origin reliability ratings (High, Medium, Low, Unknown) reflect documentation strength:
                </p>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>High:</strong> Laboratory spectroscopic origin certificate on file.</li>
                  <li><strong>Medium:</strong> Dealer trade invoice and registered mining lot receipt.</li>
                  <li><strong>Low / Unknown:</strong> Seller-declared unverified claim.</li>
                </ul>
                <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60 text-[11px] text-emerald-900 font-medium">
                  ✓ Origin reliability is an audit confidence badge on reports—it does NOT arbitrarily penalize market prices.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
