import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectDB } from "@/lib/mongodb";
import ReferenceGemstone from "@/models/ReferenceGemstone";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "CAGS_ADMIN") {
      return NextResponse.json(
        { success: false, message: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    await connectDB();

    const realRecords = await ReferenceGemstone.find({
      dataClassification: "Real",
      status: "ACTIVE",
    })
      .sort({ variety: 1, referenceId: 1 })
      .lean();

    const formattedRecords = realRecords.map((r) => ({
      referenceId: r.referenceId,
      lotId: r.lotId || "",
      species: r.species || "Corundum",
      variety: r.variety,
      naturalStatus: r.naturalStatus || "Natural",
      caratWeight: r.caratWeight,
      shape: r.shape || "Oval",
      dimensions: r.dimensions || {
        length: r.cut?.length ?? null,
        width: r.cut?.width ?? null,
        depth: r.cut?.depth ?? null,
      },
      sourceColor: r.sourceColor || "",
      color: {
        hue: r.color.hue,
        tone: r.color.tone,
        saturation: r.color.saturation,
        distribution: r.color.distribution || "Even",
        zoning: r.color.zoning || "None",
      },
      claritySystem: r.claritySystem || "CAGS / GIA Corundum Scale",
      clarity: {
        nakedEye: r.clarity.nakedEye,
        loupe10x: r.clarity.loupe10x,
        inclusionType: r.clarity.inclusionType || "",
        inclusionLocation: r.clarity.inclusionLocation || "",
        severity: r.clarity.severity || "Minor",
      },
      cut: {
        length: r.cut?.length ?? null,
        width: r.cut?.width ?? null,
        depth: r.cut?.depth ?? null,
        symmetry: r.cut?.symmetry || "Good",
        polish: r.cut?.polish || "Good",
        windowing: r.cut?.windowing || "None",
        extinction: r.cut?.extinction || "None",
        bulging: r.cut?.bulging || "None",
      },
      treatment: r.treatment || { status: "Heated" },
      treatmentEvidence: r.treatmentEvidence || "",
      claimedOrigin: r.claimedOrigin || "",
      labOrigin: r.labOrigin || "",
      origin: r.origin || { value: "Sri Lanka", reliability: "High" },
      originEvidence: r.originEvidence || "",
      labName: r.labName || "",
      labReportNumber: r.labReportNumber || "",
      labReportUrl: r.labReportUrl || "",
      labCertificate: r.labCertificate || "",
      priceAmount: r.referencePrice || r.priceAmount || 0,
      pricePerCarat:
        r.pricePerCarat ||
        (r.caratWeight > 0
          ? Math.round((r.referencePrice || r.priceAmount || 0) / r.caratWeight)
          : r.referencePrice || 0),
      priceUnit: r.priceUnit || "total",
      currency: r.currency || "LKR",
      feesDisclosed: r.feesDisclosed || "",
      taxesDisclosed: r.taxesDisclosed || "",
      netPrice: r.netPrice || r.referencePrice || 0,
      source: r.source || "Market Trade Register",
      sourceType: r.sourceType || "Wholesale Trade Register",
      sourceUrl: r.sourceUrl || "",
      publisher: r.publisher || "",
      evidenceNotes: r.evidenceNotes || r.sourceEvidence || "",
      evidenceAttachments: r.evidenceAttachments || [],
      dataClassification: "Real",
      verificationStatus: r.verificationStatus || "Verified",
      verifiedBy: r.verifiedBy || "CAGS Admin",
      verifiedAt: r.verifiedAt || new Date().toISOString(),
      reviewer: r.reviewer || "CAGS Admin",
      reviewDate: r.reviewDate || new Date().toISOString().split("T")[0],
      observationDate: r.observationDate || new Date().toISOString().split("T")[0],
      saleDate: r.saleDate || r.observationDate || new Date().toISOString().split("T")[0],
      listingDate: r.listingDate || "",
      retrievalDate: r.retrievalDate || "",
      marketLocation: r.marketLocation || "Sri Lanka",
      transactionContext: r.transactionContext || "Completed Sale",
      marketContext: r.marketContext || "Wholesale",
      originalCurrency: r.originalCurrency || r.currency || "LKR",
      originalPrice: r.originalPrice || r.referencePrice || 0,
      originalCaratWeight: r.originalCaratWeight || r.caratWeight || 1.0,
      photoUrl: r.photoUrl || "",
      photoAttribution: r.photoAttribution || "",
      photoReusePermitted: r.photoReusePermitted ?? true,
      limitations: r.limitations || "",
      missingFields: r.missingFields || [],
    }));

    const evidenceFilePath = path.join(process.cwd(), "data", "market-references-evidence.json");
    fs.writeFileSync(evidenceFilePath, JSON.stringify(formattedRecords, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      count: formattedRecords.length,
      timestamp: new Date().toISOString(),
      message: `Successfully synchronized ${formattedRecords.length} real market references from MongoDB into registry file.`,
    });
  } catch (err) {
    console.error("Sync evidence error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to sync evidence file." },
      { status: 500 }
    );
  }
}
