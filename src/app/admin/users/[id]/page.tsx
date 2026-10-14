"use client";

import { use, useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserCategory = "STUDENT" | "TRADER" | "GEMOLOGIST" | "PROFESSIONAL";

type UserRole = "USER" | "ADMIN";
type UserStatus = "ACTIVE" | "INACTIVE";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  category: UserCategory;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<UserCategory>("STUDENT");
  const [role, setRole] = useState<UserRole>("USER");
  const [status, setStatus] = useState<UserStatus>("ACTIVE");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/admin/users/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load user details.");
        }

        if (cancelled) return;

        const loadedUser = data.user as AdminUser;

        setUser(loadedUser);
        setName(loadedUser.name);
        setCategory(loadedUser.category);
        setRole(loadedUser.role);
        setStatus(loadedUser.status);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          role,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update user.");
      }

      const updatedUser = data.user as AdminUser;

      setUser(updatedUser);
      setName(updatedUser.name);
      setCategory(updatedUser.category);
      setRole(updatedUser.role);
      setStatus(updatedUser.status);
      setSuccess("User details updated successfully.");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update user.");
    } finally {
      setSaving(false);
    }
  }

  function resetChanges() {
    if (!user) return;

    setName(user.name);
    setCategory(user.category);
    setRole(user.role);
    setStatus(user.status);
    setError("");
    setSuccess("");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading user details...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load user
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "This user could not be found."}
          </p>

          <Link
            href="/admin/users"
            className="mt-5 inline-flex rounded-xl bg-[#101F3D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
          >
            Back to User Management
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/admin" className="hover:text-blue-600">
            Admin
          </Link>

          <span>/</span>

          <Link href="/admin/users" className="hover:text-blue-600">
            User Management
          </Link>

          <span>/</span>

          <span className="font-medium text-slate-800">User Details</span>
        </div>

        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Account Management
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              User Details
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View and manage this Open 4Cs account.
            </p>
          </div>

          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Users
          </Link>
        </div>

        {/* Profile card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">
              {user.name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="break-words text-xl font-bold">{user.name}</h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {user.email}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  {user.role === "ADMIN" ? "Administrator" : "Standard User"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {user.status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">User ID</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-700">
                {user._id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Account Created
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Not available"}
              </p>
            </div>
          </div>
        </section>

        {/* Edit form */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="text-base font-bold">Edit Account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update the user's profile, access role and status.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Full Name
                <input
                  className={inputClass}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Email Address
                <input
                  className={`${inputClass} cursor-not-allowed bg-slate-50`}
                  type="email"
                  value={user.email}
                  disabled
                  readOnly
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  Email editing is not enabled here.
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                User Category
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
                Account Role
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
                Account Status
                <select
                  className={inputClass}
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as UserStatus)
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  Inactive users cannot sign in again while their account
                  remains inactive.
                </span>
              </label>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
              >
                {success}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetChanges}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Reset Changes
              </button>

              <button
                type="submit"
                disabled={saving || name.trim().length < 2}
                className="rounded-xl bg-[#101F3D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
