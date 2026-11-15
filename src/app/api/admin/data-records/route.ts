import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { adminRoute, AdminError, bodyObject } from "@/lib/admin/server";
import { referenceObservations, validateHistoricalRecord, type Dataset, type ManagedRecord } from "@/lib/admin/data";
import type { EvaluationInput } from "@/lib/evaluation/types";
import { MOCK_DATASET_VERSION } from "@/lib/evaluation/mock-data";
import MockHistoricalGemstone from "@/models/MockHistoricalGemstone";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import AdminAudit from "@/models/AdminAudit";

export async function GET(request: Request) {
  return adminRoute(request, async () => {
    const dataset = new URL(request.url).searchParams.get("dataset") || "MOCK";
    if (!["MOCK", "REFERENCE"].includes(dataset)) throw new AdminError("Choose mock or reference data.");
    const model = dataset === "MOCK" ? MockHistoricalGemstone : ReferenceGemstone;
    const filter = dataset === "MOCK" ? { dataKind: "MOCK", datasetVersion: MOCK_DATASET_VERSION, deletedAt: null } : { dataKind: { $ne: "MOCK" }, deletedAt: null };
    const [documents, total] = await Promise.all([model.find(filter).sort({ createdAt: -1, id: 1 }).limit(500).lean(), model.countDocuments(filter)]);
    const records: ManagedRecord[] = documents.map((document) => {
      if (dataset === "MOCK") {
        const observation = document.observations as EvaluationInput;
        return { key: String(document._id), recordId: document.id, dataset: "MOCK", variety: observation.variety, hue: observation.color.hue, weight: observation.caratWeight,
          treatment: observation.treatment, quality: `${observation.clarity.nakedEye} · ${observation.cut.polish}`, source: document.source, date: document.recordedAt,
          totalPrice: document.totalPrice, currency: document.currency, status: document.isActive === false ? "INACTIVE" : "MOCK", priceBasis: document.priceBasis,
          observations: observation, description: document.description, qualityReviewed: false, permittedUseConfirmed: false, revision: document.revision ?? 0 };
      }
      return { key: String(document._id), recordId: document.referenceId || `REF-${String(document._id).slice(-8)}`, dataset: "REFERENCE", variety: document.variety || "Unspecified",
        hue: typeof document.color === "object" ? document.color?.hue || "Unspecified" : document.color || "Unspecified", weight: document.caratWeight || 0,
        treatment: typeof document.treatment === "object" ? document.treatment?.status || "UNKNOWN" : document.treatment || "UNKNOWN",
        quality: typeof document.clarity === "object" ? document.clarity?.nakedEye || "Unspecified" : document.clarity || "Unspecified",
        source: document.source || "Source not recorded", date: document.sourceDate || "", totalPrice: document.referencePrice || 0,
        currency: document.currency || "USD", status: document.verificationStatus === "VERIFIED" && (!document.qualityReviewed || !document.permittedUseConfirmed) ? "PENDING" : document.verificationStatus || "PENDING",
        priceBasis: document.priceBasis || "UNSPECIFIED", description: document.description || "Reference data remains excluded from the mock engine.",
        qualityReviewed: Boolean(document.qualityReviewed), permittedUseConfirmed: Boolean(document.permittedUseConfirmed), createdBy: document.createdBy,
        observations: referenceObservations(document), revision: document.revision ?? 0 };
    });
    return NextResponse.json({ records, total, truncated: total > records.length });
  });
}

export async function POST(request: Request) {
  return adminRoute(request, async (actor) => {
    const body = await bodyObject(request);
    if (body.dataset !== "MOCK" && body.dataset !== "REFERENCE") throw new AdminError("Choose a dataset.");
    const dataset: Dataset = body.dataset;
    const entries = Array.isArray(body.records) ? body.records : [body.record];
    if (!entries.length || entries.length > 200 || dataset === "REFERENCE" && entries.length > 1) throw new AdminError("Import 1–200 mock records or add one reference record at a time.");
    const ids = new Set();
    const cleaned = entries.map((entry, index) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new AdminError(`Record ${index + 1} is invalid.`);
      const errors = validateHistoricalRecord(entry, dataset);
      if (Object.keys(errors).length) throw new AdminError(`Correct record ${index + 1}.`, 400, errors);
      if (dataset === "MOCK" && ids.has(entry.id)) throw new AdminError(`Duplicate record ID: ${entry.id}.`);
      ids.add(entry.id);
      // Only validated fields are persisted. Imported dataset/version/status flags cannot override this policy.
      return { id: entry.id, dataKind: dataset, observations: entry.observations as EvaluationInput, currency: entry.currency, priceBasis: entry.priceBasis,
        totalPrice: entry.totalPrice, recordedAt: entry.recordedAt, source: entry.source.trim(), description: entry.description };
    });
    await Promise.all([MockHistoricalGemstone.init(), ReferenceGemstone.init(), AdminAudit.init()]);
    const session = await mongoose.startSession();
    try {
      const added = await session.withTransaction(async () => {
        const created = [];
        for (const entry of cleaned) {
          let document;
          if (dataset === "MOCK") {
            [document] = await MockHistoricalGemstone.create([{ ...entry, datasetVersion: MOCK_DATASET_VERSION, isActive: true }], { session });
          } else {
            const observation = entry.observations;
            [document] = await ReferenceGemstone.create([{ referenceId: `REF-${randomUUID()}`, dataKind: "REFERENCE", variety: observation.variety,
              caratWeight: observation.caratWeight, color: observation.color, clarity: observation.clarity, cut: observation.cut, shape: observation.shape,
              treatment: { status: observation.treatment }, origin: { value: observation.origin, reliability: observation.originReliability },
              referencePrice: entry.totalPrice, currency: entry.currency, priceBasis: entry.priceBasis, source: entry.source, sourceDate: entry.recordedAt, description: entry.description,
              verificationStatus: "PENDING", createdBy: actor.id, qualityReviewed: false, permittedUseConfirmed: false }], { session });
          }
          created.push(document.toObject());
        }
        await AdminAudit.create([{ actorId: actor.id, actorName: actor.name, action: "RECORD_ADDED", entity: dataset, entityId: cleaned.map((entry) => entry.id || "REFERENCE").join(",").slice(0, 1000),
          summary: `Added ${cleaned.length} ${dataset.toLowerCase()} record(s).`, after: created }], { session });
        return created.length;
      });
      return NextResponse.json({ added }, { status: 201 });
    } finally { await session.endSession(); }
  });
}
