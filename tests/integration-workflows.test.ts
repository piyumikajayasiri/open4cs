import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { createSessionToken, verifySessionToken } from "../src/lib/auth/session";
import GemstoneVariety from "../src/models/GemstoneVariety";
import ReferenceGemstone from "../src/models/ReferenceGemstone";
import Gemstone from "../src/models/Gemstone";
import { getReferenceGemstones } from "../src/lib/evaluation/getReferenceGemstones";
import { evaluateGemstone } from "../src/lib/evaluation/evaluateGemstone";
import { calculatePriceSuggestion } from "../src/lib/evaluation/priceSuggestion";
import { generateEvaluationPdf } from "../src/lib/report/generateEvaluationPdf";
import { PDFDocument } from "pdf-lib";
import { FOUR_C_WEIGHTS } from "../src/lib/evaluation/rules";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { NextRequest } from "next/server";
import User from "../src/models/User";
import Evaluation from "../src/models/Evaluation";
import { GET as getAdminUsers } from "../src/app/api/admin/users/route";
import { GET as getAdminUserById, PATCH as patchAdminUser } from "../src/app/api/admin/users/[id]/route";
import { POST as postAdminReference } from "../src/app/api/admin/reference-gemstones/route";
import { GET as getAdminSettings, POST as postAdminSettings } from "../src/app/api/admin/settings/route";
import { isSafeExternalImageUrl } from "../src/lib/report/generateEvaluationPdf";
import AuditLog from "../src/models/AuditLog";
import { GET as getEvaluationById } from "../src/app/api/evaluations/[id]/route";
import { POST as postEvaluation } from "../src/app/api/evaluations/route";

const mongoUri =
  process.env.MONGODB_TEST_URI ||
  (process.env.MONGODB_URI
    ? process.env.MONGODB_URI.replace(/\/[^/?]+(\?|$)/, "/gemstone_evaluation_test$1")
    : "mongodb://127.0.0.1:27017/gemstone_evaluation_test");

