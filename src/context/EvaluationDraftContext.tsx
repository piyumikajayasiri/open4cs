"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type InformationReliabilityType =
  | "Measured"
  | "User Observed"
  | "Seller Provided"
  | "Laboratory Verified"
  | "Unverified";

export interface EvaluationDraft {
  // Step 1: Gemstone variety & identification
  variety: string;
  stoneId?: string;

  // Step 2 / Step 6: Carat & Basic dimensions
  caratWeight: string;
  shape?: string;

  // Step 3: Color
  hue: string;
  tone: string;
  saturation: string;
  distribution: string;
  zoning: string;

  // Step 4: Clarity
  nakedEye: string;
  loupe10x: string;
  inclusionType: string;
  inclusionLocation: string;
  severity: string;

  // Step 5: Cut
  length: string;
  width: string;
  depth: string;
  symmetry: string;
  polish: string;
  windowing: string;
  extinction: string;
  bulging: string;

  // Step 7: Additional Factors
  treatmentStatus: string;
  treatmentType: string;
  originValue: string;
  originReliability: string;
  recutPotential?: string;
  otherCharacteristics?: string;
  attachedDocument?: string;
  informationReliability: {
    measurements: InformationReliabilityType;
    treatment: InformationReliabilityType;
    origin: InformationReliabilityType;
  };
}

export const initialDraftState: EvaluationDraft = {
  variety: "Ceylon Blue Sapphire",
  stoneId: "CEY-2026-0847",
  caratWeight: "2.45",
  shape: "Oval",
  hue: "Blue",
  tone: "Medium",
  saturation: "Vivid",
  distribution: "Even",
  zoning: "None",
  nakedEye: "Clean",
  loupe10x: "Very Slight",
  inclusionType: "Fine silk needles",
  inclusionLocation: "Near edge — low impact",
  severity: "Minor",
  length: "8.42",
  width: "6.31",
  depth: "4.55",
  symmetry: "Good",
  polish: "Excellent",
  windowing: "None",
  extinction: "Minimal",
  bulging: "None",
  treatmentStatus: "Heated (H) — mild",
  treatmentType: "Laboratory Verified",
  originValue: "Sri Lanka (Ceylon)",
  originReliability: "Seller Provided",
  recutPotential: "Low / None",
  otherCharacteristics: "No surface-reaching fissures",
  attachedDocument: "GIC-Colombo Report (Verified)",
  informationReliability: {
    measurements: "Measured",
    treatment: "Laboratory Verified",
    origin: "Seller Provided",
  },
};

interface EvaluationDraftContextType {
  draft: EvaluationDraft;
  updateDraft: (updates: Partial<EvaluationDraft>) => void;
  resetDraft: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  submitEvaluation: () => Promise<{ success: boolean; evaluationId?: string; error?: string }>;
}

const EvaluationDraftContext = createContext<EvaluationDraftContextType | undefined>(
  undefined
);

const DRAFT_STORAGE_KEY = "open4cs_evaluation_draft_v1";

export function EvaluationDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<EvaluationDraft>(initialDraftState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hydrate from sessionStorage once on client mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDraft((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // sessionStorage unavailable or parse error; use defaults
    }
  }, []);

  // Update draft in state and sync with sessionStorage
  const updateDraft = useCallback((updates: Partial<EvaluationDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Reset draft to initial state and clear sessionStorage
  const resetDraft = useCallback(() => {
    setDraft(initialDraftState);
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setSubmitError(null);
  }, []);

  // Full submission calling existing backend APIs
  const submitEvaluation = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      variety: draft.variety || "Ceylon Blue Sapphire",
      caratWeight: Number(draft.caratWeight) > 0 ? Number(draft.caratWeight) : 2.45,
      color: {
        hue: draft.hue || "Blue",
        tone: draft.tone || "Medium",
        saturation: draft.saturation || "Vivid",
        distribution: draft.distribution || "Even",
        zoning: draft.zoning || "None",
      },
      clarity: {
        nakedEye: draft.nakedEye || "Clean",
        loupe10x: draft.loupe10x || "Very Slight",
        inclusionType: draft.inclusionType || "Fine silk needles",
        inclusionLocation: draft.inclusionLocation || "Near edge — low impact",
        severity: draft.severity || "Minor",
      },
      cut: {
        length: Number(draft.length) > 0 ? Number(draft.length) : 8.42,
        width: Number(draft.width) > 0 ? Number(draft.width) : 6.31,
        depth: Number(draft.depth) > 0 ? Number(draft.depth) : 4.55,
        symmetry: draft.symmetry || "Good",
        polish: draft.polish || "Excellent",
        windowing: draft.windowing || "None",
        extinction: draft.extinction || "Minimal",
        bulging: draft.bulging || "None",
      },
      treatment: {
        status: draft.treatmentStatus || "Heated (H) — mild",
        type: draft.treatmentType || "Laboratory Verified",
      },
      origin: {
        value: draft.originValue || "Sri Lanka (Ceylon)",
        reliability: draft.originReliability || "Seller Provided",
      },
      informationReliability: {
        measurements: draft.informationReliability?.measurements || "Measured",
        treatment: draft.informationReliability?.treatment || "Laboratory Verified",
        origin: draft.informationReliability?.origin || "Seller Provided",
      },
    };

    try {
      // Step 1: Save gemstone record
      const gemRes = await fetch("/api/gemstones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const gemData = await gemRes.json();
      if (!gemRes.ok) {
        const errMsg = gemData.message || "Failed to save gemstone record.";
        setSubmitError(errMsg);
        setIsSubmitting(false);
        return { success: false, error: errMsg };
      }

      // Step 2: Trigger 4Cs evaluation engine
      const evalRes = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          gemstoneId: gemData.gemstone?._id,
        }),
      });

      const evalData = await evalRes.json();
      if (!evalRes.ok) {
        const errMsg = evalData.message || "Evaluation calculation failed.";
        setSubmitError(errMsg);
        setIsSubmitting(false);
        return { success: false, error: errMsg };
      }

      const evaluationId = evalData.evaluation?._id || gemData.gemstone?._id;

      // Evaluation complete — safely clear draft session storage
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }

      setIsSubmitting(false);
      return { success: true, evaluationId };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error during evaluation.";
      setSubmitError(errMsg);
      setIsSubmitting(false);
      return { success: false, error: errMsg };
    }
  }, [draft]);

  return (
    <EvaluationDraftContext.Provider
      value={{
        draft,
        updateDraft,
        resetDraft,
        isSubmitting,
        submitError,
        submitEvaluation,
      }}
    >
      {children}
    </EvaluationDraftContext.Provider>
  );
}

export function useEvaluationDraft() {
  const context = useContext(EvaluationDraftContext);
  if (!context) {
    throw new Error(
      "useEvaluationDraft must be used within an EvaluationDraftProvider"
    );
  }
  return context;
}
