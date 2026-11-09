import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { validateAccount } from "@/lib/account-validation";
import { connectDB } from "@/lib/mongodb";
import User, { type UserCategory } from "@/models/User";


export async function POST(request: NextRequest) {
  try {
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }
    const errors = validateAccount({ ...body, category: body.category ?? body.userCategory ?? body.selectedCategory });
    if (Object.keys(errors).length) {
      return NextResponse.json({ success: false, message: "Please correct the highlighted fields.", errors }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const rawCategory =
      body.category ?? body.userCategory ?? body.selectedCategory;

    const category =
      typeof rawCategory === "string" ? rawCategory.trim().toUpperCase() : "";

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
