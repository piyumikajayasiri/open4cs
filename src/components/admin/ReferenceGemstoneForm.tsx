"use client";

import React, { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { ShadcnSelect } from "@/components/ui/select";

export type ReferenceFormData = {
  referenceId: string;
  variety: string;
  caratWeight: string;

  // Required explicit context selections
  dataClassification: "Real" | "Demo" | "";
  transactionContext: "Completed Sale" | "Asking Price" | "";
  marketContext: "Wholesale" | "Retail" | "Auction" | "";

  // Dimensions
  length: string;
  width: string;
  depth: string;

  // Structured Color
  hue: string;
  tone: string;
  saturation: string;
  distribution: string;
  zoning: string;

  // Structured Clarity
  nakedEye: string;
  loupe10x: string;
  severity: string;
  inclusionType: string;

  // Structured Cut
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
  sourceEvidence: string;
  labCertificate: string;
  observationDate: string;
};

const initialFormData: ReferenceFormData = {
  referenceId: "",
  variety: "Blue Sapphire",
  caratWeight: "",

  dataClassification: "",
  transactionContext: "",
  marketContext: "",

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
  sourceEvidence: "",
  labCertificate: "",
  observationDate: new Date().toISOString().split("T")[0],
};

interface ReferenceGemstoneFormProps {
  onSuccess?: (createdRef: Record<string, unknown>) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export default function ReferenceGemstoneForm({
  onSuccess,
  onCancel,
  isModal = false,
}: ReferenceGemstoneFormProps) {
  const [form, setForm] = useState<ReferenceFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof ReferenceFormData>(
    field: K,
    value: ReferenceFormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.referenceId.trim()) {
      setError("Reference ID is required (e.g. REF-BLU-2026-001).");
      return;
    }

    const caratNum = Number(form.caratWeight);
    if (!caratNum || caratNum <= 0) {
      setError("A valid positive carat weight is required.");
      return;
    }

    if (!form.dataClassification) {
      setError("Please explicitly select whether this is Real market data or Demo data.");
      return;
    }

    if (!form.transactionContext) {
      setError("Please explicitly select whether this represents a Completed Sale or Asking Price.");
      return;
    }

    if (!form.marketContext) {
      setError("Please explicitly select the market context (Wholesale, Retail, or Auction).");
      return;
    }

    const priceNum = Number(form.referencePrice);
    if (!priceNum || priceNum <= 0) {
      setError("A valid positive reference price is required.");
      return;
    }

    if (!form.source.trim()) {
      setError("Source register or market origin is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
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
        sourceEvidence: form.sourceEvidence.trim(),
        labCertificate: form.labCertificate.trim(),
        observationDate: form.observationDate,
        // Always saved as Pending per requirements until verified by admin
        verificationStatus: "Pending",
      };

      const res = await fetch("/api/admin/reference-gemstones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create reference gemstone record.");
      }

      if (onSuccess) {
        onSuccess(data.reference);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reference gemstone.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 1. Identification & Explicit Governance Classification */}
      <section className={`rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 ${isModal ? "shadow-none" : "shadow-xs"}`}>
        <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">
          1. Identification &amp; Context Requirements
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reference ID *
            </label>
            <input
              id="ref-input-referenceId"
              type="text"
              value={form.referenceId}
              onChange={(e) => updateField("referenceId", e.target.value)}
              placeholder="REF-BLU-2026-001"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Variety *
            </label>
            <ShadcnSelect
              id="ref-select-variety"
              value={form.variety}
              onValueChange={(val) => updateField("variety", val)}
              options={["Blue Sapphire", "Padparadscha", "Ruby"]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Carat Weight (ct) *
            </label>
            <input
              id="ref-input-caratWeight"
              type="number"
              step="0.01"
              min="0.01"
              value={form.caratWeight}
              onChange={(e) => updateField("caratWeight", e.target.value)}
              placeholder="2.45"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Explicit Required Selections Grid */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Data Classification *
            </label>
            <ShadcnSelect
              id="ref-select-dataClassification"
              value={form.dataClassification}
              onValueChange={(val) =>
                updateField("dataClassification", val as "Real" | "Demo" | "")
              }
              options={[
                { value: "Real", label: "Real Market Record (Eligible for pricing)" },
                { value: "Demo", label: "Demo Record (Excluded from commercial valuation)" },
              ]}
              placeholder="— Select Real or Demo —"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Price Basis / Transaction Context *
            </label>
            <ShadcnSelect
              id="ref-select-transactionContext"
              value={form.transactionContext}
              onValueChange={(val) =>
                updateField("transactionContext", val as "Completed Sale" | "Asking Price" | "")
              }
              options={[
                { value: "Completed Sale", label: "Completed Sale (Verified transaction)" },
                { value: "Asking Price", label: "Asking Price / Dealer Quotation" },
              ]}
              placeholder="— Select Sale or Asking —"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Market Context *
            </label>
            <ShadcnSelect
              id="ref-select-marketContext"
              value={form.marketContext}
              onValueChange={(val) =>
                updateField("marketContext", val as "Wholesale" | "Retail" | "Auction" | "")
              }
              options={[
                { value: "Wholesale", label: "Wholesale (B2B Trade)" },
                { value: "Retail", label: "Retail (Consumer Market)" },
                { value: "Auction", label: "Auction (Public Clearing)" },
              ]}
              placeholder="— Select Market Context —"
            />
          </div>
        </div>
      </section>

      {/* 2. Structured Color & Clarity */}
      <section className={`rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 ${isModal ? "shadow-none" : "shadow-xs"}`}>
        <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">
          2. Structured Color &amp; Clarity Observations
        </h3>

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
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tone (1–9)
            </label>
            <ShadcnSelect
              value={form.tone}
              onValueChange={(val) => updateField("tone", val)}
              options={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Saturation
            </label>
            <ShadcnSelect
              value={form.saturation}
              onValueChange={(val) => updateField("saturation", val)}
              options={["Greyish", "Slightly Greyish", "Medium", "Strong", "Vivid"]}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Naked Eye Clarity
            </label>
            <ShadcnSelect
              value={form.nakedEye}
              onValueChange={(val) => updateField("nakedEye", val)}
              options={[
                { value: "Clean", label: "Eye-clean (Clean)" },
                { value: "Slight", label: "Slightly Included (Slight)" },
                { value: "Noticeable", label: "Moderately Included (Noticeable)" },
                { value: "Obvious", label: "Heavily Included (Obvious)" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              10× Loupe Observation
            </label>
            <ShadcnSelect
              value={form.loupe10x}
              onValueChange={(val) => updateField("loupe10x", val)}
              options={[
                { value: "Clean", label: "Minute (VVS / Clean)" },
                { value: "Very Slight", label: "Minor (VS / Very Slight)" },
                { value: "Slight", label: "Noticeable (SI / Slight)" },
                { value: "Noticeable", label: "Obvious (I / Noticeable)" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Inclusion Severity *
            </label>
            <ShadcnSelect
              value={form.severity}
              onValueChange={(val) => updateField("severity", val)}
              options={[
                { value: "None", label: "None (Clean)" },
                { value: "Minor", label: "Minor" },
                { value: "Moderate", label: "Moderate" },
                { value: "Severe", label: "Severe" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 3. Structured Cut & Proportions */}
      <section className={`rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 ${isModal ? "shadow-none" : "shadow-xs"}`}>
        <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">
          3. Cut Measurements &amp; Proportions
        </h3>

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
              placeholder="8.20"
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
              placeholder="6.80"
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
              placeholder="4.90"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cut Symmetry *
            </label>
            <ShadcnSelect
              value={form.symmetry}
              onValueChange={(val) => updateField("symmetry", val)}
              options={["Excellent", "Very Good", "Good", "Fair", "Poor"]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cut Polish *
            </label>
            <ShadcnSelect
              value={form.polish}
              onValueChange={(val) => updateField("polish", val)}
              options={["Excellent", "Very Good", "Good", "Fair"]}
            />
          </div>
        </div>
      </section>

      {/* 4. Treatment & Origin */}
      <section className={`rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 ${isModal ? "shadow-none" : "shadow-xs"}`}>
        <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">
          4. Treatment &amp; Origin
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Treatment Status *
            </label>
            <ShadcnSelect
              value={form.treatmentStatus}
              onValueChange={(val) => updateField("treatmentStatus", val)}
              options={[
                { value: "Untreated", label: "Untreated / Natural" },
                { value: "Heated", label: "Heated" },
                { value: "Treated", label: "Treated (Lattice/Diffusion)" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Geographic Origin *
            </label>
            <ShadcnSelect
              value={form.originValue}
              onValueChange={(val) => updateField("originValue", val)}
              options={[
                { value: "Sri Lanka", label: "Sri Lanka (Ceylon)" },
                { value: "Madagascar", label: "Madagascar" },
                { value: "Myanmar", label: "Myanmar (Burma)" },
                { value: "Other", label: "Other / Unknown" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Origin Reliability
            </label>
            <ShadcnSelect
              value={form.originReliability}
              onValueChange={(val) => updateField("originReliability", val)}
              options={[
                { value: "High", label: "High (Lab report confirmed)" },
                { value: "Medium", label: "Medium (Dealer documentation)" },
                { value: "Low", label: "Low" },
                { value: "Unknown", label: "Unknown" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 5. Pricing, Evidence & Initial Verification Status */}
      <section className={`rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 ${isModal ? "shadow-none" : "shadow-xs"}`}>
        <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">
          5. Pricing, Evidence &amp; Verification
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Original Price *
            </label>
            <input
              id="ref-input-referencePrice"
              type="number"
              step="1"
              min="1"
              value={form.referencePrice}
              onChange={(e) => updateField("referencePrice", e.target.value)}
              placeholder="1500000"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Currency *
            </label>
            <ShadcnSelect
              id="ref-select-currency"
              value={form.currency}
              onValueChange={(val) => updateField("currency", val as "LKR" | "USD")}
              options={[
                { value: "LKR", label: "LKR — Sri Lankan Rupee" },
                { value: "USD", label: "USD — US Dollar" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Observation / Sale Date *
            </label>
            <input
              id="ref-input-observationDate"
              type="date"
              value={form.observationDate}
              onChange={(e) => updateField("observationDate", e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source Register / Dealer *
            </label>
            <input
              id="ref-input-source"
              type="text"
              value={form.source}
              onChange={(e) => updateField("source", e.target.value)}
              placeholder="Ratnapura Wholesale Trade Register / Auction Lot #14"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source Evidence / Document Ref
            </label>
            <input
              id="ref-input-sourceEvidence"
              type="text"
              value={form.sourceEvidence}
              onChange={(e) => updateField("sourceEvidence", e.target.value)}
              placeholder="Invoice #RWTR-2026-448 / Receipt"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none"
            />
          </div>
        </div>

        {/* Verification Status Notice */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800">Initial Verification State:</span>{" "}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Pending
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            Requires authorized CAGS sign-off before influencing pricing engine
          </span>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        )}

        <button
          id="ref-submit-btn"
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
              <span>Save Market Reference</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
