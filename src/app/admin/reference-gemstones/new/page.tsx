"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save, Loader2, Gem } from "lucide-react";

type FormData = {
  referenceId: string;
  variety: string;
  caratWeight: string;
  dataClassification: "Real" | "Demo";
  transactionContext: "Completed Sale" | "Dealer Estimate";
  marketContext: "Wholesale" | "Retail";

  // Dimensions
  length: string;
  width: string;
  depth: string;

  // Color
  hue: string;
  tone: string;
  saturation: string;
  distribution: string;
  zoning: string;

  // Clarity
  nakedEye: string;
  loupe10x: string;
  severity: string;
  inclusionType: string;

  // Cut
  symmetry: string;
  polish: string;
  windowing: string;
  extinction: string;
  bulging: string;

  // Treatment & Origin
  treatmentStatus: string;
  originValue: string;
  originReliability: string;

  // Pricing & Evidence
  referencePrice: string;
  currency: "LKR" | "USD";
  source: string;
  observationDate: string;
  verificationStatus: "Verified" | "Pending";
};

const initialForm: FormData = {
  referenceId: "",
  variety: "Blue Sapphire",
  caratWeight: "",
  dataClassification: "Real",
  transactionContext: "Completed Sale",
  marketContext: "Wholesale",

  length: "",
  width: "",
  depth: "",

  hue: "Royal Blue",
  tone: "6",
  saturation: "Vivid",
  distribution: "Even",
  zoning: "None",

  nakedEye: "Clean",
  loupe10x: "Very Slight",
  severity: "Minor",
  inclusionType: "Silk needles",

  symmetry: "Good",
  polish: "Good",
  windowing: "None",
  extinction: "None",
  bulging: "None",

  treatmentStatus: "Heated",
  originValue: "Sri Lanka",
  originReliability: "High",

  referencePrice: "",
  currency: "LKR",
  source: "Ratnapura Wholesale Trade Register",
  observationDate: new Date().toISOString().split("T")[0],
  verificationStatus: "Verified",
};

