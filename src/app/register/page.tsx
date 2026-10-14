"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gem,
  GraduationCap,
  Building2,
  FlaskConical,
  UserRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

type UserCategory = "STUDENT" | "TRADER" | "GEMOLOGIST" | "PROFESSIONAL";

const categories: {
  value: UserCategory;
  label: string;
  icon: typeof GraduationCap;
}[] = [
  { value: "STUDENT", label: "Student", icon: GraduationCap },
  { value: "TRADER", label: "Trader", icon: Building2 },
  { value: "GEMOLOGIST", label: "Gemologist", icon: FlaskConical },
  { value: "PROFESSIONAL", label: "Professional", icon: UserRound },
];

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [category, setCategory] = useState<UserCategory>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 12,
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
    }),
    [password],
  );

  const strength = Object.values(passwordChecks).filter(Boolean).length;

  const strengthLabel =
    password.length === 0
      ? "Not entered"
      : strength <= 2
        ? "Weak"
        : strength <= 3
          ? "Fair"
          : strength === 4
            ? "Good"
            : "Strong";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 12) {
      setError("Your password must contain at least 12 characters.");
      return;
    }

    if (!passwordChecks.number || !passwordChecks.symbol) {
      setError("Include at least one number and one symbol in your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      setSuccess("Account created successfully. Redirecting to sign in...");

      window.setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 900);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

  const labelClass = "mb-1.5 block text-xs font-semibold text-slate-700";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4 py-8">
      <section className="w-full max-w-[480px] rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
        {/* Brand */}
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Gem size={21} strokeWidth={1.8} />
          </div>

          <div>
            <p className="text-base font-bold leading-tight text-slate-900">
              Open 4Cs
            </p>
            <p className="text-xs text-slate-500">Gemstone Evaluation</p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Statements and guidance adapt to your category.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={100}
              className={inputClass}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              className={inputClass}
              required
            />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClass} pr-10`}
                  minLength={12}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={`${inputClass} pr-10`}
                  required
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password strength */}
          <div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-600">
                Password strength
              </span>
              <span
                className={
                  strength >= 4
                    ? "font-semibold text-emerald-600"
                    : "text-slate-500"
                }
              >
                {strengthLabel}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((segment) => (
                <div
                  key={segment}
                  className={`h-1.5 rounded-full transition-colors ${
                    strength >= segment
                      ? strength <= 2
                        ? "bg-red-500"
                        : strength === 3
                          ? "bg-amber-500"
                          : "bg-teal-600"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
              <span className={passwordChecks.length ? "text-teal-700" : ""}>
                {passwordChecks.length ? "✓" : "○"} 12+ characters
              </span>
              <span className={passwordChecks.number ? "text-teal-700" : ""}>
                {passwordChecks.number ? "✓" : "○"} Number
              </span>
              <span className={passwordChecks.symbol ? "text-teal-700" : ""}>
                {passwordChecks.symbol ? "✓" : "○"} Symbol
              </span>
            </div>
          </div>

          {/* Category */}
          <fieldset className="pt-1">
            <legend className={`${labelClass} mb-2`}>User Category</legend>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((item) => {
                const Icon = item.icon;
                const selected = category === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(item.value)}
                    className={`flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 transition ${
                      selected
                        ? "border-2 border-slate-900 bg-slate-50 text-slate-900"
                        : "border-slate-200 text-slate-500 hover:border-slate-400"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span className="text-[11px] font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Feedback */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700"
            >
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-5 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </section>
    </main>
  );
}
