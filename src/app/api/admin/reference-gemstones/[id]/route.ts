import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectDB } from "@/lib/mongodb";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import Gemstone from "@/models/Gemstone";
import AuditLog from "@/models/AuditLog";

async function requireAdmin(req?: NextRequest) {
  const user = await getCurrentUser(req);

  if (!user || user.role !== "CAGS_ADMIN") {
    return null;
  }

  return user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { referenceId: id.toUpperCase().trim() };

    await connectDB();

    const reference = await ReferenceGemstone.findOne(query)
      .populate(
        "gemstoneId",
        "code name species supportedOrigin supportedShapes",
      )
      .lean();

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Reference gemstone not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      reference,
    });
  } catch (error) {
    console.error("GET reference gemstone error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve reference gemstone",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { referenceId: id.toUpperCase().trim() };

    const existing = await ReferenceGemstone.findOne(query);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Reference gemstone not found" },
        { status: 404 },
      );
    }

    if (body.referenceId !== undefined) {
      const referenceId = String(body.referenceId).trim().toUpperCase();

      if (!referenceId) {
        return NextResponse.json(
          { success: false, message: "Reference ID is required" },
          { status: 400 },
        );
      }

      const duplicate = await ReferenceGemstone.findOne({
        referenceId,
        _id: { $ne: existing._id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "A reference gemstone with this ID already exists",
          },
          { status: 409 },
        );
      }

      existing.referenceId = referenceId;
    }

    if (body.variety !== undefined) {
      existing.variety = String(body.variety).trim();
    }

    if (body.species !== undefined) {
      existing.species = String(body.species).trim();
    }

    if (body.naturalStatus !== undefined) {
      existing.naturalStatus = body.naturalStatus;
    }

    if (body.shape !== undefined) {
      existing.shape = String(body.shape).trim();
    }

    if (body.caratWeight !== undefined) {
      const cw = Number(body.caratWeight);
      if (isNaN(cw) || cw <= 0) {
        return NextResponse.json(
          { success: false, message: "Carat weight must be positive" },
          { status: 400 }
        );
      }
      existing.caratWeight = cw;
    }

    if (body.referencePrice !== undefined) {
      const rp = Number(body.referencePrice);
      if (isNaN(rp) || rp <= 0) {
        return NextResponse.json(
          { success: false, message: "Reference price must be positive" },
          { status: 400 }
        );
      }
      existing.referencePrice = rp;
      existing.priceAmount = rp;
    }

    // Auto-compute price per carat
    if (existing.caratWeight > 0 && existing.referencePrice > 0) {
      existing.pricePerCarat = body.pricePerCarat
        ? Number(body.pricePerCarat)
        : Math.round(existing.referencePrice / existing.caratWeight);
    }

    if (body.currency !== undefined) {
      existing.currency = String(body.currency).toUpperCase().trim();
    }

    // Sub-objects: color, clarity, cut, treatment, origin
    if (body.color && typeof body.color === "object") {
      existing.color = {
        hue: body.color.hue || existing.color.hue,
        tone: body.color.tone || existing.color.tone,
        saturation: body.color.saturation || existing.color.saturation,
        distribution: body.color.distribution || existing.color.distribution,
        zoning: body.color.zoning || existing.color.zoning,
      };
    }

    if (body.clarity && typeof body.clarity === "object") {
      existing.clarity = {
        nakedEye: body.clarity.nakedEye || existing.clarity.nakedEye,
        loupe10x: body.clarity.loupe10x || existing.clarity.loupe10x,
        inclusionType: body.clarity.inclusionType !== undefined ? body.clarity.inclusionType : existing.clarity.inclusionType,
        inclusionLocation: body.clarity.inclusionLocation !== undefined ? body.clarity.inclusionLocation : existing.clarity.inclusionLocation,
        severity: body.clarity.severity || existing.clarity.severity,
      };
    }

    if (body.cut && typeof body.cut === "object") {
      existing.cut = {
        length: body.cut.length !== undefined ? Number(body.cut.length) || null : existing.cut.length,
        width: body.cut.width !== undefined ? Number(body.cut.width) || null : existing.cut.width,
        depth: body.cut.depth !== undefined ? Number(body.cut.depth) || null : existing.cut.depth,
        symmetry: body.cut.symmetry || existing.cut.symmetry,
        polish: body.cut.polish || existing.cut.polish,
        windowing: body.cut.windowing || existing.cut.windowing,
        extinction: body.cut.extinction || existing.cut.extinction,
        bulging: body.cut.bulging || existing.cut.bulging,
      };
      existing.dimensions = {
        length: existing.cut.length,
        width: existing.cut.width,
        depth: existing.cut.depth,
      };
    }

    if (body.treatment && typeof body.treatment === "object") {
      existing.treatment = {
        status: body.treatment.status || existing.treatment.status,
      };
    }

    if (body.origin && typeof body.origin === "object") {
      existing.origin = {
        value: body.origin.value || existing.origin.value,
        reliability: body.origin.reliability || existing.origin.reliability,
      };
    }

    const otherFields = [
      "lotId",
      "sourceColor",
      "claritySystem",
      "treatmentEvidence",
      "claimedOrigin",
      "labOrigin",
      "originEvidence",
      "labName",
      "labReportNumber",
      "labReportUrl",
      "labCertificate",
      "feesDisclosed",
      "taxesDisclosed",
      "source",
      "sourceType",
      "sourceUrl",
      "publisher",
      "evidenceNotes",
      "dataClassification",
      "transactionContext",
      "marketContext",
      "marketLocation",
      "observationDate",
      "saleDate",
      "listingDate",
      "photoUrl",
      "photoAttribution",
      "limitations",
      "rejectionReason",
      "overallScore",
      "qualityGrade",
    ] as const;

    for (const f of otherFields) {
      if (body[f] !== undefined) {
        (existing as unknown as Record<string, unknown>)[f] = body[f];
      }
    }

    if (body.verificationStatus !== undefined) {
      existing.verificationStatus = body.verificationStatus;
      if (body.verificationStatus === "Verified") {
        existing.verifiedBy = session.name || "CAGS Admin";
        existing.verifiedAt = new Date().toISOString();
        existing.reviewer = session.name || "CAGS Admin";
        existing.reviewDate = new Date().toISOString().split("T")[0];
      }
    }

    if (body.status !== undefined) {
      existing.status = body.status;
      existing.isActive = body.status === "ACTIVE";
    }

    // Increment version
    existing.version = (existing.version || 1) + 1;

    await existing.save();

    try {
      await AuditLog.create({
        action: "UPDATE_REFERENCE_GEMSTONE",
        entityType: "ReferenceGemstone",
        entityId: existing._id,
        performedBy: session.id,
        userEmail: session.email,
        details: {
          referenceId: existing.referenceId,
          version: existing.version,
          updatedFields: Object.keys(body),
        },
        timestamp: new Date(),
      });
    } catch (logErr) {
      console.error("Audit log error:", logErr);
    }

    const updated = await ReferenceGemstone.findById(existing._id).lean();

    return NextResponse.json({
      success: true,
      message: `Reference ${existing.referenceId} updated (version ${existing.version}).`,
      reference: updated,
    });
  } catch (error) {
    console.error("PUT reference gemstone error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update reference gemstone." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    await connectDB();

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { referenceId: id.toUpperCase().trim() };

    const reference = await ReferenceGemstone.findOne(query);

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Reference gemstone not found" },
        { status: 404 },
      );
    }

    // Soft delete / archive
    reference.status = "INACTIVE";
    reference.isActive = false;
    reference.verificationStatus = "Archived";
    await reference.save();

    try {
      await AuditLog.create({
        action: "ARCHIVE_REFERENCE_GEMSTONE",
        entityType: "ReferenceGemstone",
        entityId: reference._id,
        performedBy: session.id,
        userEmail: session.email,
        details: { referenceId: reference.referenceId },
        timestamp: new Date(),
      });
    } catch (logErr) {
      console.error("Audit log error:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Reference gemstone '${reference.referenceId}' archived successfully.`,
    });
  } catch (error) {
    console.error("DELETE reference gemstone error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to archive reference gemstone" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "CAGS Admin access required." },
        { status: 403 },
      );
    }

    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const updateDoc: Record<string, unknown> = { ...body };

    const reviewerName = admin.name || "CAGS Admin";
    const timestamp = new Date().toISOString();

    if (body.verificationStatus === "Verified") {
      updateDoc.verificationStatus = "Verified";
      updateDoc.verifiedBy = reviewerName;
      updateDoc.verifiedAt = timestamp;
      updateDoc.reviewer = reviewerName;
      updateDoc.reviewDate = timestamp.split("T")[0];
      updateDoc.status = "ACTIVE";
      updateDoc.isActive = true;
    } else if (body.verificationStatus === "Rejected") {
      updateDoc.verificationStatus = "Rejected";
      updateDoc.rejectionReason = body.rejectionReason || "Criteria not met during peer review";
      updateDoc.reviewer = reviewerName;
      updateDoc.reviewDate = timestamp.split("T")[0];
    } else if (body.verificationStatus === "Archived") {
      updateDoc.verificationStatus = "Archived";
      updateDoc.status = "INACTIVE";
      updateDoc.isActive = false;
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { referenceId: id.toUpperCase().trim() };

    const updated = await ReferenceGemstone.findOneAndUpdate(
      query,
      { $set: updateDoc },
      { returnDocument: "after" }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Reference record not found." },
        { status: 404 },
      );
    }

    try {
      await AuditLog.create({
        action: `SET_STATUS_${String(body.verificationStatus || "UPDATED").toUpperCase()}`,
        entityType: "ReferenceGemstone",
        entityId: updated._id,
        performedBy: admin.id,
        userEmail: admin.email,
        details: {
          referenceId: updated.referenceId,
          status: updated.verificationStatus,
          rejectionReason: updateDoc.rejectionReason,
        },
        timestamp: new Date(),
      });
    } catch (logErr) {
      console.error("Audit log creation error:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Reference record '${updated.referenceId}' updated to '${updated.verificationStatus}'.`,
      reference: updated,
    });
  } catch (err) {
    console.error("Patch reference error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update reference record." },
      { status: 500 },
    );
  }
}
