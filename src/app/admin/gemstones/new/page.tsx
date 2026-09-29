"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SHAPES = [
  "Oval",
  "Round",
  "Cushion",
  "Pear",
  "Emerald",
  "Princess",
  "Radiant",
  "Marquise",
  "Cabochon",
];

export default function NewGemstonePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    name: "",
    species: "",
    supportedShapes: [] as string[],
    supportedOrigin: "Sri Lanka",
    description: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleShape(shape: string) {
    setForm((current) => ({
      ...current,
      supportedShapes: current.supportedShapes.includes(shape)
        ? current.supportedShapes.filter((item) => item !== shape)
        : [...current.supportedShapes, shape],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!form.code.trim()) {
      setError("Internal code is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Gemstone name is required.");
      return;
    }

    if (!form.species.trim()) {
      setError("Species is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/gemstones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create gemstone.");
      }

      router.push("/admin/gemstones");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create gemstone variety.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/admin/gemstones"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Gemstone Catalogue
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-slate-500">
            CAGS Administration
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Add Gemstone Variety
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add a gemstone variety that is supported by the Open 4Cs system.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic information */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Basic Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define the identity of the supported gemstone variety.
                </p>
              </div>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
                {/* Code */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Internal Code
                  </label>

                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. CBS"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    A unique internal identifier.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Variety Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Ceylon Blue Sapphire"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Species */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Species
                  </label>

                  <input
                    type="text"
                    value={form.species}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        species: e.target.value,
                      })
                    }
                    placeholder="e.g. Corundum"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Origin */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Supported Origin
                  </label>

                  <input
                    type="text"
                    value={form.supportedOrigin}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        supportedOrigin: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    The origin supported by this catalogue entry.
                  </p>
                </div>
              </div>
            </section>

            {/* Shapes */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Supported Shapes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select the shapes supported for this gemstone variety.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 px-6 py-6 sm:grid-cols-3">
                {SHAPES.map((shape) => {
                  const selected = form.supportedShapes.includes(shape);

                  return (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => toggleShape(shape)}
                      className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? "border-slate-900 bg-slate-900 font-medium text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {shape}
                    </button>
                  );
                })}
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
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Add a short description of this supported gemstone variety..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </section>

            {/* Status */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Catalogue Status
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Active varieties can be selected by users during evaluation.
                  </p>
                </div>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/admin/gemstones"
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Adding..." : "Add Variety"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
