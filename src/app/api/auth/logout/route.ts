import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return Response.json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout failed:", error);

    return Response.json(
      {
        error: "Logout failed.",
      },
      { status: 500 }
    );
  }
}
