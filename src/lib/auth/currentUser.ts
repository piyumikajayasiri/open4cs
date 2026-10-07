import { cookies } from "next/headers";

import { verifySessionToken } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await verifySessionToken(sessionToken);

  if (!session) {
    return null;
  }

  await connectToDatabase();

  const user = await User.findById(session.userId);

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    category: user.category,
    role: user.role as "USER" | "CAGS_ADMIN",
  };
}

export async function getCurrentAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CAGS_ADMIN") {
    return null;
  }

  return user;
}
