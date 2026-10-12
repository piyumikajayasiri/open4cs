import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import RecommendationRule from "@/models/RecommendationRule";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid recommendation rule ID." },
        { status: 400 }
      );
    }

    const data = await request.json();
    const description = data.description;

    if (typeof description !== "string") {
      return NextResponse.json(
        { error: "Description must be text." },
        { status: 400 }
      );
    }

    const cleanDescription = description.trim();

    if (cleanDescription.length > 500) {
      return NextResponse.json(
        { error: "Description must be 500 characters or fewer." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const recommendationRule = await RecommendationRule.findByIdAndUpdate(
      id,
      {
        $set: {
          description: cleanDescription,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!recommendationRule) {
      return NextResponse.json(
        { error: "Recommendation rule not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Recommendation rule description updated successfully.",
      recommendationRule,
    });
  } catch (error) {
    console.error("Failed to update recommendation rule:", error);
    return NextResponse.json(
      { error: "Failed to update recommendation rule." },
      { status: 500 }
    );
  }
}