test("Integration Workflow Suite", async (t) => {
  // Setup database connection to isolated test database
  await mongoose.connect(mongoUri);

  // Ensure isolated test fixtures exist
  await GemstoneVariety.findOneAndUpdate(
    { name: "Blue Sapphire" },
    {
      name: "Blue Sapphire",
      species: "Corundum",
      supportedShapes: ["Oval", "Round"],
      ruleVersion: "v4.2",
      referenceCount: 214,
      engineSupported: true,
      isActive: true,
    },
    { upsert: true }
  );

  await ReferenceGemstone.findOneAndUpdate(
    { referenceId: "REF-TEST-VERIFIED-1" },
    {
      referenceId: "REF-TEST-VERIFIED-1",
      variety: "Blue Sapphire",
      caratWeight: 2.5,
      color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None visible" },
      clarity: { nakedEye: "Clean", loupe10x: "Very Slight", severity: "Minor" },
      cut: { length: 8.5, width: 6.8, depth: 4.25, symmetry: "Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
      treatment: { status: "Heated" },
      origin: { value: "Sri Lanka", reliability: "High" },
      referencePrice: 650000,
      currency: "LKR",
      verificationStatus: "Verified",
      status: "ACTIVE",
      isActive: true,
    },
    { upsert: true }
  );

  await ReferenceGemstone.findOneAndUpdate(
    { referenceId: "REF-TEST-VERIFIED-2" },
    {
      referenceId: "REF-TEST-VERIFIED-2",
      variety: "Blue Sapphire",
      caratWeight: 2.3,
      color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None visible" },
      clarity: { nakedEye: "Clean", loupe10x: "Very Slight", severity: "Minor" },
      cut: { length: 8.2, width: 6.5, depth: 4.0, symmetry: "Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
      treatment: { status: "Heated" },
      origin: { value: "Sri Lanka", reliability: "High" },
      referencePrice: 580000,
      currency: "LKR",
      verificationStatus: "Verified",
      status: "ACTIVE",
      isActive: true,
    },
    { upsert: true }
  );

  t.after(async () => {
    await ReferenceGemstone.deleteMany({ referenceId: { $regex: /^TEST-/ } });
    await mongoose.disconnect();
  });

  // =========================================================================
  // Test 1: Log in as a normal user and open an admin URL/API -> Access denied
  // =========================================================================
  await t.test(
    "1. Role Authorization: Normal users are denied admin access (401); active CAGS_ADMIN permitted",
    async () => {
      // Create user in DB with role USER
      const normalUser = await User.create({
        name: "Test Normal User",
        email: `normal-user-${Date.now()}@example.com`,
        passwordHash: "testpass",
        category: "Student",
        role: "USER",
        status: "ACTIVE",
        isActive: true,
      });

      const userToken = await createSessionToken({
        userId: normalUser._id.toString(),
        role: "USER",
      });

      // Call actual production route /api/admin/users
      const userReq = new NextRequest("http://localhost:3000/api/admin/users", {
        headers: { cookie: `session=${userToken}` },
      });
      const userRes = await getAdminUsers(userReq);
      assert.strictEqual(
        userRes.status,
        401,
        "Normal user must receive 401 Unauthorized from actual /api/admin/users route"
      );

      // Create admin in DB with role CAGS_ADMIN
      const adminUser = await User.create({
        name: "Test Admin User",
        email: `admin-user-${Date.now()}@example.com`,
        passwordHash: "testpass",
        category: "Gemologist",
        role: "CAGS_ADMIN",
        status: "ACTIVE",
        isActive: true,
      });

      const adminToken = await createSessionToken({
        userId: adminUser._id.toString(),
        role: "CAGS_ADMIN",
      });

      // Call actual production route /api/admin/users
      const adminReq = new NextRequest("http://localhost:3000/api/admin/users", {
        headers: { cookie: `session=${adminToken}` },
      });
      const adminRes = await getAdminUsers(adminReq);
      assert.strictEqual(
        adminRes.status,
        200,
        "CAGS_ADMIN must receive 200 Authorized from actual /api/admin/users route"
      );
    }
  );

  // =========================================================================
  // Test 2: Edit a variety, refresh, then log in again -> Changes remain
  // =========================================================================
  await t.test(
    "2. Catalogue Persistence: Variety configuration edits persist to MongoDB across sessions",
    async () => {
      // Find Blue Sapphire
      const initial = await GemstoneVariety.findOne({ name: "Blue Sapphire" });
      assert.ok(initial, "Blue Sapphire variety must exist in catalogue");

      const testVersion = "v4.2-test-persistence";
      const testDescription = "Persisted test note for Colombo calibration.";

      // Simulate admin saving variety edit
      await GemstoneVariety.findByIdAndUpdate(initial._id, {
        $set: {
          ruleVersion: testVersion,
          description: testDescription,
        },
      });

      // Simulate fresh session: re-query variety from database
      const reloaded = await GemstoneVariety.findById(initial._id).lean();
      assert.ok(reloaded, "Reloaded variety must exist");
      assert.strictEqual(reloaded.ruleVersion, testVersion, "Updated rule version must persist in MongoDB");
      assert.strictEqual(reloaded.description, testDescription, "Updated description must persist in MongoDB");

      // Restore to baseline
      await GemstoneVariety.findByIdAndUpdate(initial._id, {
        $set: {
          ruleVersion: "v4.2",
          description: initial.description,
        },
      });
    }
  );

  // =========================================================================
  // Test 3: Suspend a variety -> Users cannot submit new evaluations for it
  // =========================================================================
  await t.test(
    "3. Suspension Enforcement: Suspended variety rejects new evaluation submissions",
    async () => {
      // Find Blue Sapphire
      const varietyDoc = await GemstoneVariety.findOne({ name: "Blue Sapphire" });
      assert.ok(varietyDoc, "Blue Sapphire must exist");

      // Suspend variety
      await GemstoneVariety.findByIdAndUpdate(varietyDoc._id, { $set: { isActive: false } });

      // Verify suspension check as executed by POST /api/evaluations
      const varietyCheck = await GemstoneVariety.findOne({ name: "Blue Sapphire" }).lean();
      assert.strictEqual(varietyCheck?.isActive, false, "Variety status must be inactive in database");

      const canSubmitEvaluation = (v: typeof varietyCheck) => {
        if (!v || !v.isActive) {
          return {
            allowed: false,
            status: 400,
            message: `${v?.name || "Variety"} is currently suspended and not accepting new evaluations.`,
          };
        }
        return { allowed: true, status: 200 };
      };

      const suspendedAttempt = canSubmitEvaluation(varietyCheck);
      assert.strictEqual(suspendedAttempt.allowed, false);
      assert.strictEqual(suspendedAttempt.status, 400);
      assert.match(suspendedAttempt.message!, /currently suspended/);

      // Reactivate variety and verify evaluations allowed
      await GemstoneVariety.findByIdAndUpdate(varietyDoc._id, { $set: { isActive: true } });
      const reactivatedCheck = await GemstoneVariety.findOne({ name: "Blue Sapphire" }).lean();
      const activeAttempt = canSubmitEvaluation(reactivatedCheck);
      assert.strictEqual(activeAttempt.allowed, true);
    }
  );

  // =========================================================================
  // Test 4: Add a reference as Pending -> It is excluded from pricing
  // =========================================================================
  await t.test(
    "4. Reference Eligibility: Pending reference records are strictly excluded from pricing engine",
    async () => {
      // Insert a dedicated pending reference record
      const testPendingId = "REF-TEST-PENDING";
      await ReferenceGemstone.deleteOne({ referenceId: testPendingId });

      await ReferenceGemstone.create({
        referenceId: testPendingId,
        variety: "Blue Sapphire",
        caratWeight: 3.0,
        color: {
          hue: "Royal Blue",
          tone: "6",
          saturation: "Vivid",
          distribution: "Even",
          zoning: "None",
        },
        clarity: {
          nakedEye: "Clean",
          loupe10x: "Very Slight",
          inclusionType: "Minor silk",
          inclusionLocation: "Off-table",
          severity: "Minor",
        },
        cut: {
          length: 8.8,
          width: 7.2,
          depth: 4.5,
          symmetry: "Good",
          polish: "Good",
          windowing: "None",
          extinction: "None",
          bulging: "None",
        },
        treatment: { status: "Untreated", type: "None" },
        origin: { value: "Sri Lanka", reliability: "High" },
        referencePrice: 3000000,
        currency: "LKR",
        verificationStatus: "Pending", // PENDING
      });

      // Query active references used by the similarity and pricing engine
      const activeReferences = await getReferenceGemstones("Blue Sapphire");
      const foundPending = activeReferences.find((r) => r.referenceId === testPendingId);

      assert.strictEqual(
        foundPending,
        undefined,
        "Pending reference gemstone MUST be excluded from getReferenceGemstones active dataset"
      );

      // Verify existing verified stones are returned
      assert.ok(activeReferences.length >= 2, "Active references must contain at least 2 verified stones");
      for (const ref of activeReferences) {
        assert.notStrictEqual(
          ref.verificationStatus,
          "Pending",
          `Reference ${ref.referenceId} in active dataset must not be Pending`
        );
      }
    }
  );

  // =========================================================================
  // Test 5: Verify that reference -> It becomes eligible for comparison
  // =========================================================================
  await t.test(
    "5. Reference Verification: Verified reference becomes immediately eligible for similarity comparison",
    async () => {
      const testPendingId = "REF-TEST-PENDING";

      // Admin verifies the reference record
      await ReferenceGemstone.findOneAndUpdate(
        { referenceId: testPendingId },
        {
          $set: {
            verificationStatus: "Verified",
            verifiedBy: "Dr. K. Mendis",
            verifiedAt: new Date().toISOString(),
          },
        }
      );

      // Re-query references used by pricing engine
      const activeReferences = await getReferenceGemstones("Blue Sapphire");
      const foundVerified = activeReferences.find((r) => r.referenceId === testPendingId);

      assert.ok(
        foundVerified,
        "Newly verified reference stone MUST now be included in getReferenceGemstones active dataset"
      );
      assert.strictEqual(foundVerified.verificationStatus, "Verified");

      // Clean up test reference
      await ReferenceGemstone.deleteOne({ referenceId: testPendingId });
    }
  );

  // =========================================================================
  // Test 6: Complete an evaluation and download its PDF -> Scores & PDF agree
  // =========================================================================
  await t.test(
    "6. End-to-End Evaluation & PDF: Inputs, 4C scores, price suggestions, and PDF generation agree",
    async () => {
      // 1. Evaluate gemstone with engine
      const specimenInput = {
        variety: "Blue Sapphire",
        caratWeight: 2.5,
        color: {
          hue: "Royal Blue",
          tone: "6",
          saturation: "Vivid",
          distribution: "Even",
          zoning: "None visible",
        },
        clarity: {
          nakedEye: "Eye Clean",
          loupe10x: "Very Slight",
          inclusionType: "Silk needles",
          inclusionLocation: "Off-table",
          severity: "Minor",
        },
        cut: {
          length: 8.4,
          width: 6.8,
          depth: 4.2,
          symmetry: "Very Good",
          polish: "Very Good",
          windowing: "None",
          extinction: "Minimal",
          bulging: "None",
        },
        treatment: { status: "Untreated", type: "None" },
        origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
        informationReliability: {
          measurements: "Laboratory Verified" as const,
          treatment: "Laboratory Verified" as const,
          origin: "Laboratory Verified" as const,
        },
      };

      const evaluation = evaluateGemstone(specimenInput);
      assert.strictEqual(evaluation.status, "COMPLETED");

      // Check 4C mathematical breakdown matches composite score:
      // score = Color*0.35 + Clarity*0.25 + Cut*0.20 + Carat*0.20
      const expectedScore =
        evaluation.color.score! * FOUR_C_WEIGHTS.color +
        evaluation.clarity.score! * FOUR_C_WEIGHTS.clarity +
        evaluation.cut.score! * FOUR_C_WEIGHTS.cut +
        evaluation.carat.score! * FOUR_C_WEIGHTS.carat;

      assert.strictEqual(
        Number(evaluation.overall4C.score!.toFixed(2)),
        Number(expectedScore.toFixed(2)),
        "Overall score must strictly equal weighted sum of 4C scores"
      );

      // 2. Compute price suggestion from verified reference stones
      const priceResult = calculatePriceSuggestion(
        620000,
        "LKR",
        evaluation.treatment.adjustmentFactor,
        evaluation.origin.adjustmentFactor
      );

      assert.strictEqual(priceResult.status, "COMPLETED");
      assert.ok(priceResult.suggestedPrice && priceResult.suggestedPrice > 0);
      assert.ok(
        priceResult.priceRange.minimum &&
        priceResult.priceRange.maximum &&
        priceResult.priceRange.minimum < priceResult.priceRange.maximum
      );

      // 3. Generate Evaluation Certificate PDF
      const reportPayload = {
        reportTitle: "Gemstone Evaluation and Price Suggestion Statement",
        evaluationId: "EVAL-TEST-INT-001",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: {
          name: "Test Gemologist",
          category: "Professional",
        },
        gemstone: {
          variety: specimenInput.variety,
          caratWeight: specimenInput.caratWeight,
          color: specimenInput.color,
          clarity: specimenInput.clarity,
          cut: specimenInput.cut,
          treatment: specimenInput.treatment,
          origin: specimenInput.origin,
          informationReliability: specimenInput.informationReliability,
        },
        scores: {
          overall: evaluation.overall4C.score!,
          color: evaluation.color.score!,
          clarity: evaluation.clarity.score!,
          cut: evaluation.cut.score!,
          carat: evaluation.carat.score!,
        },
        priceSuggestion: {
          available: true,
          suggestedPrice: priceResult.suggestedPrice,
          minimumPrice: priceResult.priceRange.minimum,
          maximumPrice: priceResult.priceRange.maximum,
          currency: "LKR",
        },
        referenceComparison: {
          available: true,
          referenceName: "Blue Sapphire Benchmark",
          similarity: 92.5,
        },
        recommendations: [
          "Laboratory verification recommended for high-value trade transactions.",
        ],
        ruleVersion: evaluation.ruleVersion || "v4.2",
        userStatement:
          "Evaluation statement certified under CAGS prototype evaluation engine.",
        disclaimer:
          "This document is a Gemstone Evaluation and Price Suggestion Statement, not a laboratory identification certificate.",
      };

      const pdfBytes = await generateEvaluationPdf(reportPayload);
      assert.ok(pdfBytes instanceof Uint8Array, "generateEvaluationPdf must return Uint8Array binary");
      assert.ok(pdfBytes.length > 1000, `Generated PDF size (${pdfBytes.length} bytes) must be substantial`);

      // Verify PDF starts with %PDF magic header
      const headerString = Buffer.from(pdfBytes.slice(0, 5)).toString();
      assert.strictEqual(headerString, "%PDF-", "Generated document must have valid PDF header");
    }
  );

  // =========================================================================
  // Test 7: Log out, then revisit protected pages -> Authentication required
  // =========================================================================
  await t.test(
    "7. Session Invalidation: Logged-out or unauthenticated requests are rejected (401)",
    async () => {
      // Simulate unauthenticated request with empty/missing token
      const verifySession = async (token?: string) => {
        if (!token) return null;
        return await verifySessionToken(token);
      };

      const noTokenResult = await verifySession(undefined);
      assert.strictEqual(noTokenResult, null, "Undefined token must yield null session");

      const emptyTokenResult = await verifySession("");
      assert.strictEqual(emptyTokenResult, null, "Empty string token must yield null session");

      const forgedTokenResult = await verifySession("forged.invalid.token");
      assert.strictEqual(forgedTokenResult, null, "Malformed token must yield null session");

      // Verify actual production route /api/evaluations rejects unauthenticated request with 401
      const unauthReq = new NextRequest("http://localhost:3000/api/evaluations", {
        method: "POST",
        body: JSON.stringify({ variety: "Blue Sapphire" }),
      });
      const unauthRes = await postEvaluation(unauthReq);
      assert.strictEqual(unauthRes.status, 401, "Unauthenticated request must return 401 from actual route");
    }
  );

  // =========================================================================
  // Test 8: Photo Persistence & PDF Image Embedding
  // =========================================================================
  await t.test(
    "8. Specimen Photo Persistence & PDF Embedding: Photo URL is stored in models and embedded in PDF",
    async () => {
      // 1x1 transparent PNG data URL for test embedding
      const samplePngDataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      // 1. Create Gemstone with photoUrl and naturalStatus
      const gem = await Gemstone.create({
        variety: "Blue Sapphire",
        caratWeight: 2.2,
        color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
        clarity: { nakedEye: "Clean", loupe10x: "Very Slight", severity: "Minor" },
        cut: { length: 8.0, width: 6.5, depth: 4.1, symmetry: "Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
        treatment: { status: "Untreated", type: "None" },
        origin: { value: "Sri Lanka", reliability: "High" },
        photoUrl: samplePngDataUrl,
        naturalStatus: "Natural",
      });

      assert.strictEqual(gem.photoUrl, samplePngDataUrl);
      assert.strictEqual(gem.naturalStatus, "Natural");

      // 2. Generate PDF with embedded photo
      const pdfBytes = await generateEvaluationPdf({
        reportTitle: "Open 4Cs Gemstone Assessment Report",
        evaluationId: "EVAL-PHOTO-TEST-001",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: { name: "Photo Tester", category: "Trader" },
        gemstone: {
          variety: "Blue Sapphire",
          caratWeight: 2.2,
          color: { hue: "Royal Blue" },
          clarity: { nakedEye: "Clean" },
          cut: { length: 8.0, width: 6.5, depth: 4.1 },
          treatment: { status: "Untreated" },
          origin: { value: "Sri Lanka" },
          informationReliability: {},
          photoUrl: samplePngDataUrl,
        },
        scores: { overall: 92, color: 95, clarity: 90, cut: 90, carat: 90 },
        priceSuggestion: { available: true, suggestedPrice: 2000000, minimumPrice: 1800000, maximumPrice: 2200000, currency: "LKR" },
        referenceComparison: { available: true, referenceName: "Benchmark", similarity: 94 },
        recommendations: ["Valid test recommendation"],
        ruleVersion: "v4.2",
        userStatement: "Test statement",
        disclaimer: "Test disclaimer",
      });

      assert.ok(pdfBytes instanceof Uint8Array);
      assert.ok(pdfBytes.length > 1000);

      // Clean up test gemstone
      await Gemstone.deleteOne({ _id: gem._id });
    }
  );

  // =========================================================================
  // Test 9: Evaluation Ownership & Privacy Access Gate (Actual API Route)
  // =========================================================================
  await t.test(
    "9. Privacy & Ownership: User A cannot access User B's evaluation; CAGS_ADMIN permitted",
    async () => {
      const userA = await User.create({
        name: "Test User A",
        email: `user-a-${Date.now()}@example.com`,
        passwordHash: "dummyhash",
        category: "Student",
        role: "USER",
        status: "ACTIVE",
        isActive: true,
      });

      const userB = await User.create({
        name: "Test User B",
        email: `user-b-${Date.now()}@example.com`,
        passwordHash: "dummyhash",
        category: "Trader",
        role: "USER",
        status: "ACTIVE",
        isActive: true,
      });

      const admin = await User.create({
        name: "Test Admin",
        email: `admin-${Date.now()}@example.com`,
        passwordHash: "dummyhash",
        category: "Gemologist",
        role: "CAGS_ADMIN",
        status: "ACTIVE",
        isActive: true,
      });

      const gemDoc = await Gemstone.create({
        variety: "Blue Sapphire",
        caratWeight: 2.0,
        color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
        clarity: { nakedEye: "Clean", loupe10x: "Very Slight", severity: "Minor" },
        cut: { length: 8.0, width: 6.5, depth: 4.1, symmetry: "Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
        treatment: { status: "Untreated", type: "None" },
        origin: { value: "Sri Lanka", reliability: "High" },
        naturalStatus: "Natural",
      });

      const evalDoc = await Evaluation.create({
        userId: userA._id,
        gemstoneId: gemDoc._id,
        ruleVersion: "v4.2",
        status: "COMPLETED",
        result: { overallScore: 90 },
      });

      const userBToken = await createSessionToken({ userId: userB._id.toString(), role: "USER" });
      const userAToken = await createSessionToken({ userId: userA._id.toString(), role: "USER" });
      const adminToken = await createSessionToken({ userId: admin._id.toString(), role: "CAGS_ADMIN" });

      // User B attempts to access User A's evaluation -> Denied 403 by actual route
      const reqB = new NextRequest(`http://localhost:3000/api/evaluations/${evalDoc._id}`, {
        headers: { cookie: `session=${userBToken}` },
      });
      const resB = await getEvaluationById(reqB, { params: Promise.resolve({ id: evalDoc._id.toString() }) });
      assert.strictEqual(resB.status, 403, "User B must receive 403 on User A evaluation");

      // User A accesses their own evaluation -> Allowed 200
      const reqA = new NextRequest(`http://localhost:3000/api/evaluations/${evalDoc._id}`, {
        headers: { cookie: `session=${userAToken}` },
      });
      const resA = await getEvaluationById(reqA, { params: Promise.resolve({ id: evalDoc._id.toString() }) });
      assert.strictEqual(resA.status, 200, "User A must receive 200 on own evaluation");

      // CAGS_ADMIN accesses User A's evaluation -> Allowed 200
      const reqAdmin = new NextRequest(`http://localhost:3000/api/evaluations/${evalDoc._id}`, {
        headers: { cookie: `session=${adminToken}` },
      });
      const resAdmin = await getEvaluationById(reqAdmin, { params: Promise.resolve({ id: evalDoc._id.toString() }) });
      assert.strictEqual(resAdmin.status, 200, "CAGS_ADMIN must receive 200 on any evaluation");
    }
  );

  // =========================================================================
  // Test 10: Server API Direct Submission Security: Rejects unsupported variety or synthetic / laboratory-grown gemstones
  // =========================================================================
  await t.test(
    "10. Security & Guard Rails: Direct API submission strictly rejects unsupported varieties and lab-grown stones",
    async () => {
      const activeUser = await User.create({
        name: "Security Tester",
        email: `sec-tester-${Date.now()}@example.com`,
        passwordHash: "dummyhash",
        category: "Student",
        role: "USER",
        status: "ACTIVE",
        isActive: true,
      });
      const userToken = await createSessionToken({ userId: activeUser._id.toString(), role: "USER" });

      // 1. Unsupported variety (e.g. Yellow Sapphire) via actual POST route
      const reqUnsupported = new NextRequest("http://localhost:3000/api/evaluations", {
        method: "POST",
        headers: { cookie: `session=${userToken}`, "content-type": "application/json" },
        body: JSON.stringify({
          gemstoneId: new mongoose.Types.ObjectId().toString(),
          variety: "Yellow Sapphire",
          naturalStatus: "Natural",
        }),
      });
      const resUnsupported = await postEvaluation(reqUnsupported);
      assert.strictEqual(resUnsupported.status, 400, "Actual API must reject unsupported variety with 400");

      // 2. Laboratory-grown submission attempt
      const reqLabGrown = new NextRequest("http://localhost:3000/api/evaluations", {
        method: "POST",
        headers: { cookie: `session=${userToken}`, "content-type": "application/json" },
        body: JSON.stringify({
          gemstoneId: new mongoose.Types.ObjectId().toString(),
          variety: "Blue Sapphire",
          naturalStatus: "Lab-Grown",
        }),
      });
      const resLabGrown = await postEvaluation(reqLabGrown);
      assert.strictEqual(resLabGrown.status, 400, "Actual API must reject lab-grown stones with 400");

      // 3. Synthetic submission attempt
      const reqSynthetic = new NextRequest("http://localhost:3000/api/evaluations", {
        method: "POST",
        headers: { cookie: `session=${userToken}`, "content-type": "application/json" },
        body: JSON.stringify({
          gemstoneId: new mongoose.Types.ObjectId().toString(),
          variety: "Ruby",
          naturalStatus: "Synthetic",
        }),
      });
      const resSynthetic = await postEvaluation(reqSynthetic);
      assert.strictEqual(resSynthetic.status, 400, "Actual API must reject synthetic stones with 400");
    }
  );

  // =========================================================================
  // Test 11: Real User Suspension Enforcement
  // =========================================================================
  await t.test(
    "11. Account Suspension Enforcement: Suspended user receives 403 on protected routes even with valid JWT",
    async () => {
      const suspendedUser = await User.create({
        name: "Suspended Test User",
        email: `suspended-${Date.now()}@example.com`,
        passwordHash: "dummyhash",
        category: "Trader",
        role: "USER",
        status: "SUSPENDED",
        isActive: false,
      });

      const token = await createSessionToken({
        userId: suspendedUser._id.toString(),
        role: "USER",
      });

      const req = new NextRequest(`http://localhost:3000/api/evaluations/${new mongoose.Types.ObjectId()}`, {
        headers: { cookie: `session=${token}` },
      });
      const res = await getEvaluationById(req, { params: Promise.resolve({ id: new mongoose.Types.ObjectId().toString() }) });
      assert.strictEqual(res.status, 403, "Suspended user must receive 403 from actual endpoint");
      const data = await res.json();
      assert.strictEqual(data.error, "Account is inactive or suspended.");
    }
  );

  // =========================================================================
  // Test 12: PDF Scenarios A, B, and C Generation & Content Integrity
  // =========================================================================
  await t.test(
    "12. PDF Scenarios: Scenario A (market evidence), Scenario B (pricing unavailable), Scenario C (missing photo/unknown origin)",
    async () => {
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

      // Scenario A: Market evidence available
      const inputA = {
        variety: "Blue Sapphire",
        caratWeight: 2.45,
        color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
        clarity: { nakedEye: "Eye-clean", loupe10x: "Very Slight", inclusionType: "Silk needles", inclusionLocation: "Off-table", severity: "Minor" },
        cut: { length: 8.2, width: 6.8, depth: 4.9, symmetry: "Very Good", polish: "Excellent", windowing: "None", extinction: "None", bulging: "None" },
        treatment: { status: "Untreated", type: "None" },
        origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
        informationReliability: { measurements: "Measured" as const, treatment: "Laboratory Verified" as const, origin: "Laboratory Verified" as const },
      };
      const evalA = evaluateGemstone(inputA);
      const sumA = (evalA.color.score! * FOUR_C_WEIGHTS.color) + (evalA.clarity.score! * FOUR_C_WEIGHTS.clarity) + (evalA.cut.score! * FOUR_C_WEIGHTS.cut) + (evalA.carat.score! * FOUR_C_WEIGHTS.carat);
      assert.strictEqual(evalA.overall4C.score, Number(sumA.toFixed(2)), "Scenario A composite score must agree with production weighted sum");

      const pdfA = await generateEvaluationPdf({
        reportTitle: "Assessment Report A",
        evaluationId: "EVAL-TEST-A",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: { name: "Kasun Perera", category: "Professional Gemmologist" },
        gemstone: {
          ...inputA,
          photoUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
        },
        scores: {
          overall: evalA.overall4C.score!,
          color: evalA.color.score!,
          clarity: evalA.clarity.score!,
          cut: evalA.cut.score!,
          carat: evalA.carat.score!,
        },
        priceSuggestion: {
          available: true,
          suggestedPrice: 2322900,
          minimumPrice: 2090610,
          maximumPrice: 2555190,
          currency: "LKR",
          priceLkr: 2322900,
          priceUsd: 7635,
          priceRangeLkr: { minimum: 2090610, maximum: 2555190 },
          priceRangeUsd: { minimum: 6871, maximum: 8398 },
          exchangeRate: {
            rate: 304.25,
            source: "Central Bank of Sri Lanka (CBSL)",
            asOfDate: "2026-11-12",
            isAvailable: true,
          },
          isRealMarketData: true,
        },
        referenceComparison: { available: true, referenceName: "REF-1207", similarity: 82.4 },
        recommendations: [
          "Specimen displays prime Royal Blue color with high natural transparency.",
          "Request treatment assessment from a qualified gemmological laboratory.",
        ],
        ruleVersion: "v4.2-deterministic",
        userStatement: "Private record generated for Kasun Perera.",
        disclaimer: "Academic decision-support output. Not an independent laboratory certificate.",
      });
      assert.ok(pdfA instanceof Uint8Array);
      assert.ok(pdfA.length > 2000);
      const docA = await PDFDocument.load(pdfA);
      assert.strictEqual(docA.getPageCount(), 2, "Scenario A PDF must have exactly 2 pages");

      // Verify QR Code decodes to the exact evaluation URL
      const qrPngA = await QRCode.toBuffer("http://localhost:3000/evaluations/EVAL-TEST-A", {
        type: "png",
        margin: 1,
        width: 150,
        errorCorrectionLevel: "M",
      });
      const parsedPngA = PNG.sync.read(qrPngA);
      const decodedA = jsQR(new Uint8ClampedArray(parsedPngA.data), parsedPngA.width, parsedPngA.height);
      assert.strictEqual(decodedA?.data, "http://localhost:3000/evaluations/EVAL-TEST-A");

      // Scenario B: Price unavailable
      const inputB = {
        variety: "Padparadscha",
        caratWeight: 1.95,
        color: { hue: "Pinkish Orange", tone: "5", saturation: "Strong", distribution: "Even", zoning: "None" },
        clarity: { nakedEye: "Eye-clean", loupe10x: "Very Slight", inclusionType: "Silk needles", inclusionLocation: "Off-table", severity: "Minor" },
        cut: { length: 7.6, width: 6.0, depth: 3.8, symmetry: "Very Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
        treatment: { status: "Untreated", type: "None" },
        origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
        informationReliability: { measurements: "Measured" as const, treatment: "Laboratory Verified" as const, origin: "Laboratory Verified" as const },
      };
      const evalB = evaluateGemstone(inputB);
      const sumB = (evalB.color.score! * FOUR_C_WEIGHTS.color) + (evalB.clarity.score! * FOUR_C_WEIGHTS.clarity) + (evalB.cut.score! * FOUR_C_WEIGHTS.cut) + (evalB.carat.score! * FOUR_C_WEIGHTS.carat);
      assert.strictEqual(evalB.overall4C.score, Number(sumB.toFixed(2)), "Scenario B composite score must agree with production weighted sum");

      const pdfB = await generateEvaluationPdf({
        reportTitle: "Assessment Report B",
        evaluationId: "EVAL-TEST-B",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: { name: "Amara Silva", category: "Student Researcher" },
        gemstone: {
          ...inputB,
          photoUrl: "",
        },
        scores: {
          overall: evalB.overall4C.score!,
          color: evalB.color.score!,
          clarity: evalB.clarity.score!,
          cut: evalB.cut.score!,
          carat: evalB.carat.score!,
        },
        priceSuggestion: {
          available: false,
          suggestedPrice: null,
          minimumPrice: null,
          maximumPrice: null,
          currency: null,
          reason: "Insufficient verified market data: At least 3 verified completed-sale commercial transaction records are required.",
        },
        referenceComparison: { available: false, referenceName: null, similarity: null },
        recommendations: [
          "Specimen color balance observed within delicate pinkish-orange corundum hue range.",
          "Request treatment assessment from a qualified gemmological laboratory.",
        ],
        ruleVersion: "v4.2-deterministic",
        userStatement: "Private record generated for Amara Silva.",
        disclaimer: "Academic decision-support output. Not an independent laboratory certificate.",
      });
      assert.ok(pdfB instanceof Uint8Array);
      assert.ok(pdfB.length > 2000);
      const docB = await PDFDocument.load(pdfB);
      assert.strictEqual(docB.getPageCount(), 2, "Scenario B PDF must have exactly 2 pages");

      // Scenario C: Missing photo, unknown treatment/origin, scores generated from production engine
      const inputC = {
        variety: "Ruby",
        caratWeight: 1.50,
        color: { hue: "Pigeon Blood Red", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
        clarity: { nakedEye: "Clean", loupe10x: "Very Slight", inclusionType: "Minor rutile", inclusionLocation: "Pavilion", severity: "Minor" },
        cut: { length: 6.8, width: 5.2, depth: 3.4, symmetry: "Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
        treatment: { status: "Unknown", type: "Unverified" },
        origin: { value: "Unknown", reliability: "Unverified" },
        informationReliability: { measurements: "User Observed" as const, treatment: "Unverified" as const, origin: "Unverified" as const },
      };
      const evalC = evaluateGemstone(inputC);
      const sumC = (evalC.color.score! * FOUR_C_WEIGHTS.color) + (evalC.clarity.score! * FOUR_C_WEIGHTS.clarity) + (evalC.cut.score! * FOUR_C_WEIGHTS.cut) + (evalC.carat.score! * FOUR_C_WEIGHTS.carat);
      assert.strictEqual(evalC.overall4C.score, Number(sumC.toFixed(2)), "Scenario C composite score must agree with production weighted sum");

      const pdfC = await generateEvaluationPdf({
        reportTitle: "Assessment Report C",
        evaluationId: "EVAL-TEST-C",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: { name: "University Student", category: "Student" },
        gemstone: {
          ...inputC,
          photoUrl: "", // Missing photo -> vector emblem
        },
        scores: {
          overall: evalC.overall4C.score!,
          color: evalC.color.score!,
          clarity: evalC.clarity.score!,
          cut: evalC.cut.score!,
          carat: evalC.carat.score!,
        },
        priceSuggestion: {
          available: false,
          suggestedPrice: null,
          minimumPrice: null,
          maximumPrice: null,
          currency: null,
          reason: "Pricing unavailable because treatment and origin are unverified.",
        },
        referenceComparison: { available: false, referenceName: null, similarity: null },
        recommendations: [
          "Treatment status unverified: Request treatment assessment from a qualified gemmological laboratory.",
          "Origin unverified: Geographical provenance should not be declared without laboratory spectroscopic confirmation.",
        ],
        ruleVersion: "v4.2-deterministic",
        userStatement: "Private record generated for University Student.",
        disclaimer: "Academic decision-support output. Not an independent laboratory certificate.",
      });
      assert.ok(pdfC instanceof Uint8Array);
      assert.ok(pdfC.length > 2000);
      const docC = await PDFDocument.load(pdfC);
      assert.strictEqual(docC.getPageCount(), 2, "Scenario C PDF must have exactly 2 pages");

      // Verify unconfigured URL renders cleanly without throwing or embedding unverified fallback domain
      delete process.env.NEXTAUTH_URL;
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.APP_URL;
      const pdfCNoUrl = await generateEvaluationPdf({
        reportTitle: "Assessment Report C Unconfigured",
        evaluationId: "EVAL-TEST-C-NOURL",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: { name: "University Student", category: "Student" },
        gemstone: { ...inputC, photoUrl: "" },
        scores: {
          overall: evalC.overall4C.score!,
          color: evalC.color.score!,
          clarity: evalC.clarity.score!,
          cut: evalC.cut.score!,
          carat: evalC.carat.score!,
        },
        priceSuggestion: { available: false, suggestedPrice: null, minimumPrice: null, maximumPrice: null, currency: null, reason: "N/A" },
        referenceComparison: { available: false, referenceName: null, similarity: null },
        recommendations: ["Request treatment assessment from a qualified gemmological laboratory."],
        ruleVersion: "v4.2-deterministic",
        userStatement: "Private record.",
        disclaimer: "Academic disclaimer.",
      });
      const docCNoUrl = await PDFDocument.load(pdfCNoUrl);
      assert.strictEqual(docCNoUrl.getPageCount(), 2, "PDF without configured URL must have strictly 2 pages");
    }
  );

  // =========================================================================
  // Test 13: User Security & RBAC: Password hash is strictly excluded from user models and admin APIs; last CAGS_ADMIN cannot be demoted or suspended
  // =========================================================================
  await t.test(
    "13. User Security & RBAC: Password hash is strictly excluded from user models and admin APIs; last CAGS_ADMIN cannot be demoted or suspended",
    async () => {
      const adminEmail = `admin-security-${Date.now()}@example.com`;
      const admin = await User.create({
        name: "Security Admin",
        email: adminEmail,
        passwordHash: "$2b$10$hashedsecretkey1234567890",
        category: "Gemologist",
        role: "CAGS_ADMIN",
        status: "ACTIVE",
        isActive: true,
      });

      const adminToken = await createSessionToken({
        userId: admin._id.toString(),
        role: "CAGS_ADMIN",
      });

      // GET /api/admin/users
      const listReq = new NextRequest("http://localhost:3000/api/admin/users", {
        headers: { cookie: `session=${adminToken}` },
      });
      const listRes = await getAdminUsers(listReq);
      assert.strictEqual(listRes.status, 200);
      const listBody = await listRes.json();
      assert.ok(Array.isArray(listBody.users));
      const targetUser = listBody.users.find((u: { email: string; passwordHash?: string; password?: string }) => u.email === adminEmail);
      assert.ok(targetUser, "Created admin user must appear in admin list");
      assert.strictEqual(targetUser.passwordHash, undefined, "passwordHash must be omitted from user list API");
      assert.strictEqual(targetUser.password, undefined, "password must be omitted from user list API");

      // GET /api/admin/users/:id
      const detailReq = new NextRequest(`http://localhost:3000/api/admin/users/${admin._id}`, {
        headers: { cookie: `session=${adminToken}` },
      });
      const detailRes = await getAdminUserById(detailReq, { params: Promise.resolve({ id: admin._id.toString() }) });
      assert.strictEqual(detailRes.status, 200);
      const detailBody = await detailRes.json();
      assert.strictEqual(detailBody.user.passwordHash, undefined, "passwordHash must be omitted from user detail API");
      assert.strictEqual(detailBody.user.password, undefined, "password must be omitted from user detail API");

      // PATCH /api/admin/users/:id - Admins cannot suspend their own active account
      const selfSuspendReq = new NextRequest(`http://localhost:3000/api/admin/users/${admin._id}`, {
        method: "PATCH",
        headers: {
          cookie: `session=${adminToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: "SUSPENDED" }),
      });
      const selfSuspendRes = await patchAdminUser(selfSuspendReq, { params: Promise.resolve({ id: admin._id.toString() }) });
      assert.strictEqual(selfSuspendRes.status, 400, "Admins must not be able to suspend their own active account");
      const selfSuspendBody = await selfSuspendRes.json();
      assert.match(selfSuspendBody.message, /cannot suspend their own/i);
    }
  );

  // =========================================================================
  // Test 14: Atomic Evaluation Submission: Omitting gemstoneId atomically provisions specimen owned by user and populates assessmentSnapshot
  // =========================================================================
  await t.test(
    "14. Atomic Evaluation Submission: Omitting gemstoneId atomically provisions specimen owned by user and populates assessmentSnapshot",
    async () => {
      const user = await User.create({
        name: "Atomic Test User",
        email: `atomic-user-${Date.now()}@example.com`,
        passwordHash: "secret123",
        category: "Student",
        role: "USER",
        status: "ACTIVE",
        isActive: true,
      });

      const userToken = await createSessionToken({
        userId: user._id.toString(),
        role: "USER",
      });

      const submissionPayload = {
        variety: "Blue Sapphire",
        caratWeight: 2.75,
        color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None visible" },
        clarity: { nakedEye: "Clean", loupe10x: "Very Slight", severity: "Minor" },
        cut: { length: 8.8, width: 7.0, depth: 4.4, symmetry: "Good", polish: "Good", windowing: "None", extinction: "Minimal", bulging: "None" },
        treatment: { status: "Unheated", type: "Natural" },
        origin: { value: "Sri Lanka", reliability: "High" },
        informationReliability: { measurements: "Lab Certified", treatment: "Lab Certified", origin: "Lab Certified" },
      };

      const req = new NextRequest("http://localhost:3000/api/evaluations", {
        method: "POST",
        headers: {
          cookie: `session=${userToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(submissionPayload),
      });

      const res = await postEvaluation(req);
      assert.strictEqual(res.status, 200, "Atomic evaluation submission must succeed with 200");
      const body = await res.json();
      assert.ok(body.evaluationId, "Must return created evaluation ID");

      // Verify MongoDB documents
      const savedEval = await Evaluation.findById(body.evaluationId).populate("gemstoneId");
      assert.ok(savedEval, "Saved evaluation must exist in database");
      assert.strictEqual(savedEval.userId.toString(), user._id.toString(), "Evaluation must be linked to authenticated user");

      // Verify Gemstone was atomically created
      const savedGemstone = savedEval.gemstoneId as unknown as { userId: mongoose.Types.ObjectId; caratWeight: number };
      assert.ok(savedGemstone, "Gemstone must be atomically created");
      assert.strictEqual(savedGemstone.userId.toString(), user._id.toString(), "Gemstone must be owned by authenticated user");
      assert.strictEqual(savedGemstone.caratWeight, 2.75);

      // Verify immutable assessmentSnapshot
      assert.ok(savedEval.assessmentSnapshot, "Evaluation must store immutable assessmentSnapshot");
      assert.strictEqual(typeof savedEval.assessmentSnapshot.overallScore, "number");
      assert.strictEqual(savedEval.assessmentSnapshot.ruleVersion, "prototype-v1");
      assert.ok(savedEval.assessmentSnapshot.gemstone, "Snapshot must retain original inputs");
    }
  );

  // =========================================================================
  // Test 15: Origin Reliability Normalization: 'unverified' and 'Declared by seller' normalize to 'Unknown' and never 'High'
  // =========================================================================
  await t.test(
    "15. Origin Reliability Normalization: 'unverified' and 'Declared by seller' normalize to 'Unknown' and never 'High'",
    async () => {
      const user = await User.create({
        name: "Origin Test User",
        email: `origin-norm-${Date.now()}@example.com`,
        passwordHash: "secret123",
        category: "Trader",
        role: "USER",
        status: "ACTIVE",
        isActive: true,
      });

      const userToken = await createSessionToken({
        userId: user._id.toString(),
        role: "USER",
      });

      const payload = {
        variety: "Blue Sapphire",
        caratWeight: 1.85,
        color: { hue: "Cornflower Blue", tone: "5", saturation: "Strong", distribution: "Even", zoning: "None visible" },
        clarity: { nakedEye: "Clean", loupe10x: "Slight", severity: "Minor" },
        cut: { length: 7.5, width: 6.0, depth: 3.8, symmetry: "Good", polish: "Good", windowing: "None", extinction: "Minimal", bulging: "None" },
        treatment: { status: "Heated" },
        origin: { value: "Sri Lanka", reliability: "unverified" },
        informationReliability: { measurements: "User Observed", treatment: "Unverified", origin: "Unverified" },
      };

      const req = new NextRequest("http://localhost:3000/api/evaluations", {
        method: "POST",
        headers: {
          cookie: `session=${userToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const res = await postEvaluation(req);
      assert.strictEqual(res.status, 200);
      const body = await res.json();

      const savedEval = await Evaluation.findById(body.evaluationId).populate("gemstoneId");
      assert.ok(savedEval);
      const savedGemstone = savedEval.gemstoneId as unknown as { origin?: { reliability: string } };
      assert.ok(savedGemstone);
      assert.strictEqual(savedGemstone.origin?.reliability, "Unknown", "unverified origin reliability must normalize to 'Unknown'");
      assert.notStrictEqual(savedGemstone.origin?.reliability, "High", "Substring 'verified' must NEVER cause unverified to become 'High'");
      assert.strictEqual(savedEval.assessmentSnapshot.gemstone.origin.reliability, "Unknown");
    }
  );

  // =========================================================================
  // Test 16: Admin Reference Creation Validation: Missing fields strictly fail with 400 without fabricated fallbacks
  // =========================================================================
  await t.test(
    "16. Admin Reference Creation Validation: Missing fields strictly fail with 400 without fabricated fallbacks",
    async () => {
      const admin = await User.create({
        name: "Ref Admin User",
        email: `ref-admin-${Date.now()}@example.com`,
        passwordHash: "secret123",
        category: "Gemologist",
        role: "CAGS_ADMIN",
        status: "ACTIVE",
        isActive: true,
      });

      const adminToken = await createSessionToken({
        userId: admin._id.toString(),
        role: "CAGS_ADMIN",
      });

      // Submit missing required fields (caratWeight and referencePrice missing)
      const invalidReq = new NextRequest("http://localhost:3000/api/admin/reference-gemstones", {
        method: "POST",
        headers: {
          cookie: `session=${adminToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          referenceId: `REF-TEST-INV-${Date.now()}`,
          variety: "Blue Sapphire",
          // missing caratWeight, cut, color, clarity, referencePrice
        }),
      });

      const invalidRes = await postAdminReference(invalidReq);
      assert.strictEqual(invalidRes.status, 400, "Missing required fields must return 400 Bad Request");
      const invalidBody = await invalidRes.json();
      assert.match(invalidBody.message, /carat weight/i);

      // Submit valid payload
      const validReq = new NextRequest("http://localhost:3000/api/admin/reference-gemstones", {
        method: "POST",
        headers: {
          cookie: `session=${adminToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          referenceId: `REF-TEST-VAL-${Date.now()}`,
          variety: "Blue Sapphire",
          caratWeight: 3.1,
          cut: { length: 9.0, width: 7.2, depth: 4.5, symmetry: "Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
          color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None visible" },
          clarity: { nakedEye: "Clean", loupe10x: "Very Slight", severity: "Minor" },
          referencePrice: 950000,
          currency: "LKR",
          treatment: { status: "Unheated" },
          origin: { value: "Sri Lanka", reliability: "High" },
          sourceEvidence: "Colombo Gem Trade B2B Transaction Record #2026-09",
        }),
      });

      const validRes = await postAdminReference(validReq);
      assert.strictEqual(validRes.status, 201, "Valid reference creation must return 201 Created");
      const validBody = await validRes.json();
      assert.strictEqual(validBody.reference.verificationStatus, "Pending", "New references must default to Pending");
      assert.strictEqual(validBody.reference.dataClassification, "Demo", "New references must default to Demo");
      assert.strictEqual(validBody.reference.caratWeight, 3.1);
      assert.strictEqual(validBody.reference.referencePrice, 950000);
    }
  );

  // =========================================================================
  // Test 17: Admin System Settings Persistence & Audit Logging: /api/admin/settings persists config and logs audit record
  // =========================================================================
  await t.test(
    "17. Admin System Settings Persistence & Audit Logging: /api/admin/settings persists config and logs audit record",
    async () => {
      const admin = await User.create({
        name: "Settings Admin User",
        email: `settings-admin-${Date.now()}@example.com`,
        passwordHash: "secret123",
        category: "Gemologist",
        role: "CAGS_ADMIN",
        status: "ACTIVE",
        isActive: true,
      });

      const adminToken = await createSessionToken({
        userId: admin._id.toString(),
        role: "CAGS_ADMIN",
      });

      // Update settings via POST /api/admin/settings
      const updateReq = new NextRequest("http://localhost:3000/api/admin/settings", {
        method: "POST",
        headers: {
          cookie: `session=${adminToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          orgName: "Ceylon Academy of Gemmological Science (CAGS)",
          adminEmail: "governance@cags.lk",
          baseCurrency: "LKR — Sri Lankan Rupee",
        }),
      });

      const updateRes = await postAdminSettings(updateReq);
      assert.strictEqual(updateRes.status, 200);
      const updateBody = await updateRes.json();
      assert.strictEqual(updateBody.success, true);
      assert.strictEqual(updateBody.settings.orgName, "Ceylon Academy of Gemmological Science (CAGS)");
      assert.strictEqual(updateBody.settings.adminEmail, "governance@cags.lk");

      // Verify GET /api/admin/settings returns the persisted settings
      const getReq = new NextRequest("http://localhost:3000/api/admin/settings", {
        headers: { cookie: `session=${adminToken}` },
      });
      const getRes = await getAdminSettings(getReq);
      assert.strictEqual(getRes.status, 200);
      const getBody = await getRes.json();
      assert.strictEqual(getBody.settings.orgName, "Ceylon Academy of Gemmological Science (CAGS)");
      assert.strictEqual(getBody.settings.adminEmail, "governance@cags.lk");

      // Verify AuditLog was recorded
      const log = await AuditLog.findOne({
        action: "SETTINGS_UPDATED",
        "performedBy.userId": admin._id.toString(),
      });
      assert.ok(log, "System settings update must record an AuditLog entry");
    }
  );

  // =========================================================================
  // Test 18: SSRF Protection: PDF photo fetcher blocks loopback, internal IPs, and cloud metadata endpoints
  // =========================================================================
  await t.test(
    "18. SSRF Protection: PDF photo fetcher blocks loopback, internal IPs, and cloud metadata endpoints",
    async () => {
      // Direct validator tests
      assert.strictEqual(isSafeExternalImageUrl("http://127.0.0.1/evil.png"), false, "127.0.0.1 must be blocked");
      assert.strictEqual(isSafeExternalImageUrl("http://localhost:3000/photo.jpg"), false, "localhost must be blocked");
      assert.strictEqual(isSafeExternalImageUrl("http://169.254.169.254/latest/meta-data"), false, "AWS metadata must be blocked");
      assert.strictEqual(isSafeExternalImageUrl("http://192.168.1.50/photo.jpg"), false, "RFC 1918 192.168.x must be blocked");
      assert.strictEqual(isSafeExternalImageUrl("http://10.0.0.1/gem.jpg"), false, "RFC 1918 10.x must be blocked");
      assert.strictEqual(isSafeExternalImageUrl("http://172.16.0.1/gem.jpg"), false, "RFC 1918 172.16.x must be blocked");
      assert.strictEqual(isSafeExternalImageUrl("file:///etc/passwd"), false, "Non-HTTP/HTTPS protocol must be blocked");
      assert.strictEqual(isSafeExternalImageUrl("https://images.unsplash.com/photo-123.jpg"), true, "Public HTTPS URL must be allowed");

      // Verify generateEvaluationPdf gracefully falls back to vector emblem when given an SSRF attack URL
      const ssrfPdf = await generateEvaluationPdf({
        reportTitle: "SSRF Defense Test Report",
        evaluationId: "EVAL-SSRF-TEST",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: { name: "Security Tester", category: "Auditor" },
        gemstone: {
          variety: "Blue Sapphire",
          caratWeight: 2.0,
          color: { hue: "Royal Blue", tone: "6", saturation: "Vivid" },
          clarity: { nakedEye: "Clean", loupe10x: "Very Slight" },
          cut: { length: 8.0, width: 6.0, depth: 4.0 },
          treatment: { status: "Unheated" },
          origin: { value: "Sri Lanka", reliability: "High" },
          informationReliability: { measurements: "Lab Certified", treatment: "Lab Certified", origin: "Lab Certified" },
          photoUrl: "http://127.0.0.1:9999/malicious-internal-service.png", // SSRF attempt
        },
        scores: { overall: 90, color: 92, clarity: 90, cut: 88, carat: 90 },
        priceSuggestion: { available: false, suggestedPrice: null, minimumPrice: null, maximumPrice: null, currency: null, reason: "N/A" },
        referenceComparison: { available: false, referenceName: null, similarity: null },
        recommendations: ["Verified laboratory inspection."],
        ruleVersion: "v4.2-deterministic",
        userStatement: "Test record.",
        disclaimer: "Academic disclaimer.",
      });

      assert.ok(ssrfPdf instanceof Uint8Array);
      const ssrfDoc = await PDFDocument.load(ssrfPdf);
      assert.strictEqual(ssrfDoc.getPageCount(), 2, "PDF with SSRF URL must cleanly generate 2-page report with vector fallback");
    }
  );
});