export default function NewReferenceGemstonePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      setError("Reference ID is required (e.g., REF-BLU-2026-001).");
      return;
    }

    const caratNum = Number(form.caratWeight);
    if (!caratNum || caratNum <= 0) {
      setError("Valid positive carat weight is required.");
      return;
    }

    const priceNum = Number(form.referencePrice);
    if (!priceNum || priceNum <= 0) {
      setError("Valid positive reference price is required.");
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
          referenceId: form.referenceId.trim().toUpperCase(),
          variety: form.variety,
          caratWeight: caratNum,
          dataClassification: form.dataClassification,
          transactionContext: form.transactionContext,
          marketContext: form.marketContext,
          color: {
            hue: form.hue,
            tone: form.tone,
            saturation: form.saturation,
            distribution: form.distribution,
            zoning: form.zoning,
          },
          clarity: {
            nakedEye: form.nakedEye,
            loupe10x: form.loupe10x,
            severity: form.severity,
            inclusionType: form.inclusionType,
          },
          cut: {
            length: form.length ? Number(form.length) : null,
            width: form.width ? Number(form.width) : null,
            depth: form.depth ? Number(form.depth) : null,
            symmetry: form.symmetry,
            polish: form.polish,
            windowing: form.windowing,
            extinction: form.extinction,
            bulging: form.bulging,
          },
          treatment: {
            status: form.treatmentStatus,
          },
          origin: {
            value: form.originValue,
            reliability: form.originReliability,
          },
          referencePrice: priceNum,
          currency: form.currency,
          source: form.source.trim(),
          observationDate: form.observationDate,
          verificationStatus: form.verificationStatus,
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
          : "Failed to create reference gemstone"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/reference-gemstones"
          className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Market Evidence
        </Link>

        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              CAGS Administrative Benchmark Entry
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Add Reference Gemstone
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Record a verified commercial trade observation or benchmark for the 4Cs pricing engine.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:block">
            <Gem className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Identity & Classification */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Identification &amp; Context
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reference ID *
              </label>
              <input
                type="text"
                value={form.referenceId}
                onChange={(e) => updateField("referenceId", e.target.value)}
                placeholder="REF-BLU-2026-001"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gemstone Variety *
              </label>
              <select
                value={form.variety}
                onChange={(e) => updateField("variety", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
              >
                <option value="Blue Sapphire">Blue Sapphire</option>
                <option value="Padparadscha">Padparadscha</option>
                <option value="Ruby">Ruby</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Carat Weight (ct) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.caratWeight}
                onChange={(e) => updateField("caratWeight", e.target.value)}
                placeholder="2.50"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Data Classification
              </label>
              <select
                value={form.dataClassification}
                onChange={(e) => updateField("dataClassification", e.target.value as "Real" | "Demo")}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Real">Real (Eligible for commercial valuation)</option>
                <option value="Demo">Demo (Educational testing only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Transaction Context
              </label>
              <select
                value={form.transactionContext}
                onChange={(e) => updateField("transactionContext", e.target.value as "Completed Sale" | "Dealer Estimate")}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Completed Sale">Completed Sale (Verified transaction)</option>
                <option value="Dealer Estimate">Dealer Estimate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Market Context
              </label>
              <select
                value={form.marketContext}
                onChange={(e) => updateField("marketContext", e.target.value as "Wholesale" | "Retail")}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Wholesale">Wholesale (B2B Trade)</option>
                <option value="Retail">Retail</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Color & Clarity */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Color &amp; Clarity Observations
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Color Hue *
              </label>
              <input
                type="text"
                value={form.hue}
                onChange={(e) => updateField("hue", e.target.value)}
                placeholder="Royal Blue"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Color Tone (1–9)
              </label>
              <select
                value={form.tone}
                onChange={(e) => updateField("tone", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Saturation
              </label>
              <select
                value={form.saturation}
                onChange={(e) => updateField("saturation", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Greyish">Greyish</option>
                <option value="Slightly Greyish">Slightly Greyish</option>
                <option value="Medium">Medium</option>
                <option value="Strong">Strong</option>
                <option value="Vivid">Vivid</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Naked Eye Clarity
              </label>
              <select
                value={form.nakedEye}
                onChange={(e) => updateField("nakedEye", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Clean">Eye-clean (Clean)</option>
                <option value="Slight">Slightly Included (Slight)</option>
                <option value="Noticeable">Moderately Included (Noticeable)</option>
                <option value="Obvious">Heavily Included (Obvious)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                10× Loupe Clarity
              </label>
              <select
                value={form.loupe10x}
                onChange={(e) => updateField("loupe10x", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Clean">Minute (VVS / Clean)</option>
                <option value="Very Slight">Minor (VS / Very Slight)</option>
                <option value="Slight">Noticeable (SI / Slight)</option>
                <option value="Noticeable">Obvious (I / Noticeable)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Inclusion Severity *
              </label>
              <select
                value={form.severity}
                onChange={(e) => updateField("severity", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="None">None</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 3: Cut & Dimensions */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Cut &amp; Dimensions
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Length (mm)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.length}
                onChange={(e) => updateField("length", e.target.value)}
                placeholder="8.40"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Width (mm)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.width}
                onChange={(e) => updateField("width", e.target.value)}
                placeholder="6.30"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Depth (mm)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.depth}
                onChange={(e) => updateField("depth", e.target.value)}
                placeholder="4.50"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cut Symmetry *
              </label>
              <select
                value={form.symmetry}
                onChange={(e) => updateField("symmetry", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cut Polish
              </label>
              <select
                value={form.polish}
                onChange={(e) => updateField("polish", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 4: Treatment & Origin */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            4. Treatment &amp; Origin
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Treatment Status *
              </label>
              <select
                value={form.treatmentStatus}
                onChange={(e) => updateField("treatmentStatus", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Untreated">Untreated / Natural</option>
                <option value="Heated">Heated</option>
                <option value="Treated">Treated (Lattice/Diffusion)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Geographic Origin *
              </label>
              <select
                value={form.originValue}
                onChange={(e) => updateField("originValue", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Sri Lanka">Sri Lanka (Ceylon)</option>
                <option value="Madagascar">Madagascar</option>
                <option value="Myanmar">Myanmar (Burma)</option>
                <option value="Other">Other / Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Origin Reliability
              </label>
              <select
                value={form.originReliability}
                onChange={(e) => updateField("originReliability", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="High">High (Lab report confirmed)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 5: Commercial Pricing & Evidence */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            5. Commercial Pricing &amp; Verification Evidence
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Reference Price *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={form.referencePrice}
                onChange={(e) => updateField("referencePrice", e.target.value)}
                placeholder="1500000"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Currency *
              </label>
              <select
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value as "LKR" | "USD")}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="LKR">LKR — Sri Lankan Rupee</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Verification Status
              </label>
              <select
                value={form.verificationStatus}
                onChange={(e) => updateField("verificationStatus", e.target.value as "Verified" | "Pending")}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              >
                <option value="Verified">Verified (Active in engine)</option>
                <option value="Pending">Pending (Requires board sign-off)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Source Document / Trade Register *
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => updateField("source", e.target.value)}
                placeholder="Ratnapura Wholesale Trade Register / Lab Benchmark"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Observation Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={form.observationDate}
                onChange={(e) => updateField("observationDate", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href="/admin/reference-gemstones"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-6 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Benchmark Record</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
