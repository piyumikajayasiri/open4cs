"use client";

import React, { useState } from "react";
import Link from "next/link";
import PortalSidebar from "@/components/layout/PortalSidebar";
import ToastNotification, { ToastMessage, ToastType } from "@/components/ui/ToastNotification";
import {
  BookOpen,
  Search,
  Scissors,
  Scale,
  FlaskConical,
  MapPin,
  Play,
  ArrowRight,
  CheckCircle2,
  X,
} from "lucide-react";

interface LessonTopic {
  id: string;
  title: string;
  subtitle: string;
  lessonsCount: string;
  description: string;
  icon: React.ReactNode;
  ruleCode: string;
  estimatedTime: string;
  lessonSummary: string;
  keyPoints: string[];
}

const TOPICS_DATA: LessonTopic[] = [
  {
    id: "color",
    title: "Color",
    subtitle: "Hue · Tone · Saturation",
    lessonsCount: "12 lessons",
    description: "How Rule COL-03 turns tone 5–6 + vivid saturation into a premium.",
    icon: <BookOpen className="w-5 h-5 text-blue-600" />,
    ruleCode: "Rule COL-03",
    estimatedTime: "15 min",
    lessonSummary:
      "Color grading in corundum evaluates Hue (primary and modifier), Tone (lightness scale 1-9), and Saturation (color intensity). Tone 5-6 with Vivid saturation commands a +9% B2B benchmark premium in Sri Lankan blue sapphires.",
    keyPoints: [
      "Hue defines the spectral color (pure blue vs violetish or greenish blue).",
      "Tone 5 to 6 is the optimal window: darker stones (>7) suffer extinction; lighter stones (<4) look washed out.",
      "Vivid saturation drives over 70% of color pricing variance in Colombo auctions.",
      "Even color distribution with minimal zoning guarantees top-tier liquidity.",
    ],
  },
  {
    id: "clarity",
    title: "Clarity",
    subtitle: "Naked eye → 10× loupe",
    lessonsCount: "9 lessons",
    description: "A repeatable observation protocol with severity photos.",
    icon: <Search className="w-5 h-5 text-blue-600" />,
    ruleCode: "Rule CLA-02",
    estimatedTime: "12 min",
    lessonSummary:
      "Unlike diamonds where 10x magnification is the absolute standard, colored gemstones prioritize naked-eye visibility at 30 cm under natural or daylight-equivalent lighting, followed by 10x loupe inspection.",
    keyPoints: [
      "Eye-clean gemstones with microscopic silk needles often enhance velvet luster without penalty.",
      "Table-center inclusions draw eye focus and reduce light return up to -15%.",
      "Girdle and pavilion inclusions can frequently be disguised in jewelry mounting.",
      "Heavily included stones with structural cracks must be penalized for durability risks.",
    ],
  },
  {
    id: "cut",
    title: "Cut",
    subtitle: "Ratios · Finish · Light",
    lessonsCount: "11 lessons",
    description: "L:W tolerance, depth % and windowing checks that move price.",
    icon: <Scissors className="w-5 h-5 text-blue-600" />,
    ruleCode: "Rule CUT-02",
    estimatedTime: "14 min",
    lessonSummary:
      "Evaluates proportional geometry: face-up length-to-width ratio, depth percentage, symmetry, and crown-to-pavilion balance. Windowing allows light leak, while excessive pavilion depth adds dead weight.",
    keyPoints: [
      "Ideal oval ratio: 1.30 to 1.50 for balanced elegance.",
      "Depth between 55% and 68% delivers optimal brilliance without windowing or bulging belly.",
      "Overly deep stones (>75%) incur a cut penalty as excess carat weight yields no face-up size.",
      "Symmetry and polish ensure high light return and clean facet junctions.",
    ],
  },
  {
    id: "carat",
    title: "Carat Weight",
    subtitle: "Weight in context",
    lessonsCount: "6 lessons",
    description: "Why per-carat bands beat linear multiplication.",
    icon: <Scale className="w-5 h-5 text-blue-600" />,
    ruleCode: "Rule CAR-01",
    estimatedTime: "10 min",
    lessonSummary:
      "Gemstone pricing increases exponentially across key benchmark thresholds (e.g., 1.00 ct, 2.00 ct, 3.00 ct, and 5.00 ct) due to natural scarcity rather than linear weight multiplication.",
    keyPoints: [
      "A 2.00 ct sapphire is significantly rarer than two 1.00 ct stones of identical quality.",
      "Face-up millimeter size must correspond with carat weight (spread check).",
      "Prices adjust across discrete size brackets rather than continuous straight-line math.",
      "Stones just over milestone weights (e.g., 2.01 ct vs 1.98 ct) capture notable premium jumps.",
    ],
  },
  {
    id: "treatment",
    title: "Treatment",
    subtitle: "H · U · Diffusion",
    lessonsCount: "7 lessons",
    description: "Modifiers per treatment and what verification unlocks.",
    icon: <FlaskConical className="w-5 h-5 text-blue-600" />,
    ruleCode: "Rule TRT-04",
    estimatedTime: "12 min",
    lessonSummary:
      "Heat treatment is traditional and accepted in the sapphire trade, but unheated (natural) sapphires with laboratory verification command a 40% to 80% price premium.",
    keyPoints: [
      "Untreated/Natural (N): Rarest tier, requires certified laboratory spectrographic proof.",
      "Heated (H) standard: Standard commercial benchmark with strong market liquidity.",
      "Lattice diffusion (Beryllium) or lead glass filling incurs heavy price discounts (>70%).",
      "Reliability flag ensures unverified treatment statements cannot distort price bounds.",
    ],
  },
  {
    id: "origin",
    title: "Origin",
    subtitle: "Ceylon premium",
    lessonsCount: "5 lessons",
    description: "When the origin premium applies — and when it is capped.",
    icon: <MapPin className="w-5 h-5 text-blue-600" />,
    ruleCode: "Rule ORI-01",
    estimatedTime: "8 min",
    lessonSummary:
      "Geographic origin (Sri Lanka / Ceylon, Kashmir, Burma, Madagascar) carries historic branding premiums, but the engine only applies full premiums when supported by accredited gemological lab reports.",
    keyPoints: [
      "Ceylon sapphires are revered for high clarity, open color, and lack of murky extinction.",
      "Self-claimed or seller-provided origin receives conservative baseline scoring.",
      "Origin cannot compensate for low color or poor clarity: beauty always precedes origin.",
      "Ratnapura and Elahera mine tracts produce the premier corundum referenced in engine rule sets.",
    ],
  },
];

