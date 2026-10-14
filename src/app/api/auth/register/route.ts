import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User, { UserCategory } from "@/models/User";

const ALLOWED_CATEGORIES: UserCategory[] = [
  "STUDENT",
  "TRADER",
  "GEMOLOGIST",
  "PROFESSIONAL",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    const rawCategory =
      body.category ?? body.userCategory ?? body.selectedCategory;

    const category =
      typeof rawCategory === "string" ? rawCategory.trim().toUpperCase() : "";

    // Validate required fields
    if (!name || !email || !password || !category) {
      return NextResponse.json(
        { success: false, message: "Please complete all required fields." },
        { status: 400 },
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be between 2 and 100 characters.",
        },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!ALLOWED_CATEGORIES.includes(category as UserCategory)) {
      console.error("Invalid registration category:", {
        received: rawCategory,
        type: typeof rawCategory,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Invalid user category.",
          receivedCategory: rawCategory ?? null,
        },
        { status: 400 },
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 12 characters.",
        },
        { status: 400 },
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 },
      );
    }

    // Connect to the database
    await connectDB();

    // Check for an existing account
    const existingUser = await User.findOne({ email }).select("_id");

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    // Hash the password before saving it
    const passwordHash = await bcrypt.hash(password, 12);

    // Public registration always creates a normal user
    const user = await User.create({
      name,
      email,
      passwordHash,
      category: category as UserCategory,
      role: "USER",
      status: "ACTIVE",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. You can now sign in.",
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
  } catch (error: unknown) {
    // Handle duplicate email race conditions
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
