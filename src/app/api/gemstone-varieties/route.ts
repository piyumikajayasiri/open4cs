import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import GemstoneVariety from "@/models/GemstoneVariety";

export async function GET() {
  try {
    await connectToDatabase();

    const gemstoneVarieties = await GemstoneVariety.find({
      isActive: true,
      engineSupported: true,
    })
      .sort({ name: 1 })
      .select("name description")
      .lean();

    return NextResponse.json({ gemstoneVarieties });
  } catch (error) {
    console.error("Failed to load gemstone varieties:", error);

    return NextResponse.json(
      {
        error: "Unable to load gemstone varieties.",
      },
      { status: 500 }
    );
  }
}
