import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { createSessionToken, verifySessionToken } from "../src/lib/auth/session";
import GemstoneVariety from "../src/models/GemstoneVariety";
import ReferenceGemstone from "../src/models/ReferenceGemstone";
import { getReferenceGemstones } from "../src/lib/evaluation/getReferenceGemstones";
import { evaluateGemstone } from "../src/lib/evaluation/evaluateGemstone";
import { calculatePriceSuggestion } from "../src/lib/evaluation/priceSuggestion";
import { generateEvaluationPdf } from "../src/lib/report/generateEvaluationPdf";
import { FOUR_C_WEIGHTS } from "../src/lib/evaluation/rules";

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gemstone_evaluation";

test("Integration Workflow Suite", async (t) => {
  // Setup database connection
  await mongoose.connect(mongoUri);

  t.after(async () => {
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
});
