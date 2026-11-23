"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Save,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Award,
} from "lucide-react";
import { ShadcnSelect } from "@/components/ui/select";
import { evaluateGemstone } from "@/lib/evaluation/evaluateGemstone";

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

interface VarietyBenchmark {
  avgPricePerCaratLkr: number;
  pricePerCaratMin: number;
  pricePerCaratMax: number;
  dispersionPct: number;
  wholesaleCount: number;
  status: string;
}

const DEFAULT_BENCHMARKS: Record<string, VarietyBenchmark> = {
  "Blue Sapphire": {
    avgPricePerCaratLkr: 685000,
    pricePerCaratMin: 480000,
    pricePerCaratMax: 1125000,
    dispersionPct: 24.5,
    wholesaleCount: 7,
    status: "CALIBRATED",
  },
  Padparadscha: {
    avgPricePerCaratLkr: 985000,
    pricePerCaratMin: 680000,
    pricePerCaratMax: 1350000,
    dispersionPct: 22.8,
    wholesaleCount: 5,
    status: "CALIBRATED",
  },
  Ruby: {
    avgPricePerCaratLkr: 865000,
    pricePerCaratMin: 640000,
    pricePerCaratMax: 1180000,
    dispersionPct: 21.0,
    wholesaleCount: 4,
    status: "CALIBRATED",
  },
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
  initialData?: Partial<ReferenceFormData>;
  recordDbId?: string;
  isEdit?: boolean;
  onSuccess?: (savedRef: Record<string, unknown>) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export default function ReferenceGemstoneForm({
  initialData,
  recordDbId,
  isEdit = false,
  onSuccess,
  onCancel,
  isModal = false,
}: ReferenceGemstoneFormProps) {
  const [form, setForm] = useState<ReferenceFormData>(() => ({
    ...initialFormData,
    ...initialData,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [benchmarks, setBenchmarks] = useState<Record<string, VarietyBenchmark>>(DEFAULT_BENCHMARKS);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/reference-gemstones/validate")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.varieties) {
          setBenchmarks((prev) => ({
            ...prev,
            ...data.varieties,
          }));
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Live Auto-Scoring of 4Cs
  const autoScored4C = useMemo(() => {
    const carat = Number(form.caratWeight);
    if (!carat || carat <= 0) return null;

    try {
      return evaluateGemstone({
        variety: form.variety,
        caratWeight: carat,
        color: {
          hue: form.hue || "Royal Blue",
          tone: form.tone || "6",
          saturation: form.saturation || "Vivid",
          distribution: form.distribution || "Even",
          zoning: form.zoning || "None",
        },
        clarity: {
          nakedEye: form.nakedEye || "Clean",
          loupe10x: form.loupe10x || "Very Slight",
          inclusionType: form.inclusionType || "Silk needles",
          inclusionLocation: "Center",
          severity: form.severity || "Minor",
        },
        cut: {
          length: Number(form.length) || 8.0,
          width: Number(form.width) || 6.5,
          depth: Number(form.depth) || 4.5,
          symmetry: form.symmetry || "Good",
          polish: form.polish || "Good",
          windowing: form.windowing || "None",
          extinction: form.extinction || "None",
          bulging: form.bulging || "None",
        },
        treatment: {
          status: form.treatmentStatus || "Heated",
          type: form.treatmentStatus === "Heated" ? "Traditional Heat" : "None",
        },
        origin: {
          value: form.originValue || "Sri Lanka",
          reliability: form.originReliability || "High",
        },
        informationReliability: {
          measurements: "Measured",
          treatment: "Laboratory Verified",
          origin: "Laboratory Verified",
        },
      });
    } catch {
      return null;
    }
  }, [
    form.variety,
    form.caratWeight,
    form.hue,
    form.tone,
    form.saturation,
    form.distribution,
    form.zoning,
    form.nakedEye,
    form.loupe10x,
    form.inclusionType,
    form.severity,
    form.length,
    form.width,
    form.depth,
    form.symmetry,
    form.polish,
    form.windowing,
    form.extinction,
    form.bulging,
    form.treatmentStatus,
    form.originValue,
    form.originReliability,
  ]);

  const qualityGradeText = useMemo(() => {
    if (!autoScored4C || autoScored4C.overall4C.score === null) return "Pending Evaluation";
    const s = autoScored4C.overall4C.score;
    if (s >= 88) return "Exceptional (Investment Grade)";
    if (s >= 78) return "Fine Quality Corundum";
    if (s >= 65) return "Standard Commercial Quality";
    return "Lower Commercial Quality";
  }, [autoScored4C]);

  // Peer Market Benchmark & Anomaly Validation
  const peerValidation = useMemo(() => {
    const carat = Number(form.caratWeight);
    const price = Number(form.referencePrice);
    if (!carat || carat <= 0 || !price || price <= 0) return null;

    const ppc = price / carat;
    const ppcLkr = form.currency === "USD" ? ppc * 304.25 : ppc;

    const bm = benchmarks[form.variety] || DEFAULT_BENCHMARKS[form.variety] || DEFAULT_BENCHMARKS["Blue Sapphire"];

    // Scale expected benchmark for treatment
    let expectedPpc = bm.avgPricePerCaratLkr;
    if (form.treatmentStatus === "Untreated") {
      expectedPpc *= form.variety === "Ruby" ? 1.50 : 1.45;
    }

    // Scale expected benchmark for carat size tier
    if (carat >= 5.0) {
      expectedPpc *= 1.65;
    } else if (carat >= 3.0) {
      expectedPpc *= 1.35;
    } else if (carat >= 2.0) {
      expectedPpc *= 1.15;
    }

    const variancePct = ((ppcLkr - expectedPpc) / expectedPpc) * 100;
    const absVariance = Math.abs(variancePct);

    let status: "CALIBRATED" | "MODERATE_VARIANCE" | "HIGH_ANOMALY" = "CALIBRATED";
    let statusLabel = "Well-Calibrated Market Peer";

    if (absVariance > 50) {
      status = "HIGH_ANOMALY";
      statusLabel = "Price Anomaly Warning";
    } else if (absVariance > 25) {
      status = "MODERATE_VARIANCE";
      statusLabel = "Moderate Market Variance";
    }

    return {
      ppc: Math.round(ppc),
      ppcLkr: Math.round(ppcLkr),
      expectedPpc: Math.round(expectedPpc),
      expectedRangeLkr: {
        min: Math.round(bm.pricePerCaratMin * (form.treatmentStatus === "Untreated" ? 1.4 : 1.0)),
        max: Math.round(bm.pricePerCaratMax * (form.treatmentStatus === "Untreated" ? 1.4 : 1.0) * (carat >= 3.0 ? 1.3 : 1.0)),
      },
      variancePct: Number(variancePct.toFixed(1)),
      status,
      statusLabel,
      categoryCount: bm.wholesaleCount,
    };
  }, [form.caratWeight, form.referencePrice, form.currency, form.variety, form.treatmentStatus, benchmarks]);

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
        verificationStatus: isEdit ? undefined : "Pending",
        overallScore: autoScored4C?.overall4C?.score ?? null,
        qualityGrade: qualityGradeText,
      };

      const url = isEdit && (recordDbId || form.referenceId)
        ? `/api/admin/reference-gemstones/${encodeURIComponent(recordDbId || form.referenceId)}`
        : "/api/admin/reference-gemstones";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${isEdit ? "update" : "create"} reference gemstone record.`);
      }

      if (onSuccess) {
        onSuccess(data.reference);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? "update" : "create"} reference gemstone.`);
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

      {/* AUTO-SCORED 4C GEMOLOGICAL PROFILE CARD */}
      <section className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Automated 4C Gemological Quality Score</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 tracking-wide">
                  Live Engine
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Calculated in real-time from gemological attributes using Open 4Cs weighting protocol.
              </p>
            </div>
          </div>

          {autoScored4C?.overall4C.score !== null ? (
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-indigo-200/80 shadow-2xs">
              <Award className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Overall Score</span>
                <span className="text-base font-black text-indigo-700 font-mono">
                  {autoScored4C?.overall4C.score?.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-400 italic">Enter carat &amp; 4C inputs to compute</span>
          )}
        </div>

        {autoScored4C?.overall4C.score !== null ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Quality Classification:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-extrabold ${
                  (autoScored4C?.overall4C.score ?? 0) >= 88
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : (autoScored4C?.overall4C.score ?? 0) >= 78
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : (autoScored4C?.overall4C.score ?? 0) >= 65
                    ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                    : "bg-slate-100 text-slate-700 border border-slate-300"
                }`}>
                  {qualityGradeText}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Formula: Color (40%) + Clarity (25%) + Cut (20%) + Carat (15%)
              </span>
            </div>

            {/* 4C Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Color (40%)</span>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  {autoScored4C?.color.score ?? "—"} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate mt-0.5" title={`${form.hue} (${form.saturation})`}>
                  {form.hue} · {form.saturation}
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Clarity (25%)</span>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  {autoScored4C?.clarity.score ?? "—"} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate mt-0.5" title={`${form.nakedEye} · ${form.severity}`}>
                  {form.nakedEye} · {form.severity}
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cut (20%)</span>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  {autoScored4C?.cut.score ?? "—"} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate mt-0.5" title={`Sym: ${form.symmetry} · Pol: ${form.polish}`}>
                  {form.symmetry} Sym · {form.polish}
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Carat (15%)</span>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  {autoScored4C?.carat.score ?? "—"} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate mt-0.5">
                  {form.caratWeight ? `${form.caratWeight} ct` : "—"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-indigo-200 bg-white/60 p-3 text-center text-xs text-indigo-700">
            Provide carat weight and color/clarity observations above to preview live gemological scoring.
          </div>
        )}
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

        {/* LIVE PEER BENCHMARK & ANOMALY VALIDATION CARD */}
        {peerValidation && (
          <div className={`rounded-2xl border p-4 space-y-3 transition ${
            peerValidation.status === "CALIBRATED"
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
              : peerValidation.status === "MODERATE_VARIANCE"
              ? "bg-amber-50/60 border-amber-200 text-amber-950"
              : "bg-rose-50/60 border-rose-200 text-rose-950"
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-2.5">
              <div className="flex items-center gap-2">
                {peerValidation.status === "CALIBRATED" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : peerValidation.status === "MODERATE_VARIANCE" ? (
                  <Info className="w-4 h-4 text-amber-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Live Market Peer Validation Assistant
                </span>
              </div>

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                peerValidation.status === "CALIBRATED"
                  ? "bg-emerald-100 text-emerald-800"
                  : peerValidation.status === "MODERATE_VARIANCE"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                {peerValidation.statusLabel} ({peerValidation.variancePct > 0 ? "+" : ""}{peerValidation.variancePct}%)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Proposed Rate</span>
                <span className="font-mono font-black text-sm block mt-0.5">
                  {form.currency} {peerValidation.ppc.toLocaleString()} / ct
                </span>
                {form.currency === "USD" && (
                  <span className="text-[10px] opacity-70 block font-mono">
                    ≈ LKR {peerValidation.ppcLkr.toLocaleString()} / ct
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Expected Peer Benchmark</span>
                <span className="font-mono font-bold text-sm block mt-0.5">
                  LKR {peerValidation.expectedPpc.toLocaleString()} / ct
                </span>
                <span className="text-[10px] opacity-70 block">
                  {form.treatmentStatus} · {form.caratWeight} ct weight band
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Peer Band Range</span>
                <span className="font-mono font-bold text-xs block mt-0.5">
                  LKR {peerValidation.expectedRangeLkr.min.toLocaleString()} – {peerValidation.expectedRangeLkr.max.toLocaleString()}
                </span>
                <span className="text-[10px] opacity-70 block">
                  Wholesale Clearing Spread
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Category Comparables</span>
                <span className="font-mono font-bold text-sm block mt-0.5">
                  {peerValidation.categoryCount} Verified
                </span>
                <span className="text-[10px] opacity-70 block">
                  Active wholesale sales
                </span>
              </div>
            </div>

            <div className="text-xs pt-1 border-t border-black/5 flex items-start gap-1.5 leading-relaxed">
              {peerValidation.status === "CALIBRATED" && (
                <span>
                  <strong>Benchmark Validated:</strong> Proposed rate is well-aligned with verified wholesale completed transactions. This record will reinforce precision in the automated pricing engine upon verification.
                </span>
              )}
              {peerValidation.status === "MODERATE_VARIANCE" && (
                <span>
                  <strong>Moderate Market Variance:</strong> Proposed rate deviates by {peerValidation.variancePct > 0 ? "+" : ""}{peerValidation.variancePct}% from the category median. Acceptable if the gemstone possesses exceptional saturation, unheated status, or accredited certification. Please ensure evidence is recorded.
                </span>
              )}
              {peerValidation.status === "HIGH_ANOMALY" && (
                <span>
                  <strong>Price Anomaly Warning:</strong> Proposed rate deviates significantly ({peerValidation.variancePct > 0 ? "+" : ""}{peerValidation.variancePct}%) from typical wholesale trades. Confirm that price represents a single loose gemstone rather than a multi-stone parcel, and check currency denomination.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Verification Status Notice */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800">Verification State:</span>{" "}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
              isEdit ? "bg-blue-50 text-blue-800 border border-blue-200" : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}>
              {isEdit ? "Maintains Review Status" : "Pending"}
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            {isEdit ? "Saves as new version in audit trail" : "Requires authorized CAGS sign-off before influencing pricing engine"}
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
              <span>{isEdit ? "Updating Reference..." : "Saving Record..."}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{isEdit ? "Update Reference (New Version)" : "Save Market Reference"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
