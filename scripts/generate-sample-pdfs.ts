import fs from "fs";
import path from "path";
import { generateEvaluationPdf, ReportData } from "../src/lib/report/generateEvaluationPdf";
import { evaluateGemstone } from "../src/lib/evaluation/evaluateGemstone";

const artifactDir = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\cbddecf0-aaae-4926-9139-93a3e4a0c8f3";
const workspaceDir = path.join(process.cwd(), "sample-reports");

async function generateSamplePdfs() {
  process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!fs.existsSync(workspaceDir)) {
    fs.mkdirSync(workspaceDir, { recursive: true });
  }

  // Scenario A: Complete assessment with supported market evidence
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

  const reportA: ReportData = {
    reportTitle: "Open 4Cs Gemstone Evaluation Report",
    evaluationId: "EVAL-SCENARIO-A",
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date("2026-11-12"),
    user: { name: "Kasun Perera", category: "Professional Gemmologist" },
    gemstone: {
      ...inputA,
      photoUrl: "",
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
        source: "Central Bank of Sri Lanka (CBSL) - Indicative Spot Exchange Rate",
        asOfDate: "2026-11-12",
        isAvailable: true,
      },
      isRealMarketData: true,
      marketLevel: "Indicative Wholesale Range (Traceable Reference Sales)",
    },
    referenceComparison: { available: true, referenceName: "Colombo B2B Dealer Parcel REF-1207", similarity: 82.4 },
    recommendations: [
      "Specimen displays prime Royal Blue color with high natural transparency.",
      "Maintain unheated certification record from an accredited laboratory.",
      "Pavilion proportions produce minimal extinction and excellent light return.",
    ],
    ruleVersion: evalA.ruleVersion,
    userStatement: "Private record generated for Kasun Perera, registered as Professional Gemmologist.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate or guaranteed market valuation.",
  };

  // Scenario B: Complete assessment WITHOUT sufficient market evidence (pricing unavailable)
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

  const reportB: ReportData = {
    reportTitle: "Open 4Cs Gemstone Evaluation Report",
    evaluationId: "EVAL-SCENARIO-B",
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date("2026-11-12"),
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
      reason: "Insufficient verified market data: At least 3 verified completed-sale commercial transaction records are required. Demo and unverified records are strictly excluded from commercial valuation.",
    },
    referenceComparison: { available: false, referenceName: null, similarity: null },
    recommendations: [
      "Specimen color balance observed within delicate pinkish-orange corundum hue range.",
      "Request treatment assessment from a qualified gemmological laboratory.",
    ],
    ruleVersion: evalB.ruleVersion,
    userStatement: "Private record generated for Amara Silva, registered as Student Researcher.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate or guaranteed market valuation.",
  };

  // Scenario C: Missing photo and unknown treatment/origin
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

  const reportC: ReportData = {
    reportTitle: "Open 4Cs Gemstone Evaluation Report",
    evaluationId: "EVAL-SCENARIO-C",
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date("2026-11-12"),
    user: { name: "University Student", category: "Student" },
    gemstone: {
      ...inputC,
      photoUrl: "",
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
    ruleVersion: evalC.ruleVersion,
    userStatement: "Private record generated for University Student.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate.",
  };

  console.log("Calculated Composite Scores:");
  console.log("- Scenario A Composite:", evalA.overall4C.score);
  console.log("- Scenario B Composite:", evalB.overall4C.score);
  console.log("- Scenario C Composite:", evalC.overall4C.score);

  const pdfA = await generateEvaluationPdf(reportA);
  const pdfB = await generateEvaluationPdf(reportB);
  const pdfC = await generateEvaluationPdf(reportC);

  // Write to Artifact directory
  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-a.pdf"), pdfA);
  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-b.pdf"), pdfB);
  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-c.pdf"), pdfC);

  // Write to workspace sample-reports directory
  fs.writeFileSync(path.join(workspaceDir, "sample-report-scenario-a.pdf"), pdfA);
  fs.writeFileSync(path.join(workspaceDir, "sample-report-scenario-b.pdf"), pdfB);
  fs.writeFileSync(path.join(workspaceDir, "sample-report-scenario-c.pdf"), pdfC);

  // Write to public/sample-reports directory for static browser serving
  const publicDir = path.join(process.cwd(), "public", "sample-reports");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, "sample-report-scenario-a.pdf"), pdfA);
  fs.writeFileSync(path.join(publicDir, "sample-report-scenario-b.pdf"), pdfB);
  fs.writeFileSync(path.join(publicDir, "sample-report-scenario-c.pdf"), pdfC);

  console.log("Successfully generated all 3 sample PDFs:");
  console.log("- Scenario A (Complete + Market Evidence):", pdfA.byteLength, "bytes");
  console.log("- Scenario B (Complete, Price Unavailable):", pdfB.byteLength, "bytes");
  console.log("- Scenario C (Missing Photo, Unknown Treatment/Origin):", pdfC.byteLength, "bytes");
}

generateSamplePdfs().catch(console.error);
