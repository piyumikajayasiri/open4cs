import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { EvaluationValidationError, MockDataError } from "./engine";
import { SubmissionError } from "./submission";
import { SubmissionConflict } from "./persistence";

export async function evaluationRoute(request: Request, handler: (user: { id: string; category: string }) => Promise<Response>) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Sign in to access your evaluations." }, { status: 401 });
    if (request.method !== "GET" && request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ message: "Submit evaluations from this site." }, { status: 403 });
    await connectDB();
    return await handler({ id: session.user.id, category: session.user.category });
  } catch (error) {
    if (error instanceof SubmissionError || error instanceof EvaluationValidationError) return NextResponse.json({ message: error.message, errors: error.errors }, { status: 400 });
    if (error instanceof SubmissionConflict) return NextResponse.json({ message: error.message }, { status: 409 });
    if (error instanceof MockDataError) return NextResponse.json({ message: error.message }, { status: 503 });
    console.error("Evaluation request failed:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ message: "Unable to access or save the evaluation. Please try again." }, { status: 500 });
  }
}
