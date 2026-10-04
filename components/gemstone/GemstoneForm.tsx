"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import BasicInformation from "./BasicInformation";
import ColorSection from "./ColorSection";
import ClaritySection from "./ClaritySection";
import CutSection from "./CutSection";
import AdditionalInformationSection from "./AdditionalInformationSection";
import EvaluationDetailsCard from "./EvaluationDetailsCard";
import EvaluationProgress from "./EvaluationProgress";
import EvaluationResultSummary from "./EvaluationResultSummary";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
      variety,
      caratWeight: Number(caratWeight),
      color: {
        hue,
        tone,
        saturation,
        distribution,
        zoning,
      },
      clarity: {
        nakedEye,
        loupe10x,
        inclusionType,
        inclusionLocation,
        severity,
      },
      cut: {
        length: Number(length),
        width: Number(width),
        depth: Number(depth),
        symmetry,
        polish,
        windowing,
        extinction,
        bulging,
      },
      treatment: {
        status: treatmentStatus,
        type: treatmentType,
      },
      origin: {
        value: originValue,
        reliability: originReliability,
      },
      informationReliability,
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <EvaluationProgress currentStep={currentStep} />

        <h2>Gemstone Information</h2>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <p className="font-bold text-red-800">
            We couldn&apos;t complete the evaluation
          </p>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {error}
          </p>

          <p className="mt-2 text-sm text-red-700">
            Please check your information and try again.
          </p>
        </div>
      )}

      {currentStep === 1 && (
        <BasicInformation
          variety={variety}
          caratWeight={caratWeight}
          onVarietyChange={setVariety}
          onCaratWeightChange={setCaratWeight}
        />
      )}

      {currentStep === 2 && (
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

      {currentStep === 3 && (
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

      {currentStep === 4 && (
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

      {currentStep === 5 && (
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

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() =>
                setCurrentStep((step) => Math.max(1, step - 1))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white px-6 py-3 font-semibold hover:bg-[var(--surface-soft)] sm:w-auto"
            >
              ← Back
            </button>
          )}
        </div>

        {currentStep < 5 && (
          <button
            type="button"
            onClick={() =>
              setCurrentStep((step) => Math.min(5, step + 1))
            }
            className="w-full rounded-xl bg-[var(--primary)] px-7 py-3 font-semibold text-white hover:bg-[var(--primary-dark)] sm:w-auto"
          >
            Continue →
          </button>
        )}
      </div>

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

      {evaluationResult && (
        <div className="space-y-6">
          <EvaluationResultSummary
            overallScore={evaluationResult.overall4C.score ?? 0}
            colorScore={evaluationResult.color.score ?? 0}
            clarityScore={evaluationResult.clarity.score ?? 0}
            cutScore={evaluationResult.cut.score ?? 0}
            caratScore={evaluationResult.carat.score ?? 0}
          />

          {/* Price Suggestion */}
          <ResultSection
            icon="💰"
            title="Price Suggestion"
            description="An educational B2B price suggestion based on the evaluation rules and available reference data."
          >
            {evaluationResult.priceSuggestion.suggestedPrice !== null &&
            evaluationResult.priceSuggestion.priceRange.minimum !== null &&
            evaluationResult.priceSuggestion.priceRange.maximum !== null ? (
              <PriceSuggestionCard
                suggestedPrice={evaluationResult.priceSuggestion.suggestedPrice}
                minimumPrice={evaluationResult.priceSuggestion.priceRange.minimum}
                maximumPrice={evaluationResult.priceSuggestion.priceRange.maximum}
                currency={evaluationResult.priceSuggestion.currency ?? "USD"}
              />
            ) : (
              <div className="rounded-xl bg-[var(--surface-soft)] p-5">
                <p className="font-semibold">
                  A price suggestion is not available
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  There is not enough suitable reference data to produce a
                  meaningful price suggestion for this evaluation.
                </p>
              </div>
            )}
          </ResultSection>

          {/* Reference Comparison */}
          <ResultSection
            icon="🔎"
            title="Reference Comparison"
            description="See how the gemstone compares with available reference gemstones."
          >
            <div className="space-y-6">
              {evaluationResult.bestReferenceMatch &&
              evaluationResult.bestReferenceMatch.similarity.overall !== null ? (
                <ReferenceComparisonCard
                  referenceName={`${evaluationResult.bestReferenceMatch.variety} (${evaluationResult.bestReferenceMatch.caratWeight} ct)`}
                  similarity={evaluationResult.bestReferenceMatch.similarity.overall}
                />
              ) : (
                <div className="rounded-xl bg-[var(--surface-soft)] p-5">
                  <p className="font-semibold">
                    No suitable reference comparison is available
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    The available reference gemstones were not similar enough to provide
                    a suitable comparison for this evaluation.
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm">
                  <strong>Data Sufficiency Status:</strong>{" "}
                  {evaluationResult.referenceDataSufficiency.status}
                </p>

                <p className="text-sm">
                  <strong>Available References:</strong>{" "}
                  {evaluationResult.referenceDataSufficiency.availableReferences}
                </p>

                <p className="text-sm">
                  <strong>Required References:</strong>{" "}
                  {evaluationResult.referenceDataSufficiency.requiredReferences}
                </p>

                {evaluationResult.referenceDataSufficiency.status === "INSUFFICIENT" && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    The available reference data is insufficient for a
                    reference-supported B2B price suggestion.
                  </p>
                )}
              </div>

              {evaluationResult.bestReferenceMatch && (
                <div className="border-t border-[var(--border)] pt-4 text-sm">
                  <h4 className="font-semibold mb-2">Detailed Reference Match Breakdown</h4>

                  <div className="space-y-1 text-[var(--muted)]">
                    <p>
                      <strong className="text-[var(--foreground)]">Variety:</strong>{" "}
                      {evaluationResult.bestReferenceMatch.variety}
                    </p>

                    <p>
                      <strong className="text-[var(--foreground)]">Reference Carat Weight:</strong>{" "}
                      {evaluationResult.bestReferenceMatch.caratWeight} ct
                    </p>

                    <p>
                      <strong className="text-[var(--foreground)]">Reference Price:</strong>{" "}
                      {evaluationResult.bestReferenceMatch.currency}{" "}
                      {evaluationResult.bestReferenceMatch.referencePrice.toFixed(2)}
                    </p>

                    <p>
                      <strong className="text-[var(--foreground)]">Color Similarity:</strong>{" "}
                      {evaluationResult.bestReferenceMatch.similarity.color !== null
                        ? `${evaluationResult.bestReferenceMatch.similarity.color}%`
                        : "Unavailable"}
                    </p>

                    <p>
                      <strong className="text-[var(--foreground)]">Clarity Similarity:</strong>{" "}
                      {evaluationResult.bestReferenceMatch.similarity.clarity !== null
                        ? `${evaluationResult.bestReferenceMatch.similarity.clarity}%`
                        : "Unavailable"}
                    </p>

                    <p>
                      <strong className="text-[var(--foreground)]">Cut Similarity:</strong>{" "}
                      {evaluationResult.bestReferenceMatch.similarity.cut !== null
                        ? `${evaluationResult.bestReferenceMatch.similarity.cut}%`
                        : "Unavailable"}
                    </p>

                    <p>
                      <strong className="text-[var(--foreground)]">Cut Dimension Similarity:</strong>{" "}
                      {evaluationResult.bestReferenceMatch.similarity.cutDimensions !== null
                        ? `${evaluationResult.bestReferenceMatch.similarity.cutDimensions}%`
                        : "Unavailable"}
                    </p>

                    <p>
                      <strong className="text-[var(--foreground)]">Carat Similarity:</strong>{" "}
                      {evaluationResult.bestReferenceMatch.similarity.carat !== null
                        ? `${evaluationResult.bestReferenceMatch.similarity.carat}%`
                        : "Unavailable"}
                    </p>

                    <p className="mt-2 font-semibold text-[var(--foreground)]">
                      Overall 4C Similarity:{" "}
                      {evaluationResult.bestReferenceMatch.similarity.overall !== null
                        ? `${evaluationResult.bestReferenceMatch.similarity.overall}%`
                        : "Unavailable"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ResultSection>

          {/* Recommendations */}
          <ResultSection
            icon="💡"
            title="Recommendations"
            description="Helpful next steps generated from the information you provided."
          >
            <RecommendationsCard
              recommendations={evaluationResult.recommendations.recommendations.map(
                (r) => r.message
              )}
            />
          </ResultSection>

          {/* Information Reliability */}
          <ResultSection
            icon="🛡"
            title="Information Reliability"
            description="Shows how the source of your information affects confidence in interpreting the result."
          >
            <InformationReliabilityCard
              measurementReliability={evaluationResult.informationReliability.measurements}
              treatmentReliability={evaluationResult.informationReliability.treatment}
              originReliability={evaluationResult.informationReliability.origin}
            />
          </ResultSection>

          {/* Evaluation Details */}
          <ResultSection
            icon="📋"
            title="Evaluation Details"
            description="Additional technical information used to produce this evaluation."
          >
            <EvaluationDetailsCard>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Evaluation Rule Version:{" "}
                  <span className="font-medium">{evaluationResult.ruleVersion}</span>
                </p>

                <div>
                  <h4 className="font-semibold">Evaluation Status</h4>
                  <p>{evaluationResult.status}</p>
                </div>

                <div className="rounded border p-4">
                  <h4 className="font-medium">Overall 4C Evaluation</h4>
                  <p>{evaluationResult.overall4C.status}</p>
                  <p className="text-sm text-gray-600">
                    {evaluationResult.overall4C.reason}
                  </p>
                  <p className="mt-2 text-sm">
                    Score:{" "}
                    {evaluationResult.overall4C.score !== null
                      ? `${evaluationResult.overall4C.score}/100`
                      : "N/A"}
                  </p>
                  <div className="mt-2 text-sm">
                    <p>Color Weight: {evaluationResult.overall4C.weights.color * 100}%</p>
                    <p>Clarity Weight: {evaluationResult.overall4C.weights.clarity * 100}%</p>
                    <p>Cut Weight: {evaluationResult.overall4C.weights.cut * 100}%</p>
                    <p>Carat Weight: {evaluationResult.overall4C.weights.carat * 100}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Color</h4>
                  <p>{evaluationResult.color.status}</p>
                  <p className="text-sm text-gray-600">{evaluationResult.color.reason}</p>
                  <p className="mt-2 text-sm">
                    Score:{" "}
                    {evaluationResult.color.score !== null
                      ? `${evaluationResult.color.score}/100`
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Clarity</h4>
                  <p>{evaluationResult.clarity.status}</p>
                  <p className="text-sm text-gray-600">{evaluationResult.clarity.reason}</p>
                  <p className="mt-2 text-sm">
                    Score:{" "}
                    {evaluationResult.clarity.score !== null
                      ? `${evaluationResult.clarity.score}/100`
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Cut</h4>
                  <p>{evaluationResult.cut.status}</p>
                  <p className="text-sm text-gray-600">{evaluationResult.cut.reason}</p>
                  <p className="mt-2 text-sm">
                    Score:{" "}
                    {evaluationResult.cut.score !== null
                      ? `${evaluationResult.cut.score}/100`
                      : "N/A"}
                  </p>
                  <div className="mt-2 text-sm">
                    <p>
                      Length-to-Width Ratio:{" "}
                      {evaluationResult.cut.measurements.lengthToWidthRatio ?? "N/A"}
                    </p>
                    <p>
                      Depth Percentage:{" "}
                      {evaluationResult.cut.measurements.depthPercentage !== null
                        ? `${evaluationResult.cut.measurements.depthPercentage}%`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)]">
                      Carat Weight & Size
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Carat is the gemstone&apos;s weight. Open 4Cs also checks whether the entered length, width, and depth have a reasonable relationship with that weight.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Carat Score
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--muted)] font-semibold">
                      {evaluationResult.carat.score !== null
                        ? `${evaluationResult.carat.score} / 100`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Why this score?
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {evaluationResult.carat.reason}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-lg bg-white p-3 border border-[var(--border)]">
                      <span className="text-[var(--muted)] block">Carat Weight</span>
                      <span className="font-semibold text-sm text-[var(--foreground)]">
                        {evaluationResult.carat.caratWeight} ct
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-[var(--border)]">
                      <span className="text-[var(--muted)] block">Length</span>
                      <span className="font-semibold text-sm text-[var(--foreground)]">
                        {evaluationResult.carat.dimensions.length} mm
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-[var(--border)]">
                      <span className="text-[var(--muted)] block">Width</span>
                      <span className="font-semibold text-sm text-[var(--foreground)]">
                        {evaluationResult.carat.dimensions.width} mm
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-[var(--border)]">
                      <span className="text-[var(--muted)] block">Depth</span>
                      <span className="font-semibold text-sm text-[var(--foreground)]">
                        {evaluationResult.carat.dimensions.depth} mm
                      </span>
                    </div>
                  </div>

                  <p className="text-xs leading-5 text-[var(--muted)]">
                    The size check is a supporting prototype rule. Dimensions can affect the Carat score slightly, but they do not independently verify the gemstone&apos;s weight, density, authenticity, or identity.
                  </p>

                  {typeof evaluationResult.carat.sizeConsistency === "number" && (
                    <div className="border-t border-[var(--border)] pt-3">
                      <p className="text-xs font-medium text-[var(--muted)]">
                        Technical size-consistency indicator
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">
                        {evaluationResult.carat.sizeConsistency.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium">Treatment</h4>
                  <p>{evaluationResult.treatment.status}</p>
                  <p className="text-sm text-gray-600">{evaluationResult.treatment.reason}</p>
                  <p className="mt-2 text-sm">
                    Price Adjustment Factor:{" "}
                    {evaluationResult.treatment.adjustmentFactor !== null
                      ? evaluationResult.treatment.adjustmentFactor
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Origin</h4>
                  <p>{evaluationResult.origin.status}</p>
                  <p className="text-sm text-gray-600">{evaluationResult.origin.reason}</p>
                  <p className="mt-2 text-sm">
                    Price Adjustment Factor:{" "}
                    {evaluationResult.origin.adjustmentFactor !== null
                      ? evaluationResult.origin.adjustmentFactor
                      : "N/A"}
                  </p>
                  <p className="text-sm">
                    Reliability Factor:{" "}
                    {evaluationResult.origin.reliabilityFactor !== null
                      ? evaluationResult.origin.reliabilityFactor
                      : "N/A"}
                  </p>
                </div>
              </div>
            </EvaluationDetailsCard>
          </ResultSection>

          {currentUser && (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <h4 className="font-bold mb-2">User Statement</h4>
              <p className="text-sm">
                This evaluation was generated for{" "}
                <strong>{currentUser.name}</strong>, registered as a{" "}
                <strong>{currentUser.category}</strong>.
              </p>
              <p className="text-sm text-[var(--muted)] mt-1">
                The result is provided for educational and decision-support
                purposes and should be interpreted according to the user&apos;s
                own level of gemmological knowledge and experience.
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-900">
                  Important Notice
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  This evaluation and price suggestion are for educational
                  and decision-support purposes only. They are based on
                  prototype rules and reference data and do not represent
                  professional gemstone valuation, certification, or a
                  guaranteed selling price.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <br />

      <ReferenceGemstoneList
        references={referenceGemstones}
      />

      <br />

      <EvaluationHistory
        evaluations={evaluationHistory}
      />
    </form>
    </div>
  );
}
