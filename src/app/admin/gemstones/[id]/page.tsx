"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Gemstone = {
  _id: string;
  code: string;
  name: string;
  species: string;
  supportedShapes: string[];
  supportedOrigin: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
};

export default function GemstoneDetailsPage() {
  const params = useParams();

  const id = params.id as string;

  const [gemstone, setGemstone] = useState<Gemstone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadGemstone() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/admin/gemstones/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load gemstone variety.");
        }

        setGemstone(data.gemstone);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load gemstone variety.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadGemstone();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
            Loading gemstone details...
          </div>
        </main>
      </div>
    );
  }

  if (error || !gemstone) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-5xl px-6 py-8">
          <Link
            href="/admin/gemstones"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Gemstone Catalogue
          </Link>

          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-6 py-5">
            <h1 className="text-base font-semibold text-red-800">
              Unable to load gemstone
            </h1>

            <p className="mt-1 text-sm text-red-700">
              {error || "Gemstone variety not found."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/admin/gemstones"
            className="text-sm text-slate-500 transition hover:text-slate-900"
          >
            ← Gemstone Catalogue
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-500">
              CAGS Administration
            </p>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {gemstone.name}
              </h1>

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
            </div>

            <p className="mt-2 text-sm text-slate-500">
              View the catalogue information for this supported gemstone
              variety.
            </p>
          </div>

          <Link
            href={`/admin/gemstones/${gemstone._id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Edit Variety
          </Link>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Core information defining this catalogue variety.
              </p>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
              <InfoItem label="Internal Code" value={gemstone.code || "—"} />

              <InfoItem label="Variety Name" value={gemstone.name || "—"} />

              <InfoItem label="Species" value={gemstone.species || "—"} />

              <InfoItem
                label="Supported Origin"
                value={gemstone.supportedOrigin || "—"}
              />
            </div>
          </section>

          {/* Shapes */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-900">
                Supported Shapes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Shapes supported for this gemstone variety.
              </p>
            </div>

            <div className="px-6 py-6">
              {(gemstone.supportedShapes ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {gemstone.supportedShapes.map((shape) => (
                    <span
                      key={shape}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                    >
                      {shape}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No supported shapes specified.
                </p>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-900">
                Description
              </h2>
            </div>

            <div className="px-6 py-6">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {gemstone.description || "No description provided."}
              </p>
            </div>
          </section>

          {/* Catalogue Status */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-900">
                Catalogue Status
              </h2>
            </div>

            <div className="px-6 py-6">
              {gemstone.status === "ACTIVE" ? (
                <div>
                  <p className="text-sm font-medium text-emerald-700">Active</p>

                  <p className="mt-1 text-sm text-slate-500">
                    This variety is currently available for selection in the
                    Open 4Cs system.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-600">Inactive</p>

                  <p className="mt-1 text-sm text-slate-500">
                    This variety is currently unavailable for new evaluations.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Metadata */}
          {(gemstone.createdAt || gemstone.updatedAt) && (
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Record Information
                </h2>
              </div>

              <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
                {gemstone.createdAt && (
                  <InfoItem
                    label="Created"
                    value={formatDate(gemstone.createdAt)}
                  />
                )}

                {gemstone.updatedAt && (
                  <InfoItem
                    label="Last Updated"
                    value={formatDate(gemstone.updatedAt)}
                  />
                )}
              </div>
            </section>
          )}

          {/* Bottom actions */}
          <div className="flex justify-end gap-3">
            <Link
              href="/admin/gemstones"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Catalogue
            </Link>

            <Link
              href={`/admin/gemstones/${gemstone._id}/edit`}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Edit Variety
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
