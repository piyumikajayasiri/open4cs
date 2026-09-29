"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

type Gemstone = {
  _id: string;
  code: string;
  name: string;
  species: string;
  supportedShapes: string[];
  supportedOrigin: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
};

export default function EditGemstonePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    species: "",
    supportedShapes: [] as string[],
    supportedOrigin: "Sri Lanka",
    description: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  useEffect(() => {
    if (!id) return;

    async function loadGemstone() {
      try {
        setLoading(true);
        setError("");

        console.log("Loading gemstone:", id);

        const response = await fetch(`/api/admin/gemstones/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        console.log("Gemstone API response:", data);

        if (!response.ok) {
          throw new Error(data.message || "Unable to load gemstone variety.");
        }

        if (!data.gemstone) {
          throw new Error("Gemstone data was not returned by the server.");
        }

        const gemstone: Gemstone = data.gemstone;

        setForm({
          code: gemstone.code ?? "",
          name: gemstone.name ?? "",
          species: gemstone.species ?? "",
          supportedShapes: gemstone.supportedShapes ?? [],
          supportedOrigin: gemstone.supportedOrigin ?? "Sri Lanka",
          description: gemstone.description ?? "",
          status: gemstone.status ?? "ACTIVE",
        });
      } catch (err) {
        console.error("Load gemstone error:", err);

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
      setError("Variety name is required.");
      return;
    }

    if (!form.species.trim()) {
      setError("Species is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/gemstones/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update gemstone variety.");
      }

      router.push(`/admin/gemstones/${id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update gemstone variety.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
            Loading gemstone variety...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <Link
            href={`/admin/gemstones/${id}`}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Gemstone Details
          </Link>
        </div>

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-slate-500">
            CAGS Administration
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Edit Gemstone Variety
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Update the information for this supported gemstone variety.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Basic Information
                </h2>
              </div>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
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
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

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
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

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
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
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
                  Select the shapes supported for this variety.
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
                  placeholder="Add a short description..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </section>

            {/* Status */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-6 px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Catalogue Status
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Inactive varieties will not be available for new
                    evaluations.
                  </p>
                </div>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "ACTIVE" | "INACTIVE",
                    })
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </section>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/admin/gemstones/${id}`}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
