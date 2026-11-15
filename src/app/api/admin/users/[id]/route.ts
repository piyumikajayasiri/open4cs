import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import mongoose from "mongoose";
import AdminAudit from "@/models/AdminAudit";
import { requireUserDeletion, userAuditSnapshot } from "@/lib/admin/policy";
import { adminRoute, AdminError } from "@/lib/admin/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User, { USER_CATEGORIES, USER_ROLES, USER_STATUSES } from "@/models/User";

const CATEGORIES = USER_CATEGORIES;

const ROLES = USER_ROLES;
const STATUSES = USER_STATUSES;

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

    const user = await User.findOne({ _id: id, deletedAt: null }).select("-passwordHash").lean();

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
    if (id.toLowerCase() === session.user.id.toLowerCase()) {
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

    await AdminAudit.init();
    const auditSession = await mongoose.startSession();
    let user;
    try {
      user = await auditSession.withTransaction(async () => {
        const before = await User.findOne({ _id: id, deletedAt: null }).select("-passwordHash").session(auditSession);
        if (!before) return null;
        const updated = await User.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: updates }, { new: true, runValidators: true, session: auditSession }).select("-passwordHash");
        if (!updated) return null;
        await AdminAudit.create([{ actorId: session.user.id, actorName: session.user.name || "Administrator", action: "USER_UPDATED", entity: "USER", entityId: id,
          summary: `Updated account ${updated.name}.`, before: userAuditSnapshot(before.toObject()), after: userAuditSnapshot(updated.toObject()) }], { session: auditSession });
        return updated;
      });
    } finally { await auditSession.endSession(); }

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

export async function DELETE(request: Request, context: RouteContext) {
  return adminRoute(request, async (actor) => {
    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) throw new AdminError("Invalid user ID.");
    try { requireUserDeletion(id, actor.id); } catch (error) { throw new AdminError(error instanceof Error ? error.message : "Cannot delete this account.", 409); }
    await AdminAudit.init();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const user = await User.findOne({ _id: id, deletedAt: null }).session(session);
        if (!user) throw new AdminError("Account was not found or has already been deleted.", 404);
        const before = userAuditSnapshot(user.toObject());
        user.status = "INACTIVE"; user.deletedAt = new Date(); user.deletedBy = actor.id;
        await user.save({ session });
        await AdminAudit.create([{ actorId: actor.id, actorName: actor.name, action: "USER_DELETED", entity: "USER", entityId: id,
          summary: `Deleted account ${user.name}; sign-in disabled.`, before, after: userAuditSnapshot(user.toObject()) }], { session });
      });
      return NextResponse.json({ success: true });
    } finally { await session.endSession(); }
  });
}
