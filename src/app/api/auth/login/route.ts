import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { connectToDatabase } from "@/lib/mongodb";
import User, { toSafeUserDTO } from "@/models/User";
import { createSessionToken } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const email = data.email?.trim().toLowerCase();
    const password = data.password;

    if (!email || !password) {
      return Response.json(
        {
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      return Response.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    if (!user.isActive || user.status === "SUSPENDED") {
      return Response.json(
        {
          error: "This account is inactive or suspended.",
        },
        { status: 403 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return Response.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const sessionToken = await createSessionToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const cookieStore = await cookies();

    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({
      message: "Login successful.",
      user: toSafeUserDTO(user),
    });
  } catch (error) {
    console.error("Login failed:", error);

    return Response.json(
      {
        error: "Login failed.",
      },
      { status: 500 }
    );
  }
}
