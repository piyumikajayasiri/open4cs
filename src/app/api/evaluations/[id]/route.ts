import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { verifySessionToken } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import Evaluation from "@/models/Evaluation";
import Gemstone from "@/models/Gemstone";

if (!mongoose.models.Gemstone) {
  void Gemstone;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

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

    const evaluation = await Evaluation.findById(id)
      .populate("gemstoneId")
      .lean();

    if (!evaluation) {
      return NextResponse.json(
        { error: "Evaluation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    console.error("Failed to load evaluation:", error);
    return NextResponse.json(
      { error: "Server error loading evaluation." },
      { status: 500 }
    );
  }
}
