"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Gemstone = {
  _id: string;
  code: string;
  name: string;
  species: string;
  supportedShapes: string[];
  supportedOrigin: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
};

export default function GemstoneCataloguePage() {
  const [gemstones, setGemstones] = useState<Gemstone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadGemstones() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/gemstones", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load gemstones.");
      }

      setGemstones(data.gemstones || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load gemstone catalogue.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGemstones();
  }, []);

  const filteredGemstones = useMemo(() => {
    return gemstones.filter((gemstone) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        gemstone.name.toLowerCase().includes(searchValue) ||
        gemstone.code.toLowerCase().includes(searchValue) ||
        gemstone.species.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || gemstone.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [gemstones, search, statusFilter]);
  async function handleStatusChange(
    gemstone: Gemstone,
    newStatus: "ACTIVE" | "INACTIVE",
  ) {
    const action = newStatus === "ACTIVE" ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${gemstone.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(`/api/admin/gemstones/${gemstone._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...gemstone,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to ${action} gemstone variety.`,
        );
      }

      setGemstones((current) =>
        current.map((item) =>
          item._id === gemstone._id ? { ...item, status: newStatus } : item,
        ),
      );

      setOpenActionId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Unable to ${action} gemstone variety.`,
      );
    } finally {
      setActionLoading(false);
    }
  }
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-500">
            CAGS Administration
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Gemstone Catalogue Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Manage the gemstone varieties supported by the Open 4Cs system.
          </p>
        </div>

        <Link
          href="/admin/gemstones/new"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <span className="text-lg leading-none">+</span>
          Add Variety
        </Link>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>

              <input
                type="text"
                placeholder="Search varieties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
              Loading catalogue...
            </div>
          </div>
        ) : filteredGemstones.length === 0 ? (
          /* Empty state */
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 7.2 7.5 4.2 7.5-4.2M12 11.4V21"
                />
              </svg>
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No gemstone varieties found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search || statusFilter !== "ALL"
                ? "Try changing your search or filter."
                : "Add the first supported gemstone variety to the catalogue."}
            </p>

            {!search && statusFilter === "ALL" && (
              <Link
                href="/admin/gemstones/new"
                className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add Variety
              </Link>
            )}
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Variety
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Species / Shapes
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Origin
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="w-20 px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredGemstones.map((gemstone) => (
                  <tr
                    key={gemstone._id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Variety */}
                    <td className="px-6 py-5">
                      <div>
                        <Link
                          href={`/admin/gemstones/${gemstone._id}`}
                          className="font-medium text-slate-900 hover:text-slate-600"
                        >
                          {gemstone.name}
                        </Link>

                        <p className="mt-1 text-xs text-slate-400">
                          {gemstone.code}
                        </p>
                      </div>
                    </td>

                    {/* Species / Shapes */}
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-700">
                        {gemstone.species}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {(gemstone.supportedShapes ?? []).length > 0 ? (
                          (gemstone.supportedShapes ?? []).map((shape) => (
                            <span
                              key={shape}
                              className="text-xs text-slate-500"
                            >
                              {shape}
                              {shape !==
                              gemstone.supportedShapes[
                                gemstone.supportedShapes.length - 1
                              ]
                                ? " /"
                                : ""}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            No shapes specified
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Origin */}
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-700">
                        {gemstone.supportedOrigin}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      {gemstone.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionId(
                              openActionId === gemstone._id
                                ? null
                                : gemstone._id,
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Actions for ${gemstone.name}`}
                        >
                          <span className="text-lg leading-none">⋮</span>
                        </button>

                        {openActionId === gemstone._id && (
                          <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
                            {/* View */}
                            <Link
                              href={`/admin/gemstones/${gemstone._id}`}
                              onClick={() => setOpenActionId(null)}
                              className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                              View Details
                            </Link>

                            {/* Edit */}
                            <Link
                              href={`/admin/gemstones/${gemstone._id}/edit`}
                              onClick={() => setOpenActionId(null)}
                              className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit Variety
                            </Link>

                            <div className="my-1 border-t border-slate-100" />

                            {/* Activate / Deactivate */}
                            {gemstone.status === "ACTIVE" ? (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                  handleStatusChange(gemstone, "INACTIVE")
                                }
                                className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                  handleStatusChange(gemstone, "ACTIVE")
                                }
                                className="block w-full px-4 py-2.5 text-left text-sm text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filteredGemstones.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {filteredGemstones.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {gemstones.length}
              </span>{" "}
              varieties
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
