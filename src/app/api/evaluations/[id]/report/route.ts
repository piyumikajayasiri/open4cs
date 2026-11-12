import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { verifySessionToken } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import Evaluation from "@/models/Evaluation";
import Gemstone from "@/models/Gemstone";
import User from "@/models/User";
import { generateEvaluationPdf } from "@/lib/report/generateEvaluationPdf";

// Ensure User and Gemstone models are registered for mongoose populate
if (!mongoose.models.User) {
  void User;
}
if (!mongoose.models.Gemstone) {
  void Gemstone;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid evaluation ID." },
        { status: 400 }
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

    const evaluation = await Evaluation.findOne({
      _id: id,
      userId: session.userId,
    })
      .populate("userId", "name category")
      .populate("gemstoneId");

    if (!evaluation) {
      return NextResponse.json(
        { error: "Evaluation not found." },
        { status: 404 }
      );
    }

    const gemstoneDoc =
      typeof evaluation.gemstoneId === "object" && evaluation.gemstoneId
        ? evaluation.gemstoneId
        : {};

    const userDoc =
      typeof evaluation.userId === "object" && evaluation.userId
        ? evaluation.userId
        : {};

    const userName = userDoc.name || "User";
    const userCategory = userDoc.category || "Student";

    const priceSuggestion = evaluation.priceSuggestion;
    const isPriceAvailable =
      priceSuggestion !== null &&
      priceSuggestion !== undefined &&
      priceSuggestion.status === "COMPLETED" &&
      priceSuggestion.suggestedPrice !== null &&
      priceSuggestion.suggestedPrice > 0;

    const minPrice =
      priceSuggestion?.priceRange?.minimum ??
      priceSuggestion?.minimumPrice ??
      null;

    const maxPrice =
      priceSuggestion?.priceRange?.maximum ??
      priceSuggestion?.maximumPrice ??
      null;

    const bestRef = evaluation.bestReferenceMatch;
    const isReferenceAvailable =
      bestRef !== null &&
      bestRef !== undefined &&
      bestRef.similarity?.overall !== null &&
      bestRef.similarity?.overall !== undefined;

    const recommendationsArray =
      Array.isArray(evaluation.result?.recommendations?.recommendations)
        ? evaluation.result.recommendations.recommendations
        : Array.isArray(evaluation.result?.recommendations)
        ? evaluation.result.recommendations
        : [];

    const report = {
      reportTitle: "Open 4Cs Gemstone Evaluation Report",
      evaluationId: evaluation._id.toString(),
      generatedAt: new Date().toISOString(),
      evaluationDate: evaluation.createdAt,

      user: {
        name: userName,
        category: userCategory,
      },

      gemstone: {
        variety: gemstoneDoc.variety || "Gemstone",
        caratWeight: gemstoneDoc.caratWeight || 0,
        color: gemstoneDoc.color || {},
        clarity: gemstoneDoc.clarity || {},
        cut: gemstoneDoc.cut || {},
        treatment: gemstoneDoc.treatment || {},
        origin: gemstoneDoc.origin || {},
        informationReliability: gemstoneDoc.informationReliability || {},
        photoUrl: (gemstoneDoc as { photoUrl?: string }).photoUrl || evaluation.photoUrl || "",
      },

      scores: {
        overall: evaluation.result?.overall4C?.score ?? 0,
        color: evaluation.result?.color?.score ?? 0,
        clarity: evaluation.result?.clarity?.score ?? 0,
        cut: evaluation.result?.cut?.score ?? 0,
        carat: evaluation.result?.carat?.score ?? 0,
      },

      priceSuggestion: {
        available: isPriceAvailable,
        suggestedPrice: isPriceAvailable ? priceSuggestion.suggestedPrice : null,
        minimumPrice: isPriceAvailable ? minPrice : null,
        maximumPrice: isPriceAvailable ? maxPrice : null,
        currency: isPriceAvailable ? priceSuggestion.currency || "LKR" : null,
        priceLkr: priceSuggestion?.priceLkr ?? null,
        priceUsd: priceSuggestion?.priceUsd ?? null,
        priceRangeLkr: priceSuggestion?.priceRangeLkr ?? null,
        priceRangeUsd: priceSuggestion?.priceRangeUsd ?? null,
        exchangeRate: evaluation.exchangeRate || priceSuggestion?.exchangeRate || null,
        isRealMarketData: priceSuggestion?.marketLevel?.includes("Verified Commercial") || false,
        marketLevel: priceSuggestion?.marketLevel || "",
        reason: priceSuggestion?.reason || "",
      },

      referenceComparison: {
        available: isReferenceAvailable,
        referenceName: isReferenceAvailable ? (bestRef.variety || "Reference Gemstone") : null,
        similarity: isReferenceAvailable ? bestRef.similarity.overall : null,
      },

      recommendations: recommendationsArray,

      ruleVersion: evaluation.ruleVersion || "prototype-v1",

      userStatement: `This evaluation was generated for ${userName}, registered as a ${userCategory}.`,

      disclaimer:
        "This report is an educational and decision-support output from the Open 4Cs system. It is not a professional gemstone valuation, laboratory certification, authenticity determination, origin authentication, treatment detection result, or guaranteed selling price.",
    };

    const pdfBytes = await generateEvaluationPdf(report);

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="open4cs-evaluation-${evaluation._id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Failed to prepare evaluation report:", error);

    return NextResponse.json(
      { error: "Unable to prepare the evaluation report." },
      { status: 500 }
    );
  }
}
