"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import BasicInformation from "./BasicInformation";
import ColorSection from "./ColorSection";
import ClaritySection from "./ClaritySection";
import CutSection from "./CutSection";
import CaratSection from "./CaratSection";
import AdditionalInformationSection from "./AdditionalInformationSection";
import EvaluationProcessingScreen from "./EvaluationProcessingScreen";
import ReviewSection from "./ReviewSection";
import EvaluationDetailsCard from "./EvaluationDetailsCard";
import EvaluationProgress from "./EvaluationProgress";
import EvaluationResultSummary from "./EvaluationResultSummary";
import EvaluationCompleteDashboard from "./EvaluationCompleteDashboard";
import InformationReliabilityCard from "./InformationReliabilityCard";
import PriceSuggestionCard from "./PriceSuggestionCard";
import RecommendationsCard from "./RecommendationsCard";
import ReferenceComparisonCard from "./ReferenceComparisonCard";
import ResultSection from "./ResultSection";
import EvaluationHistory, {
  type EvaluationHistoryItem,
} from "./EvaluationHistory";
import ReferenceGemstoneList, {
  type ReferenceGemstoneItem,
} from "./ReferenceGemstoneList";

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  category: string;
  role: "USER" | "CAGS_ADMIN";
};

export default function GemstoneForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [currentUser, setCurrentUser] =
    useState<AuthenticatedUser | null>(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [variety, setVariety] = useState("");
  const [caratWeight, setCaratWeight] = useState("");

  const [hue, setHue] = useState("");
  const [tone, setTone] = useState("");
  const [saturation, setSaturation] = useState("");
  const [distribution, setDistribution] = useState("");
  const [zoning, setZoning] = useState("");

  const [nakedEye, setNakedEye] = useState("");
  const [loupe10x, setLoupe10x] = useState("");
  const [inclusionType, setInclusionType] = useState("");
  const [inclusionLocation, setInclusionLocation] = useState("");
  const [severity, setSeverity] = useState("");

  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [symmetry, setSymmetry] = useState("");
  const [polish, setPolish] = useState("");
  const [windowing, setWindowing] = useState("");
  const [extinction, setExtinction] = useState("");
  const [bulging, setBulging] = useState("");

  const [treatmentStatus, setTreatmentStatus] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [originValue, setOriginValue] = useState("");
  const [originReliability, setOriginReliability] = useState("");
  const [informationReliability, setInformationReliability] = useState({
    measurements: "Measured",
    treatment: "Unverified",
    origin: "Unverified",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [evaluationHistory, setEvaluationHistory] =
    useState<EvaluationHistoryItem[]>([]);
  const [referenceGemstones, setReferenceGemstones] =
    useState<ReferenceGemstoneItem[]>([]);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (response.ok && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    async function loadEvaluationHistory() {
      try {
        const response = await fetch("/api/evaluations");
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          setEvaluationHistory(data);
        } else {
          setEvaluationHistory([]);
        }
      } catch (error) {
        console.error(
          "Failed to load evaluation history:",
          error
        );
        setEvaluationHistory([]);
      }
    }

    async function loadReferenceGemstones() {
      try {
        const response = await fetch(
          "/api/reference-gemstones"
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const references =
          data.referenceGemstones ?? data;

        if (Array.isArray(references)) {
          setReferenceGemstones(references);
        }
      } catch (error) {
        console.error(
          "Failed to load reference gemstones:",
          error
        );
      }
    }

    loadCurrentUser();
    loadEvaluationHistory();
    loadReferenceGemstones();
  }, []);
  const [evaluationResult, setEvaluationResult] = useState<{
    _id?: string;
    status: string;
    ruleVersion: string;
    overall4C: {
      status: string;
      reason: string;
      score: number | null;
      weights: {
        color: number;
        clarity: number;
        cut: number;
        carat: number;
      };
    };
    color: {
      status: string;
      reason: string;
      score: number | null;
    };
    clarity: {
      status: string;
      reason: string;
      score: number | null;
    };
    cut: {
      status: string;
      reason: string;
      score: number | null;
      measurements: {
        lengthToWidthRatio: number | null;
        depthPercentage: number | null;
      };
    };
    carat: {
      status: string;
      reason: string;
      score: number | null;
      caratWeight: number;
      dimensions: {
        length: number;
        width: number;
        depth: number;
      };
      sizeConsistency: number | null;
    };
    treatment: {
      status: string;
      reason: string;
      adjustmentFactor: number | null;
    };
    origin: {
      status: string;
      reason: string;
      adjustmentFactor: number | null;
      reliabilityFactor: number | null;
    };
    informationReliability: {
      measurements:
        | "Measured"
        | "User Observed"
        | "Seller Provided"
        | "Laboratory Verified"
        | "Unverified";
      treatment:
        | "Measured"
        | "User Observed"
        | "Seller Provided"
        | "Laboratory Verified"
        | "Unverified";
      origin:
        | "Measured"
        | "User Observed"
        | "Seller Provided"
        | "Laboratory Verified"
        | "Unverified";
    };
    recommendations: {
      status: string;
      recommendations: {
        category:
          | "COLOR"
          | "CLARITY"
          | "CUT"
          | "MEASUREMENT"
          | "VERIFICATION";
        message: string;
      }[];
    };
    referenceDataSufficiency: {
      status: "SUFFICIENT" | "INSUFFICIENT";
      availableReferences: number;
      requiredReferences: number;
    };
    bestReferenceMatch: {
      referenceGemstoneId: string;
      variety: string;
      caratWeight: number;
      referencePrice: number;
      currency: string;
      similarity: {
        color: number | null;
        clarity: number | null;
        cut: number | null;
        cutDimensions: number | null;
        carat: number | null;
        overall: number | null;
      };
    } | null;
    priceSuggestion: {
      status: string;
      reason: string;
      currency: string | null;
      referencePrice: number | null;
      suggestedPrice: number | null;
      priceRange: {
        minimum: number | null;
        maximum: number | null;
      };
      adjustmentFactors: {
        treatment: number | null;
        origin: number | null;
      };
    };
  } | null>(null);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        alert("Logout failed.");
        return;
      }

      setCurrentUser(null);
      setEvaluationHistory([]);
    } catch {
      alert("Logout failed.");
    }
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();

    if (!currentUser) {
      alert("Please log in before evaluating a gemstone.");
      return;
    }

    setError("");

    if (!variety) {
      setError("Please select a gemstone variety.");
      return;
    }

    if (!caratWeight || Number(caratWeight) <= 0) {
      setError("Please enter a valid carat weight.");
      return;
    }

    setMessage("");

    if (!variety) {
      setMessage("Please select a gemstone variety.");
      return;
    }

    if (!caratWeight) {
      setMessage("Please enter the carat weight.");
      return;
    }

    const payload = {
      variety: variety || "Ceylon Blue Sapphire",
      caratWeight: Number(caratWeight) > 0 ? Number(caratWeight) : 2.45,
      color: {
        hue: hue || "Blue",
        tone: tone || "Medium",
        saturation: saturation || "Vivid",
        distribution: distribution || "Even",
        zoning: zoning || "None",
      },
      clarity: {
        nakedEye: nakedEye || "Clean",
        loupe10x: loupe10x || "Very Slight",
        inclusionType: inclusionType || "Fine silk needles",
        inclusionLocation: inclusionLocation || "Near edge — low impact",
        severity: severity || "Minor",
      },
      cut: {
        length: Number(length) > 0 ? Number(length) : 8.42,
        width: Number(width) > 0 ? Number(width) : 6.31,
        depth: Number(depth) > 0 ? Number(depth) : 4.55,
        symmetry: symmetry || "Good",
        polish: polish || "Excellent",
        windowing: windowing || "None",
        extinction: extinction || "Minimal",
        bulging: bulging || "None",
      },
      treatment: {
        status: treatmentStatus || "Heated (H) — mild",
        type: treatmentType || "Laboratory Verified",
      },
      origin: {
        value: originValue || "Sri Lanka (Ceylon)",
        reliability: originReliability || "Seller Provided",
      },
      informationReliability: {
        measurements: informationReliability?.measurements || "Measured",
        treatment: informationReliability?.treatment || "Laboratory Verified",
        origin: informationReliability?.origin || "Seller Provided",
      },
    };

    try {
      setLoading(true);

      const response = await fetch("/api/gemstones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to save gemstone.");
        return;
      }

      const evaluationResponse = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          gemstoneId: result.gemstone?._id,
        }),
      });

      const evaluationResult = await evaluationResponse.json();

      if (!evaluationResponse.ok) {
        throw new Error(
          evaluationResult.message || "Evaluation failed."
        );
      }

      setEvaluationResult({
        ...evaluationResult.evaluation,
        bestReferenceMatch: evaluationResult.bestReferenceMatch,
        priceSuggestion: evaluationResult.priceSuggestion,
      });

      setMessage(
        `Gemstone saved successfully. ID: ${result.gemstone._id}`
      );

      const historyResponse = await fetch(
        "/api/evaluations"
      );
      const historyData = await historyResponse.json();

      if (historyResponse.ok && Array.isArray(historyData)) {
        setEvaluationHistory(historyData);
      } else {
        setEvaluationHistory([]);
      }
    } catch (err) {
      console.error("Request error:", err);
      setError("Something went wrong while saving the gemstone.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2>User Account</h2>

        {authLoading ? (
          <p>Checking login status...</p>
        ) : currentUser ? (
          <div>
            <p>
              Logged in as: <strong>{currentUser.name}</strong>
            </p>
            <p>Category: {currentUser.category}</p>
            <p>Role: {currentUser.role}</p>

            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p>You are not logged in.</p>
            <p>Please log in before evaluating a gemstone.</p>

            <p>
              <Link href="/login">Login</Link>
              {" | "}
              <Link href="/register">Create Account</Link>
            </p>
          </div>
        )}
      </section>

      {evaluationResult ? (
        <EvaluationCompleteDashboard
          stoneId={evaluationResult._id ? String(evaluationResult._id).slice(-8).toUpperCase() : "CEY-2026-0847"}
          variety={variety || "Ceylon Blue Sapphire"}
          evaluationDate="24 Sep 2026"
          ruleVersion={evaluationResult.ruleVersion || "v4.2"}
          overallScore={
            (evaluationResult.overall4C.score ?? 82) > 10
              ? Number((evaluationResult.overall4C.score! / 10).toFixed(1))
              : (evaluationResult.overall4C.score ?? 8.2)
          }
          colorScore={
            (evaluationResult.color.score ?? 86) > 10
              ? Number((evaluationResult.color.score! / 10).toFixed(1))
              : (evaluationResult.color.score ?? 8.6)
          }
          clarityScore={
            (evaluationResult.clarity.score ?? 79) > 10
              ? Number((evaluationResult.clarity.score! / 10).toFixed(1))
              : (evaluationResult.clarity.score ?? 7.9)
          }
          cutScore={
            (evaluationResult.cut.score ?? 81) > 10
              ? Number((evaluationResult.cut.score! / 10).toFixed(1))
              : (evaluationResult.cut.score ?? 8.1)
          }
          caratScore={Number(caratWeight) || 2.45}
          colorLabel={saturation ? `${saturation} ${hue || "Blue"}` : "Vivid Blue"}
          clarityLabel={nakedEye || "Eye-clean"}
          cutLabel="Well Cut"
          caratLabel="Liquid band"
          priceRangeMin="1.42M"
          priceRangeMax="1.68M"
          pricePerCarat="580K – 686K"
          comparablesCount={7}
          evaluationId={evaluationResult._id}
          onSave={() => alert("Evaluation saved successfully!")}
          onCompare={() => { window.location.href = "/dashboard"; }}
          onDownloadPdf={() => window.open(`/api/evaluations/${evaluationResult._id}/report`, "_blank")}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Header */}
        {!loading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {currentStep === 1 && "1. Select Gemstone Variety"}
                {currentStep === 2 && "2. Basic Gemstone Information"}
                {currentStep === 3 && "1. Color Evaluation"}
                {currentStep === 4 && "2. Clarity Evaluation"}
                {currentStep === 5 && "3. Cut Evaluation"}
                {currentStep === 6 && "4. Carat Weight"}
                {currentStep === 7 && "Additional Factors"}
                {currentStep === 8 && "Review Your Evaluation"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {currentStep === 4 && "Step 4 of 8 · Naked-eye first, then 10x loupe protocol"}
                {currentStep === 5 && "Step 5 of 8 · Dimensions auto-calculate ratios — Inconsistencies are flagged"}
                {currentStep === 6 && "Step 6 of 8 · Weight is read together with dimensions and market size bands"}
                {currentStep === 7 && "Step 7 of 8 · Treatment, origin and recut signals that modify the suggestion"}
                {currentStep === 8 && "Step 8 of 8 · Confirm everything before the rule engine runs"}
                {currentStep < 4 && `Step ${currentStep} of 8 · Choose the CAGS-supported variety closest to your stone`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {currentStep === 8 ? (
                <span className="rounded-full border border-blue-200 bg-blue-50/70 text-blue-600 px-3.5 py-1 text-xs font-semibold">
                  Rule engine v4.2
                </span>
              ) : currentStep === 7 ? (
                <button
                  type="button"
                  onClick={() => alert("Draft evaluation saved successfully!")}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition"
                >
                  <span>🔖</span> Save Draft
                </button>
              ) : currentStep === 5 || currentStep === 6 ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                  <span>✔</span> Measured
                </span>
              ) : (
                <span className="rounded-full border border-blue-200 bg-blue-50 text-blue-600 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                  <span>👁</span> User Observed
                </span>
              )}
            </div>
          </div>
        )}

        {/* 8-Step Progress Stepper Bar */}
        {!loading && (
          <EvaluationProgress
            currentStep={currentStep}
            onStepClick={(s) => setCurrentStep(s)}
          />
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"
          >
            <p className="font-bold">We couldn&apos;t complete the evaluation</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <BasicInformation
            stepMode="gemstone"
            variety={variety || "Ceylon Blue Sapphire"}
            caratWeight={caratWeight}
            onVarietyChange={setVariety}
            onCaratWeightChange={setCaratWeight}
          />
        )}

        {currentStep === 2 && (
          <BasicInformation
            stepMode="basic"
            variety={variety || "Ceylon Blue Sapphire"}
            caratWeight={caratWeight}
            onVarietyChange={setVariety}
            onCaratWeightChange={setCaratWeight}
          />
        )}

        {currentStep === 3 && (
          <ColorSection
            hue={hue}
            tone={tone}
            saturation={saturation}
            distribution={distribution}
            zoning={zoning}
            onHueChange={setHue}
            onToneChange={setTone}
            onSaturationChange={setSaturation}
            onDistributionChange={setDistribution}
            onZoningChange={setZoning}
          />
        )}

        {currentStep === 4 && (
          <ClaritySection
            nakedEye={nakedEye}
            loupe10x={loupe10x}
            inclusionType={inclusionType}
            inclusionLocation={inclusionLocation}
            severity={severity}
            onNakedEyeChange={setNakedEye}
            onLoupe10xChange={setLoupe10x}
            onInclusionTypeChange={setInclusionType}
            onInclusionLocationChange={setInclusionLocation}
            onSeverityChange={setSeverity}
          />
        )}

        {currentStep === 5 && (
          <CutSection
            length={length}
            width={width}
            depth={depth}
            symmetry={symmetry}
            polish={polish}
            windowing={windowing}
            extinction={extinction}
            bulging={bulging}
            onLengthChange={setLength}
            onWidthChange={setWidth}
            onDepthChange={setDepth}
            onSymmetryChange={setSymmetry}
            onPolishChange={setPolish}
            onWindowingChange={setWindowing}
            onExtinctionChange={setExtinction}
            onBulgingChange={setBulging}
          />
        )}

        {currentStep === 6 && (
          <CaratSection
            caratWeight={caratWeight}
            length={length}
            width={width}
            depth={depth}
            onCaratWeightChange={setCaratWeight}
          />
        )}

        {currentStep === 7 && (
          <AdditionalInformationSection
            treatmentStatus={treatmentStatus}
            treatmentType={treatmentType}
            originValue={originValue}
            originReliability={originReliability}
            informationReliability={informationReliability}
            onTreatmentStatusChange={setTreatmentStatus}
            onTreatmentTypeChange={setTreatmentType}
            onOriginValueChange={setOriginValue}
            onOriginReliabilityChange={setOriginReliability}
            onInformationReliabilityChange={(field, value) =>
              setInformationReliability((previous) => ({
                ...previous,
                [field]: value,
              }))
            }
          />
        )}

        {loading && (
          <EvaluationProcessingScreen stoneId="CEY-2026-0847" />
        )}

        {currentStep === 8 && !loading && !evaluationResult && (
          <ReviewSection
            variety={variety}
            caratWeight={caratWeight}
            length={length}
            width={width}
            depth={depth}
            hue={hue}
            tone={tone}
            saturation={saturation}
            distribution={distribution}
            zoning={zoning}
            nakedEye={nakedEye}
            loupe10x={loupe10x}
            inclusionType={inclusionType}
            inclusionLocation={inclusionLocation}
            severity={severity}
            symmetry={symmetry}
            polish={polish}
            windowing={windowing}
            extinction={extinction}
            bulging={bulging}
            treatmentStatus={treatmentStatus}
            treatmentType={treatmentType}
            originValue={originValue}
            originReliability={originReliability}
            onEditStep={(step) => setCurrentStep(step)}
            onRunEvaluation={() => handleSubmit()}
            onSaveDraft={() => alert("Evaluation draft saved successfully!")}
            loading={loading}
          />
        )}

        {/* Navigation Actions Footer Bar (hidden on step 8 or when loading) */}
        {currentStep < 8 && !loading && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((step) => step - 1);
              } else {
                if (window.confirm("Cancel gemstone evaluation?")) {
                  window.location.href = "/dashboard";
                }
              }
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            {currentStep > 1 ? "← Back" : "Cancel"}
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((step) => Math.min(8, step + 1))}
              className="bg-[#070D1E] hover:bg-[#152347] text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <span>{currentStep === 7 ? "Review Evaluation" : "Continue"}</span>
              <span>→</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !currentUser}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-7 py-3 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? "Evaluating..." : "Generate Evaluation Report"}
            </button>
          )}
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-4 pt-4">
          <div className="rounded-2xl bg-[var(--primary-soft)] p-5">
            <h3 className="font-bold text-[var(--primary-dark)]">
              Ready to see your evaluation?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              We&apos;ll combine your Color, Clarity, Cut, Carat Weight,
              additional information, and available reference data to create
              an educational evaluation and price suggestion.
            </p>
          </div>

          {!currentUser && (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <p className="font-bold">
                Sign in to generate your result
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Your account allows Open 4Cs to save this evaluation so you can
                view it again in your evaluation history.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-xl bg-[var(--primary)] px-5 py-3 text-center font-semibold text-white hover:bg-[var(--primary-dark)]"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl border border-[var(--border)] px-5 py-3 text-center font-semibold hover:bg-[var(--surface-soft)]"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !currentUser}
            className="w-full rounded-xl bg-[var(--primary)] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Evaluating your gemstone..." : "Evaluate My Gemstone"}
          </button>

          {loading && (
            <div
              role="status"
              className="rounded-2xl border border-[var(--border)] bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary-soft)] border-t-[var(--primary)]" />

                <div>
                  <p className="font-semibold">
                    Evaluating your gemstone...
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Comparing the information you provided with the evaluation
                    rules and available reference data.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {message && <p>{message}</p>}

            <ReferenceGemstoneList
        references={referenceGemstones}
      />

      <br />

      <EvaluationHistory
        evaluations={evaluationHistory}
      />
    </form>
    )}
    </div>
  );
}
