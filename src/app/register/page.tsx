"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const CATEGORY_DESCRIPTIONS = [
  {
    value: "Student",
    label: "Student / Learner",
    description: "Learning gemstone evaluation basics and exploring standard valuation concepts.",
  },
  {
    value: "Trader",
    label: "Trader / Gem Dealer",
    description: "Buying, selling, or trading gemstones with standard commercial market benchmarks.",
  },
  {
    value: "Gemologist",
    label: "Gemologist / Evaluator",
    description: "Conducting technical 4C assessments, laboratory testing, and origin analysis.",
  },
  {
    value: "Professional",
    label: "Industry Professional",
    description: "Jewelers, appraisers, and business executives needing structured pricing tools.",
  },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("Student");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
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

      setMessage("Registration successful. You can now log in.");

      setName("");
      setEmail("");
      setPassword("");
      setCategory("Student");
    } catch {
      setError("Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:items-start lg:py-20">
        <section className="lg:sticky lg:top-28">
          <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
            Create Your Account
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Start evaluating gemstones with confidence
          </h1>

          <p className="mt-4 text-base leading-7 text-[var(--muted)] sm:text-lg">
            Join Open 4Cs to save your evaluations, track valuation history, and access standardized market pricing reference tools.
          </p>

          <div className="mt-8 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Which category describes you best?
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {CATEGORY_DESCRIPTIONS.map((cat) => (
                <div
                  key={cat.value}
                  className={`rounded-xl border p-4 transition ${
                    category === cat.value
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]/40"
                      : "border-[var(--border)] bg-white"
                  }`}
                >
                  <p className="font-semibold text-sm">{cat.label}</p>
                  <p className="mt-1 text-xs text-[var(--muted)] leading-5">
                    {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Register</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Fill in your details below to create your free account.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">{message}</p>
              <p className="mt-1 text-emerald-700">
                <Link href="/login" className="underline hover:text-emerald-900">
                  Click here to log in to your new account.
                </Link>
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
                required
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium">
                User Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="Student">Student / Learner</option>
                <option value="Trader">Trader / Gem Dealer</option>
                <option value="Gemologist">Gemologist / Evaluator</option>
                <option value="Professional">Industry Professional</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 border-t border-[var(--border)] pt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] underline"
            >
              Log in instead
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
