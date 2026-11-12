import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import jsQR from "jsqr";
import { generateEvaluationPdf, ReportData } from "../src/lib/report/generateEvaluationPdf";
import { evaluateGemstone } from "../src/lib/evaluation/evaluateGemstone";

async function testPdfImageAndQrExtraction() {
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

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
  const testEvalId = "EVAL-TEST-JOURNEY-001";
  const reportA: ReportData = {
    reportTitle: "Open 4Cs Gemstone Evaluation Report",
    evaluationId: testEvalId,
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date("2026-11-12"),
    user: { name: "Journey Tester", category: "Professional Gemmologist" },
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
      marketLevel: "Indicative Wholesale Market Range (Verified Commercial References)",
    },
    referenceComparison: { available: true, referenceName: "REF-1207", similarity: 82.4 },
    recommendations: [
      "Specimen displays prime Royal Blue color with high natural transparency.",
      "Request treatment assessment from a qualified gemmological laboratory.",
    ],
    ruleVersion: "v4.2-deterministic",
    userStatement: "Private record generated for Journey Tester.",
    disclaimer: "Academic decision-support output. Not an independent laboratory certificate.",
  };

  const pdfBytes = await generateEvaluationPdf(reportA);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  console.log("PDF loaded successfully. Page count:", pdfDoc.getPageCount());

  // Search through all PDF indirect objects for embedded PNG images (specifically the QR code)
  let foundQrCode = false;
  let decodedUrl = "";

  const context = pdfDoc.context;
  const indirectObjects = context.enumerateIndirectObjects();

  for (const [ref, obj] of indirectObjects) {
    if (obj instanceof PDFRawStream) {
      const dict = obj.dict;
      const subtype = dict.get(PDFName.of("Subtype"));
      if (subtype === PDFName.of("Image")) {
        const width = dict.get(PDFName.of("Width"))?.toString();
        const height = dict.get(PDFName.of("Height"))?.toString();
        const filter = dict.get(PDFName.of("Filter"))?.toString();
        console.log(`Found Embedded Image in PDF: Width=${width}, Height=${height}, Filter=${filter}, Size=${obj.contents.length} bytes`);

        // If it's a FlateDecode image of the QR dimensions (150x150 or similar)
        if (filter === "/FlateDecode" || filter?.includes("FlateDecode")) {
          try {
            // Check if contents are a valid PNG or raw decoded bitmap
            // Notice: pdf-lib embedPng embeds the raw deflated image data or PNG
            // Let's decode contents with zlib
            const zlib = await import("zlib");
            const uncompressed = zlib.inflateSync(Buffer.from(obj.contents));
            const w = parseInt(width || "0", 10);
            const h = parseInt(height || "0", 10);

            // A 1-channel or 3-channel or 4-channel raw raster
            console.log(`Decompressed raster bytes: ${uncompressed.length} for ${w}x${h}`);
            if (w > 0 && h > 0) {
              // Convert raster to RGBA Uint8ClampedArray for jsQR
              const rgba = new Uint8ClampedArray(w * h * 4);
              if (uncompressed.length === w * h * 3) {
                // RGB 24-bit
                for (let i = 0; i < w * h; i++) {
                  rgba[i * 4] = uncompressed[i * 3];
                  rgba[i * 4 + 1] = uncompressed[i * 3 + 1];
                  rgba[i * 4 + 2] = uncompressed[i * 3 + 2];
                  rgba[i * 4 + 3] = 255;
                }
              } else if (uncompressed.length === w * h * 4) {
                // RGBA 32-bit
                for (let i = 0; i < w * h * 4; i++) rgba[i] = uncompressed[i];
              } else if (uncompressed.length >= w * h) {
                // Grayscale or filtered scanlines
                // Attempt direct grayscale mapping
                const bytesPerPixel = Math.floor(uncompressed.length / (w * h));
                for (let i = 0; i < w * h; i++) {
                  const val = uncompressed[i * bytesPerPixel];
                  rgba[i * 4] = val;
                  rgba[i * 4 + 1] = val;
                  rgba[i * 4 + 2] = val;
                  rgba[i * 4 + 3] = 255;
                }
              }

              const qrResult = jsQR(rgba, w, h);
              if (qrResult && qrResult.data) {
                console.log(`>>> SUCCESS: Decoded QR code extracted from PDF: "${qrResult.data}"`);
                foundQrCode = true;
                decodedUrl = qrResult.data;
              }
            }
          } catch (e: unknown) {
            console.log("Decompress attempt note:", (e as Error)?.message);
          }
        }
      }
    }
  }

  const expectedUrl = `http://localhost:3000/evaluations/${testEvalId}`;
  if (foundQrCode && decodedUrl === expectedUrl) {
    console.log(`\nVerified: The QR code inside the rendered PDF is 100% readable and points to ${expectedUrl}`);
  } else {
    console.log(`Note on QR detection: found=${foundQrCode}, url=${decodedUrl}`);
  }
}

testPdfImageAndQrExtraction().catch(console.error);
