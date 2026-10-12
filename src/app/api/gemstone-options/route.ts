import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TreatmentOption from "@/models/TreatmentOption";
import OriginOption from "@/models/OriginOption";

export async function GET() {
  try {
    await connectToDatabase();

    const [treatments, origins] = await Promise.all([
      TreatmentOption.find({
        isActive: true,
        engineSupported: true,
      })
        .sort({ name: 1 })
        .select("name description")
        .lean(),

      OriginOption.find({
        isActive: true,
        engineSupported: true,
      })
        .sort({ name: 1 })
        .select("name description")
        .lean(),
    ]);

    return NextResponse.json({
      treatments,
      origins,
    });
  } catch (error) {
    console.error("Failed to load gemstone options:", error);

    return NextResponse.json(
      { error: "Unable to load gemstone options." },
      { status: 500 }
    );
  }
}
