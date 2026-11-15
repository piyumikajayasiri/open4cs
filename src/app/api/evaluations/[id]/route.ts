import { NextResponse } from "next/server";
import Evaluation from "@/models/Evaluation";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { evaluationDetail, ownedEvaluationFilter } from "@/lib/evaluation/submission";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return evaluationRoute(request, async (user) => {
    const { id } = await context.params;
    if (!/^[0-9a-f]{24}$/i.test(id)) return NextResponse.json({ message: "Invalid evaluation identifier." }, { status: 400 });
    const document = await Evaluation.findOne(ownedEvaluationFilter(user.id, id)).lean();
    // Do not distinguish another user's record from a record that does not exist.
    if (!document) return NextResponse.json({ message: "Evaluation was not found." }, { status: 404 });
    return NextResponse.json({ evaluation: evaluationDetail(document) });
  });
}
