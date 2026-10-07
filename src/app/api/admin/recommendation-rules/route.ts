import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import RecommendationRule from "@/models/RecommendationRule";

const DEFAULT_RECOMMENDATION_RULES = [
  {
    key: "COLOR_UNEVEN_DISTRIBUTION",
    category: "COLOR",
    name: "Uneven Color Distribution",
    description:
      "Applies when the observed gemstone color distribution is recorded as uneven.",
    message:
      "Uneven color distribution was observed. Review the gemstone's color distribution when assessing overall quality.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "COLOR_NOTICEABLE_ZONING",
    category: "COLOR",
    name: "Noticeable Color Zoning",
    description:
      "Applies when color zoning is recorded as moderate or severe.",
    message:
      "Noticeable color zoning was observed. Consider further examination of the zoning and its effect on the gemstone's appearance.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "CLARITY_NAKED_EYE_VISIBLE",
    category: "CLARITY",
    name: "Naked Eye Inclusions",
    description:
      "Applies when inclusions are noticeable or obvious with the naked eye.",
    message:
      "Visible inclusions were observed with the naked eye. Review their effect on the gemstone's appearance and clarity.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "CLARITY_10X_VISIBLE",
    category: "CLARITY",
    name: "10× Loupe Inclusions",
    description:
      "Applies when inclusions are noticeable or obvious under 10× magnification.",
    message:
      "Noticeable inclusions were observed under 10× magnification. Consider further examination of their type and location.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "CLARITY_SEVERE_INCLUSIONS",
    category: "CLARITY",
    name: "Severe Inclusion Characteristics",
    description:
      "Applies when clarity inclusion severity is marked as severe.",
    message:
      "Severe inclusion characteristics were reported. Consider professional examination before relying on the clarity assessment.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "CUT_POOR_SYMMETRY_OR_POLISH",
    category: "CUT",
    name: "Poor Symmetry or Polish",
    description:
      "Applies when either symmetry or polish quality is recorded as poor.",
    message:
      "Poor symmetry or polish was reported. Consider professional examination of the gemstone's cut quality.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "CUT_NOTICEABLE_WINDOWING",
    category: "CUT",
    name: "Noticeable Windowing",
    description:
      "Applies when windowing is recorded as moderate or severe.",
    message:
      "Noticeable windowing was observed. Consider professional assessment of whether recutting could improve the gemstone's appearance.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "CUT_NOTICEABLE_EXTINCTION",
    category: "CUT",
    name: "Noticeable Extinction",
    description:
      "Applies when extinction is recorded as moderate or severe.",
    message:
      "Noticeable extinction was observed. Review its effect on brilliance and overall appearance.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "CUT_NOTICEABLE_BULGING",
    category: "CUT",
    name: "Noticeable Bulging",
    description:
      "Applies when bulging is recorded as moderate or severe.",
    message:
      "Noticeable bulging was reported. Consider professional assessment of the gemstone's proportions and possible recutting considerations.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "MEASUREMENT_INCOMPLETE",
    category: "MEASUREMENT",
    name: "Incomplete Measurement Dimensions",
    description:
      "Applies when length-to-width ratio or depth percentage cannot be calculated due to missing dimensions.",
    message:
      "Complete dimension measurements are required before proportion-related recommendations can be provided.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "MEASUREMENT_LENGTH_WIDTH_RATIO",
    category: "MEASUREMENT",
    name: "Length-to-Width Ratio Range",
    description:
      "Applies when calculated length-to-width ratio falls outside the standard review range (1.0 to 2.0).",
    message:
      "The calculated length-to-width ratio is outside the current prototype review range. Recheck the entered length and width measurements.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "MEASUREMENT_DEPTH_PERCENTAGE",
    category: "MEASUREMENT",
    name: "Depth Percentage Range",
    description:
      "Applies when calculated depth percentage falls outside the standard review range (40% to 90%).",
    message:
      "The calculated depth percentage is outside the current prototype review range. Recheck the entered width and depth measurements.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "VERIFICATION_ORIGIN_LOW_UNKNOWN",
    category: "VERIFICATION",
    name: "Low or Unknown Origin Reliability",
    description:
      "Applies when gemstone origin reliability is low or unknown.",
    message:
      "Origin information has low or unknown reliability. Consider laboratory verification before relying on the stated origin for pricing or evaluation.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "VERIFICATION_ORIGIN_MEDIUM",
    category: "VERIFICATION",
    name: "Medium Origin Reliability",
    description:
      "Applies when gemstone origin reliability is medium.",
    message:
      "Origin information has medium reliability. Consider additional verification when origin materially affects the evaluation or price suggestion.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "VERIFICATION_MEASUREMENTS_UNVERIFIED",
    category: "VERIFICATION",
    name: "Unverified Measurements Warning",
    description:
      "Applies when gemstone measurement information is marked as unverified.",
    message:
      "Gemstone measurements are unverified. Verify the measurements before relying on the evaluation.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "VERIFICATION_TREATMENT_UNVERIFIED",
    category: "VERIFICATION",
    name: "Unverified Treatment Warning",
    description:
      "Applies when treatment information is marked as unverified.",
    message:
      "Treatment information is unverified. Consider laboratory verification where appropriate.",
    isActive: true,
    engineSupported: true,
  },
  {
    key: "VERIFICATION_ORIGIN_UNVERIFIED",
    category: "VERIFICATION",
    name: "Unverified Origin Warning",
    description:
      "Applies when origin information is marked as unverified.",
    message:
      "Origin information is unverified. Consider laboratory verification where appropriate.",
    isActive: true,
    engineSupported: true,
  },
];

async function seedDefaultRecommendationRules() {
  for (const rule of DEFAULT_RECOMMENDATION_RULES) {
    await RecommendationRule.updateOne(
      { key: rule.key },
      { $setOnInsert: rule },
      { upsert: true }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "CAGS_ADMIN") {
      return NextResponse.json(
        { error: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    await seedDefaultRecommendationRules();

    const recommendationRules = await RecommendationRule.find({})
      .sort({ category: 1, name: 1 })
      .lean();

    return NextResponse.json(
      { recommendationRules },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch recommendation rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendation rules." },
      { status: 500 }
    );
  }
}
