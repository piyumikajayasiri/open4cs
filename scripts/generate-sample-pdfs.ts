import fs from "fs";
import path from "path";
import { generateEvaluationPdf, ReportData } from "../src/lib/report/generateEvaluationPdf";

const artifactDir = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\cbddecf0-aaae-4926-9139-93a3e4a0c8f3";

async function generateSamplePdfs() {
  // Scenario A: Complete assessment with supported market evidence
  const reportA: ReportData = {
    reportTitle: "Open 4Cs Gemstone Evaluation Report",
    evaluationId: "EVAL-SCENARIO-A",
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date("2026-11-12"),
    user: { name: "Kasun Perera", category: "Professional Gemmologist" },
    gemstone: {
      variety: "Blue Sapphire",
      caratWeight: 2.45,
      color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
      clarity: { nakedEye: "Eye-clean", loupe10x: "Very Slight", severity: "Minor" },
      cut: { length: 8.2, width: 6.8, depth: 4.9, symmetry: "Very Good", polish: "Excellent" },
      treatment: { status: "Untreated", type: "None" },
      origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
      informationReliability: { measurements: "Measured", treatment: "Laboratory Verified", origin: "Laboratory Verified" },
      photoUrl: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&auto=format&fit=crop&q=80",
    },
    scores: { overall: 94.94, color: 100, clarity: 92.75, cut: 98.75, carat: 85 },
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
        source: "Central Bank of Sri Lanka (CBSL) - Indicative Spot Exchange Rate",
        asOfDate: "2026-11-12",
        isAvailable: true,
      },
      isRealMarketData: true,
      marketLevel: "Indicative Wholesale Market Range (Verified Commercial References)",
    },
    referenceComparison: { available: true, referenceName: "Colombo B2B Dealer Parcel REF-1207", similarity: 82.4 },
    recommendations: [
      "Specimen displays prime Royal Blue color with high natural transparency.",
      "Maintain unheated certification record from an accredited laboratory.",
      "Pavilion proportions produce minimal extinction and excellent light return.",
    ],
    ruleVersion: "prototype-v1",
    userStatement: "Private record generated for Kasun Perera, registered as Professional Gemmologist.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate or guaranteed market valuation.",
  };

  // Scenario B: Complete assessment WITHOUT sufficient market evidence (pricing unavailable)
  const reportB: ReportData = {
    reportTitle: "Open 4Cs Gemstone Evaluation Report",
    evaluationId: "EVAL-SCENARIO-B",
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date("2026-11-12"),
    user: { name: "Amara Silva", category: "Student Researcher" },
    gemstone: {
      variety: "Padparadscha",
      caratWeight: 1.95,
      color: { hue: "Pinkish Orange", tone: "5", saturation: "Strong", distribution: "Even", zoning: "None" },
      clarity: { nakedEye: "Eye-clean", loupe10x: "Very Slight", severity: "Minor" },
      cut: { length: 7.6, width: 6.0, depth: 3.8, symmetry: "Very Good", polish: "Good" },
      treatment: { status: "Untreated", type: "None" },
      origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
      informationReliability: { measurements: "Measured", treatment: "Laboratory Verified", origin: "Laboratory Verified" },
      photoUrl: "",
    },
    scores: { overall: 90.76, color: 94.5, clarity: 92.75, cut: 92.5, carat: 80 },
    priceSuggestion: {
      available: false,
      suggestedPrice: null,
      minimumPrice: null,
      maximumPrice: null,
      currency: null,
      reason: "Insufficient verified market data: At least 3 verified completed-sale market references required.",
    },
    referenceComparison: { available: false, referenceName: null, similarity: null },
    recommendations: [
      "Lotus Gemology color balance confirmed within delicate pink-orange spectrum.",
      "Verify absence of beryllium lattice diffusion before commercial trading.",
    ],
    ruleVersion: "prototype-v1",
    userStatement: "Private record generated for Amara Silva, registered as Student Researcher.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate or guaranteed market valuation.",
  };

  // Scenario C: Missing photo and unknown treatment/origin
  const reportC: ReportData = {
    reportTitle: "Open 4Cs Gemstone Evaluation Report",
    evaluationId: "EVAL-SCENARIO-C",
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date("2026-11-12"),
    user: { name: "University Student", category: "Student" },
    gemstone: {
      variety: "Ruby",
      caratWeight: 1.50,
      color: { hue: "Pigeon Blood Red", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
      clarity: { nakedEye: "Clean", loupe10x: "Very Slight", severity: "Minor" },
      cut: { length: 6.8, width: 5.2, depth: 3.4, symmetry: "Good", polish: "Good" },
      treatment: { status: "Unknown", type: "Unverified" },
      origin: { value: "Unknown", reliability: "Unverified" },
      informationReliability: { measurements: "User Observed", treatment: "Unverified", origin: "Unverified" },
      photoUrl: "",
    },
    scores: { overall: 89.25, color: 100, clarity: 92.75, cut: 85.0, carat: 80 },
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
      "Treatment status unverified: Submit to an accredited gemmological laboratory for FTIR heating analysis.",
      "Origin unverified: Geographical provenance should not be declared without laboratory spectroscopic confirmation.",
    ],
    ruleVersion: "prototype-v1",
    userStatement: "Private record generated for University Student.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate.",
  };

  const pdfA = await generateEvaluationPdf(reportA);
  const pdfB = await generateEvaluationPdf(reportB);
  const pdfC = await generateEvaluationPdf(reportC);

  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-a.pdf"), pdfA);
  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-b.pdf"), pdfB);
  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-c.pdf"), pdfC);

  console.log("Successfully generated all 3 sample PDFs:");
  console.log("- Scenario A (Complete + Market Evidence):", pdfA.byteLength, "bytes");
  console.log("- Scenario B (Complete, Price Unavailable):", pdfB.byteLength, "bytes");
  console.log("- Scenario C (Missing Photo, Unknown Treatment/Origin):", pdfC.byteLength, "bytes");
}

generateSamplePdfs().catch(console.error);
