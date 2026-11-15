import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export class AdminError extends Error {
  status: number;
  errors?: Record<string, string>;
  constructor(message: string, status = 400, errors?: Record<string, string>) { super(message); this.status = status; this.errors = errors; }
}
export type AdminActor = { id: string; name: string };

export async function adminRoute(request: Request, handler: (actor: AdminActor) => Promise<Response>) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AdminError("Sign in to continue.", 401);
    if (session.user.role !== "ADMIN") throw new AdminError("Administrator access required.", 403);
    if (request.method !== "GET" && request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) throw new AdminError("This request must come from the administration site.", 403);
    await connectDB();
    const current = await User.findById(session.user.id).select("role status deletedAt").lean();
    if (!current || current.deletedAt || current.role !== "ADMIN" || current.status !== "ACTIVE") throw new AdminError("Your administrator access is no longer active. Sign in again.", 403);
    return await handler({ id: session.user.id, name: session.user.name || "Administrator" });
  } catch (error) {
    if (error instanceof AdminError) return NextResponse.json({ message: error.message, errors: error.errors }, { status: error.status });
    if (error && typeof error === "object" && "code" in error && error.code === 11000) return NextResponse.json({ message: "This record or version already exists. Refresh and choose a new identifier." }, { status: 409 });
    console.error("Admin operation failed:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ message: "Unable to complete the operation. No partial change was committed; check database access and try again." }, { status: 500 });
  }
}

export async function bodyObject(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try { body = await request.json(); } catch { throw new AdminError("Invalid request body."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new AdminError("Provide an object containing the form fields.");
  return body as Record<string, unknown>;
}
