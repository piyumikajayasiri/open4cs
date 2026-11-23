import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import { verifySessionToken } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { evaluateGemstone } from "@/lib/evaluation/evaluateGemstone";
import type { EvaluationInput, InformationReliability } from "@/lib/evaluation/evaluationInput";
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
import Gemstone from "@/models/Gemstone";
import User from "@/models/User";
import GemstoneVariety from "@/models/GemstoneVariety";

if (!mongoose.models.Gemstone) {
  void Gemstone;
}
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

    if (
      data.gemstoneId &&
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

    if (data.informationReliability) {
      const normalizeRel = (val: unknown): InformationReliability => {
        if (!val || typeof val !== "string") return "Unverified";
        const lower = val.toLowerCase().trim();
        if (lower.includes("lab") || lower.includes("cert") || lower.includes("laboratory")) return "Laboratory Verified";
        if (lower.includes("seller") || lower.includes("dealer")) return "Seller Provided";
        if (lower.includes("measured") || lower.includes("caliper") || lower.includes("scale")) return "Measured";
        if (lower.includes("user") || lower.includes("observed") || lower.includes("eye")) return "User Observed";
        return "Unverified";
      };

      data.informationReliability = {
        measurements: normalizeRel(data.informationReliability.measurements),
        treatment: normalizeRel(data.informationReliability.treatment),
        origin: normalizeRel(data.informationReliability.origin),
      };
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

    // Normalize treatment status from UI variants
    if (data.treatment?.status) {
      const rawTreatment = data.treatment.status.toLowerCase();
      if (rawTreatment.includes("untreated") || rawTreatment.includes("natural")) {
        data.treatment.status = "Untreated";
      } else if (rawTreatment.includes("heat")) {
        data.treatment.status = "Heated";
      } else if (!ENGINE_SUPPORTED_TREATMENTS.some((item) => item === data.treatment.status)) {
        data.treatment.status = "Unknown";
      }
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

    // Normalize origin value from UI variants
    if (data.origin?.value) {
      const rawOriginVal = data.origin.value.toLowerCase();
      if (rawOriginVal.includes("sri lanka") || rawOriginVal.includes("ceylon")) {
        data.origin.value = "Sri Lanka";
      } else if (rawOriginVal.includes("myanmar") || rawOriginVal.includes("burma")) {
        data.origin.value = "Myanmar";
      } else if (rawOriginVal.includes("madagascar")) {
        data.origin.value = "Madagascar";
      } else if (!ENGINE_SUPPORTED_ORIGINS.some((item) => item === data.origin.value)) {
        data.origin.value = "Unknown";
      }
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

    // Normalize origin reliability from UI variants
    if (data.origin?.reliability) {
      const rawOriginRel = data.origin.reliability.toLowerCase().replace(/[\s\-_]+/g, "");
      if (rawOriginRel.includes("unverified") || rawOriginRel === "unknown") {
        data.origin.reliability = "Unknown";
      } else if (rawOriginRel === "high" || rawOriginRel.includes("verified") || rawOriginRel.includes("laboratory") || rawOriginRel.includes("lab")) {
        data.origin.reliability = "High";
      } else if (rawOriginRel === "medium" || rawOriginRel.includes("declared") || rawOriginRel.includes("seller")) {
        data.origin.reliability = "Medium";
      } else if (rawOriginRel === "low") {
        data.origin.reliability = "Low";
      } else {
        data.origin.reliability = "Unknown";
      }
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
      (r) =>
        r.dataClassification === "Real" &&
        r.transactionContext === "Completed Sale" &&
        (r.marketContext || "Wholesale") === "Wholesale"
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
        let normPricePerCarat = reference.pricePerCarat && reference.pricePerCarat > 0
          ? reference.pricePerCarat
          : (reference.caratWeight > 0 ? Math.round(reference.referencePrice / reference.caratWeight) : reference.referencePrice);
        const refCurr = (reference.currency || "LKR").toUpperCase().trim();
        if (refCurr === "USD") {
          if (exchangeRate && exchangeRate.isAvailable && exchangeRate.rate > 0) {
            normPrice = reference.referencePrice * exchangeRate.rate;
            normPricePerCarat = normPricePerCarat * exchangeRate.rate;
          } else {
            normPrice = 0; // Exclude USD reference if no verified exchange rate is available
          }
        } else if (refCurr === "CHF") {
          if (exchangeRate && exchangeRate.isAvailable && exchangeRate.rate > 0) {
            normPrice = reference.referencePrice * 1.12 * exchangeRate.rate;
            normPricePerCarat = normPricePerCarat * 1.12 * exchangeRate.rate;
          }
        }
        return {
          ...reference,
          referenceId: reference.referenceId || reference.referenceGemstoneId,
          referencePrice: Math.round(normPrice),
          pricePerCarat: Math.round(normPricePerCarat),
          currency: "LKR",
        };
      })
      .filter((r) => r.referencePrice > 0);

    const hasRealMarketData = normalizedRealComparables.length >= 3;
    const bestRealMatch =
      normalizedRealComparables.length > 0 ? normalizedRealComparables[0] : null;

    const candidateCarat = Number(data.caratWeight) || 1.0;
    const candidateContext = {
      caratWeight: candidateCarat,
      treatment: data.treatment,
      origin: data.origin,
    };

    const aggregationResult = hasRealMarketData
      ? calculateComparableReferencePrice(normalizedRealComparables, candidateContext)
      : null;

    const comparableReferencePrice = aggregationResult?.suggestedTotalPrice ?? null;

    const priceSuggestion = calculatePriceSuggestion(
      hasRealMarketData && bestRealMatch ? comparableReferencePrice : null,
      "LKR",
      evaluation.treatment.adjustmentFactor,
      evaluation.origin.adjustmentFactor,
      {
        referenceCount: normalizedRealComparables.length,
        aggregationResult,
        candidateCaratWeight: candidateCarat,
        exchangeRate,
        dataClassification: hasRealMarketData ? "Real" : "Demo",
        isRealMarketData: hasRealMarketData,
        marketContext: "Wholesale",
        evidenceBasis: hasRealMarketData ? "Wholesale Completed Sales" : "None",
      }
    );

    const pricingSnapshot = {
      engineVersion: "v4.2-explainable-per-carat",
      timestamp: new Date().toISOString(),
      candidateCaratWeight: candidateCarat,
      status: priceSuggestion.status,
      evidenceBasis: priceSuggestion.evidenceBasis || "None",
      marketContext: priceSuggestion.marketContext || "Wholesale",
      comparablesUsedCount: normalizedRealComparables.length,
      benchmarkPricePerCaratLkr: priceSuggestion.pricePerCaratLkr,
      benchmarkPricePerCaratUsd: priceSuggestion.pricePerCaratUsd,
      suggestedTotalPriceLkr: priceSuggestion.priceLkr,
      suggestedTotalPriceUsd: priceSuggestion.priceUsd,
      priceRangeLkr: priceSuggestion.priceRangeLkr,
      priceRangeUsd: priceSuggestion.priceRangeUsd,
      priceRangePerCaratLkr: priceSuggestion.priceRangePerCaratLkr,
      priceRangePerCaratUsd: priceSuggestion.priceRangePerCaratUsd,
      rangePercentage: priceSuggestion.rangePercentage,
      dispersion: priceSuggestion.dispersion,
      exchangeRateUsed: exchangeRate,
      contributingComparables: priceSuggestion.contributingComparables || [],
      retailIndicativeRangeLkr: priceSuggestion.retailIndicativeRangeLkr,
      retailIndicativeRangeUsd: priceSuggestion.retailIndicativeRangeUsd,
    };

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

    let finalGemstoneId = data.gemstoneId;
    let createdGemstoneId: string | null = null;

    if (finalGemstoneId && mongoose.Types.ObjectId.isValid(finalGemstoneId)) {
      const existingGem = await Gemstone.findById(finalGemstoneId);
      if (existingGem && existingGem.userId && existingGem.userId.toString() !== session.userId) {
        return NextResponse.json(
          { error: "Access denied. You do not own the specified gemstone specimen." },
          { status: 403 }
        );
      }
    } else {
      // Atomic specimen creation ensuring ownership and data integrity
      const createdGemstone = await Gemstone.create({
        userId: session.userId,
        variety: data.variety,
        caratWeight: Number(data.caratWeight),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        treatment: data.treatment,
        origin: data.origin,
        informationReliability: data.informationReliability,
        photoUrl: data.photoUrl || "",
        naturalStatus: data.naturalStatus || "Natural",
      });
      finalGemstoneId = createdGemstone._id.toString();
      createdGemstoneId = finalGemstoneId;
    }

    const assessmentSnapshot = {
      ownerId: session.userId,
      gemstone: {
        variety: data.variety,
        caratWeight: Number(data.caratWeight),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        treatment: data.treatment,
        origin: data.origin,
        informationReliability: data.informationReliability,
        photoUrl: data.photoUrl || "",
        naturalStatus: data.naturalStatus || "Natural",
      },
      ruleVersion: evaluation.ruleVersion,
      scores: {
        color: evaluation.color.score,
        clarity: evaluation.clarity.score,
        cut: evaluation.cut.score,
        carat: evaluation.carat.score,
        overall: evaluation.overall4C.score,
      },
      overallScore: evaluation.overall4C.score,
      priceSuggestion,
      pricingSnapshot,
      exchangeRate: priceSuggestion.exchangeRate ?? null,
      recommendations: evaluation.recommendations,
      timestamp: new Date().toISOString(),
    };

    let savedEvaluation;
    try {
      savedEvaluation = await Evaluation.create({
        userId: session.userId,
        gemstoneId: finalGemstoneId,
        ruleVersion: evaluation.ruleVersion,
        status: evaluation.status,
        result: evaluation,
        referenceDataSufficiency,
        bestReferenceMatch,
        priceSuggestion: {
          ...priceSuggestion,
          pricingSnapshot,
        },
        exchangeRate: priceSuggestion.exchangeRate ?? null,
        photoUrl: data.photoUrl || "",
        assessmentSnapshot,
      });
    } catch (evalSaveError) {
      // Clean rollback: If an evaluation save fails, delete any newly provisioned gemstone specimen
      if (createdGemstoneId) {
        try {
          await Gemstone.findByIdAndDelete(createdGemstoneId);
        } catch (cleanupErr) {
          console.error("Failed to clean up orphaned gemstone specimen:", cleanupErr);
        }
      }
      throw evalSaveError;
    }

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
        "variety caratWeight color clarity cut treatment origin informationReliability photoUrl"
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
