"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserCategory = "STUDENT" | "TRADER" | "GEMOLOGIST" | "PROFESSIONAL";

type UserRole = "USER" | "ADMIN";
type UserStatus = "ACTIVE" | "INACTIVE";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function CreateUserPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [category, setCategory] = useState<UserCategory>("STUDENT");
  const [role, setRole] = useState<UserRole>("USER");
  const [status, setStatus] = useState<UserStatus>("ACTIVE");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          category,
          role,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create user.");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/admin" className="hover:text-blue-600">
            Admin
          </Link>
          <span>/</span>
          <Link href="/admin/users" className="hover:text-blue-600">
            User Management
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-800">Create User</span>
        </div>

        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Account Management
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Create New User
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create an account for a student, trader, gemologist, or professional
            using Open 4Cs.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-base font-bold">Personal Information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the user's basic account details.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <label className="block text-sm font-semibold text-slate-700">
                Full Name <span className="text-red-500">*</span>
                <input
                  className={inputClass}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter full name"
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Email Address <span className="text-red-500">*</span>
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="user@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Password <span className="text-red-500">*</span>
                <input
                  className={inputClass}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Confirm Password <span className="text-red-500">*</span>
                <input
                  className={inputClass}
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </label>

              <div className="sm:col-span-2">
                <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) => setShowPassword(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Show passwords
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-base font-bold">Role and Access</h2>
              <p className="mt-1 text-sm text-slate-500">
                Select the account category, permissions, and status.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <label className="block text-sm font-semibold text-slate-700">
                User Category <span className="text-red-500">*</span>
                <select
                  className={inputClass}
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as UserCategory)
                  }
                >
                  <option value="STUDENT">Student</option>
                  <option value="TRADER">Trader</option>
                  <option value="GEMOLOGIST">Gemologist</option>
                  <option value="PROFESSIONAL">Professional</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Account Role <span className="text-red-500">*</span>
                <select
                  className={inputClass}
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                >
                  <option value="USER">Standard User</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Initial Account Status
                <select
                  className={inputClass}
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as UserStatus)
                  }
                >
                  <option value="ACTIVE">Active — can sign in</option>
                  <option value="INACTIVE">Inactive — sign-in blocked</option>
                </select>
              </label>

              {role === "ADMIN" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:col-span-2">
                  <strong>Administrator access:</strong> This account will have
                  administrative permissions. Only assign this role to trusted
                  people.
                </div>
              )}
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-[#101F3D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating Account..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
