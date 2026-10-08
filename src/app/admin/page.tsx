"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EVALUATION_RULE_VERSION } from "@/lib/evaluation/rules";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  category: string;
  role: "CAGS_ADMIN";
};

interface RuleVersionRecord {
  _id: string;
  version: string;
  name: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";

  fourCWeights: {
    color: number;
    clarity: number;
    cut: number;
    carat: number;
  };

  priceRangePercentage: number;
  notes: string;
  approvedBy: string;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GemstoneVarietyItem {
  _id: string;
  name: string;
  description: string;
  isActive?: boolean;
  engineSupported?: boolean;
}

interface HistoricalPriceRecord {
  _id: string;
  referenceGemstoneId: string;
  variety: string;
  caratWeight: number;
  price: number;
  currency: string;
  recordedAt: string;
  source: "REFERENCE_CREATED" | "REFERENCE_UPDATED";
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RecommendationRuleRecord {
  _id: string;
  key: string;
  category:
    | "COLOR"
    | "CLARITY"
    | "CUT"
    | "MEASUREMENT"
    | "VERIFICATION";
  name: string;
  description: string;
  message: string;
  isActive: boolean;
  engineSupported: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type ReferenceGemstone = {
  _id: string;
  variety: string;
  caratWeight: number;
  color?: {
    hue?: string;
    tone?: string;
    saturation?: string;
    distribution?: string;
    zoning?: string;
  };
  clarity?: {
    nakedEye?: string;
    loupe10x?: string;
    inclusionType?: string;
    inclusionLocation?: string;
    severity?: string;
  };
  cut?: {
    length?: number | null;
    width?: number | null;
    depth?: number | null;
    symmetry?: string;
    polish?: string;
    windowing?: string;
    extinction?: string;
    bulging?: string;
  };
  treatment?: {
    status?: string;
  };
  origin?: {
    value?: string;
    reliability?: string;
  };
  referencePrice: number;
  currency?: string;
};

const recommendationCategoryOrder = [
  "COLOR",
  "CLARITY",
  "CUT",
  "MEASUREMENT",
  "VERIFICATION",
] as const;

const recommendationCategoryLabels: Record<string, string> = {
  COLOR: "Color Recommendations",
  CLARITY: "Clarity Recommendations",
  CUT: "Cut Recommendations",
  MEASUREMENT: "Measurement Recommendations",
  VERIFICATION: "Verification Recommendations",
};

function createEmptyReferenceForm() {
  return {
    variety: "Blue Sapphire",
    caratWeight: "",

    color: {
      hue: "",
      tone: "",
      saturation: "",
      distribution: "",
      zoning: "",
    },

    clarity: {
      nakedEye: "",
      loupe10x: "",
      inclusionType: "",
      inclusionLocation: "",
      severity: "",
    },

    cut: {
      length: "",
      width: "",
      depth: "",
      symmetry: "",
      polish: "",
      windowing: "",
      extinction: "",
      bulging: "",
    },

    treatment: {
      status: "",
    },

    origin: {
      value: "",
      reliability: "",
    },

    referencePrice: "",
    currency: "USD",
  };
}

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [referenceGemstones, setReferenceGemstones] = useState<ReferenceGemstone[]>([]);
  const [newReference, setNewReference] = useState(createEmptyReferenceForm);
  const [editingReferenceId, setEditingReferenceId] = useState<string | null>(null);
  const [deletingReferenceId, setDeletingReferenceId] = useState<string | null>(null);
  const [referenceToDelete, setReferenceToDelete] = useState<ReferenceGemstone | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [referenceFormError, setReferenceFormError] = useState("");
  const [referenceFormMessage, setReferenceFormMessage] = useState("");
  const [referenceSubmitting, setReferenceSubmitting] = useState(false);

  const [ruleVersions, setRuleVersions] = useState<RuleVersionRecord[]>([]);
  const [ruleVersionsLoading, setRuleVersionsLoading] = useState(true);
  const [ruleVersionsError, setRuleVersionsError] = useState("");

  const [gemstoneVarieties, setGemstoneVarieties] = useState<GemstoneVarietyItem[]>([]);
  const [treatmentOptions, setTreatmentOptions] = useState<GemstoneVarietyItem[]>([]);
  const [originOptions, setOriginOptions] = useState<GemstoneVarietyItem[]>([]);
  const [editingVarietyId, setEditingVarietyId] = useState<string | null>(null);
  const [varietyDescription, setVarietyDescription] = useState("");
  const [savingVarietyId, setSavingVarietyId] = useState<string | null>(null);
  const [varietyMessage, setVarietyMessage] = useState("");
  const [varietyError, setVarietyError] = useState("");

  const [editingTreatmentId, setEditingTreatmentId] = useState<string | null>(null);
  const [treatmentDescription, setTreatmentDescription] = useState("");
  const [savingTreatmentId, setSavingTreatmentId] = useState<string | null>(null);
  const [treatmentMessage, setTreatmentMessage] = useState("");
  const [treatmentError, setTreatmentError] = useState("");

  const [editingOriginId, setEditingOriginId] = useState<string | null>(null);
  const [originDescription, setOriginDescription] = useState("");
  const [savingOriginId, setSavingOriginId] = useState<string | null>(null);
  const [originMessage, setOriginMessage] = useState("");
  const [originError, setOriginError] = useState("");

  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPriceRecord[]>([]);
  const [historicalPricesLoading, setHistoricalPricesLoading] = useState(true);
  const [historicalPricesError, setHistoricalPricesError] = useState("");

  const [recommendationRules, setRecommendationRules] = useState<
    RecommendationRuleRecord[]
  >([]);
  const [recommendationRulesLoading, setRecommendationRulesLoading] =
    useState(true);
  const [recommendationRulesError, setRecommendationRulesError] =
    useState("");

  const [editingRecommendationRuleId, setEditingRecommendationRuleId] =
    useState<string | null>(null);
  const [
    recommendationRuleDescription,
    setRecommendationRuleDescription,
  ] = useState("");
  const [
    savingRecommendationRuleId,
    setSavingRecommendationRuleId,
  ] = useState<string | null>(null);
  const [
    recommendationRuleManagementMessage,
    setRecommendationRuleManagementMessage,
  ] = useState("");
  const [
    recommendationRuleManagementError,
    setRecommendationRuleManagementError,
  ] = useState("");

  async function loadRecommendationRules() {
    try {
      setRecommendationRulesLoading(true);
      setRecommendationRulesError("");

      const response = await fetch("/api/admin/recommendation-rules");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load recommendation rules."
        );
      }

      setRecommendationRules(data.recommendationRules ?? []);
    } catch (error) {
      console.error("Failed to load recommendation rules:", error);

      setRecommendationRulesError(
        error instanceof Error
          ? error.message
          : "Unable to load recommendation rules."
      );
    } finally {
      setRecommendationRulesLoading(false);
    }
  }

