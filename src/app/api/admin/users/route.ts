import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import User, { toSafeUserDTO } from "@/models/User";
import AuditLog from "@/models/AuditLog";

export async function GET(request?: NextRequest) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== "CAGS_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const rawUsers = await User.find()
      .select("-passwordHash -password")
      .sort({ createdAt: -1 })
      .lean();

    const users = rawUsers.map(toSafeUserDTO);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET admin users error:", error);
    return NextResponse.json({ success: false, message: "Failed to load users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== "CAGS_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const { name, email, password, category, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const tempPassword = password || "Open4CsTempPass2026!";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash: hashedPassword,
      category: category || "Professional",
      role: role === "CAGS_ADMIN" ? "CAGS_ADMIN" : "USER",
      status: "ACTIVE",
      isActive: true,
    });

    await AuditLog.create({
      action: "USER_PROVISIONED",
      performedBy: {
        userId: admin.id,
        name: admin.name,
        email: admin.email,
      },
      targetType: "User",
      targetId: newUser._id.toString(),
      summary: `${admin.name} provisioned user account for ${newUser.name} (${newUser.email})`,
      details: { role: newUser.role, category: newUser.category },
    });

    return NextResponse.json(
      {
        success: true,
        message: `User ${newUser.name} created successfully.`,
        user: toSafeUserDTO(newUser),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST admin user error:", error);
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 });
  }
}
