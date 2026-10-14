import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.user.role,
        category: session.user.category,
      },
    });
  } catch (error) {
    console.error("Auth me API error:", error);

    return NextResponse.json(
      { message: "Unable to verify session" },
      { status: 500 },
    );
  }
}
