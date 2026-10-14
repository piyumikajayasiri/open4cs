"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, LoaderCircle } from "lucide-react";

type Gemstone = {
  _id: string;
  code: string;
  name: string;
  status?: "ACTIVE" | "INACTIVE";
};

type Reference = {
  _id: string;
  referenceId: string;
  gemstoneId: Gemstone | string;
  origin?: string;
  originVerification?: string;
  color?: string;
  clarity?: string;
  cut?: string;
  caratWeight?: number;
  treatment?: string;
  treatmentVerification?: string;
  referencePrice?: number;
  pricePerCarat?: number;
  priceCurrency?: string;
  verificationStatus?: string;
  source?: string;
  notes?: string;
  status: "ACTIVE" | "INACTIVE";
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

const emptyForm: FormData = {
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

function toForm(reference: Reference): FormData {
  return {
    referenceId: reference.referenceId ?? "",
    gemstoneId:
      typeof reference.gemstoneId === "string"
        ? reference.gemstoneId
        : (reference.gemstoneId?._id ?? ""),
    origin: reference.origin ?? "",
    originVerification: reference.originVerification ?? "",
    color: reference.color ?? "",
    clarity: reference.clarity ?? "",
    cut: reference.cut ?? "",
    caratWeight:
      reference.caratWeight != null ? String(reference.caratWeight) : "",
    treatment: reference.treatment ?? "",
    treatmentVerification: reference.treatmentVerification ?? "",
    referencePrice:
      reference.referencePrice != null ? String(reference.referencePrice) : "",
    pricePerCarat:
      reference.pricePerCarat != null ? String(reference.pricePerCarat) : "",
    priceCurrency: reference.priceCurrency ?? "LKR",
    verificationStatus: reference.verificationStatus ?? "",
    source: reference.source ?? "",
    notes: reference.notes ?? "",
    status: reference.status ?? "ACTIVE",
  };
}

export default function EditReferenceGemstonePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [form, setForm] = useState<FormData>(emptyForm);
  const [gemstones, setGemstones] = useState<Gemstone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [referenceResponse, gemstonesResponse] = await Promise.all([
          fetch(`/api/admin/reference-gemstones/${id}`, {
            cache: "no-store",
          }),
          fetch("/api/admin/gemstones", {
            cache: "no-store",
          }),
        ]);

        const [referenceData, gemstonesData] = await Promise.all([
          referenceResponse.json(),
          gemstonesResponse.json(),
        ]);

        if (!referenceResponse.ok || !referenceData.success) {
          throw new Error(
            referenceData.message || "Failed to load reference gemstone.",
          );
        }

        if (!gemstonesResponse.ok || !gemstonesData.success) {
          throw new Error(
            gemstonesData.message || "Failed to load gemstone catalogue.",
          );
        }

        if (!cancelled) {
          setForm(toForm(referenceData.reference));
          setGemstones(gemstonesData.gemstones ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load the record.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.referenceId.trim() || !form.gemstoneId) {
      setError("Reference ID and gemstone variety are required.");
      return;
    }

    const numericFields = [
      ["Carat weight", form.caratWeight],
      ["Reference price", form.referencePrice],
      ["Price per carat", form.pricePerCarat],
    ] as const;

    for (const [label, value] of numericFields) {
      if (
        value.trim() !== "" &&
        (!Number.isFinite(Number(value)) || Number(value) < 0)
      ) {
        setError(`${label} must be a valid non-negative number.`);
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/reference-gemstones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceId: form.referenceId.trim().toUpperCase(),
          gemstoneId: form.gemstoneId,
          origin: form.origin,
          originVerification: form.originVerification,
          color: form.color,
          clarity: form.clarity,
          cut: form.cut,
          caratWeight:
            form.caratWeight === "" ? null : Number(form.caratWeight),
          treatment: form.treatment,
          treatmentVerification: form.treatmentVerification,
          referencePrice:
            form.referencePrice === "" ? null : Number(form.referencePrice),
          pricePerCarat:
            form.pricePerCarat === "" ? null : Number(form.pricePerCarat),
          priceCurrency: form.priceCurrency.trim().toUpperCase(),
          verificationStatus: form.verificationStatus,
          source: form.source,
          notes: form.notes,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update reference gemstone.");
      }

      router.push(`/admin/reference-gemstones/${id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update reference gemstone.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex justify-center gap-3 py-20 text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading reference gemstone...
        </div>
      </main>
    );
  }

  if (error && !form.referenceId) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
        <Link
          href="/admin/reference-gemstones"
          className="mt-4 inline-block text-sm text-slate-600 underline"
        >
          Back to Reference Gemstones
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Link
        href={`/admin/reference-gemstones/${id}`}
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reference Details
      </Link>

      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          CAGS Administration / Reference Gemstones
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Edit Reference Gemstone
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Update the reference record and its available pricing information.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Basic Information">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Reference ID"
              required
              value={form.referenceId}
              onChange={(v) => update("referenceId", v.toUpperCase())}
            />

            <div>
              <Label>Gemstone Variety *</Label>
              <select
                required
                value={form.gemstoneId}
                onChange={(e) => update("gemstoneId", e.target.value)}
                className={inputClass}
              >
                <option value="">Select variety</option>
                {gemstones
                  .filter(
                    (g) => g.status !== "INACTIVE" || g._id === form.gemstoneId,
                  )
                  .map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.code})
                    </option>
                  ))}
              </select>
            </div>

            <Field
              label="Origin"
              value={form.origin}
              onChange={(v) => update("origin", v)}
            />
            <Field
              label="Origin Verification"
              value={form.originVerification}
              onChange={(v) => update("originVerification", v)}
            />
          </div>
        </Section>

        <Section title="4C Characteristics">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Color"
              value={form.color}
              onChange={(v) => update("color", v)}
            />
            <Field
              label="Clarity"
              value={form.clarity}
              onChange={(v) => update("clarity", v)}
            />
            <Field
              label="Cut"
              value={form.cut}
              onChange={(v) => update("cut", v)}
            />
            <Field
              label="Carat Weight"
              type="number"
              min="0"
              step="any"
              value={form.caratWeight}
              onChange={(v) => update("caratWeight", v)}
            />
          </div>
        </Section>

        <Section title="Treatment Information">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Treatment"
              value={form.treatment}
              onChange={(v) => update("treatment", v)}
            />
            <Field
              label="Treatment Verification"
              value={form.treatmentVerification}
              onChange={(v) => update("treatmentVerification", v)}
            />
          </div>
        </Section>

        <Section title="Reference Pricing">
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Reference Price"
              type="number"
              min="0"
              step="any"
              value={form.referencePrice}
              onChange={(v) => update("referencePrice", v)}
            />
            <Field
              label="Price per Carat"
              type="number"
              min="0"
              step="any"
              value={form.pricePerCarat}
              onChange={(v) => update("pricePerCarat", v)}
            />
            <Field
              label="Currency"
              value={form.priceCurrency}
              onChange={(v) => update("priceCurrency", v.toUpperCase())}
            />
          </div>
        </Section>

        <Section title="Verification & Source">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Verification Status"
              value={form.verificationStatus}
              onChange={(v) => update("verificationStatus", v)}
            />
            <Field
              label="Source"
              value={form.source}
              onChange={(v) => update("source", v)}
            />

            <div className="md:col-span-2">
              <Label>Notes</Label>
              <textarea
                rows={4}
                maxLength={2000}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className={inputClass}
                placeholder="Additional reference information..."
              />
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as "ACTIVE" | "INACTIVE")
                }
                className={inputClass}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </Section>

        <div className="flex justify-end gap-3 pb-8">
          <Link
            href={`/admin/reference-gemstones/${id}`}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  step,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        step={step}
        required={required}
        className={inputClass}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
