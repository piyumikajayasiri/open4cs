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

  // Scenario A: Complete Ceylon Blue Sapphire with supported market evidence
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
    user: { name: "Thasneem Mohamed", category: "Professional Gemmologist" },
    gemstone: {
      ...inputA,
      photoUrl: "/images/gemstones/ceylon-blue-sapphire.jpg",
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
      isRealMarketData: false,
      marketLevel: "Illustrative price range (Pedagogical Demo Reference REF-1181)",
    },
    referenceComparison: { available: true, referenceName: "Colombo Fort Dealer Lot REF-1181 (Pedagogical Demo Data)", similarity: 82.4 },
    recommendations: [
      "Specimen displays prime Royal Blue color with high natural transparency.",
      "Maintain unheated certification record from an accredited laboratory.",
      "Pavilion proportions produce minimal extinction and excellent light return.",
    ],
    ruleVersion: evalA.ruleVersion,
    userStatement: "Private record generated for Thasneem Mohamed, registered as Professional Gemmologist.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate or guaranteed market valuation.",
  };

  // Scenario B: Padparadscha Sapphire (Comparison Specimen)
  const inputB = {
    variety: "Padparadscha",
    caratWeight: 1.85,
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
    user: { name: "Thasneem Mohamed", category: "Professional Gemmologist" },
    gemstone: {
      ...inputB,
      photoUrl: "/images/gemstones/padparadscha-sapphire.jpg",
    },
    scores: {
      overall: evalB.overall4C.score!,
      color: evalB.color.score!,
      clarity: evalB.clarity.score!,
      cut: evalB.cut.score!,
      carat: evalB.carat.score!,
    },
    priceSuggestion: {
      available: true,
      suggestedPrice: 1550000,
      minimumPrice: 1395000,
      maximumPrice: 1705000,
      currency: "LKR",
      priceLkr: 1550000,
      priceUsd: 5095,
      priceRangeLkr: { minimum: 1395000, maximum: 1705000 },
      priceRangeUsd: { minimum: 4585, maximum: 5604 },
      exchangeRate: {
        rate: 304.25,
        source: "Central Bank of Sri Lanka (CBSL) - Indicative Spot Exchange Rate",
        asOfDate: "2026-11-12",
        isAvailable: true,
      },
      isRealMarketData: false,
      marketLevel: "Illustrative price range (Pedagogical Demo Reference REF-PAD-02)",
    },
    referenceComparison: { available: true, referenceName: "Ratnapura Collector Lot REF-PAD-02 (Pedagogical Demo Data)", similarity: 80.2 },
    recommendations: [
      "Classic delicate pinkish-orange corundum balance with good saturation.",
      "Preserve natural unheated documentation from an independent gemmological laboratory.",
    ],
    ruleVersion: evalB.ruleVersion,
    userStatement: "Private record generated for Thasneem Mohamed.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate.",
  };

  // Scenario C: Natural Ruby (Uncertainty Handling & Risk Disclosures)
  const inputC = {
    variety: "Ruby",
    caratWeight: 1.50,
    color: { hue: "Pigeon Blood Red", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
    clarity: { nakedEye: "Slightly Included", loupe10x: "Slight", inclusionType: "Feather", inclusionLocation: "Under table", severity: "Moderate" },
    cut: { length: 7.0, width: 5.5, depth: 3.6, symmetry: "Good", polish: "Good", windowing: "Slight", extinction: "Slight", bulging: "None" },
    treatment: { status: "Unknown", type: "Unknown" },
    origin: { value: "Unknown", reliability: "Unknown" },
    informationReliability: { measurements: "Measured" as const, treatment: "Unverified" as const, origin: "Unverified" as const },
  };
  const evalC = evaluateGemstone(inputC);

  const reportC: ReportData = {
    reportTitle: "Open 4Cs Gemstone Evaluation Report",
    evaluationId: "EVAL-SCENARIO-C",
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date("2026-11-12"),
    user: { name: "Thasneem Mohamed", category: "Professional Gemmologist" },
    gemstone: {
      ...inputC,
      photoUrl: "/images/gemstones/ceylon-ruby.jpg",
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
      reason: "Pricing unavailable: Treatment status and geographical origin are unverified. Laboratory confirmation required.",
    },
    referenceComparison: { available: false, referenceName: null, similarity: null },
    recommendations: [
      "Treatment status unverified: Request thermal/flux analysis from an accredited gemmological laboratory.",
      "Origin unverified: Trace-element spectroscopic confirmation recommended before commercial transactions.",
    ],
    ruleVersion: evalC.ruleVersion,
    userStatement: "Private record generated for Thasneem Mohamed.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate.",
  };

  // Scenario D: Exceptional Ceylon Blue Sapphire (Data Sufficiency Boundary)
  const inputD = {
    variety: "Blue Sapphire",
    caratWeight: 4.25,
    color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
    clarity: { nakedEye: "Eye-clean", loupe10x: "Very Slight", inclusionType: "Silk needles", inclusionLocation: "Off-table", severity: "Minor" },
    cut: { length: 10.2, width: 8.5, depth: 5.8, symmetry: "Very Good", polish: "Excellent", windowing: "None", extinction: "None", bulging: "None" },
    treatment: { status: "Untreated", type: "None" },
    origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
    informationReliability: { measurements: "Measured" as const, treatment: "Laboratory Verified" as const, origin: "Laboratory Verified" as const },
  };
  const evalD = evaluateGemstone(inputD);

  const reportD: ReportData = {
    reportTitle: "Open 4Cs Gemstone Evaluation Report",
    evaluationId: "EVAL-SCENARIO-D",
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date("2026-11-12"),
    user: { name: "Thasneem Mohamed", category: "Professional Gemmologist" },
    gemstone: {
      ...inputD,
      photoUrl: "/images/gemstones/yellow-sapphire.jpg",
    },
    scores: {
      overall: evalD.overall4C.score!,
      color: evalD.color.score!,
      clarity: evalD.clarity.score!,
      cut: evalD.cut.score!,
      carat: evalD.carat.score!,
    },
    priceSuggestion: {
      available: false,
      suggestedPrice: null,
      minimumPrice: null,
      maximumPrice: null,
      currency: null,
      reason: "Pricing unavailable: Insufficient verified wholesale transactions for >4.0 ct size bracket (minimum 3 required).",
    },
    referenceComparison: { available: false, referenceName: null, similarity: null },
    recommendations: [
      "Exceptional carat size exceeding standard wholesale reference bracket.",
      "Maintain unheated certification from multiple tier-1 international gem laboratories.",
    ],
    ruleVersion: evalD.ruleVersion,
    userStatement: "Private record generated for Thasneem Mohamed.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate.",
  };

  console.log("Calculated Composite Scores:");
  console.log("- Scenario A Composite:", evalA.overall4C.score);
  console.log("- Scenario B Composite:", evalB.overall4C.score);
  console.log("- Scenario C Composite:", evalC.overall4C.score);
  console.log("- Scenario D Composite:", evalD.overall4C.score);

  const pdfA = await generateEvaluationPdf(reportA);
  const pdfB = await generateEvaluationPdf(reportB);
  const pdfC = await generateEvaluationPdf(reportC);
  const pdfD = await generateEvaluationPdf(reportD);

  // Write to Artifact directory
  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-a.pdf"), pdfA);
  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-b.pdf"), pdfB);
  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-c.pdf"), pdfC);
  fs.writeFileSync(path.join(artifactDir, "sample-report-scenario-d.pdf"), pdfD);

  // Write to workspace sample-reports directory
  fs.writeFileSync(path.join(workspaceDir, "sample-report-scenario-a.pdf"), pdfA);
  fs.writeFileSync(path.join(workspaceDir, "sample-report-scenario-b.pdf"), pdfB);
  fs.writeFileSync(path.join(workspaceDir, "sample-report-scenario-c.pdf"), pdfC);
  fs.writeFileSync(path.join(workspaceDir, "sample-report-scenario-d.pdf"), pdfD);

  // Write to public/sample-reports directory for static browser serving
  const publicDir = path.join(process.cwd(), "public", "sample-reports");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, "sample-report-scenario-a.pdf"), pdfA);
  fs.writeFileSync(path.join(publicDir, "sample-report-scenario-b.pdf"), pdfB);
  fs.writeFileSync(path.join(publicDir, "sample-report-scenario-c.pdf"), pdfC);
  fs.writeFileSync(path.join(publicDir, "sample-report-scenario-d.pdf"), pdfD);

  console.log("Successfully generated all 4 sample PDFs with embedded specimen photographs:");
  console.log("- Scenario A:", pdfA.byteLength, "bytes");
  console.log("- Scenario B:", pdfB.byteLength, "bytes");
  console.log("- Scenario C:", pdfC.byteLength, "bytes");
  console.log("- Scenario D:", pdfD.byteLength, "bytes");
}

generateSamplePdfs().catch(console.error);
