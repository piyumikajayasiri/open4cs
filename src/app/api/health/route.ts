import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();

    return NextResponse.json({
      success: true,
      message: "Database connection is working.",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed.",
      },
      { status: 500 }
    );
  }
}