import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const CATEGORIES = ["STUDENT", "TRADER", "GEMOLOGIST", "PROFESSIONAL"] as const;

const ROLES = ["USER", "ADMIN"] as const;
const STATUSES = ["ACTIVE", "INACTIVE"] as const;

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const params = request.nextUrl.searchParams;
    const search = params.get("search")?.trim() ?? "";
    const category = params.get("category") ?? "";
    const role = params.get("role") ?? "";
    const status = params.get("status") ?? "";

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      filter.category = category;
    }

    if (ROLES.includes(role as (typeof ROLES)[number])) {
      filter.role = role;
    }

    if (STATUSES.includes(status as (typeof STATUSES)[number])) {
      filter.status = status;
    }

    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/admin/users:", error);

    return NextResponse.json(
      { message: "Unable to load users." },
      { status: 500 },
    );
  }
}

// POST /api/admin/users
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const category =
      typeof body.category === "string"
        ? body.category.trim().toUpperCase()
        : "";
    const role =
      typeof body.role === "string" ? body.role.trim().toUpperCase() : "USER";
    const status =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "ACTIVE";

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { message: "Name must contain 2–100 characters." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must contain at least 8 characters." },
        { status: 400 },
      );
    }

    if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      return NextResponse.json(
        { message: "Invalid user category." },
        { status: 400 },
      );
    }

    if (!ROLES.includes(role as (typeof ROLES)[number])) {
      return NextResponse.json(
        { message: "Invalid user role." },
        { status: 400 },
      );
    }

    if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
      return NextResponse.json(
        { message: "Invalid account status." },
        { status: 400 },
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      category,
      role,
      status,
    });

    return NextResponse.json(
      {
        message: "User created successfully.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          category: user.category,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    console.error("POST /api/admin/users:", error);

    return NextResponse.json(
      { message: "Unable to create user." },
      { status: 500 },
    );
  }
}
