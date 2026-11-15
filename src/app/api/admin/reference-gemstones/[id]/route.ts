import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import { adminRoute, AdminError } from "@/lib/admin/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return adminRoute(request, async () => {
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AdminError("Invalid reference ID.");
    const reference = await ReferenceGemstone.findOne({ _id: id, deletedAt: null }).lean();
    if (!reference) throw new AdminError("Reference record was not found.", 404);
    return NextResponse.json({ success: true, reference });
  });
}
export async function PUT(request: Request) {
  return adminRoute(request, async () => { throw new AdminError("Use the managed record editor at /api/admin/data-records to edit source records with audit history and review reset.", 409); });
}
export async function DELETE(request: Request) {
  return adminRoute(request, async () => { throw new AdminError("Use the managed record deletion workflow at /api/admin/data-records to retain the audit trail.", 409); });
}
