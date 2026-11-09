import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { POST as createUser } from "@/app/api/admin/users/route";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Administrator access required." }, { status: 403 });
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
  return createUser(new NextRequest(request.url, {
    method: "POST", headers: request.headers,
    body: JSON.stringify({ ...body, role: "ADMIN" }),
  }));
}