export default function LearnPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentMode, setStudentMode] = useState(true);
  const [activeTopic, setActiveTopic] = useState<LessonTopic | null>(null);

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTopics = TOPICS_DATA.filter((topic) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      topic.title.toLowerCase().includes(term) ||
      topic.subtitle.toLowerCase().includes(term) ||
      topic.description.toLowerCase().includes(term) ||
      topic.ruleCode.toLowerCase().includes(term)
    );
  });

  const handleToggleStudentMode = () => {
    setStudentMode(!studentMode);
    showToast(
      !studentMode
        ? "Student Mode activated: In-depth rule explainers and classroom glossary enabled."
        : "Trader Mode activated: Switched to concise commercial grading rules.",
      "info"
    );
  };

  const handleFeaturedLesson = () => {
    const colorTopic = TOPICS_DATA.find((t) => t.id === "color") || TOPICS_DATA[0];
    setActiveTopic(colorTopic);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Left Sidebar */}
      <PortalSidebar activeItem="learn" />

      {/* Main Learning Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Title Header with Mode Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Learning / 4Cs Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Classroom-grade explainers with the exact rules the engine uses
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleToggleStudentMode}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer shadow-2xs ${
                studentMode
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 text-slate-700 border-slate-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${studentMode ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span>{studentMode ? "Student mode · Glossary on" : "Trader mode · Concise rules"}</span>
            </button>
          </div>
        </div>

        {/* Featured Lesson Dark Card Banner */}
        <div className="bg-[#0B1528] rounded-2xl p-6 sm:p-7 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              FEATURED LESSON
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              Why tone 6 vivid blue earns +9% — Rule COL-03 explained
            </h2>
            <p className="text-xs text-slate-400 pt-1 flex items-center gap-1.5">
              <span>8 min</span>
              <span>·</span>
              <span>with reference swatches and market photos</span>
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              type="button"
              onClick={handleFeaturedLesson}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-xs transition duration-150 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Continue lesson</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lessons, terms, rules..."
            className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
          />
        </div>

        {/* 6 Topic Cards (3x2 Grid) */}
        {filteredTopics.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">No lessons match your search.</p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Clear search query
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition duration-200 group"
              >
                <div>
                  {/* Top Header Row with Icon & Lessons Count Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50/80 border border-blue-100/80 flex items-center justify-center">
                      {topic.icon}
                    </div>

                    <span className="text-xs text-slate-400 font-medium">
                      {topic.lessonsCount}
                    </span>
                  </div>

                  {/* Card Main Info */}
                  <div className="mt-4 space-y-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {topic.title}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600">
                      {topic.subtitle}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed pt-1.5 font-normal">
                      {topic.description}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-5 border-t border-slate-100 mt-5">
                  <button
                    type="button"
                    onClick={() => setActiveTopic(topic)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer transition group-hover:translate-x-0.5 duration-150"
                  >
                    <span>Open topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ================= TOPIC EXPLAINER MODAL ================= */}
      {activeTopic && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                    {activeTopic.ruleCode}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {activeTopic.estimatedTime} reading
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {activeTopic.title} Masterclass
                </h3>
                <p className="text-xs text-blue-600 font-semibold">
                  {activeTopic.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTopic(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Text Box */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {activeTopic.lessonSummary}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Classroom Takeaways
              </h4>
              <div className="space-y-2">
                {activeTopic.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
              <button
                type="button"
                onClick={() => setActiveTopic(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close Explainer
              </button>

              <Link
                href="/evaluate/gemstone"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>Evaluate with this Rule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
