import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import HistoricalPrice from "@/models/HistoricalPrice";

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

    const historicalPrices = await HistoricalPrice.find({})
      .sort({ recordedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      { historicalPrices },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch historical prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical prices." },
      { status: 500 }
    );
  }
}
