import { cookies } from "next/headers";

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
