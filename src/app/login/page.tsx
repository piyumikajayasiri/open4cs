"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Invalid email or password.");
        return;
      }

      // Successful login -> Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-2 border border-slate-100 min-h-[580px]">
        
        {/* Left Column: Form Panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Logo & Brand Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-[#0B132B] flex items-center justify-center text-sky-400 shadow-md">
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 9l10 13L22 9L12 2zm0 3.2L18.6 9 12 18.2 5.4 9 12 5.2z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg leading-none block">
                  Open 4Cs
                </span>
                <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase block mt-0.5">
                  GEMSTONE EVALUATION
                </span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Sign in to continue your gemstone evaluations.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nimal@traders.lk"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.046 10.046 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-3.269 1.126a3.001 3.001 0 01-4.243-4.243m4.243 4.243L3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>

                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact your system administrator or CAGS panel to reset your password.");
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B132B] hover:bg-[#1C2A4D] text-white font-semibold py-3 rounded-xl shadow-md text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            {/* Create Account Link */}
            <div className="text-center text-xs sm:text-sm text-slate-500 mt-5">
              New to Open 4Cs?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:underline"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Yellow Amber Disclaimer Banner */}
          <div className="mt-6 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-3 text-xs leading-relaxed text-[#92400E] flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeWidth="2" d="M12 8v4m0 4h.01" />
            </svg>
            <span>
              Outputs are suggested B2B market price ranges for valuation and reference — not certifications or guaranteed prices.
            </span>
          </div>
        </div>

        {/* Right Column: Dark Visual Branding Panel */}
        <div className="bg-[#070D1E] p-8 sm:p-10 flex-col justify-end text-white relative overflow-hidden hidden lg:flex">
          {/* Subtle Background Graphics Watermark */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <svg className="w-80 h-80 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="0.5" d="M12 2L2 9l10 13L22 9L12 2zm0 3.2L18.6 9 12 18.2 5.4 9 12 5.2z" />
            </svg>
          </div>

          {/* Bottom Card Content */}
          <div className="relative z-10 space-y-4">
            <div className="inline-block rounded-full bg-blue-950/80 border border-blue-700/40 px-3 py-1 text-[10px] font-bold tracking-widest text-sky-400 uppercase">
              RULE-BASED · TRANSPARENT · EDUCATIONAL
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              “Every score traces back to a published rule and a real reference stone.”
            </h2>

            <p className="text-xs text-slate-400 font-medium">
              Prof. CAGS Gemmology Panel · University of Moratuwa
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
