import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { evaluateMock, EvaluationValidationError, MockDataError, validateEvaluation } from "@/lib/evaluation/engine";
import { loadMockData } from "@/lib/evaluation/load-mock-data";

export async function GET() {
  if (!(await auth())?.user?.id) return NextResponse.json({ message: "Sign in to preview evaluation rules." }, { status: 401 });
  try {
    const { records, rules } = await loadMockData();
    return NextResponse.json({ rules, recordCount: records.length });
  } catch (error) {
    return NextResponse.json({ message: error instanceof MockDataError ? error.message : "Mock data is unavailable. Check database access and load the test dataset." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Sign in to preview an evaluation." }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch {
    return NextResponse.json({ message: "Invalid JSON request body." }, { status: 400 });
  }
  try {
    const errors = validateEvaluation(input);
    if (Object.keys(errors).length) throw new EvaluationValidationError(errors);
    // The request contains observations only; all records and rules come from separate mock collections.
    const { records, rules } = await loadMockData();
    return NextResponse.json({ success: true, evaluation: evaluateMock(input, records, rules) });
  } catch (error) {
    if (error instanceof EvaluationValidationError) return NextResponse.json({ message: error.message, errors: error.errors }, { status: 400 });
    return NextResponse.json({ message: error instanceof MockDataError ? error.message : "Mock data is unavailable. Check database access and load the test dataset." }, { status: 503 });
  }
}
