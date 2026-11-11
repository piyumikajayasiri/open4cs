"use client";

import React, {
  createContext,
  useContext,
  useState,
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
  variety: "Blue Sapphire",
  stoneId: "",
  caratWeight: "",
  shape: "Oval",
  hue: "Royal Blue",
  tone: "6",
  saturation: "Vivid",
  distribution: "Even",
  zoning: "None",
  nakedEye: "Clean",
  loupe10x: "Very Slight",
  inclusionType: "",
  inclusionLocation: "",
  severity: "Minor",
  length: "",
  width: "",
  depth: "",
  symmetry: "Good",
  polish: "Good",
  windowing: "None",
  extinction: "None",
  bulging: "None",
  treatmentStatus: "Heated",
  treatmentType: "Unverified",
  originValue: "Sri Lanka",
  originReliability: "Unverified",
  recutPotential: "",
  otherCharacteristics: "",
  attachedDocument: "",
  informationReliability: {
    measurements: "Unverified",
    treatment: "Unverified",
    origin: "Unverified",
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
  // Lazy state initialization from sessionStorage avoiding setState in effect
  const [draft, setDraft] = useState<EvaluationDraft>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          return { ...initialDraftState, ...JSON.parse(saved) };
        }
      } catch {
        // sessionStorage unavailable
      }
    }
    return initialDraftState;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Full submission calling existing backend APIs with strict validation
  const submitEvaluation = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const caratWeight = Number(draft.caratWeight);
    if (!caratWeight || caratWeight <= 0) {
      setIsSubmitting(false);
      const errMsg = "A valid positive carat weight is required.";
      setSubmitError(errMsg);
      return { success: false, error: errMsg };
    }

    const length = Number(draft.length);
    const width = Number(draft.width);
    const depth = Number(draft.depth);
    if (!length || length <= 0 || !width || width <= 0 || !depth || depth <= 0) {
      setIsSubmitting(false);
      const errMsg = "Valid positive length, width, and depth measurements are required.";
      setSubmitError(errMsg);
      return { success: false, error: errMsg };
    }

    const payload = {
      variety: draft.variety || "Blue Sapphire",
      caratWeight,
      color: {
        hue: draft.hue || "Royal Blue",
        tone: draft.tone || "6",
        saturation: draft.saturation || "Vivid",
        distribution: draft.distribution || "Even",
        zoning: draft.zoning || "None",
      },
      clarity: {
        nakedEye: draft.nakedEye || "Clean",
        loupe10x: draft.loupe10x || "Very Slight",
        inclusionType: draft.inclusionType || "",
        inclusionLocation: draft.inclusionLocation || "",
        severity: draft.severity || "Minor",
      },
      cut: {
        length,
        width,
        depth,
        symmetry: draft.symmetry || "Good",
        polish: draft.polish || "Good",
        windowing: draft.windowing || "None",
        extinction: draft.extinction || "None",
        bulging: draft.bulging || "None",
      },
      treatment: {
        status: draft.treatmentStatus || "Heated",
        type: draft.treatmentType || "Unverified",
      },
      origin: {
        value: draft.originValue || "Sri Lanka",
        reliability: draft.originReliability || "Unverified",
      },
      informationReliability: {
        measurements: draft.informationReliability?.measurements || "Unverified",
        treatment: draft.informationReliability?.treatment || "Unverified",
        origin: draft.informationReliability?.origin || "Unverified",
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

      const evaluationId = evalData.evaluationId || evalData.evaluation?._id || evalData.data?._id;

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
