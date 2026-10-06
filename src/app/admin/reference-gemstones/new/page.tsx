"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2, Gem } from "lucide-react";

type Gemstone = {
  status: string;
  _id: string;
  code: string;
  name: string;
  species: string;
  supportedOrigin?: string;
  supportedShapes?: string[];
};

type FormData = {
  referenceId: string;
  gemstoneId: string;

  origin: string;
  originVerification: string;

  color: string;
  clarity: string;
  cut: string;
  caratWeight: string;

  treatment: string;
  treatmentVerification: string;

  referencePrice: string;
  pricePerCarat: string;
  priceCurrency: string;

  verificationStatus: string;
  source: string;
  notes: string;

  status: "ACTIVE" | "INACTIVE";
};

const initialForm: FormData = {
  referenceId: "",
  gemstoneId: "",

  origin: "",
  originVerification: "",

  color: "",
  clarity: "",
  cut: "",
  caratWeight: "",

  treatment: "",
  treatmentVerification: "",

  referencePrice: "",
  pricePerCarat: "",
  priceCurrency: "LKR",

  verificationStatus: "",
  source: "",
  notes: "",

  status: "ACTIVE",
};

export default function NewReferenceGemstonePage() {
  const router = useRouter();

  const [gemstones, setGemstones] = useState<Gemstone[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);

  const [loadingGemstones, setLoadingGemstones] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGemstones() {
      try {
        setLoadingGemstones(true);

        const response = await fetch("/api/admin/gemstones");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load gemstone catalogue");
        }

        setGemstones(data.gemstones || []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load gemstone catalogue",
        );
      } finally {
        setLoadingGemstones(false);
      }
    }

    loadGemstones();
  }, []);

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!form.referenceId.trim()) {
      setError("Reference ID is required.");
      return;
    }

    if (!form.gemstoneId) {
      setError("Please select a gemstone variety.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/reference-gemstones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceId: form.referenceId,

          gemstoneId: form.gemstoneId,

          origin: form.origin,
          originVerification: form.originVerification,

          color: form.color,
          clarity: form.clarity,
          cut: form.cut,
          caratWeight:
            form.caratWeight === "" ? undefined : Number(form.caratWeight),

          treatment: form.treatment,
          treatmentVerification: form.treatmentVerification,

          referencePrice:
            form.referencePrice === ""
              ? undefined
              : Number(form.referencePrice),

          pricePerCarat:
            form.pricePerCarat === "" ? undefined : Number(form.pricePerCarat),

          priceCurrency: form.priceCurrency,

          verificationStatus: form.verificationStatus,
          source: form.source,
          notes: form.notes,

          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create reference gemstone");
      }

      router.push("/admin/reference-gemstones");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create reference gemstone",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/reference-gemstones"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reference Gemstones
        </Link>

        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              CAGS Administration
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              Add Reference Gemstone
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add a known or validated gemstone record for future comparison and
              pricing analysis.
            </p>
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:block">
            <Gem className="h-6 w-6 text-slate-600" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Identify the reference gemstone and connect it to the supported
              gemstone catalogue.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <Field
              label="Reference ID"
              required
              value={form.referenceId}
              onChange={(value) =>
                updateField("referenceId", value.toUpperCase())
              }
              placeholder="e.g. REF-0001"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Gemstone Variety <span className="text-red-500">*</span>
              </label>

              <select
                value={form.gemstoneId}
                onChange={(e) => updateField("gemstoneId", e.target.value)}
                disabled={loadingGemstones}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingGemstones
                    ? "Loading gemstones..."
                    : "Select gemstone variety"}
                </option>

                {gemstones
                  .filter((gemstone) => gemstone.status !== "INACTIVE")
                  .map((gemstone) => (
                    <option key={gemstone._id} value={gemstone._id}>
                      {gemstone.name} ({gemstone.code})
                    </option>
                  ))}
              </select>
            </div>

            <Field
              label="Origin"
              value={form.origin}
              onChange={(value) => updateField("origin", value)}
              placeholder="Enter origin"
            />

            <Field
              label="Origin Verification"
              value={form.originVerification}
              onChange={(value) => updateField("originVerification", value)}
              placeholder="Enter verification information"
            />
          </div>
        </section>

        {/* 4C Information */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              4C Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record the available characteristics of this reference gemstone.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <Field
              label="Color"
              value={form.color}
              onChange={(value) => updateField("color", value)}
              placeholder="Enter color information"
            />

            <Field
              label="Clarity"
              value={form.clarity}
              onChange={(value) => updateField("clarity", value)}
              placeholder="Enter clarity information"
            />

            <Field
              label="Cut"
              value={form.cut}
              onChange={(value) => updateField("cut", value)}
              placeholder="Enter cut information"
            />

            <Field
              label="Carat Weight"
              type="number"
              min="0"
              step="0.01"
              value={form.caratWeight}
              onChange={(value) => updateField("caratWeight", value)}
              placeholder="e.g. 2.50"
            />
          </div>
        </section>

        {/* Treatment */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Treatment Information
            </h2>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <Field
              label="Treatment"
              value={form.treatment}
              onChange={(value) => updateField("treatment", value)}
              placeholder="Enter treatment information"
            />

            <Field
              label="Treatment Verification"
              value={form.treatmentVerification}
              onChange={(value) => updateField("treatmentVerification", value)}
              placeholder="Enter verification information"
            />
          </div>
        </section>

        {/* Pricing */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Reference Pricing
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record the available reference price information.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-3">
            <Field
              label="Reference Price"
              type="number"
              min="0"
              step="0.01"
              value={form.referencePrice}
              onChange={(value) => updateField("referencePrice", value)}
              placeholder="Enter price"
            />

            <Field
              label="Price per Carat"
              type="number"
              min="0"
              step="0.01"
              value={form.pricePerCarat}
              onChange={(value) => updateField("pricePerCarat", value)}
              placeholder="Enter price per carat"
            />

            <Field
              label="Currency"
              value={form.priceCurrency}
              onChange={(value) =>
                updateField("priceCurrency", value.toUpperCase())
              }
              placeholder="e.g. LKR"
            />
          </div>
        </section>

        {/* Verification / Source */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Verification & Source
            </h2>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <Field
              label="Verification Status"
              value={form.verificationStatus}
              onChange={(value) => updateField("verificationStatus", value)}
              placeholder="Enter verification status"
            />

            <Field
              label="Source"
              value={form.source}
              onChange={(value) => updateField("source", value)}
              placeholder="Enter source"
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={5}
                placeholder="Add additional notes..."
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value as "ACTIVE" | "INACTIVE")
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/admin/reference-gemstones"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || loadingGemstones}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Reference Gemstone
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  );
}
