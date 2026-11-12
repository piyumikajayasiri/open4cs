import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import { verifySessionToken } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { evaluateGemstone } from "@/lib/evaluation/evaluateGemstone";
import type { EvaluationInput } from "@/lib/evaluation/evaluationInput";
import { compareReferenceGemstones } from "@/lib/evaluation/compareReferenceGemstones";
import { calculatePriceSuggestion } from "@/lib/evaluation/priceSuggestion";
import { getActiveExchangeRate } from "@/lib/currency/exchangeRate";
import {
  REFERENCE_COMPARISON_RULES,
  ENGINE_SUPPORTED_VARIETIES,
  ENGINE_SUPPORTED_TREATMENTS,
  ENGINE_SUPPORTED_ORIGINS,
  ENGINE_SUPPORTED_ORIGIN_RELIABILITIES,
  COLOR_HUE_RULES,
  TREATMENT_RULES,
  ORIGIN_RULES,
} from "@/lib/evaluation/rules";
import Evaluation from "@/models/Evaluation";
import User from "@/models/User";
import GemstoneVariety from "@/models/GemstoneVariety";
import { calculateComparableReferencePrice } from "@/lib/evaluation/comparablePrice";

const SUPPORTED_INFORMATION_RELIABILITY = [
  "Measured",
  "User Observed",
  "Seller Provided",
  "Laboratory Verified",
  "Unverified",
];

