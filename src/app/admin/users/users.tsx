"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type UserCategory = "STUDENT" | "TRADER" | "GEMOLOGIST" | "PROFESSIONAL";

type UserRole = "USER" | "ADMIN";
type UserStatus = "ACTIVE" | "INACTIVE";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  category: UserCategory;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
};

const categories = [
  { label: "All Categories", value: "" },
  { label: "Student", value: "STUDENT" },
  { label: "Trader", value: "TRADER" },
  { label: "Gemologist", value: "GEMOLOGIST" },
  { label: "Professional", value: "PROFESSIONAL" },
];

const roles = [
  { label: "All Roles", value: "" },
  { label: "User", value: "USER" },
  { label: "Administrator", value: "ADMIN" },
];

const statuses = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function categoryLabel(category: UserCategory) {
  const labels: Record<UserCategory, string> = {
    STUDENT: "Student",
    TRADER: "Trader",
    GEMOLOGIST: "Gemologist",
    PROFESSIONAL: "Professional",
  };

  return labels[category] ?? category;
}

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const params = new URLSearchParams();

        if (search.trim()) params.set("search", search.trim());
        if (category) params.set("category", category);
        if (role) params.set("role", role);
        if (status) params.set("status", status);

        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load users.");
        }

        if (!Array.isArray(data.users)) {
          throw new Error("Unexpected response from the users API.");
        }

        setUsers(data.users);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, category, role, status],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadUsers();
    }, 250);

    return () => clearTimeout(timeout);
  }, [loadUsers]);

  async function toggleStatus(user: AdminUser) {
    const nextStatus: UserStatus =
      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setUpdatingId(user._id);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to update account status.",
        );
      }

      setPendingUser(null);
      await loadUsers(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update account status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }
  const activeCount = users.filter((user) => user.status === "ACTIVE").length;

  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  const inactiveCount = users.filter(
    (user) => user.status === "INACTIVE",
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Administration
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              User Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage Open 4Cs accounts, roles, categories and access.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadUsers(false)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <span aria-hidden="true">↻</span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              href="/admin/users/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101F3D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
            >
              <span aria-hidden="true">+</span>
              Create User
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Matching Users"
            value={loading ? "—" : users.length}
            description="Accounts matching current filters"
            icon="👥"
          />

          <SummaryCard
            title="Active Users"
            value={loading ? "—" : activeCount}
            description="Active accounts in this result"
            icon="✓"
          />

          <SummaryCard
            title="Administrators"
            value={loading ? "—" : adminCount}
            description={`${inactiveCount} inactive in this result`}
            icon="⚙"
          />
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void loadUsers()}
              className="shrink-0 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Search and filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="user-search"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Search users
              </label>

              <input
                id="user-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email..."
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Category
              </label>

              <select
                id="category-filter"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="role-filter"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Role
              </label>

              <select
                id="role-filter"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className={inputClass}
              >
                {roles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={inputClass}
              >
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              {loading
                ? "Loading accounts..."
                : `${users.length} matching account${users.length === 1 ? "" : "s"}`}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("");
                setRole("");
                setStatus("");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        </section>

        {/* User table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold">Registered Users</h2>
              <p className="mt-1 text-xs text-slate-500">
                Account information and access controls
              </p>
            </div>

            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {loading ? "..." : users.length}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm text-slate-500">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                👥
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                No users found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Try changing your filters or create a new user account.
              </p>

              <Link
                href="/admin/users/create"
                className="mt-4 rounded-lg bg-[#101F3D] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Create User
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">User</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                            {user.name
                              .split(/\s+/)
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-56 truncate text-sm font-semibold text-slate-800">
                              {user.name}
                            </p>
                            <p className="max-w-56 truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {categoryLabel(user.category)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-violet-50 text-violet-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role === "ADMIN" ? "Admin" : "User"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.status === "ACTIVE"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />
                          {user.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user._id}`}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                          >
                            View / Edit
                          </Link>

                          <button
                            type="button"
                            disabled={updatingId === user._id}
                            onClick={() => void toggleStatus(user)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.status === "ACTIVE"
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {updatingId === user._id
                              ? "Updating..."
                              : user.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-slate-400">
          Open 4Cs · Admin User Management
        </p>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  );
}
