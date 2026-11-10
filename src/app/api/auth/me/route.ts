import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { verifySessionToken } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return Response.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return Response.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.userId);

    if (!user || !user.isActive) {
      return Response.json(
        { error: "User account is unavailable." },
        { status: 401 }
      );
    }

    return Response.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        category: user.category,
        role: user.role,
        organization: user.organization || "Perera Gems · Beruwala",
        preferredLanguage: user.preferredLanguage || "English",
        reportCurrency: user.reportCurrency || "LKR — Sri Lankan Rupee",
        notifications: user.notifications || {
          evaluationComplete: true,
          referenceDataUpdates: true,
          ruleVersionChanges: true,
          weeklyMarketDigest: false,
        },
      },
    });
  } catch (error) {
    console.error("Failed to load current user:", error);

    return Response.json(
      { error: "Failed to load current user." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return Response.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return Response.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      category,
      organization,
      preferredLanguage,
      reportCurrency,
      notifications,
      currentPassword,
      newPassword,
    } = body;

    await connectToDatabase();

    const user = await User.findById(session.userId);

    if (!user || !user.isActive) {
      return Response.json(
        { error: "User account is unavailable." },
        { status: 401 }
      );
    }

    // Update basic fields if provided
    if (name && typeof name === "string") user.name = name.trim();
    if (category && ["Student", "Trader", "Gemologist", "Professional"].includes(category)) {
      user.category = category;
    }
    if (organization !== undefined) user.organization = organization;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (reportCurrency) user.reportCurrency = reportCurrency;
    if (notifications) user.notifications = notifications;

    // Optional password change
    if (newPassword) {
      if (!currentPassword) {
        return Response.json(
          { error: "Current password is required to set a new password." },
          { status: 400 }
        );
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return Response.json(
          { error: "Current password does not match." },
          { status: 400 }
        );
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return Response.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        category: user.category,
        role: user.role,
        organization: user.organization,
        preferredLanguage: user.preferredLanguage,
        reportCurrency: user.reportCurrency,
        notifications: user.notifications,
      },
    });
  } catch (error) {
    console.error("Failed to update user profile:", error);

    return Response.json(
      { error: "Failed to update profile settings." },
      { status: 500 }
    );
  }
}
