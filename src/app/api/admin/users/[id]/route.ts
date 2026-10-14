import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const CATEGORIES = ["STUDENT", "TRADER", "GEMOLOGIST", "PROFESSIONAL"];

const ROLES = ["USER", "ADMIN"];
const STATUSES = ["ACTIVE", "INACTIVE"];

async function isAdmin() {
  const session = await auth();
  return Boolean(session?.user?.id && session.user.role === "ADMIN");
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(id).select("-passwordHash").lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET admin user:", error);
    return NextResponse.json(
      { message: "Unable to load user" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const updates: Record<string, string> = {};

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length < 2 ||
        body.name.trim().length > 100
      ) {
        return NextResponse.json({ message: "Invalid name" }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.category !== undefined) {
      if (!CATEGORIES.includes(body.category)) {
        return NextResponse.json(
          { message: "Invalid category" },
          { status: 400 },
        );
      }
      updates.category = body.category;
    }

    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) {
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
      }
      updates.role = body.role;
    }

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json(
          { message: "Invalid status" },
          { status: 400 },
        );
      }
      updates.status = body.status;
    }

    // Do not allow an administrator to deactivate or demote themselves.
    if (id === session.user.id) {
      if (
        (updates.role && updates.role !== "ADMIN") ||
        (updates.status && updates.status !== "ACTIVE")
      ) {
        return NextResponse.json(
          { message: "You cannot remove your own administrator access." },
          { status: 400 },
        );
      }
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("PATCH admin user:", error);
    return NextResponse.json(
      { message: "Unable to update user" },
      { status: 500 },
    );
  }
}
