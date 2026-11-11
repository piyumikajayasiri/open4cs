import { cookies } from "next/headers";

import { verifySessionToken } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

export async function getCurrentUser() {
  // 1. Try application session token cookie
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (sessionToken) {
      const session = await verifySessionToken(sessionToken);

      if (session) {
        await connectToDatabase();
        const user = await User.findById(session.userId);

        if (user && user.isActive) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            category: user.category,
            role: user.role as "USER" | "CAGS_ADMIN",
          };
        }
      }
    }
  } catch {
    // Session token retrieval failed or cookieStore unavailable
  }

  // 2. Fallback to NextAuth session if available
  try {
    const nextAuthSession = await auth();

    if (nextAuthSession?.user?.email) {
      await connectToDatabase();
      const user = await User.findOne({
        email: nextAuthSession.user.email.toLowerCase(),
      });

      if (user && user.isActive) {
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          category: user.category,
          role: user.role as "USER" | "CAGS_ADMIN",
        };
      }
    }
  } catch {
    // NextAuth session not present
  }

  return null;
}

export async function getCurrentAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CAGS_ADMIN") {
    return null;
  }

  return user;
}
