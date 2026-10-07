import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import { verifySessionToken } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { evaluateGemstone } from "@/lib/evaluation/evaluateGemstone";
import type { EvaluationInput } from "@/lib/evaluation/evaluationInput";
import { compareReferenceGemstones } from "@/lib/evaluation/compareReferenceGemstones";
import { calculatePriceSuggestion } from "@/lib/evaluation/priceSuggestion";
import {
  REFERENCE_COMPARISON_RULES,
  ENGINE_SUPPORTED_VARIETIES,
  ENGINE_SUPPORTED_TREATMENTS,
  ENGINE_SUPPORTED_ORIGINS,
  ENGINE_SUPPORTED_ORIGIN_RELIABILITIES,
} from "@/lib/evaluation/rules";
import Evaluation from "@/models/Evaluation";
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
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

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
          message: "Unsupported gemstone variety.",
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

    const bestReferenceMatch =
      referenceComparisons.length > 0
        ? referenceComparisons[0]
        : null;

    const pricingCurrency =
      bestReferenceMatch?.currency ?? null;

    const sameCurrencyReferenceComparisons =
      pricingCurrency
        ? referenceComparisons.filter(
            (reference) =>
              reference.currency === pricingCurrency
          )
        : [];

    const suitableComparableReferences =
      sameCurrencyReferenceComparisons.filter(
        (reference) =>
          reference.similarity.overall !== null &&
          reference.similarity.overall >=
            REFERENCE_COMPARISON_RULES.minimumSimilarityForPricing
      );

    const comparableReferencePrice =
      calculateComparableReferencePrice(
        suitableComparableReferences
      );

    const hasSufficientReferenceData =
      referenceComparisons.length >=
      REFERENCE_COMPARISON_RULES.minimumReferencesForSimilarity;

    const suitableReferenceMatch =
      hasSufficientReferenceData &&
      bestReferenceMatch &&
      bestReferenceMatch.similarity.overall !== null &&
      bestReferenceMatch.similarity.overall >=
        REFERENCE_COMPARISON_RULES.minimumSimilarityForPricing
        ? bestReferenceMatch
        : null;

    const priceSuggestion =
      calculatePriceSuggestion(
        suitableReferenceMatch
          ? comparableReferencePrice
          : null,
        suitableReferenceMatch?.currency ?? null,
        evaluation.treatment.adjustmentFactor,
        evaluation.origin.adjustmentFactor
      );

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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

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
