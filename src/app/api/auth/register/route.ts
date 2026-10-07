import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

const ALLOWED_CATEGORIES = [
  "Student",
  "Trader",
  "Gemologist",
  "Professional",
];

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const password = data.password;
    const category = data.category;

    if (!name || !email || !password || !category) {
      return Response.json(
        {
          error:
            "Name, email, password, and category are required.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return Response.json(
        { error: "Invalid user category." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        {
          error:
            "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        {
          error:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      category,
      role: "USER",
    });

    return Response.json(
      {
        message: "Registration successful.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          category: user.category,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration failed:", error);

    return Response.json(
      { error: "Registration failed." },
      { status: 500 }
    );
  }
}
