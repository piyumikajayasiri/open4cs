"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EvaluationComparison from "@/components/gemstone/EvaluationComparison";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  category: string;
  role: "USER" | "CAGS_ADMIN";
};

type EvaluationItem = {
  _id: string;
  gemstoneId?: any;
  ruleVersion?: string;
  status?: string;
  createdAt?: string;
  result?: {
    overall4C?: { score: number | null };
    color?: { score: number | null };
    clarity?: { score: number | null };
    cut?: { score: number | null };
    carat?: { score: number | null };
  };
  priceSuggestion?: {
    status?: string;
    currency?: string | null;
    suggestedPrice?: number | null;
    minimumPrice?: number | null;
    maximumPrice?: number | null;
    formattedPriceRange?: string | null;
  };
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        setUser(userData.user);

        const evalRes = await fetch("/api/evaluations");
        if (evalRes.ok) {
          const evalData = await evalRes.json();
          setEvaluations(Array.isArray(evalData) ? evalData : []);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Unable to load user dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  }

  function handleDownloadReport(id: string) {
    window.open(`/api/evaluations/${id}/report`, "_blank");
  }

  function toggleCompare(id: string) {
    if (comparingIds.includes(id)) {
      setComparingIds(comparingIds.filter((item) => item !== id));
    } else {
      if (comparingIds.length >= 3) {
        alert("You can compare up to 3 evaluations at a time.");
        return;
      }
      setComparingIds([...comparingIds, id]);
    }
  }

  // Sample data fallback if no evaluations exist in DB yet
  const sampleEvaluations: EvaluationItem[] = [
    {
      _id: "EV-2026-0847",
      gemstoneId: { variety: "Ceylon Blue Sapphire", caratWeight: 1.8 },
      status: "COMPLETED",
      createdAt: "2026-09-24T10:00:00.000Z",
      result: { overall4C: { score: 8.4 } },
      priceSuggestion: { formattedPriceRange: "LKR 1.42M – 1.68M" },
    },
    {
      _id: "EV-2026-0841",
      gemstoneId: { variety: "Padparadscha", caratWeight: 2.1 },
      status: "COMPLETED",
      createdAt: "2026-09-21T14:30:00.000Z",
      result: { overall4C: { score: 7.8 } },
      priceSuggestion: { formattedPriceRange: "LKR 2.05M – 2.40M" },
    },
    {
      _id: "EV-2026-0839",
      gemstoneId: { variety: "Pink Sapphire", caratWeight: 1.2 },
      status: "DRAFT",
      createdAt: "2026-09-19T09:15:00.000Z",
      result: { overall4C: { score: null } },
      priceSuggestion: { formattedPriceRange: "—" },
    },
    {
      _id: "EV-2026-0832",
      gemstoneId: { variety: "Yellow Sapphire", caratWeight: 1.5 },
      status: "COMPLETED",
      createdAt: "2026-09-14T16:45:00.000Z",
      result: { overall4C: { score: 7.1 } },
      priceSuggestion: { formattedPriceRange: "LKR 310K – 385K" },
    },
  ];

  const displayEvaluations = evaluations.length > 0 ? evaluations : sampleEvaluations;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Format initials from user name
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NP";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-64 bg-[#070D1E] text-white flex flex-col justify-between p-4 flex-shrink-0 min-h-screen sticky top-0 h-screen border-r border-slate-800">
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 9l10 13L22 9L12 2zm0 3.2L18.6 9 12 18.2 5.4 9 12 5.2z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-base leading-none block">
                Open 4Cs
              </span>
              <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase block mt-1">
                Gemstone Evaluation
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab("dashboard"); setIsComparing(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "dashboard" && !isComparing
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard</span>
            </button>

            <Link
              href="/#evaluation"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Evaluation</span>
            </Link>

            <button
              onClick={() => { setActiveTab("evaluations"); setIsComparing(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "evaluations"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
              <span>My Evaluations</span>
            </button>

            <button
              onClick={() => { setActiveTab("history"); setIsComparing(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "history"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Evaluation History</span>
            </button>

            <button
              onClick={() => { setIsComparing(true); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isComparing
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Compare Gemstones</span>
            </button>

            <button
              onClick={() => alert("Report generation center: Select any evaluation below to download the official PDF.")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Reports</span>
            </button>

            <Link
              href="/#evaluation"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Gemstone Catalogue</span>
            </Link>

            <Link
              href="/learn"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Learning / 4Cs Guide</span>
            </Link>

            {user?.role === "CAGS_ADMIN" && (
              <Link
                href="/admin"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-950/40 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <span>CAGS Admin Portal</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User Profile Card Footer */}
        <div className="bg-[#121B36] rounded-2xl p-3 flex items-center justify-between border border-slate-700/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Nimal Perera"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.category || "Trader · Colombo"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg transition"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header & Greetings */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Good Morning, {user?.name?.split(" ")[0] || "Nimal"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tuesday, September 24 · Rule version 4.2 active · 6 reference records updated this week
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("history")}
              className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
            </button>

            <Link
              href="/#evaluation"
              className="bg-[#070D1E] hover:bg-[#152347] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ New Evaluation</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* ================= COMPARING VIEW OVERLAY ================= */}
        {isComparing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Compare Gemstone Evaluations</h2>
              <button
                onClick={() => setIsComparing(false)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Back to Dashboard
              </button>
            </div>
            <EvaluationComparison
              evaluations={(evaluations as any[]).map((e) => ({
                _id: e._id,
                variety: typeof e.gemstoneId === "object" ? e.gemstoneId?.variety || "Corundum" : "Ceylon Blue Sapphire",
                caratWeight: `${typeof e.gemstoneId === "object" ? e.gemstoneId?.caratWeight || 1.5 : 1.5} ct`,
                overallScore: e.result?.overall4C?.score || 8.0,
                colorScore: e.result?.color?.score || 8.2,
                clarityScore: e.result?.clarity?.score || 7.9,
                cutScore: e.result?.cut?.score || 8.1,
                caratScore: e.result?.carat?.score || 8.0,
                treatmentStatus: "Heated",
                originValue: "Sri Lanka",
                suggestedPriceText: e.priceSuggestion?.formattedPriceRange || "LKR 1.5M",
                priceRangeText: e.priceSuggestion?.formattedPriceRange || "LKR 1.4M – 1.6M",
                measurementReliability: "High",
                treatmentReliability: "Medium",
                originReliability: "High",
                createdAt: e.createdAt || new Date().toISOString(),
              }))}
            />
          </div>
        ) : (
          <>
            {/* ================= 4 METRICS CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1 */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Evaluations</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {evaluations.length > 0 ? evaluations.length : 48}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      +6 this month
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Saved Evaluations</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-slate-900">12</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Drafts & finalised</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Evaluations This Month</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-slate-900">9</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Across 3 varieties</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Generated Reports</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-slate-900">21</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">PDF · A4 lab format</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

            </div>

            {/* ================= MAIN CONTENT GRID ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Recent Evaluations Table */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold tracking-wider text-slate-800 uppercase">
                    RECENT EVALUATIONS
                  </h2>
                  <button
                    onClick={() => setActiveTab("evaluations")}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View all
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        <th className="py-3 px-2">EVALUATION</th>
                        <th className="py-3 px-2">VARIETY</th>
                        <th className="py-3 px-2">OVERALL</th>
                        <th className="py-3 px-2">SUGGESTED RANGE</th>
                        <th className="py-3 px-2">DATE</th>
                        <th className="py-3 px-2 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {displayEvaluations.map((item) => {
                        const evalId = item._id.startsWith("EV-") ? item._id : `EV-2026-${item._id.slice(-4)}`;
                        const variety =
                          typeof item.gemstoneId === "object"
                            ? item.gemstoneId?.variety ?? "Corundum"
                            : "Ceylon Blue Sapphire";
                        const score = item.result?.overall4C?.score;
                        const isDraft = item.status === "DRAFT" || score === null;
                        
                        let scoreBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                        let scoreLabel = score ? `${score.toFixed(1)} ${score >= 8 ? "Excellent" : score >= 7.5 ? "Very Good" : "Good"}` : "Draft";
                        if (isDraft) {
                          scoreBadgeClass = "bg-slate-100 text-slate-500 border-slate-200";
                          scoreLabel = "Draft";
                        }

                        const dateStr = item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "Sep 24";

                        const priceStr = item.priceSuggestion?.formattedPriceRange || "—";

                        return (
                          <tr key={item._id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-2 font-bold text-blue-600">
                              {evalId}
                            </td>
                            <td className="py-3.5 px-2 font-medium text-slate-700">
                              {variety}
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`inline-block border px-2.5 py-1 rounded-md font-bold text-[11px] ${scoreBadgeClass}`}>
                                {scoreLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 font-semibold text-slate-900">
                              {priceStr}
                            </td>
                            <td className="py-3.5 px-2 text-slate-400">
                              {dateStr}
                            </td>
                            <td className="py-3.5 px-2 text-right space-x-2">
                              <button
                                onClick={() => alert(`View details for ${evalId}`)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                                title="View details"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => {
                                  toggleCompare(item._id);
                                  setIsComparing(true);
                                }}
                                className="text-slate-400 hover:text-blue-600 p-1"
                                title="Compare"
                              >
                                📊
                              </button>
                              <button
                                onClick={() => handleDownloadReport(item._id)}
                                className="text-slate-400 hover:text-emerald-600 p-1"
                                title="Download PDF Report"
                              >
                                📥
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Quick Start + Recent Activity */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Quick Start Card */}
                <div className="bg-[#070D1E] text-white rounded-2xl p-5 border border-slate-800 shadow-md">
                  <h3 className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-3.5">
                    QUICK START
                  </h3>

                  <div className="space-y-2">
                    <Link
                      href="/#evaluation"
                      className="w-full bg-[#121B36] hover:bg-[#1A264B] text-slate-100 font-semibold text-xs rounded-xl py-2.5 px-3.5 flex items-center gap-3 transition border border-slate-700/40"
                    >
                      <span className="text-blue-400 text-xs">▶</span>
                      <span>Start New Evaluation</span>
                    </Link>

                    <button
                      onClick={() => setActiveTab("history")}
                      className="w-full bg-[#121B36] hover:bg-[#1A264B] text-slate-100 font-semibold text-xs rounded-xl py-2.5 px-3.5 flex items-center gap-3 transition border border-slate-700/40 text-left"
                    >
                      <span className="text-blue-400 text-xs">🕒</span>
                      <span>View History</span>
                    </button>

                    <button
                      onClick={() => setIsComparing(true)}
                      className="w-full bg-[#121B36] hover:bg-[#1A264B] text-slate-100 font-semibold text-xs rounded-xl py-2.5 px-3.5 flex items-center gap-3 transition border border-slate-700/40 text-left"
                    >
                      <span className="text-blue-400 text-xs">📊</span>
                      <span>Compare Gemstones</span>
                    </button>

                    <Link
                      href="/learn"
                      className="w-full bg-[#121B36] hover:bg-[#1A264B] text-slate-100 font-semibold text-xs rounded-xl py-2.5 px-3.5 flex items-center gap-3 transition border border-slate-700/40"
                    >
                      <span className="text-blue-400 text-xs">📖</span>
                      <span>Learn 4Cs</span>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                  <h3 className="text-[10px] font-extrabold tracking-wider text-slate-800 uppercase">
                    RECENT ACTIVITY
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        ✓
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">EV-2026-0847 finalised</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">2h ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        📄
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Draft saved · Pink Sapphire</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Yesterday</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        📥
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Report RG-118 downloaded</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sep 21</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* ================= AMBER DISCLAIMER BANNER ================= */}
            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 text-xs font-medium text-[#92400E] flex items-center gap-3">
              <svg className="w-4 h-4 text-[#D97706] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Suggested B2B Market Price Range only — not an official valuation, certification, or guaranteed selling price.
              </span>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
