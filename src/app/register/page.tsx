"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const category = "Student";

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamic Password Strength Calculator
  function getPasswordStrength(pass: string) {
    if (!pass) return { score: 0, label: "None", color: "text-slate-400" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "text-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "text-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "text-emerald-500" };
    return { score: 4, label: "Strong", color: "text-emerald-600 font-semibold" };
  }

  const strength = getPasswordStrength(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }

      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-100">
        
        {/* Header & Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#0B132B] flex items-center justify-center text-sky-400 shadow-md">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
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

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Create your account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sign up to evaluate gemstones using calibrated gemmological standards.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-medium">
            {message}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Amaya Fernando"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
            />
          </div>

          {/* Email */}
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
              placeholder="amaya@uni.lk"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
            />
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="samplepassword"
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="samplepassword"
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password Strength Indicator */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Password strength</span>
              <span className={strength.color}>{strength.label}</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    seg <= strength.score ? "bg-emerald-600" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 pt-0.5">
              <span>✓</span>
              <span>12+ characters with a number and symbol</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B132B] hover:bg-[#1C2A4D] text-white font-semibold py-3 rounded-xl shadow-md text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Already have an account link */}
        <div className="text-center text-xs sm:text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </div>

      </div>
    </main>
  );
}
