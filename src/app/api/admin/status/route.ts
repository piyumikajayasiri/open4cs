import { getCurrentUser } from "@/lib/auth/currentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "CAGS_ADMIN") {
      return Response.json(
        { error: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    return Response.json({
      message: "CAGS Admin access granted.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        category: user.category,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin status check failed:", error);

    return Response.json(
      { error: "Failed to verify admin access." },
      { status: 500 }
    );
  }
}
