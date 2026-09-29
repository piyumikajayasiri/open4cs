import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const VALID_CATEGORIES = [
  "STUDENT",
  "TRADER",
  "GEMOLOGIST",
  "PROFESSIONAL",
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, password, category } = body;

    if (!name || !email || !password || !category) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 },
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user category.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      category,
      role: "USER",
      status: "ACTIVE",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          category: user.category,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create account.",
      },
      { status: 500 },
    );
  }
}
