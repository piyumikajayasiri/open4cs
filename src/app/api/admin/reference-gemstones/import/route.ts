import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectDB } from "@/lib/mongodb";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import AuditLog from "@/models/AuditLog";

async function checkAdmin(req?: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "CAGS_ADMIN") {
    return null;
  }
  return user;
}

export type ImportRow = Record<string, unknown>;

export interface RowValidationResult {
  rowIndex: number;
  referenceId: string;
  variety: string;
  caratWeight: number;
  referencePrice: number;
  pricePerCarat: number;
  currency: string;
  dataClassification: "Real" | "Demo";
  transactionContext: string;
  marketContext: string;
  isValid: boolean;
  isDuplicate: boolean;
  duplicateReason?: string;
  errors: string[];
  row: ImportRow;
}

function parseCsv(csvText: string): ImportRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const rows: ImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parser handling quotes
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let c = 0; c < lines[i].length; c++) {
      const char = lines[i][c];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ""));

    const rowObj: ImportRow = {};
    for (let h = 0; h < headers.length; h++) {
      const header = headers[h];
      const val = values[h] ?? "";
      rowObj[header] = val;
    }
    rows.push(rowObj);
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await request.json();
    const mode = body.mode === "commit" ? "commit" : "preview";
    let rows: ImportRow[] = [];

    if (Array.isArray(body.records)) {
      rows = body.records;
    } else if (typeof body.csvData === "string") {
      rows = parseCsv(body.csvData);
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid payload: provide 'records' array or 'csvData' string." },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data rows found in import payload." },
        { status: 400 }
      );
    }

    // Existing IDs for duplicate checking
    const existingRefs = await ReferenceGemstone.find({}, { referenceId: 1, variety: 1, caratWeight: 1, referencePrice: 1, observationDate: 1 }).lean();
    const existingIdMap = new Map<string, unknown>();
    const existingSignatureSet = new Set<string>();

    for (const er of existingRefs) {
      if (er.referenceId) {
        existingIdMap.set(String(er.referenceId).toUpperCase().trim(), er);
      }
      const sig = `${(er.variety || "").toLowerCase()}_${er.caratWeight}_${er.referencePrice}`;
      existingSignatureSet.add(sig);
    }

    const batchSeenIds = new Set<string>();
    const validatedRows: RowValidationResult[] = [];
    const docsToInsert: Record<string, unknown>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowErrors: string[] = [];
      let isDuplicate = false;
      let duplicateReason = "";

      const rawRefId = String(r.referenceId || r.refId || r.recordId || `REF-IMP-${Date.now()}-${i + 1}`).trim().toUpperCase();
      const variety = String(r.variety || "Blue Sapphire").trim();
      const carat = Number(r.caratWeight || r.carat || 0);
      let refPrice = Number(r.referencePrice || r.price || r.priceAmount || 0);
      let pricePerCt = Number(r.pricePerCarat || r.pricePerCt || 0);
      const currency = String(r.currency || "LKR").toUpperCase().trim();

      if (!variety) {
        rowErrors.push("Variety is required.");
      }
      if (isNaN(carat) || carat <= 0) {
        rowErrors.push("Carat weight must be a positive number.");
      }

      if (refPrice <= 0 && pricePerCt > 0 && carat > 0) {
        refPrice = Math.round(pricePerCt * carat);
      } else if (pricePerCt <= 0 && refPrice > 0 && carat > 0) {
        pricePerCt = Math.round(refPrice / carat);
      }

      if (refPrice <= 0) {
        rowErrors.push("Reference price or price per carat is required.");
      }

      // Check duplicates
      if (existingIdMap.has(rawRefId)) {
        isDuplicate = true;
        duplicateReason = `Reference ID '${rawRefId}' already exists in database.`;
      } else if (batchSeenIds.has(rawRefId)) {
        isDuplicate = true;
        duplicateReason = `Duplicate Reference ID '${rawRefId}' within this batch.`;
      } else {
        batchSeenIds.add(rawRefId);
      }

      const sig = `${variety.toLowerCase()}_${carat}_${refPrice}`;
      if (!isDuplicate && existingSignatureSet.has(sig)) {
        isDuplicate = true;
        duplicateReason = `A gemstone with matching variety (${variety}), carat (${carat}ct), and price (${currency} ${refPrice}) already exists.`;
      }

      const colorObj = typeof r.color === "object" && r.color !== null
        ? (r.color as Record<string, unknown>)
        : {
            hue: String(r.hue || r.colorHue || "Royal Blue"),
            tone: String(r.tone || "6"),
            saturation: String(r.saturation || "Vivid"),
            distribution: String(r.distribution || "Even"),
            zoning: String(r.zoning || "None"),
          };

      const clarityObj = typeof r.clarity === "object" && r.clarity !== null
        ? (r.clarity as Record<string, unknown>)
        : {
            nakedEye: String(r.nakedEye || "Clean"),
            loupe10x: String(r.loupe10x || "Very Slight"),
            inclusionType: String(r.inclusionType || ""),
            inclusionLocation: String(r.inclusionLocation || ""),
            severity: String(r.severity || "Minor"),
          };

      const cutObj = typeof r.cut === "object" && r.cut !== null
        ? (r.cut as Record<string, unknown>)
        : {
            length: Number(r.length) || null,
            width: Number(r.width) || null,
            depth: Number(r.depth) || null,
            symmetry: String(r.symmetry || "Good"),
            polish: String(r.polish || "Good"),
            windowing: String(r.windowing || "None"),
            extinction: String(r.extinction || "None"),
            bulging: String(r.bulging || "None"),
          };

      const treatmentObj = typeof r.treatment === "object" && r.treatment !== null
        ? (r.treatment as Record<string, unknown>)
        : { status: String(r.treatmentStatus || r.treatment || "Untreated") };

      const originObj = typeof r.origin === "object" && r.origin !== null
        ? (r.origin as Record<string, unknown>)
        : {
            value: String(r.originValue || r.origin || "Sri Lanka"),
            reliability: String(r.originReliability || "High"),
          };

      const dataClassification = String(r.dataClassification || "Real") === "Demo" ? "Demo" : "Real";
      const transactionContext = String(r.transactionContext || "Completed Sale");
      const marketContext = String(r.marketContext || "Wholesale");
      const observationDate = String(r.observationDate || r.saleDate || new Date().toISOString().split("T")[0]);

      const isValid = rowErrors.length === 0;

      validatedRows.push({
        rowIndex: i + 1,
        referenceId: rawRefId,
        variety,
        caratWeight: carat,
        referencePrice: refPrice,
        pricePerCarat: pricePerCt,
        currency,
        dataClassification,
        transactionContext,
        marketContext,
        isValid,
        isDuplicate,
        duplicateReason: isDuplicate ? duplicateReason : undefined,
        errors: rowErrors,
        row: r,
      });

      if (isValid && (!isDuplicate || body.overwriteDuplicates)) {
        docsToInsert.push({
          referenceId: rawRefId,
          lotId: String(r.lotId || ""),
          species: String(r.species || "Corundum"),
          variety,
          naturalStatus: String(r.naturalStatus || "Natural"),
          caratWeight: carat,
          shape: String(r.shape || "Oval"),
          dimensions: {
            length: Number(cutObj.length) || null,
            width: Number(cutObj.width) || null,
            depth: Number(cutObj.depth) || null,
          },
          sourceColor: String(r.sourceColor || colorObj.hue || ""),
          color: colorObj,
          claritySystem: String(r.claritySystem || "CAGS / GIA Corundum Scale"),
          clarity: clarityObj,
          cut: cutObj,
          treatment: treatmentObj,
          treatmentEvidence: String(r.treatmentEvidence || ""),
          claimedOrigin: String(r.claimedOrigin || originObj.value || ""),
          labOrigin: String(r.labOrigin || (originObj.reliability === "High" ? originObj.value : "")),
          origin: originObj,
          originEvidence: String(r.originEvidence || ""),
          labName: String(r.labName || ""),
          labReportNumber: String(r.labReportNumber || ""),
          labReportUrl: String(r.labReportUrl || ""),
          labCertificate: String(r.labCertificate || ""),
          referencePrice: refPrice,
          priceAmount: refPrice,
          pricePerCarat: pricePerCt,
          priceUnit: "total",
          currency,
          feesDisclosed: String(r.feesDisclosed || ""),
          taxesDisclosed: String(r.taxesDisclosed || ""),
          source: String(r.source || "Bulk Market Import"),
          sourceType: String(r.sourceType || "Market Register"),
          sourceUrl: String(r.sourceUrl || ""),
          publisher: String(r.publisher || ""),
          evidenceNotes: String(r.evidenceNotes || ""),
          evidenceAttachments: Array.isArray(r.evidenceAttachments) ? r.evidenceAttachments : [],
          status: "ACTIVE",
          isActive: true,
          verificationStatus: body.autoVerify ? "Verified" : "Pending",
          verifiedBy: body.autoVerify ? (admin.name || "CAGS Admin") : "",
          verifiedAt: body.autoVerify ? new Date().toISOString() : "",
          reviewer: admin.name || "CAGS Admin",
          reviewDate: new Date().toISOString().split("T")[0],
          dataClassification,
          observationDate,
          saleDate: String(r.saleDate || observationDate),
          listingDate: String(r.listingDate || ""),
          marketLocation: String(r.marketLocation || "Sri Lanka"),
          transactionContext,
          marketContext,
          photoUrl: String(r.photoUrl || ""),
          photoAttribution: String(r.photoAttribution || ""),
          photoReusePermitted: true,
          limitations: String(r.limitations || ""),
          missingFields: Array.isArray(r.missingFields) ? r.missingFields : [],
          version: 1,
        });
      }
    }

    if (mode === "preview") {
      const validCount = validatedRows.filter((r) => r.isValid && !r.isDuplicate).length;
      const errorCount = validatedRows.filter((r) => !r.isValid).length;
      const duplicateCount = validatedRows.filter((r) => r.isDuplicate).length;

      return NextResponse.json({
        success: true,
        mode: "preview",
        totalRows: rows.length,
        validCount,
        errorCount,
        duplicateCount,
        validatedRows,
      });
    }

    // Commit mode: perform upsert or insert
    let insertedCount = 0;
    let updatedCount = 0;

    for (const doc of docsToInsert) {
      const filter = { referenceId: doc.referenceId };
      const existing = await ReferenceGemstone.findOne(filter);
      if (existing) {
        await ReferenceGemstone.updateOne(filter, { $set: doc });
        updatedCount++;
      } else {
        await ReferenceGemstone.create(doc);
        insertedCount++;
      }
    }

    try {
      await AuditLog.create({
        action: "BULK_IMPORT_REFERENCES",
        entityType: "ReferenceGemstone",
        performedBy: admin.id,
        userEmail: admin.email,
        details: {
          totalRows: rows.length,
          insertedCount,
          updatedCount,
          autoVerify: Boolean(body.autoVerify),
        },
        timestamp: new Date(),
      });
    } catch (logErr) {
      console.error("Audit log creation error:", logErr);
    }

    return NextResponse.json({
      success: true,
      mode: "commit",
      message: `Bulk import completed: ${insertedCount} inserted, ${updatedCount} updated.`,
      insertedCount,
      updatedCount,
    });
  } catch (error) {
    console.error("Bulk import references error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to process reference import." },
      { status: 500 }
    );
  }
}
