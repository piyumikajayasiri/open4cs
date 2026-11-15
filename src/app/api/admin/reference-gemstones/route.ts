import { NextResponse } from "next/server";
import { adminRoute, AdminError } from "@/lib/admin/server";
import ReferenceGemstone from "@/models/ReferenceGemstone";
export async function GET(request: Request) {
  return adminRoute(request, async () => NextResponse.json({ success: true, references: await ReferenceGemstone.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(500).lean() }));
}
export async function POST(request: Request) {
  return adminRoute(request, async () => { throw new AdminError("Add sourced reference records through /api/admin/data-records with dataset REFERENCE. Direct verification flags are not accepted.", 409); });
}
