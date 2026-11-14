import fs from "fs";
import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import jsQR from "jsqr";
import zlib from "zlib";

async function checkPdf(filePath: string) {
  const bytes = fs.readFileSync(filePath);
  const doc = await PDFDocument.load(bytes);
  console.log(`\nVerifying ${filePath}:`);
  console.log(`  Page count: ${doc.getPageCount()} (Enforced 2 pages: ${doc.getPageCount() === 2})`);
  console.log(`  File size: ${bytes.length} bytes`);
  
  let foundQr = false;
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream) {
      const dict = obj.dict;
      if (dict.get(PDFName.of("Subtype")) === PDFName.of("Image")) {
        const w = parseInt(dict.get(PDFName.of("Width"))?.toString() || "0", 10);
        const h = parseInt(dict.get(PDFName.of("Height"))?.toString() || "0", 10);
        if (w === 150 && h === 150) {
          const uncompressed = zlib.inflateSync(Buffer.from(obj.contents));
          const rgba = new Uint8ClampedArray(w * h * 4);
          for (let i = 0; i < w * h; i++) {
            rgba[i * 4] = uncompressed[i * 3];
            rgba[i * 4 + 1] = uncompressed[i * 3 + 1];
            rgba[i * 4 + 2] = uncompressed[i * 3 + 2];
            rgba[i * 4 + 3] = 255;
          }
          const qr = jsQR(rgba, w, h);
          console.log(`  ✓ Decoded embedded QR URL: "${qr?.data}"`);
          foundQr = true;
        }
      }
    }
  }
  if (!foundQr) {
    console.log("  ⚠️ No 150x150 QR image stream found.");
  }
}

async function main() {
  await checkPdf("sample-reports/sample-report-scenario-a.pdf");
  await checkPdf("sample-reports/sample-report-scenario-b.pdf");
  await checkPdf("sample-reports/sample-report-scenario-c.pdf");
}

main().catch(console.error);
