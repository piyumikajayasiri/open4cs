import { NextResponse } from "next/server";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { approvedCatalogue } from "@/lib/evaluation/approved-data";
export async function GET(request: Request) {
  return evaluationRoute(request, async()=>NextResponse.json(await approvedCatalogue()));
}