export async function POST(request: NextRequest) {
  try {
    let sessionToken: string | undefined;
    try {
      const cookieStore = await cookies();
      sessionToken = cookieStore.get("session")?.value;
    } catch {
      sessionToken = request.cookies.get("session")?.value;
    }
    if (!sessionToken) {
      sessionToken = request.cookies.get("session")?.value;
    }

    if (!sessionToken) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return Response.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const activeUser = await User.findById(session.userId).select("status isActive role");
    if (!activeUser || activeUser.isActive === false || activeUser.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Account is inactive or suspended." },
        { status: 403 }
      );
    }

    let data: EvaluationInput;

    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    // Engine tolerance normalizer for display names from UI
    if (data.variety) {
      const v = data.variety.toLowerCase().trim();
      if (v.includes("padparadscha")) {
        data.variety = "Padparadscha";
      } else if (v.includes("ruby")) {
        data.variety = "Ruby";
      } else if (
        v.includes("blue sapphire") ||
        v.includes("ceylon blue") ||
        v === "blue"
      ) {
        data.variety = "Blue Sapphire";
      }
      // Distinct varieties like Yellow Sapphire, Pink Sapphire, White Sapphire, and Star Sapphire
      // are preserved as-is so they are not silently re-classified under Blue Sapphire rules.
    }

    if (data.treatment?.status) {
      const t = data.treatment.status.toLowerCase();
      if (t.includes("untreated")) data.treatment.status = "Untreated";
      else if (t.includes("treated") && !t.includes("untreated")) data.treatment.status = "Treated";
      else if (t.includes("heated")) data.treatment.status = "Heated";
      else if (t.includes("unknown")) data.treatment.status = "Unknown";
    }

    if (data.origin?.value) {
      const o = data.origin.value.toLowerCase();
      if (o.includes("sri lanka") || o.includes("ceylon")) data.origin.value = "Sri Lanka";
      else if (o.includes("myanmar") || o.includes("burma")) data.origin.value = "Myanmar";
      else if (o.includes("madagascar")) data.origin.value = "Madagascar";
      else if (o.includes("other")) data.origin.value = "Other";
      else if (o.includes("unknown")) data.origin.value = "Unknown";
    }

    if (data.origin?.reliability) {
      const r = data.origin.reliability.toLowerCase();
      if (r.includes("high") || r.includes("laboratory")) data.origin.reliability = "High";
      else if (r.includes("medium") || r.includes("seller")) data.origin.reliability = "Medium";
      else if (r.includes("low") || r.includes("observed") || r.includes("user")) data.origin.reliability = "Low";
      else if (r.includes("unknown")) data.origin.reliability = "Unknown";
    }

    if (
      !data.gemstoneId ||
      !mongoose.Types.ObjectId.isValid(data.gemstoneId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid gemstoneId is required.",
        },
        { status: 400 }
      );
    }

    if (!data.variety) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemstone variety is required.",
        },
        { status: 400 }
      );
    }

    if (
      !ENGINE_SUPPORTED_VARIETIES.some(
        (supported) => supported === data.variety
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `${data.variety} is not currently supported for automated 4C evaluation. Currently supported varieties: ${ENGINE_SUPPORTED_VARIETIES.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    // Direct API bypass guard for synthetic or lab-grown submissions
    if (
      data.naturalStatus &&
      data.naturalStatus.toLowerCase() !== "natural"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Automated 4Cs evaluation and price comparables are strictly calibrated for natural corundum. Laboratory-grown or synthetic gemstones cannot be evaluated under this model.",
        },
        { status: 400 }
      );
    }

    if (!data.color || !data.color.hue) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemstone color hue is required.",
        },
        { status: 400 }
      );
    }

    const varietyHueRules =
      COLOR_HUE_RULES[data.variety as keyof typeof COLOR_HUE_RULES];
    if (varietyHueRules) {
      const normalizedHue = data.color.hue
        .trim()
        .toLowerCase()
        .replace(/[\s\-_]+/g, "");
      const isHueSupported = Object.keys(varietyHueRules).some(
        (key) => key.toLowerCase().replace(/[\s\-_]+/g, "") === normalizedHue
      );
      if (!isHueSupported) {
        return NextResponse.json(
          {
            success: false,
            message: `Hue "${data.color.hue}" is not supported for variety "${data.variety}". Supported hues: ${Object.keys(varietyHueRules).join(", ")}.`,
          },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    const varietyDoc = (await GemstoneVariety.findOne({
      name: { $regex: new RegExp(`^${data.variety.trim()}$`, "i") },
    }).lean()) as { isActive?: boolean } | null;

    if (varietyDoc && !varietyDoc.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: `${data.variety} is currently suspended and not accepting new evaluations.`,
        },
        { status: 400 }
      );
    }

    if (!data.caratWeight || data.caratWeight <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid carat weight is required.",
        },
        { status: 400 }
      );
    }

    if (
      !data.cut ||
      !Number.isFinite(data.cut.length) ||
      !Number.isFinite(data.cut.width) ||
      !Number.isFinite(data.cut.depth) ||
      data.cut.length <= 0 ||
      data.cut.width <= 0 ||
      data.cut.depth <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid Cut dimensions are required.",
        },
        { status: 400 }
      );
    }

    const informationReliability =
      data.informationReliability;

    if (
      !informationReliability ||
      !SUPPORTED_INFORMATION_RELIABILITY.includes(
        informationReliability.measurements
      ) ||
      !SUPPORTED_INFORMATION_RELIABILITY.includes(
        informationReliability.treatment
      ) ||
      !SUPPORTED_INFORMATION_RELIABILITY.includes(
        informationReliability.origin
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid information reliability is required for measurements, treatment, and origin.",
        },
        { status: 400 }
      );
    }

    if (
      !data.treatment ||
      !ENGINE_SUPPORTED_TREATMENTS.some(
        (item) => item === data.treatment.status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported treatment status.",
        },
        { status: 400 }
      );
    }

    if (
      !data.origin ||
      !ENGINE_SUPPORTED_ORIGINS.some(
        (item) => item === data.origin.value
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported origin value.",
        },
        { status: 400 }
      );
    }

    if (
      !data.origin ||
      !ENGINE_SUPPORTED_ORIGIN_RELIABILITIES.some(
        (item) => item === data.origin.reliability
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported origin reliability.",
        },
        { status: 400 }
      );
    }

    const evaluation = evaluateGemstone(data);

    const referenceComparisons =
      await compareReferenceGemstones({
        variety: data.variety,
        caratWeight: data.caratWeight,

        color: {
          hue: data.color.hue,
          tone: data.color.tone,
          saturation: data.color.saturation,
          distribution: data.color.distribution,
          zoning: data.color.zoning,
        },

        clarity: {
          nakedEye: data.clarity.nakedEye,
          loupe10x: data.clarity.loupe10x,
          inclusionType: data.clarity.inclusionType ?? "",
          inclusionLocation: data.clarity.inclusionLocation ?? "",
          severity: data.clarity.severity,
        },

        cut: {
          length: data.cut.length,
          width: data.cut.width,
          depth: data.cut.depth,
          symmetry: data.cut.symmetry,
          polish: data.cut.polish,
          windowing: data.cut.windowing,
          extinction: data.cut.extinction,
          bulging: data.cut.bulging,
        },
      });

    const exchangeRate = getActiveExchangeRate();

    // Strict Data Traceability: Filter eligible real market records BEFORE counting, matching, and calculating prices
    const realCompletedReferences = referenceComparisons.filter(
      (r) => r.dataClassification === "Real" && r.transactionContext === "Completed Sale"
    );

    const eligibleRealComparables = realCompletedReferences.filter(
      (reference) =>
        reference.similarity.overall !== null &&
        reference.similarity.overall >=
          REFERENCE_COMPARISON_RULES.minimumSimilarityForPricing
    );

    // Normalize currencies of eligible real comparables to LKR (the regional trading benchmark)
    const normalizedRealComparables = eligibleRealComparables
      .map((reference) => {
        let normPrice = reference.referencePrice;
        const refCurr = (reference.currency || "LKR").toUpperCase().trim();
        if (refCurr === "USD") {
          if (exchangeRate && exchangeRate.isAvailable && exchangeRate.rate > 0) {
            normPrice = reference.referencePrice * exchangeRate.rate;
          } else {
            normPrice = 0; // Exclude USD reference if no verified exchange rate is available
          }
        }
        return {
          ...reference,
          referencePrice: Math.round(normPrice),
          currency: "LKR",
        };
      })
      .filter((r) => r.referencePrice > 0);

    const hasRealMarketData = normalizedRealComparables.length >= 3;
    const bestRealMatch =
      normalizedRealComparables.length > 0 ? normalizedRealComparables[0] : null;

    const comparableReferencePrice = hasRealMarketData
      ? calculateComparableReferencePrice(normalizedRealComparables)
      : null;

    // Relative treatment and origin adjustment calculations (relative to best real match if available)
    const candidateTreatmentStatus = data.treatment?.status?.toLowerCase() || "unknown";
    const refTreatmentStatus = bestRealMatch?.treatment?.status?.toLowerCase() || candidateTreatmentStatus;
    const candidateTreatmentWeight = TREATMENT_RULES.status[candidateTreatmentStatus as keyof typeof TREATMENT_RULES.status] ?? 1.0;
    const refTreatmentWeight = TREATMENT_RULES.status[refTreatmentStatus as keyof typeof TREATMENT_RULES.status] ?? 1.0;
    const relativeTreatmentMultiplier = refTreatmentWeight > 0 ? (candidateTreatmentWeight / refTreatmentWeight) : 1.0;

    const candidateOriginValue = (data.origin?.value || "unknown").toLowerCase().replace(/\s+/g, "");
    const refOriginValue = (bestRealMatch?.origin?.value || data.origin?.value || "unknown").toLowerCase().replace(/\s+/g, "");
    const candidateOriginWeight = ORIGIN_RULES.value[candidateOriginValue as keyof typeof ORIGIN_RULES.value] ?? 1.0;
    const refOriginWeight = ORIGIN_RULES.value[refOriginValue as keyof typeof ORIGIN_RULES.value] ?? 1.0;
    const relativeOriginMultiplier = refOriginWeight > 0 ? (candidateOriginWeight / refOriginWeight) : 1.0;

    const priceSuggestion = calculatePriceSuggestion(
      hasRealMarketData && bestRealMatch ? comparableReferencePrice : null,
      "LKR",
      evaluation.treatment.adjustmentFactor,
      evaluation.origin.adjustmentFactor,
      {
        referenceCount: normalizedRealComparables.length,
        relativeTreatmentMultiplier,
        relativeOriginMultiplier,
        exchangeRate,
        dataClassification: hasRealMarketData ? "Real" : "Demo",
        isRealMarketData: hasRealMarketData,
      }
    );

    const hasSufficientReferenceData = hasRealMarketData;
    const bestReferenceMatch =
      bestRealMatch ||
      (referenceComparisons.length > 0 ? referenceComparisons[0] : null);

    const referenceDataSufficiency = {
      status: hasSufficientReferenceData
        ? "SUFFICIENT"
        : "INSUFFICIENT",
      availableReferences: referenceComparisons.length,
      requiredReferences:
        REFERENCE_COMPARISON_RULES.minimumReferencesForSimilarity,
    };

    const savedEvaluation = await Evaluation.create({
      userId: session.userId,
      gemstoneId: data.gemstoneId,
      ruleVersion: evaluation.ruleVersion,
      status: evaluation.status,
      result: evaluation,
      referenceDataSufficiency,
      bestReferenceMatch,
      priceSuggestion,
      exchangeRate: priceSuggestion.exchangeRate ?? null,
      photoUrl: data.photoUrl || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Evaluation completed.",
        evaluationId: savedEvaluation._id.toString(),
        data,
        evaluation,
        bestReferenceMatch,
        priceSuggestion,
        referenceDataSufficiency,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Evaluation API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process evaluation.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request?: NextRequest) {
  try {
    let sessionToken: string | undefined;
    try {
      const cookieStore = await cookies();
      sessionToken = cookieStore.get("session")?.value;
    } catch {
      sessionToken = request?.cookies.get("session")?.value;
    }
    if (!sessionToken && request) {
      sessionToken = request.cookies.get("session")?.value;
    }

    if (!sessionToken) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return Response.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const activeUser = await User.findById(session.userId).select("status isActive role");
    if (!activeUser || activeUser.isActive === false || activeUser.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Account is inactive or suspended." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const evaluations = await Evaluation.find({
      userId: session.userId,
    })
      .populate(
        "gemstoneId",
        "variety caratWeight treatment origin informationReliability"
      )
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("Failed to load evaluations:", error);

    return NextResponse.json(
      {
        error: "Failed to load evaluation history.",
      },
      { status: 500 }
    );
  }
}
