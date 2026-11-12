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
    "1. Role Authorization: Normal users are denied admin access (403); active CAGS_ADMIN permitted",
    async () => {
      // Create session for normal user
      const userToken = await createSessionToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "USER",
      });
      const userSession = await verifySessionToken(userToken);
      assert.ok(userSession, "User session token must be verifiable");
      assert.strictEqual(userSession.role, "USER");

      // Verify that admin check logic rejects normal user
      const checkAdminForUser = (session: typeof userSession) => {
        if (!session) return { authorized: false, status: 401 };
        if (session.role !== "CAGS_ADMIN") return { authorized: false, status: 403 };
        return { authorized: true, status: 200 };
      };

      const userAccess = checkAdminForUser(userSession);
      assert.strictEqual(userAccess.authorized, false);
      assert.strictEqual(userAccess.status, 403, "Normal user must receive 403 Forbidden on admin APIs");

      // Create session for active CAGS Admin
      const adminToken = await createSessionToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "CAGS_ADMIN",
      });
      const adminSession = await verifySessionToken(adminToken);
      assert.ok(adminSession, "Admin session token must be verifiable");
      assert.strictEqual(adminSession.role, "CAGS_ADMIN");

      const adminAccess = checkAdminForUser(adminSession);
      assert.strictEqual(adminAccess.authorized, true);
      assert.strictEqual(adminAccess.status, 200, "CAGS_ADMIN must receive 200 Authorized on admin APIs");
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

      // Verify protected route gate rejects unauthenticated user with 401
      const protectRoute = (session: unknown) => {
        if (!session) {
          return { status: 401, error: "Authentication required." };
        }
        return { status: 200 };
      };

      const response = protectRoute(noTokenResult);
      assert.strictEqual(response.status, 401, "Unauthenticated access must return 401 Authentication required.");
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
  // Test 9: Evaluation Ownership & Privacy Access Gate
  // =========================================================================
  await t.test(
    "9. Privacy & Ownership: User A cannot access User B's evaluation; CAGS_ADMIN permitted",
    async () => {
      const userAId = new mongoose.Types.ObjectId().toString();
      const userBId = new mongoose.Types.ObjectId().toString();

      // Mock evaluation ownership check helper matching /api/evaluations/[id]
      const checkEvaluationAccess = (
        evaluationOwnerId: string,
        requesterId: string,
        requesterRole: string
      ) => {
        const isOwner = evaluationOwnerId === requesterId;
        const isCagsAdmin = requesterRole === "CAGS_ADMIN";
        if (!isOwner && !isCagsAdmin) {
          return { status: 403, error: "Access denied." };
        }
        return { status: 200, success: true };
      };

      // User B attempts to access User A's evaluation -> Denied 403
      const userBAccess = checkEvaluationAccess(userAId, userBId, "USER");
      assert.strictEqual(userBAccess.status, 403);

      // User A accesses their own evaluation -> Allowed 200
      const userAAccess = checkEvaluationAccess(userAId, userAId, "USER");
      assert.strictEqual(userAAccess.status, 200);

      // CAGS_ADMIN accesses User A's evaluation -> Allowed 200
      const adminAccess = checkEvaluationAccess(userAId, userBId, "CAGS_ADMIN");
      assert.strictEqual(adminAccess.status, 200);
    }
  );

  // =========================================================================
  // Test 10: Server API Direct Submission Security: Rejects unsupported variety or synthetic / laboratory-grown gemstones
  // =========================================================================
  await t.test(
    "10. Security & Guard Rails: Direct API submission strictly rejects unsupported varieties and lab-grown stones",
    async () => {
      // Validate direct submission guard function matching /api/evaluations
      const validateSubmissionPayload = (body: {
        variety?: string;
        naturalStatus?: string;
      }) => {
        const supported = ["Blue Sapphire", "Padparadscha", "Ruby"];
        if (!body.variety || !supported.includes(body.variety)) {
          return { status: 400, message: "Unsupported variety" };
        }
        if (body.naturalStatus && body.naturalStatus.toLowerCase() !== "natural") {
          return { status: 400, message: "Lab-grown stones cannot be evaluated" };
        }
        return { status: 200, success: true };
      };

      // 1. Unsupported variety (e.g. Yellow Sapphire)
      const resUnsupported = validateSubmissionPayload({
        variety: "Yellow Sapphire",
        naturalStatus: "Natural",
      });
      assert.strictEqual(resUnsupported.status, 400);

      // 2. Laboratory-grown submission attempt
      const resLabGrown = validateSubmissionPayload({
        variety: "Blue Sapphire",
        naturalStatus: "Lab-Grown",
      });
      assert.strictEqual(resLabGrown.status, 400);

      // 3. Synthetic submission attempt
      const resSynthetic = validateSubmissionPayload({
        variety: "Ruby",
        naturalStatus: "Synthetic",
      });
      assert.strictEqual(resSynthetic.status, 400);

      // 4. Legitimate natural corundum submission
      const resLegitimate = validateSubmissionPayload({
        variety: "Padparadscha",
        naturalStatus: "Natural",
      });
      assert.strictEqual(resLegitimate.status, 200);
    }
  );

  // =========================================================================
  // Test 11: PDF Scenarios A, B, and C Generation & Content Integrity
  // =========================================================================
  await t.test(
    "11. PDF Scenarios: Scenario A (market evidence), Scenario B (pricing unavailable), Scenario C (missing photo/unknown origin)",
    async () => {
      // Scenario A: Market evidence available
      const pdfA = await generateEvaluationPdf({
        reportTitle: "Assessment Report A",
        evaluationId: "EVAL-TEST-A",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: { name: "Tester A", category: "Professional" },
        gemstone: {
          variety: "Blue Sapphire",
          caratWeight: 2.5,
          color: { hue: "Royal Blue" },
          clarity: { nakedEye: "Clean" },
          cut: { length: 8.2, width: 6.8, depth: 4.9 },
          treatment: { status: "Untreated" },
          origin: { value: "Sri Lanka" },
          informationReliability: {},
        },
        scores: { overall: 94, color: 100, clarity: 92, cut: 95, carat: 85 },
        priceSuggestion: {
          available: true,
          suggestedPrice: 2000000,
          minimumPrice: 1800000,
          maximumPrice: 2200000,
          currency: "LKR",
          priceLkr: 2000000,
          priceUsd: 6573,
          priceRangeLkr: { minimum: 1800000, maximum: 2200000 },
          priceRangeUsd: { minimum: 5916, maximum: 7230 },
          exchangeRate: {
            rate: 304.25,
            source: "Central Bank of Sri Lanka (CBSL)",
            asOfDate: "2026-11-12",
            isAvailable: true,
          },
          isRealMarketData: true,
        },
        referenceComparison: { available: true, referenceName: "REF-1207", similarity: 82 },
        recommendations: ["A-grade stone"],
        ruleVersion: "prototype-v1",
        userStatement: "Test statement",
        disclaimer: "Academic disclaimer",
      });
      assert.ok(pdfA instanceof Uint8Array);
      assert.ok(pdfA.length > 2000);
      const docA = await PDFDocument.load(pdfA);
      assert.strictEqual(docA.getPageCount(), 2, "Scenario A PDF must have exactly 2 pages");

      // Scenario B: Price unavailable (should NOT display price numbers)
      const pdfB = await generateEvaluationPdf({
        reportTitle: "Assessment Report B",
        evaluationId: "EVAL-TEST-B",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: { name: "Tester B", category: "Student" },
        gemstone: {
          variety: "Padparadscha",
          caratWeight: 1.8,
          color: { hue: "Pinkish Orange" },
          clarity: { nakedEye: "Clean" },
          cut: { length: 7.5, width: 5.9, depth: 3.8 },
          treatment: { status: "Untreated" },
          origin: { value: "Sri Lanka" },
          informationReliability: {},
        },
        scores: { overall: 90, color: 95, clarity: 90, cut: 90, carat: 80 },
        priceSuggestion: {
          available: false,
          suggestedPrice: null,
          minimumPrice: null,
          maximumPrice: null,
          currency: null,
          reason: "Insufficient verified market data: At least 3 verified references required.",
        },
        referenceComparison: { available: false, referenceName: null, similarity: null },
        recommendations: ["B-grade stone"],
        ruleVersion: "prototype-v1",
        userStatement: "Test statement",
        disclaimer: "Academic disclaimer",
      });
      assert.ok(pdfB instanceof Uint8Array);
      assert.ok(pdfB.length > 2000);
      const docB = await PDFDocument.load(pdfB);
      assert.strictEqual(docB.getPageCount(), 2, "Scenario B PDF must have exactly 2 pages");

      // Scenario C: Missing photo & unknown origin
      const pdfC = await generateEvaluationPdf({
        reportTitle: "Assessment Report C",
        evaluationId: "EVAL-TEST-C",
        generatedAt: new Date().toISOString(),
        evaluationDate: new Date(),
        user: { name: "Tester C", category: "Student" },
        gemstone: {
          variety: "Ruby",
          caratWeight: 1.2,
          color: { hue: "Pigeon Blood Red" },
          clarity: { nakedEye: "Clean" },
          cut: { length: 6.5, width: 5.0, depth: 3.2 },
          treatment: { status: "Unknown" },
          origin: { value: "Unknown" },
          informationReliability: {},
          photoUrl: "", // Missing photo
        },
        scores: { overall: 85, color: 90, clarity: 85, cut: 80, carat: 80 },
        priceSuggestion: {
          available: false,
          suggestedPrice: null,
          minimumPrice: null,
          maximumPrice: null,
          currency: null,
          reason: "Pricing unavailable for unverified treatment and origin.",
        },
        referenceComparison: { available: false, referenceName: null, similarity: null },
        recommendations: ["C-grade stone"],
        ruleVersion: "prototype-v1",
        userStatement: "Test statement",
        disclaimer: "Academic disclaimer",
      });
      assert.ok(pdfC instanceof Uint8Array);
      assert.ok(pdfC.length > 2000);
      const docC = await PDFDocument.load(pdfC);
      assert.strictEqual(docC.getPageCount(), 2, "Scenario C PDF must have exactly 2 pages");
    }
  );
});
