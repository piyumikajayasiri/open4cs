"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Gemstone = {
  _id: string;
  code: string;
  name: string;
  species: string;
};

type ReferenceGemstone = {
  _id: string;
  referenceId: string;
  gemstoneId:
    | Gemstone
    | {
        _id: string;
      };
  origin?: string;
  color?: string;
  clarity?: string;
  cut?: string;
  caratWeight?: number;
  treatment?: string;
  referencePrice?: number;
  pricePerCarat?: number;
  priceCurrency?: string;
  verificationStatus?: string;
  status: "ACTIVE" | "INACTIVE";
};

export default function ReferenceGemstonesPage() {
  const [references, setReferences] = useState<ReferenceGemstone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadReferences() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reference-gemstones", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reference gemstones.");
      }

      setReferences(data.references || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reference gemstones.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReferences();
  }, []);

  const filteredReferences = useMemo(() => {
    return references.filter((reference) => {
      const searchValue = search.toLowerCase().trim();

      const gemstone =
        reference.gemstoneId && "name" in reference.gemstoneId
          ? reference.gemstoneId
          : null;

      const matchesSearch =
        !searchValue ||
        (reference.referenceId ?? "").toLowerCase().includes(searchValue) ||
        (gemstone?.name ?? "").toLowerCase().includes(searchValue) ||
        (gemstone?.code ?? "").toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || reference.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [references, search, statusFilter]);

  function getGemstoneName(reference: ReferenceGemstone) {
    if (reference.gemstoneId && "name" in reference.gemstoneId) {
      return reference.gemstoneId.name;
    }

    return "Unknown variety";
  }

  function getGemstoneCode(reference: ReferenceGemstone) {
    if (reference.gemstoneId && "code" in reference.gemstoneId) {
      return reference.gemstoneId.code;
    }

    return "—";
  }

  function formatPrice(price?: number, currency?: string) {
    if (price === undefined || price === null) {
      return "—";
    }

    return `${currency || "LKR"} ${price.toLocaleString()}`;
  }

  return (
    <main className="mx-auto max-w-[1600px] px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-500">
            CAGS Administration
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Reference Gemstones
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Manage reference gemstone records used for comparison and price
            suggestion.
          </p>
        </div>

        <Link
          href="/admin/reference-gemstones/new"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <span className="text-lg leading-none">+</span>
          Add Reference Gemstone
        </Link>
      </div>

      {/* Main card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
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
                placeholder="Search reference gemstones..."
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
          <div className="flex min-h-72 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
              Loading reference gemstones...
            </div>
          </div>
        ) : filteredReferences.length === 0 ? (
          /* Empty */
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
              No reference gemstones found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search || statusFilter !== "ALL"
                ? "Try changing your search or filter."
                : "Add the first reference gemstone to the system."}
            </p>

            {!search && statusFilter === "ALL" && (
              <Link
                href="/admin/reference-gemstones/new"
                className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add Reference Gemstone
              </Link>
            )}
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reference ID
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Variety
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Origin
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Color
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Clarity
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cut
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Carat
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Treatment
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reference Price
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Verification
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="w-20 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredReferences.map((reference) => (
                  <tr
                    key={reference._id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Reference ID */}
                    <td className="px-5 py-5">
                      <Link
                        href={`/admin/reference-gemstones/${reference._id}`}
                        className="font-medium text-slate-900 hover:text-slate-600"
                      >
                        {reference.referenceId}
                      </Link>
                    </td>

                    {/* Variety */}
                    <td className="px-5 py-5">
                      <p className="text-sm font-medium text-slate-800">
                        {getGemstoneName(reference)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {getGemstoneCode(reference)}
                      </p>
                    </td>

                    {/* Origin */}
                    <td className="px-5 py-5 text-sm text-slate-700">
                      {reference.origin || "—"}
                    </td>

                    {/* Color */}
                    <td className="px-5 py-5 text-sm text-slate-700">
                      {reference.color || "—"}
                    </td>

                    {/* Clarity */}
                    <td className="px-5 py-5 text-sm text-slate-700">
                      {reference.clarity || "—"}
                    </td>

                    {/* Cut */}
                    <td className="px-5 py-5 text-sm text-slate-700">
                      {reference.cut || "—"}
                    </td>

                    {/* Carat */}
                    <td className="px-5 py-5 whitespace-nowrap text-sm text-slate-700">
                      {reference.caratWeight !== undefined
                        ? `${reference.caratWeight} ct`
                        : "—"}
                    </td>

                    {/* Treatment */}
                    <td className="px-5 py-5 text-sm text-slate-700">
                      {reference.treatment || "—"}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-5 whitespace-nowrap text-sm font-medium text-slate-800">
                      {formatPrice(
                        reference.referencePrice,
                        reference.priceCurrency,
                      )}
                    </td>

                    {/* Verification */}
                    <td className="px-5 py-5">
                      {reference.verificationStatus ? (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {reference.verificationStatus}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-5">
                      {reference.status === "ACTIVE" ? (
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

                    {/* Actions */}
                    <td className="px-5 py-5 text-right">
                      <Link
                        href={`/admin/reference-gemstones/${reference._id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title="View"
                      >
                        <span className="text-lg leading-none">⋮</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filteredReferences.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {filteredReferences.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {references.length}
              </span>{" "}
              reference gemstones
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