  async function loadHistoricalPrices() {
    try {
      setHistoricalPricesLoading(true);
      setHistoricalPricesError("");

      const response = await fetch("/api/admin/historical-pricing");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load historical pricing."
        );
      }

      setHistoricalPrices(data.historicalPrices ?? []);
    } catch (error) {
      console.error("Failed to load historical pricing:", error);

      setHistoricalPricesError(
        error instanceof Error
          ? error.message
          : "Unable to load historical pricing."
      );
    } finally {
      setHistoricalPricesLoading(false);
    }
  }

  async function loadRuleVersions() {
    try {
      setRuleVersionsLoading(true);
      setRuleVersionsError("");

      const response = await fetch("/api/admin/rule-versions", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load evaluation rule versions."
        );
      }

      setRuleVersions(data.ruleVersions ?? []);
    } catch (error) {
      console.error("Failed to load rule versions:", error);

      setRuleVersionsError(
        error instanceof Error
          ? error.message
          : "Unable to load evaluation rule versions."
      );
    } finally {
      setRuleVersionsLoading(false);
    }
  }

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const response = await fetch("/api/admin/status");
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "CAGS Admin access required.");
          setAdminUser(null);
          return;
        }

        setAdminUser(data.user);
        loadRuleVersions();
        loadHistoricalPrices();
        loadRecommendationRules();

        const varietyResponse = await fetch("/api/admin/gemstone-varieties");
        const varietyData = await varietyResponse.json();
        if (varietyResponse.ok) {
          setGemstoneVarieties(varietyData.gemstoneVarieties ?? []);
        }

        const [tRes, oRes] = await Promise.all([
          fetch("/api/admin/treatment-options"),
          fetch("/api/admin/origin-options"),
        ]);
        if (tRes.ok) {
          const tData = await tRes.json();
          setTreatmentOptions(tData.treatmentOptions ?? []);
        }
        if (oRes.ok) {
          const oData = await oRes.json();
          setOriginOptions(oData.originOptions ?? []);
        }

        const referenceResponse = await fetch("/api/reference-gemstones");
        const referenceData = await referenceResponse.json();

        if (referenceResponse.ok) {
          const references = Array.isArray(referenceData)
            ? referenceData
            : referenceData.referenceGemstones;

          setReferenceGemstones(Array.isArray(references) ? references : []);
        }
      } catch {
        setError("Failed to verify CAGS Admin access.");
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAccess();
  }, []);

  function handleEditVariety(variety: GemstoneVarietyItem) {
    setEditingVarietyId(variety._id);
    setVarietyDescription(variety.description || "");
    setVarietyError("");
    setVarietyMessage("");
  }

  function handleCancelVarietyEdit() {
    setEditingVarietyId(null);
    setVarietyDescription("");
    setVarietyError("");
    setVarietyMessage("");
  }

  async function handleSaveVariety(id: string) {
    try {
      setSavingVarietyId(id);
      setVarietyError("");
      setVarietyMessage("");

      const response = await fetch(`/api/admin/gemstone-varieties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: varietyDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update gemstone variety.");
      }

      setGemstoneVarieties((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, description: data.gemstoneVariety.description }
            : item
        )
      );

      setEditingVarietyId(null);
      setVarietyDescription("");
      setVarietyMessage("Gemstone variety description updated successfully.");
    } catch (err) {
      setVarietyError(
        err instanceof Error ? err.message : "Failed to update variety."
      );
    } finally {
      setSavingVarietyId(null);
    }
  }

  function handleEditTreatment(option: GemstoneVarietyItem) {
    setEditingTreatmentId(option._id);
    setTreatmentDescription(option.description || "");
    setTreatmentError("");
    setTreatmentMessage("");
  }

  function handleCancelTreatmentEdit() {
    setEditingTreatmentId(null);
    setTreatmentDescription("");
    setTreatmentError("");
    setTreatmentMessage("");
  }

  async function handleSaveTreatment(id: string) {
    try {
      setSavingTreatmentId(id);
      setTreatmentError("");
      setTreatmentMessage("");

      const response = await fetch(`/api/admin/treatment-options/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: treatmentDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update treatment option.");
      }

      setTreatmentOptions((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, description: data.treatmentOption.description }
            : item
        )
      );

      setEditingTreatmentId(null);
      setTreatmentDescription("");
      setTreatmentMessage("Treatment option description updated successfully.");
    } catch (err) {
      setTreatmentError(
        err instanceof Error ? err.message : "Failed to update treatment option."
      );
    } finally {
      setSavingTreatmentId(null);
    }
  }

  function handleEditOrigin(option: GemstoneVarietyItem) {
    setEditingOriginId(option._id);
    setOriginDescription(option.description || "");
    setOriginError("");
    setOriginMessage("");
  }

  function handleCancelOriginEdit() {
    setEditingOriginId(null);
    setOriginDescription("");
    setOriginError("");
    setOriginMessage("");
  }

  async function handleSaveOrigin(id: string) {
    try {
      setSavingOriginId(id);
      setOriginError("");
      setOriginMessage("");

      const response = await fetch(`/api/admin/origin-options/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: originDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update origin option.");
      }

      setOriginOptions((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, description: data.originOption.description }
            : item
        )
      );

      setEditingOriginId(null);
      setOriginDescription("");
      setOriginMessage("Origin option description updated successfully.");
    } catch (err) {
      setOriginError(
        err instanceof Error ? err.message : "Failed to update origin option."
      );
    } finally {
      setSavingOriginId(null);
    }
  }

  function handleEditRecommendationRule(rule: RecommendationRuleRecord) {
    setEditingRecommendationRuleId(rule._id);
    setRecommendationRuleDescription(rule.description ?? "");
    setRecommendationRuleManagementError("");
    setRecommendationRuleManagementMessage("");
  }

  function handleCancelRecommendationRuleEdit() {
    setEditingRecommendationRuleId(null);
    setRecommendationRuleDescription("");
    setRecommendationRuleManagementError("");
    setRecommendationRuleManagementMessage("");
  }

  async function handleSaveRecommendationRule(id: string) {
    try {
      setSavingRecommendationRuleId(id);
      setRecommendationRuleManagementError("");
      setRecommendationRuleManagementMessage("");

      const response = await fetch(`/api/admin/recommendation-rules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: recommendationRuleDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update recommendation rule description."
        );
      }

      setRecommendationRules((prev) =>
        prev.map((r) => (r._id === id ? data.recommendationRule : r))
      );
      setRecommendationRuleManagementMessage(
        "Recommendation rule description updated successfully."
      );
      setEditingRecommendationRuleId(null);
      setRecommendationRuleDescription("");
    } catch (err) {
      console.error("Failed to save recommendation rule description:", err);
      setRecommendationRuleManagementError(
        err instanceof Error
          ? err.message
          : "Failed to update recommendation rule description."
      );
    } finally {
      setSavingRecommendationRuleId(null);
    }
  }

  function handleEditReference(reference: ReferenceGemstone) {
    setEditingReferenceId(reference._id);

    setNewReference({
      variety: reference.variety || "Blue Sapphire",
      caratWeight:
        reference.caratWeight !== undefined && reference.caratWeight !== null
          ? reference.caratWeight.toString()
          : "",

      color: {
        hue: reference.color?.hue || "",
        tone: reference.color?.tone || "",
        saturation: reference.color?.saturation || "",
        distribution: reference.color?.distribution || "",
        zoning: reference.color?.zoning || "",
      },

      clarity: {
        nakedEye: reference.clarity?.nakedEye || "",
        loupe10x: reference.clarity?.loupe10x || "",
        inclusionType: reference.clarity?.inclusionType || "",
        inclusionLocation: reference.clarity?.inclusionLocation || "",
        severity: reference.clarity?.severity || "",
      },

      cut: {
        length:
          reference.cut?.length !== null && reference.cut?.length !== undefined
            ? reference.cut.length.toString()
            : "",
        width:
          reference.cut?.width !== null && reference.cut?.width !== undefined
            ? reference.cut.width.toString()
            : "",
        depth:
          reference.cut?.depth !== null && reference.cut?.depth !== undefined
            ? reference.cut.depth.toString()
            : "",
        symmetry: reference.cut?.symmetry || "",
        polish: reference.cut?.polish || "",
        windowing: reference.cut?.windowing || "",
        extinction: reference.cut?.extinction || "",
        bulging: reference.cut?.bulging || "",
      },

      treatment: {
        status: reference.treatment?.status || "",
      },

      origin: {
        value: reference.origin?.value || "",
        reliability: reference.origin?.reliability || "",
      },

      referencePrice:
        reference.referencePrice !== undefined && reference.referencePrice !== null
          ? reference.referencePrice.toString()
          : "",
      currency: reference.currency || "USD",
    });

    setReferenceFormError("");
    setReferenceFormMessage("");

    requestAnimationFrame(() => {
      document
        .getElementById("reference-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleCancelEdit() {
    setEditingReferenceId(null);
    setNewReference(createEmptyReferenceForm());
    setReferenceFormError("");
    setReferenceFormMessage("");
  }

  async function handleDeleteReference() {
    if (!referenceToDelete) {
      return;
    }

    try {
      setDeletingReferenceId(referenceToDelete._id);
      setReferenceFormError("");
      setReferenceFormMessage("");

      const response = await fetch(
        `/api/reference-gemstones/${referenceToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to delete the reference gemstone."
        );
      }

      setReferenceGemstones((current) =>
        current.filter(
          (reference) =>
            reference._id !== referenceToDelete._id
        )
      );

      if (editingReferenceId === referenceToDelete._id) {
        setEditingReferenceId(null);
        setNewReference(createEmptyReferenceForm());
      }

      setReferenceFormMessage(
        "Reference gemstone deleted successfully."
      );

      setReferenceToDelete(null);
    } catch (error) {
      console.error(
        "Failed to delete reference gemstone:",
        error
      );

      setReferenceFormError(
        error instanceof Error
          ? error.message
          : "Unable to delete the reference gemstone."
      );
    } finally {
      setDeletingReferenceId(null);
    }
  }

  function validateNewReference() {
    setReferenceFormError("");

    const caratWeight = Number(newReference.caratWeight);
    const referencePrice = Number(newReference.referencePrice);

    if (!newReference.variety) {
      setReferenceFormError("Variety is required.");
      return false;
    }

    if (!Number.isFinite(caratWeight) || caratWeight <= 0) {
      setReferenceFormError("Carat weight must be greater than 0.");
      return false;
    }

    if (
      !newReference.color.hue ||
      !newReference.color.tone ||
      !newReference.color.saturation ||
      !newReference.color.distribution ||
      !newReference.color.zoning
    ) {
      setReferenceFormError("All Color fields are required.");
      return false;
    }

    if (
      !newReference.clarity.nakedEye ||
      !newReference.clarity.loupe10x ||
      !newReference.clarity.severity
    ) {
      setReferenceFormError(
        "Naked Eye, 10x Loupe, and Clarity Severity are required."
      );
      return false;
    }

    if (
      !newReference.cut.symmetry ||
      !newReference.cut.polish ||
      !newReference.cut.windowing ||
      !newReference.cut.extinction ||
      !newReference.cut.bulging
    ) {
      setReferenceFormError("All Cut quality fields are required.");
      return false;
    }

    if (!newReference.treatment.status) {
      setReferenceFormError("Treatment status is required.");
      return false;
    }

    if (!newReference.origin.value || !newReference.origin.reliability) {
      setReferenceFormError("Origin and Origin Reliability are required.");
      return false;
    }

    if (!Number.isFinite(referencePrice) || referencePrice <= 0) {
      setReferenceFormError("Reference price must be greater than 0.");
      return false;
    }

    if (!/^[A-Z]{3}$/.test(newReference.currency.trim())) {
      setReferenceFormError(
        "Currency must contain exactly 3 letters, for example USD."
      );
      return false;
    }

    const dimensionValues = [
      newReference.cut.length,
      newReference.cut.width,
      newReference.cut.depth,
    ];

    for (const dimension of dimensionValues) {
      if (
        dimension !== "" &&
        (!Number.isFinite(Number(dimension)) || Number(dimension) <= 0)
      ) {
        setReferenceFormError(
          "Cut dimensions must be greater than 0 when provided."
        );
        return false;
      }
    }

    return true;
  }

  async function handleAddReference() {
    if (!validateNewReference()) {
      return;
    }

    setReferenceFormMessage("");
    setReferenceSubmitting(true);

    try {
      const isEditing = editingReferenceId !== null;
      const endpoint = isEditing
        ? `/api/reference-gemstones/${editingReferenceId}`
        : "/api/reference-gemstones";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        variety: newReference.variety,
        caratWeight: Number(newReference.caratWeight),

        color: {
          ...newReference.color,
        },

        clarity: {
          ...newReference.clarity,
        },

        cut: {
          length:
            newReference.cut.length === ""
              ? null
              : Number(newReference.cut.length),

          width:
            newReference.cut.width === ""
              ? null
              : Number(newReference.cut.width),

          depth:
            newReference.cut.depth === ""
              ? null
              : Number(newReference.cut.depth),

          symmetry: newReference.cut.symmetry,
          polish: newReference.cut.polish,
          windowing: newReference.cut.windowing,
          extinction: newReference.cut.extinction,
          bulging: newReference.cut.bulging,
        },

        treatment: {
          status: newReference.treatment.status,
        },

        origin: {
          value: newReference.origin.value,
          reliability: newReference.origin.reliability,
        },

        referencePrice: Number(newReference.referencePrice),
        currency: newReference.currency.trim().toUpperCase(),
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setReferenceFormError(
          data.message ?? data.error ?? "Failed to save reference gemstone."
        );
        return;
      }

      const updatedReferenceResponse = await fetch("/api/reference-gemstones");
      const updatedReferenceData = await updatedReferenceResponse.json();

      if (updatedReferenceResponse.ok) {
        const updatedReferences = Array.isArray(updatedReferenceData)
          ? updatedReferenceData
          : updatedReferenceData.referenceGemstones;

        setReferenceGemstones(
          Array.isArray(updatedReferences) ? updatedReferences : []
        );
        loadHistoricalPrices();
      }

      setNewReference(createEmptyReferenceForm());
      setEditingReferenceId(null);
      setReferenceFormError("");
      setReferenceFormMessage(
        isEditing
          ? "Reference gemstone updated successfully."
          : "Reference gemstone created successfully."
      );
    } catch {
      setReferenceFormError("Failed to save reference gemstone.");
    } finally {
      setReferenceSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
          <h1 className="mt-4 text-xl font-bold">CAGS Administration</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Verifying administrator access permissions...
          </p>
        </div>
      </main>
    );
  }

  if (!adminUser) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <div className="max-w-md text-center rounded-2xl border border-red-200 bg-red-50 p-8 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xl">
            !
          </div>
          <h1 className="mt-4 text-2xl font-bold text-red-900">Access Denied</h1>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Login
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Top Banner */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            CAGS Administrator Dashboard
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Reference Gemstones Management
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage standardized market benchmark gemstones used by the algorithm for similarity calculations and price estimations.
          </p>
        </div>

        <div className="rounded-xl bg-[var(--surface-soft)] p-4 text-xs space-y-1 min-w-[200px]">
          <p>
            Logged in as: <strong className="text-[var(--foreground)]">{adminUser.name}</strong>
          </p>
          <p>Category: <span className="font-medium text-[var(--muted)]">{adminUser.category}</span></p>
          <p>
            Role: <span className="font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">{adminUser.role}</span>
          </p>
        </div>
      </section>

      {/* Active Evaluation Rule Version Card */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 space-y-3">
        <p className="text-sm font-medium text-[var(--muted)]">
          Active Evaluation Rule Version
        </p>

        <p className="text-xl font-bold text-[var(--foreground)]">
          {EVALUATION_RULE_VERSION}
        </p>

        <p className="text-sm leading-6 text-[var(--muted)]">
          New evaluations currently use this prototype rule version.
          Saved evaluations retain the rule version that was used when
          they were created.
        </p>

        <p className="text-xs leading-5 text-[var(--muted)]">
          Prototype rule values are configurable development criteria and
          should be reviewed and validated before being treated as
          CAGS-approved production criteria.
        </p>
      </section>

      {/* Evaluation Rule Version History Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Evaluation Rule Versions
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Stored versions provide a history of evaluation rule configurations.
            Rule activation is not enabled yet because the current evaluation
            engine uses its configured static prototype rules.
          </p>
        </div>

        {ruleVersionsLoading && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted)]">
            Loading rule versions...
          </div>
        )}

        {ruleVersionsError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {ruleVersionsError}
          </div>
        )}

        {!ruleVersionsLoading &&
          !ruleVersionsError &&
          ruleVersions.length === 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
              <p className="font-semibold text-[var(--foreground)]">
                No stored rule versions yet.
              </p>

              <p className="mt-2 text-sm text-[var(--muted)]">
                The evaluation engine continues to use its configured
                prototype rules.
              </p>
            </div>
          )}

        {!ruleVersionsLoading &&
          !ruleVersionsError &&
          ruleVersions.map((ruleVersion) => (
            <article
              key={ruleVersion._id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/40 p-5 space-y-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">
                    {ruleVersion.name}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-[var(--primary)]">
                    {ruleVersion.version}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-white border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                  {ruleVersion.status}
                </span>
              </div>

              <p className="text-sm leading-6 text-[var(--muted)]">
                {ruleVersion.description}
              </p>

              <div className="pt-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  4C Weight Snapshot
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-white border border-[var(--border)] p-3">
                    <p className="text-xs text-[var(--muted)]">Color</p>
                    <p className="mt-1 font-bold">
                      {(ruleVersion.fourCWeights.color * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-[var(--border)] p-3">
                    <p className="text-xs text-[var(--muted)]">Clarity</p>
                    <p className="mt-1 font-bold">
                      {(ruleVersion.fourCWeights.clarity * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-[var(--border)] p-3">
                    <p className="text-xs text-[var(--muted)]">Cut</p>
                    <p className="mt-1 font-bold">
                      {(ruleVersion.fourCWeights.cut * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-[var(--border)] p-3">
                    <p className="text-xs text-[var(--muted)]">Carat</p>
                    <p className="mt-1 font-bold">
                      {(ruleVersion.fourCWeights.carat * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white border border-[var(--border)] p-3">
                <p className="text-xs text-[var(--muted)]">
                  Suggested Price Range
                </p>

                <p className="mt-1 font-semibold text-[var(--foreground)]">
                  ±{(ruleVersion.priceRangePercentage * 100).toFixed(0)}%
                </p>
              </div>

              <div className="text-xs text-[var(--muted)]">
                {ruleVersion.approvedBy && ruleVersion.approvedAt ? (
                  <p>
                    Approval information recorded: {ruleVersion.approvedBy}
                  </p>
                ) : (
                  <p>
                    No formal approval information has been recorded for this
                    version.
                  </p>
                )}
              </div>

              {ruleVersion.notes && (
                <div className="rounded-xl bg-white border border-[var(--border)] p-4">
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Notes
                  </p>

                  <p className="mt-1.5 text-sm leading-6 text-[var(--foreground)]">
                    {ruleVersion.notes}
                  </p>
                </div>
              )}
            </article>
          ))}
      </section>

      {/* Supported Gemstone Varieties Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Supported Gemstone Varieties
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The valuation engine currently supports rules and scoring parameters for three corundum varieties. CAGS admins can edit educational descriptions below.
          </p>
        </div>

        {varietyError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {varietyError}
          </div>
        )}

        {varietyMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {varietyMessage}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {gemstoneVarieties.map((variety) => (
            <div
              key={variety._id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/40 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[var(--foreground)]">
                    {variety.name}
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      Engine Supported
                    </span>
                  </div>
                </div>

                {editingVarietyId === variety._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                        Educational Description (max 500 chars)
                      </label>
                      <textarea
                        rows={4}
                        maxLength={500}
                        value={varietyDescription}
                        onChange={(e) => setVarietyDescription(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        placeholder="Enter educational description..."
                      />
                      <div className="mt-1 text-right text-xs text-[var(--muted)]">
                        {varietyDescription.length}/500
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelVarietyEdit}
                        disabled={savingVarietyId === variety._id}
                        className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveVariety(variety._id)}
                        disabled={savingVarietyId === variety._id}
                        className="rounded-xl bg-[var(--primary)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--primary-dark)] transition disabled:opacity-60"
                      >
                        {savingVarietyId === variety._id ? "Saving..." : "Save Description"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm leading-6 text-[var(--muted)] min-h-[60px]">
                      {variety.description || "No educational description added yet."}
                    </p>
                  </div>
                )}
              </div>

              {editingVarietyId !== variety._id && (
                <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleEditVariety(variety)}
                    className="rounded-lg border border-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)] transition"
                  >
                    Edit Description
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Treatment Information Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Treatment Information
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            These are the treatment categories supported by the current evaluation rules. You can update their educational descriptions below.
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Pricing adjustments and supported treatment categories cannot be changed from this screen.
          </p>
        </div>

        {treatmentError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {treatmentError}
          </div>
        )}

        {treatmentMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {treatmentMessage}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {treatmentOptions.map((option) => (
            <div
              key={option._id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/40 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[var(--foreground)]">
                    {option.name}
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      Engine Supported
                    </span>
                  </div>
                </div>

                {editingTreatmentId === option._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                        Educational Description (max 500 chars)
                      </label>
                      <p className="text-[11px] text-[var(--muted)] mb-1.5 leading-4">
                        This text helps users understand what this treatment category means. It does not verify whether a gemstone actually received this treatment.
                      </p>
                      <textarea
                        rows={4}
                        maxLength={500}
                        value={treatmentDescription}
                        onChange={(e) => setTreatmentDescription(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        placeholder="Enter educational description..."
                      />
                      <div className="mt-1 text-right text-xs text-[var(--muted)]">
                        {treatmentDescription.length}/500
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelTreatmentEdit}
                        disabled={savingTreatmentId === option._id}
                        className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveTreatment(option._id)}
                        disabled={savingTreatmentId === option._id}
                        className="rounded-xl bg-[var(--primary)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--primary-dark)] transition disabled:opacity-60"
                      >
                        {savingTreatmentId === option._id ? "Saving..." : "Save Description"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm leading-6 text-[var(--muted)] min-h-[60px]">
                      {option.description || "No educational description added yet."}
                    </p>
                  </div>
                )}
              </div>

              {editingTreatmentId !== option._id && (
                <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleEditTreatment(option)}
                    className="rounded-lg border border-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)] transition"
                  >
                    Edit Description
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Gemstone Origin Information Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Gemstone Origin Information
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            These are the geographic origin choices supported by the current evaluation rules. You can update their educational descriptions below.
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            An origin entered in the system is reported information. It does not authenticate or scientifically determine a gemstone&apos;s origin.
          </p>
        </div>

        {originError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {originError}
          </div>
        )}

        {originMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {originMessage}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {originOptions.map((option) => (
            <div
              key={option._id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/40 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[var(--foreground)]">
                    {option.name}
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      Engine Supported
                    </span>
                  </div>
                </div>

                {editingOriginId === option._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                        Educational Description (max 500 chars)
                      </label>
                      <textarea
                        rows={4}
                        maxLength={500}
                        value={originDescription}
                        onChange={(e) => setOriginDescription(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        placeholder="Enter educational description..."
                      />
                      <div className="mt-1 text-right text-xs text-[var(--muted)]">
                        {originDescription.length}/500
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelOriginEdit}
                        disabled={savingOriginId === option._id}
                        className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveOrigin(option._id)}
                        disabled={savingOriginId === option._id}
                        className="rounded-xl bg-[var(--primary)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--primary-dark)] transition disabled:opacity-60"
                      >
                        {savingOriginId === option._id ? "Saving..." : "Save Description"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm leading-6 text-[var(--muted)] min-h-[60px]">
                      {option.description || "No educational description added yet."}
                    </p>
                  </div>
                )}
              </div>

              {editingOriginId !== option._id && (
                <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleEditOrigin(option)}
                    className="rounded-lg border border-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)] transition"
                  >
                    Edit Description
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Add / Edit Reference Form */}
      <section id="reference-form" className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold">
            {editingReferenceId ? "Edit Reference Gemstone" : "Add New Reference Gemstone"}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {editingReferenceId
              ? "Update the reference information below, then save your changes."
              : "Create a standard reference specimen. All required parameters are evaluated during comparable matching."}
          </p>
        </div>

        {referenceFormError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {referenceFormError}
          </div>
        )}

        {referenceFormMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {referenceFormMessage}
          </div>
        )}

        <form className="space-y-8">
          {/* General Specs */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium">Gemstone Variety *</label>
              <select
                value={newReference.variety}
                onChange={(event) =>
                  setNewReference({
                    ...newReference,
                    variety: event.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                {gemstoneVarieties.length === 0 ? (
                  <>
                    <option value="Blue Sapphire">Blue Sapphire</option>
                    <option value="Padparadscha">Padparadscha</option>
                    <option value="Ruby">Ruby</option>
                  </>
                ) : (
                  gemstoneVarieties.map((variety) => (
                    <option key={variety._id} value={variety.name}>
                      {variety.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Carat Weight (ct) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 2.50"
                value={newReference.caratWeight}
                onChange={(event) =>
                  setNewReference({
                    ...newReference,
                    caratWeight: event.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-3.5 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Reference Price *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 3500"
                value={newReference.referencePrice}
                onChange={(event) =>
                  setNewReference({
                    ...newReference,
                    referencePrice: event.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-3.5 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Currency *</label>
              <input
                type="text"
                maxLength={3}
                placeholder="USD"
                value={newReference.currency}
                onChange={(event) =>
                  setNewReference({
                    ...newReference,
                    currency: event.target.value.toUpperCase(),
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-3.5 py-2.5 text-sm uppercase focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          {/* Color Section */}
          <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 p-5 space-y-4">
            <legend className="px-2 font-semibold text-sm text-[var(--foreground)]">
              Color Parameters
            </legend>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
              <div>
                <label className="block text-xs font-medium">Hue *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Blue"
                  value={newReference.color.hue}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      color: {
                        ...newReference.color,
                        hue: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Tone *</label>
                <input
                  type="text"
                  placeholder="e.g. Medium Dark"
                  value={newReference.color.tone}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      color: {
                        ...newReference.color,
                        tone: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Saturation *</label>
                <input
                  type="text"
                  placeholder="e.g. Vivid"
                  value={newReference.color.saturation}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      color: {
                        ...newReference.color,
                        saturation: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Distribution *</label>
                <input
                  type="text"
                  placeholder="e.g. Uniform"
                  value={newReference.color.distribution}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      color: {
                        ...newReference.color,
                        distribution: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Zoning *</label>
                <input
                  type="text"
                  placeholder="e.g. None"
                  value={newReference.color.zoning}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      color: {
                        ...newReference.color,
                        zoning: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </fieldset>

          {/* Clarity Section */}
          <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 p-5 space-y-4">
            <legend className="px-2 font-semibold text-sm text-[var(--foreground)]">
              Clarity Parameters
            </legend>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
              <div>
                <label className="block text-xs font-medium">Naked Eye *</label>
                <select
                  value={newReference.clarity.nakedEye}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      clarity: {
                        ...newReference.clarity,
                        nakedEye: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Clean">Clean</option>
                  <option value="Very Slight">Very Slight</option>
                  <option value="Slight">Slight</option>
                  <option value="Noticeable">Noticeable</option>
                  <option value="Obvious">Obvious</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium">10× Loupe *</label>
                <select
                  value={newReference.clarity.loupe10x}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      clarity: {
                        ...newReference.clarity,
                        loupe10x: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Clean">Clean</option>
                  <option value="Very Slight">Very Slight</option>
                  <option value="Slight">Slight</option>
                  <option value="Noticeable">Noticeable</option>
                  <option value="Obvious">Obvious</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium">Inclusion Type</label>
                <input
                  type="text"
                  placeholder="e.g. Feather"
                  value={newReference.clarity.inclusionType}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      clarity: {
                        ...newReference.clarity,
                        inclusionType: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Inclusion Location</label>
                <input
                  type="text"
                  placeholder="e.g. Pavilion"
                  value={newReference.clarity.inclusionLocation}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      clarity: {
                        ...newReference.clarity,
                        inclusionLocation: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Severity *</label>
                <select
                  value={newReference.clarity.severity}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      clarity: {
                        ...newReference.clarity,
                        severity: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="None">None</option>
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Cut Parameters */}
          <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 p-5 space-y-4">
            <legend className="px-2 font-semibold text-sm text-[var(--foreground)]">
              Cut & Quality Parameters
            </legend>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium">Length (mm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 7.50"
                  value={newReference.cut.length}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      cut: {
                        ...newReference.cut,
                        length: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Width (mm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 5.50"
                  value={newReference.cut.width}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      cut: {
                        ...newReference.cut,
                        width: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Depth (mm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 4.20"
                  value={newReference.cut.depth}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      cut: {
                        ...newReference.cut,
                        depth: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
              <div>
                <label className="block text-xs font-medium">Symmetry *</label>
                <select
                  value={newReference.cut.symmetry}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      cut: {
                        ...newReference.cut,
                        symmetry: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium">Polish *</label>
                <select
                  value={newReference.cut.polish}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      cut: {
                        ...newReference.cut,
                        polish: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium">Windowing *</label>
                <select
                  value={newReference.cut.windowing}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      cut: {
                        ...newReference.cut,
                        windowing: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="None">None</option>
                  <option value="Slight">Slight</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium">Extinction *</label>
                <select
                  value={newReference.cut.extinction}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      cut: {
                        ...newReference.cut,
                        extinction: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="None">None</option>
                  <option value="Slight">Slight</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium">Bulging *</label>
                <select
                  value={newReference.cut.bulging}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      cut: {
                        ...newReference.cut,
                        bulging: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="None">None</option>
                  <option value="Slight">Slight</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Treatment & Origin */}
          <div className="grid gap-6 sm:grid-cols-2">
            <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 p-5 space-y-4">
              <legend className="px-2 font-semibold text-sm text-[var(--foreground)]">
                Treatment Parameters
              </legend>
              <div>
                <label className="block text-xs font-medium">Treatment Status *</label>
                <select
                  value={newReference.treatment.status}
                  onChange={(event) =>
                    setNewReference({
                      ...newReference,
                      treatment: {
                        ...newReference.treatment,
                        status: event.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {treatmentOptions.length === 0 ? (
                    <>
                      <option value="Untreated">Untreated</option>
                      <option value="Heated">Heated</option>
                      <option value="Treated">Treated</option>
                      <option value="Unknown">Unknown</option>
                    </>
                  ) : (
                    treatmentOptions.map((option) => (
                      <option key={option._id} value={option.name}>
                        {option.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </fieldset>

            <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 p-5 space-y-4">
              <legend className="px-2 font-semibold text-sm text-[var(--foreground)]">
                Origin Parameters
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium">Geographic Origin *</label>
                  <select
                    value={newReference.origin.value}
                    onChange={(event) =>
                      setNewReference({
                        ...newReference,
                        origin: {
                          ...newReference.origin,
                          value: event.target.value,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select</option>
                    {originOptions.length === 0 ? (
                      <>
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="Myanmar">Myanmar</option>
                        <option value="Madagascar">Madagascar</option>
                        <option value="Other">Other</option>
                        <option value="Unknown">Unknown</option>
                      </>
                    ) : (
                      originOptions.map((option) => (
                        <option key={option._id} value={option.name}>
                          {option.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium">Origin Reliability *</label>
                  <select
                    value={newReference.origin.reliability}
                    onChange={(event) =>
                      setNewReference({
                        ...newReference,
                        origin: {
                          ...newReference.origin,
                          reliability: event.target.value,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="flex justify-end gap-3">
            {editingReferenceId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={referenceSubmitting}
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={handleAddReference}
              disabled={referenceSubmitting}
              className="rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 transition"
            >
              {referenceSubmitting
                ? editingReferenceId
                  ? "Saving Changes..."
                  : "Adding Specimen..."
                : editingReferenceId
                  ? "Save Changes"
                  : "+ Add Reference Gemstone"}
            </button>
          </div>
        </form>
      </section>

      {/* Existing Reference Gemstones List */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Active Reference Specimens</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Currently registered benchmark gemstones in the valuation engine database.
            </p>
          </div>
          <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary-dark)]">
            {referenceGemstones.length} Specimen{referenceGemstones.length !== 1 ? "s" : ""}
          </span>
        </div>

        {referenceGemstones.length === 0 ? (
          <div className="rounded-xl bg-[var(--surface-soft)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">No reference gemstones available in database.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {referenceGemstones.map((reference) => (
              <div
                key={reference._id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/40 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-[var(--foreground)]">
                    {reference.variety}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white border border-[var(--border)] px-2 py-0.5 text-xs font-semibold">
                      {reference.caratWeight} ct
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEditReference(reference)}
                      className="rounded-lg border border-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)] transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReferenceToDelete(reference);
                        setReferenceFormError("");
                        setReferenceFormMessage("");
                      }}
                      disabled={deletingReferenceId === reference._id}
                      className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingReferenceId === reference._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-[var(--muted)]">
                  <p>
                    Benchmark Price:{" "}
                    <span className="font-semibold text-[var(--foreground)]">
                      {reference.currency ?? "USD"} {reference.referencePrice?.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Dimensions:{" "}
                    <span className="font-medium text-[var(--foreground)]">
                      {reference.cut?.length && reference.cut?.width && reference.cut?.depth
                        ? `${reference.cut.length} × ${reference.cut.width} × ${reference.cut.depth} mm`
                        : "Not specified"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historical Pricing Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Historical Pricing
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Review the recorded pricing history of reference gemstones used by the evaluation system.
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            These records are kept as an audit history. They cannot be edited or deleted from this dashboard.
          </p>
        </div>

        <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            How is this used?
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Historical records show how reference prices changed over time. New gemstone evaluations use the current reference price, not an older historical price.
          </p>
        </div>

        {historicalPricesLoading && (
          <p className="text-sm text-[var(--muted)]">
            Loading pricing history...
          </p>
        )}

        {historicalPricesError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {historicalPricesError}
          </div>
        )}

        {!historicalPricesLoading &&
          !historicalPricesError &&
          historicalPrices.length === 0 && (
            <p className="text-sm text-[var(--muted)]">
              No historical pricing records are available yet.
            </p>
          )}

        {!historicalPricesLoading &&
          !historicalPricesError &&
          historicalPrices.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {historicalPrices.map((record) => (
                <article
                  key={record._id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/40 p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)] text-base">
                        {record.variety}
                      </h3>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {record.caratWeight} ct
                      </p>
                    </div>

                    <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary-dark)]">
                      {record.source === "REFERENCE_CREATED"
                        ? "Initial Price"
                        : "Price Updated"}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--muted)]">
                      Recorded Price
                    </p>

                    <p className="mt-1 text-lg font-bold text-[var(--foreground)]">
                      {record.currency} {record.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)] space-y-1">
                    <p>
                      <span className="font-medium text-[var(--foreground)]">Recorded:</span>{" "}
                      {new Date(record.recordedAt).toLocaleString()}
                    </p>

                    {record.note && (
                      <p className="text-[var(--muted)] leading-5">
                        {record.note}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>

      {/* Recommendation Rules Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Recommendation Rules
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            These rules determine when educational recommendations may appear
            after a gemstone evaluation.
          </p>
        </div>

        <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            How do these rules work?
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            The evaluation engine controls each rule&apos;s trigger and recommendation
            message. CAGS administrators can update the educational description
            shown in this dashboard, but cannot change evaluation behavior here.
          </p>
        </div>

        {recommendationRuleManagementMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {recommendationRuleManagementMessage}
          </div>
        )}

        {recommendationRuleManagementError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {recommendationRuleManagementError}
          </div>
        )}

        {recommendationRulesLoading && (
          <p className="text-sm text-[var(--muted)]">
            Loading recommendation rules...
          </p>
        )}

        {recommendationRulesError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {recommendationRulesError}
          </div>
        )}

        {!recommendationRulesLoading &&
          !recommendationRulesError &&
          recommendationRules.length === 0 && (
            <p className="text-sm text-[var(--muted)]">
              No recommendation rules are available.
            </p>
          )}

        {!recommendationRulesLoading &&
          !recommendationRulesError &&
          recommendationRules.length > 0 && (
            <div className="space-y-8">
              {recommendationCategoryOrder.map((category) => {
                const categoryRules = recommendationRules.filter(
                  (r) => r.category === category
                );
                if (categoryRules.length === 0) return null;

                return (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2">
                      {recommendationCategoryLabels[category] ??
                        `${category} Recommendations`}
                    </h3>

                    <div className="grid gap-4 lg:grid-cols-2">
                      {categoryRules.map((rule) => (
                        <article
                          key={rule._id}
                          className="rounded-xl border border-[var(--border)] bg-white p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-[var(--foreground)]">
                                {rule.name}
                              </h4>

                              <p className="mt-1 text-xs text-[var(--muted)]">
                                {rule.category}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {rule.isActive && (
                                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--primary-dark)]">
                                  Active
                                </span>
                              )}

                              {rule.engineSupported && (
                                <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] border border-[var(--border)]">
                                  Engine Supported
                                </span>
                              )}

                              {editingRecommendationRuleId !== rule._id && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditRecommendationRule(rule)
                                  }
                                  className="rounded-lg border border-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)] transition"
                                >
                                  Edit Description
                                </button>
                              )}
                            </div>
                          </div>

                          {editingRecommendationRuleId === rule._id ? (
                            <div className="mt-4">
                              <label className="text-sm font-semibold text-[var(--foreground)]">
                                Educational Description
                              </label>

                              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                Explain when this recommendation applies in language
                                that is easy for administrators to understand. This
                                does not change the evaluation trigger.
                              </p>

                              <textarea
                                value={recommendationRuleDescription}
                                onChange={(event) =>
                                  setRecommendationRuleDescription(
                                    event.target.value
                                  )
                                }
                                maxLength={500}
                                rows={4}
                                className="mt-3 w-full rounded-xl border border-[var(--border)] p-3 text-sm focus:border-[var(--primary)] focus:outline-hidden"
                              />

                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveRecommendationRule(rule._id)
                                    }
                                    disabled={
                                      savingRecommendationRuleId === rule._id
                                    }
                                    className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--primary-dark)] transition disabled:opacity-60"
                                  >
                                    {savingRecommendationRuleId === rule._id
                                      ? "Saving..."
                                      : "Save Description"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={handleCancelRecommendationRuleEdit}
                                    disabled={
                                      savingRecommendationRuleId === rule._id
                                    }
                                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition disabled:opacity-60"
                                  >
                                    Cancel
                                  </button>
                                </div>

                                <p className="text-xs text-[var(--muted)]">
                                  {recommendationRuleDescription.length}/500
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-[var(--muted)]">
                                When it applies
                              </p>

                              <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                                {rule.description}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 rounded-lg bg-[var(--surface-soft)] p-3 space-y-1">
                            <p className="text-xs font-semibold text-[var(--muted)]">
                              Engine Recommendation
                            </p>

                            <p className="text-[11px] leading-4 text-[var(--muted)]">
                              This wording is controlled by the current evaluation
                              engine and cannot be edited here.
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[var(--foreground)] pt-1">
                              {rule.message}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </section>

      {referenceToDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-reference-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3
              id="delete-reference-title"
              className="text-lg font-bold text-[var(--foreground)]"
            >
              Delete Reference Gemstone?
            </h3>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              You are about to delete the reference for{" "}
              <strong className="text-[var(--foreground)]">
                {referenceToDelete.variety}
              </strong>
              . This reference will no longer be available for future
              gemstone comparisons.
            </p>

            <p className="mt-3 text-sm font-medium text-red-700">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setReferenceToDelete(null)}
                disabled={deletingReferenceId !== null}
                className="rounded-xl border border-[var(--border)] px-4 py-2 font-semibold text-[var(--foreground)] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteReference}
                disabled={deletingReferenceId !== null}
                className="rounded-xl bg-red-700 px-4 py-2 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingReferenceId
                  ? "Deleting..."
                  : "Delete Reference"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
