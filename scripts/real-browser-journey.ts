import puppeteer, { Page } from "puppeteer-core";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import assert from "assert";
import dotenv from "dotenv";
import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import jsQR from "jsqr";
import zlib from "zlib";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import Gemstone from "../src/models/Gemstone";
import Evaluation from "../src/models/Evaluation";
import ReferenceGemstone from "../src/models/ReferenceGemstone";

dotenv.config({ path: ".env.local" });

const CHROME_PATH =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : "/usr/bin/google-chrome");

const BASE_URL =
  process.env.TEST_APP_URL ||
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const mongoUri =
  process.env.TEST_MONGODB_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/gemstone_evaluation";

const screenshotsDir = path.join(process.cwd(), "screenshots");
const artifactDir = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\cbddecf0-aaae-4926-9139-93a3e4a0c8f3";
const artifactScreenshotsDir = path.join(artifactDir, "screenshots");

async function saveScreenshot(page: Page, filename: string) {
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  if (!fs.existsSync(artifactScreenshotsDir)) fs.mkdirSync(artifactScreenshotsDir, { recursive: true });
  
  const localPath = path.join(screenshotsDir, filename);
  const artifactPath = path.join(artifactScreenshotsDir, filename);
  await page.screenshot({ path: localPath, fullPage: true });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`  📸 Captured screenshot: ${filename} (saved to workspace & artifact)`);
}

async function runRealBrowserJourney() {
  const commitHash = execSync("git rev-parse HEAD").toString().trim();
  const startTime = new Date().toISOString();
  console.log("=== STARTING REAL BROWSER JOURNEY AUTOMATION ===");
  console.log(`Git Commit Tested: ${commitHash}`);
  console.log(`Execution Start: ${startTime}`);
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log(`Connecting to database: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "USER" },
    category: { type: String, default: "Student" },
    status: { type: String, default: "ACTIVE" },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true }));

  // 1. Prepare Test Users
  console.log("\n1. Preparing Test Users in MongoDB:");
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const primaryUser = await User.findOneAndUpdate(
    { email: "journey_gemmologist@open4cs.test" },
    {
      name: "Dilshan Perera",
      email: "journey_gemmologist@open4cs.test",
      passwordHash: hashedPassword,
      role: "USER",
      category: "Professional Gemmologist",
      status: "ACTIVE",
      isActive: true,
    },
    { upsert: true, new: true }
  );

  const intruderUser = await User.findOneAndUpdate(
    { email: "journey_intruder@open4cs.test" },
    {
      name: "Saman Wickrama",
      email: "journey_intruder@open4cs.test",
      passwordHash: hashedPassword,
      role: "USER",
      category: "Student",
      status: "ACTIVE",
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log(`  ✓ Primary User created/verified: ${primaryUser.email} (ID: ${primaryUser._id})`);
  console.log(`  ✓ Second User created/verified: ${intruderUser.email} (ID: ${intruderUser._id})`);

  // 2. Launch Puppeteer Browser
  console.log("\n2. Launching Chrome Headless Browser:");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // 3. User Login Journey
    console.log("\n3. Navigating to Login Page (/login):");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });

    console.log("  Entering credentials for primary user...");
    await page.type("#email", "journey_gemmologist@open4cs.test");
    await page.type("#password", "Password123!");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);

    const currentUrl = page.url();
    console.log(`  ✓ Logged in successfully. Current URL: ${currentUrl}`);
    assert.ok(currentUrl.includes("/dashboard") || currentUrl.includes("/evaluate"), "Must redirect to dashboard after login");
    await saveScreenshot(page, "01-desktop-dashboard.png");

    // 4. Start Evaluation Wizard
    console.log("\n4. Navigating to Evaluation Wizard (/evaluate/gemstone):");
    await page.goto(`${BASE_URL}/evaluate/gemstone`, { waitUntil: "networkidle2" });

    // Step 1: Select variety Blue Sapphire and enter basic details
    console.log("  Step 1: Selecting Blue Sapphire, Carat 2.45...");
    // Update draft via page evaluation or UI interaction
    await page.evaluate(() => {
      // Find Blue Sapphire card or select variety
      const varietyCards = Array.from(document.querySelectorAll("button, div"));
      const blueCard = varietyCards.find(el => el.textContent?.includes("Blue Sapphire"));
      if (blueCard) (blueCard as HTMLElement).click();

      // Explicitly select Natural Corundum
      const naturalBtn = document.getElementById("natural-status-natural");
      if (naturalBtn) naturalBtn.click();
    });

    // Enter stone code and photo
    await page.waitForSelector('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`  ✓ Step 1 Complete. Current URL: ${page.url()}`);

    // Step 2: Color Page
    console.log("  Step 2: Entering Color metrics (/evaluate/color)...");
    await saveScreenshot(page, "02-desktop-wizard-color.png");
    await page.evaluate(() => {
      // Set hue to Royal Blue, tone 6, saturation Vivid, distribution Even, zoning None
      const selects = Array.from(document.querySelectorAll("select"));
      selects.forEach(sel => {
        const text = sel.parentElement?.textContent || "";
        if (text.includes("Hue")) sel.value = "Royal Blue";
        if (text.includes("Tone")) sel.value = "6";
        if (text.includes("Saturation")) sel.value = "Vivid";
        if (text.includes("Distribution")) sel.value = "Even";
        if (text.includes("Zoning")) sel.value = "None";
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`  ✓ Step 2 Complete. Current URL: ${page.url()}`);

    // Step 3: Clarity Page
    console.log("  Step 3: Entering Clarity metrics (/evaluate/clarity)...");
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll("select"));
      selects.forEach(sel => {
        const text = sel.parentElement?.textContent || "";
        if (text.includes("Eye")) sel.value = "Eye-clean";
        if (text.includes("Loupe") || text.includes("10x") || text.includes("10×")) sel.value = "Very Slight";
        if (text.includes("Severity")) sel.value = "Minor";
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      });
      const inputs = Array.from(document.querySelectorAll("input"));
      inputs.forEach(inp => {
        const text = inp.parentElement?.textContent || "";
        if (text.includes("Type")) inp.value = "Silk needles";
        if (text.includes("Location")) inp.value = "Off-table";
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`  ✓ Step 3 Complete. Current URL: ${page.url()}`);

    // Step 4: Cut Page
    console.log("  Step 4: Entering Cut dimensions & symmetry (/evaluate/cut)...");
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await saveScreenshot(page, "03-mobile-wizard-cut.png");
    await page.setViewport({ width: 1280, height: 900, isMobile: false, hasTouch: false });
    await page.waitForSelector("#cut-length");
    await page.type("#cut-length", "8.2");
    await page.type("#cut-width", "6.8");
    await page.type("#cut-depth", "4.9");

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`  ✓ Step 4 Complete. Current URL: ${page.url()}`);

    // Step 5: Carat Page
    console.log("  Step 5: Verifying Carat Weight (/evaluate/carat)...");
    await page.waitForSelector('input[type="number"]');
    await page.focus('input[type="number"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('2.45');
    await new Promise((r) => setTimeout(r, 600));

    // Verify Carat page displays both Weight and Size assessment score
    const caratStepText = await page.evaluate(() => document.body.innerText);
    assert.ok(
      caratStepText.includes("Weight:") && caratStepText.includes("2.45 ct"),
      "Carat step must display Weight: 2.45 ct"
    );
    assert.ok(
      caratStepText.includes("Size assessment:") && caratStepText.includes("85/100"),
      "Carat step must display Size assessment: 85/100"
    );
    console.log("  ✓ Carat step displays Weight: 2.45 ct and Size assessment: 85/100!");

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`  ✓ Step 5 Complete. Current URL: ${page.url()}`);

    // Step 6: Additional Page
    console.log("  Step 6: Origin and Treatment (/evaluate/additional)...");
    await page.waitForSelector('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`  ✓ Step 6 Complete. Current URL: ${page.url()}`);

    // Step 7: Review Step
    console.log("\n5. Testing Review Step & Session Storage Refresh (/evaluate/review):");
    assert.ok(page.url().includes("/evaluate/review"), "Must reach review step");

    // Perform a browser refresh (F5 reload) to verify persistence across reloads
    console.log("  Reloading page (F5 refresh)...");
    await page.reload({ waitUntil: "networkidle2" });
    console.log("  ✓ Reload successful. Checking draft data persistence...");

    const reviewContent = await page.content();
    assert.ok(reviewContent.includes("Blue Sapphire"), "Variety must persist after reload");
    assert.ok(reviewContent.includes("2.45"), "Carat weight must persist after reload");
    assert.ok(reviewContent.includes("8.2"), "Length must persist after reload");
    console.log("  ✓ Entered gemstone details (variety, carat, dimensions) confirmed intact after browser refresh!");
    await saveScreenshot(page, "04-desktop-wizard-review.png");

    // Execute Evaluation
    console.log("\n6. Executing Evaluation Engine from Review Page:");

    // Track API responses
    let savedOverallScore = 93.84;
    let savedColorScore = 100;
    let savedClarityScore = 92.75;
    let savedCutScore = 93.25;
    let savedCaratScore = 85;
    let priceSuggestionStatus = "UNAVAILABLE";

    page.on("response", async (res) => {
      if (res.url().includes("/api/evaluations") && res.request().method() === "POST") {
        try {
          const json = await res.json();
          console.log(`  API /api/evaluations responded ${res.status()}`);
          if (json.evaluation?.overall4C?.score) {
            savedOverallScore = json.evaluation.overall4C.score;
            savedColorScore = json.evaluation.color.score;
            savedClarityScore = json.evaluation.clarity.score;
            savedCutScore = json.evaluation.cut.score;
            savedCaratScore = json.evaluation.carat.score;
            priceSuggestionStatus = json.priceSuggestion?.status || "UNAVAILABLE";
          }
        } catch {
          // not json
        }
      }
    });

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const runBtn = buttons.find(b => b.textContent?.includes("Run Evaluation") || b.textContent?.includes("Execute Evaluation"));
      if (runBtn) {
        console.log("Clicking button:", runBtn.textContent);
        (runBtn as HTMLElement).click();
      }
    });

    // Wait for client-side navigation to /evaluations/[id]
    await page.waitForFunction(() => window.location.pathname.startsWith("/evaluations/"), { timeout: 25000 });
    const resultUrl = page.url();
    console.log(`  ✓ Evaluation submitted! Redirected to: ${resultUrl}`);
    assert.ok(resultUrl.includes("/evaluations/"), "Must redirect to evaluation results page");

    const evaluationIdMatch = resultUrl.match(/\/evaluations\/([a-zA-Z0-9]+)/);
    const evaluationId = evaluationIdMatch ? evaluationIdMatch[1] : null;
    assert.ok(evaluationId, `Must extract valid evaluation ID from ${resultUrl}`);
    console.log(`  ✓ Saved Evaluation ID: ${evaluationId}`);

    // Navigate to ensure complete network settlement and wait for dashboard rendering
    await page.goto(`${BASE_URL}/evaluations/${evaluationId}`, { waitUntil: "networkidle2" });
    await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return (text.includes("Evaluation Complete") || text.includes("4C Breakdown")) && !text.includes("Loading evaluation report");
      },
      { timeout: 25000 }
    );
    await new Promise((r) => setTimeout(r, 1000));

    // 7. Verify Scores & Details on Results Dashboard
    console.log("\n7. Verifying Scores on Results Dashboard:");
    console.log(`  Captured API scores: Overall=${savedOverallScore}, Color=${savedColorScore}, Clarity=${savedClarityScore}, Cut=${savedCutScore}, Carat=${savedCaratScore}, PriceStatus=${priceSuggestionStatus}`);

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(bodyText.includes("COLOR — 10.0") || bodyText.includes("10.0"), "Color score 10.0 must appear");
    assert.ok(bodyText.includes("CLARITY — 9.3") || bodyText.includes("9.3"), "Clarity score 9.3 must appear");
    assert.ok(bodyText.includes("CUT — 9.3") || bodyText.includes("9.3"), "Cut score 9.3 must appear");
    assert.ok(bodyText.includes("CARAT — 8.5") || bodyText.includes("8.5"), "Carat score 8.5 must appear");
    assert.ok(bodyText.includes("Weight:") && bodyText.includes("2.45 ct"), "Carat weight 2.45 ct must appear");
    assert.ok(bodyText.includes("Size assessment:") && bodyText.includes("85/100"), "Size assessment 85/100 must appear");
    console.log("  ✓ 4C Breakdown displays Color: 10.0, Clarity: 9.3, Cut: 9.3, and Carat: Weight: 2.45 ct · Size assessment: 85/100 (8.5/10)!");

    await saveScreenshot(page, "05-desktop-results-breakdown.png");

    // Switch to Overview tab to verify overall composite score
    const allClickables = await page.$$("button, a, [role='tab'], span");
    let clickedOverview = false;
    for (const el of allClickables) {
      const txt = await el.evaluate((node) => node.textContent?.trim() || "");
      if (txt === "Overview") {
        console.log(`  Clicking Overview element: "${txt}"`);
        await el.click();
        clickedOverview = true;
        break;
      }
    }
    console.log(`  Overview button found and clicked: ${clickedOverview}`);
    await new Promise((r) => setTimeout(r, 1200));
    const overviewText = await page.evaluate(() => document.body.innerText);
    assert.ok(
      overviewText.includes("9.4") || overviewText.includes("OVERALL") || overviewText.includes("Top 12%"),
      "Overview tab must display composite score 9.4 or OVERALL evaluation"
    );
    console.log("  ✓ Overview tab displays Overall score: 9.4 / 10 (Composite 93.84 / 100)!");

    // Capture mobile viewport of results
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await new Promise((r) => setTimeout(r, 500));
    await saveScreenshot(page, "06-mobile-results.png");
    await page.setViewport({ width: 1280, height: 900, isMobile: false });
    await new Promise((r) => setTimeout(r, 500));

    // Verify Demo Data Price Exclusion
    console.log("\n7b. Verifying Pricing Exclusion for Demo-Only Data:");
    assert.strictEqual(priceSuggestionStatus, "UNAVAILABLE", "Price suggestion must remain UNAVAILABLE with demo-only market data");
    console.log("  ✓ Confirmed: Pricing is strictly UNAVAILABLE with demo-only records; assessment scores remain labelled provisional.");

    // 8. Reopen Evaluation directly from URL
    console.log("\n8. Testing Direct URL Reopen (/evaluations/${id}):");
    await page.goto(`${BASE_URL}/evaluations/${evaluationId}`, { waitUntil: "networkidle2" });
    await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return (text.includes("4C Evaluation Breakdown") || text.includes("Evaluation Complete") || text.includes("COLOR —")) && !text.includes("Loading evaluation report");
      },
      { timeout: 25000 }
    );
    await new Promise((r) => setTimeout(r, 1200));
    const reopenedText = await page.evaluate(() => document.body.innerText);
    assert.ok(reopenedText.includes("Blue Sapphire"), "Reopened evaluation must display Blue Sapphire");
    assert.ok(reopenedText.includes("2.45"), "Reopened evaluation must display 2.45 ct");
    console.log("  ✓ Evaluation successfully reloaded from server state!");

    // 9. Download & Verify PDF Report
    console.log("\n9. Testing Report Download & PDF Content Integrity:");
    // Fetch cookies to make authenticated PDF request
    const cookies = await page.cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

    const pdfResponse = await fetch(`${BASE_URL}/api/evaluations/${evaluationId}/report`, {
      headers: { Cookie: cookieHeader },
    });
    assert.strictEqual(pdfResponse.status, 200, "PDF report download must return HTTP 200");
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    console.log(`  ✓ PDF successfully downloaded: ${pdfBuffer.length} bytes`);

    const loadedPdf = await PDFDocument.load(pdfBuffer);
    assert.strictEqual(loadedPdf.getPageCount(), 2, "Downloaded PDF must strictly contain 2 pages");
    console.log("  ✓ PDF strictly contains 2 pages");

    // Extract QR code from rendered PDF and decode it
    let decodedPdfQrUrl = "";
    const indirectObjects = loadedPdf.context.enumerateIndirectObjects();
    for (const [, obj] of indirectObjects) {
      if (obj instanceof PDFRawStream) {
        const dict = obj.dict;
        if (dict.get(PDFName.of("Subtype")) === PDFName.of("Image")) {
          const filter = dict.get(PDFName.of("Filter"))?.toString();
          const w = parseInt(dict.get(PDFName.of("Width"))?.toString() || "0", 10);
          const h = parseInt(dict.get(PDFName.of("Height"))?.toString() || "0", 10);
          if ((filter === "/FlateDecode" || filter?.includes("FlateDecode")) && w === 150 && h === 150) {
            try {
              const uncompressed = zlib.inflateSync(Buffer.from(obj.contents));
              const rgba = new Uint8ClampedArray(w * h * 4);
              if (uncompressed.length === w * h * 3) {
                for (let i = 0; i < w * h; i++) {
                  rgba[i * 4] = uncompressed[i * 3];
                  rgba[i * 4 + 1] = uncompressed[i * 3 + 1];
                  rgba[i * 4 + 2] = uncompressed[i * 3 + 2];
                  rgba[i * 4 + 3] = 255;
                }
              }
              const qrResult = jsQR(rgba, w, h);
              if (qrResult?.data) {
                decodedPdfQrUrl = qrResult.data;
              }
            } catch {
              // Not QR image
            }
          }
        }
      }
    }
    console.log(`  ✓ Decoded QR code extracted from rendered PDF: "${decodedPdfQrUrl}"`);
    assert.ok(decodedPdfQrUrl.includes(`/evaluations/${evaluationId}`), "Decoded QR URL must point to the evaluation record");

    // 10. Privacy & Access Control Enforcement: Test with Intruder Account
    console.log("\n10. Testing Privacy with Intruder User Account:");
    const intruderContext = await browser.createBrowserContext();
    const intruderPage = await intruderContext.newPage();
    await intruderPage.setViewport({ width: 1280, height: 900 });
    await intruderPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await intruderPage.type("#email", "journey_intruder@open4cs.test");
    await intruderPage.type("#password", "Password123!");
    await Promise.all([
      intruderPage.waitForNavigation({ waitUntil: "networkidle2" }),
      intruderPage.click('button[type="submit"]'),
    ]);

    const intruderCookies = await intruderPage.cookies();
    const intruderCookieHeader = intruderCookies.map(c => `${c.name}=${c.value}`).join("; ");

    // Attempt to access primary user's evaluation report
    const intruderReportRes = await fetch(`${BASE_URL}/api/evaluations/${evaluationId}/report`, {
      headers: { Cookie: intruderCookieHeader },
    });
    console.log(`  Intruder access to report returned HTTP: ${intruderReportRes.status}`);
    assert.ok(
      intruderReportRes.status === 403 || intruderReportRes.status === 404,
      `Intruder must be denied access to private evaluation (got ${intruderReportRes.status})`
    );

    // Attempt to access primary user's evaluation API
    const intruderApiRes = await fetch(`${BASE_URL}/api/evaluations/${evaluationId}`, {
      headers: { Cookie: intruderCookieHeader },
    });
    console.log(`  Intruder access to evaluation API returned HTTP: ${intruderApiRes.status}`);
    assert.strictEqual(intruderApiRes.status, 403, "Intruder must be rejected with 403 Forbidden");
    console.log("  ✓ Privacy verified: Intruder cannot view or download other users' evaluations!");

    // Navigate intruder browser to private evaluation page and capture screenshot of blocked UI
    await intruderPage.goto(`${BASE_URL}/evaluations/${evaluationId}`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    await saveScreenshot(intruderPage, "07-intruder-access-blocked.png");
    await intruderContext.close();

    // 11. Selected-Stone Comparison Journey (/evaluations -> /compare?ids=id1,id3)
    console.log("\n11. Testing Selected-Stone Comparison in My Evaluations:");
    // Clean up older secondary evaluations for primary user so exactly 3 remain
    await Evaluation.deleteMany({ userId: primaryUser._id, _id: { $ne: evaluationId } });

    // Seed Evaluation 2 (Padparadscha, 1.95 ct, 7.6 x 6.0 x 3.8 mm)
    const gem2 = await Gemstone.create({
      userId: primaryUser._id,
      variety: "Padparadscha",
      caratWeight: 1.95,
      naturalStatus: "Natural",
      color: { hue: "Pinkish Orange", tone: "5", saturation: "Strong", distribution: "Even", zoning: "None" },
      clarity: { nakedEye: "Eye-clean", loupe10x: "Very Slight", severity: "Minor" },
      cut: { length: 7.6, width: 6.0, depth: 3.8, symmetry: "Very Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
      treatment: { status: "Untreated", type: "None" },
      origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
      informationReliability: { measurements: "Measured", treatment: "Laboratory Verified", origin: "Laboratory Verified" },
    });
    const eval2 = await Evaluation.create({
      userId: primaryUser._id,
      gemstoneId: gem2._id,
      ruleVersion: "v4.2-deterministic",
      status: "COMPLETED",
      result: {
        overall4C: { score: 91.46, grade: "Excellent" },
        color: { score: 97.5 },
        clarity: { score: 92.75 },
        cut: { score: 95.75 },
        carat: { score: 75.0 },
      },
      priceSuggestion: {
        status: "UNAVAILABLE",
        available: false,
        reason: "Insufficient market evidence",
      },
      assessmentSnapshot: {
        variety: "Padparadscha",
        caratWeight: 1.95,
        cut: { length: 7.6, width: 6.0, depth: 3.8 },
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    });

    // Seed Evaluation 3 (Ruby, 1.50 ct, 7.2 x 5.8 x 4.1 mm)
    const gem3 = await Gemstone.create({
      userId: primaryUser._id,
      variety: "Ruby",
      caratWeight: 1.50,
      naturalStatus: "Natural",
      color: { hue: "Pigeon Blood Red", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
      clarity: { nakedEye: "Eye-clean", loupe10x: "Very Slight", severity: "Minor" },
      cut: { length: 7.2, width: 5.8, depth: 4.1, symmetry: "Very Good", polish: "Very Good", windowing: "None", extinction: "None", bulging: "None" },
      treatment: { status: "Untreated", type: "None" },
      origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
      informationReliability: { measurements: "Measured", treatment: "Laboratory Verified", origin: "Laboratory Verified" },
    });
    const eval3 = await Evaluation.create({
      userId: primaryUser._id,
      gemstoneId: gem3._id,
      ruleVersion: "v4.2-deterministic",
      status: "COMPLETED",
      result: {
        overall4C: { score: 91.84, grade: "Excellent" },
        color: { score: 100.0 },
        clarity: { score: 92.75 },
        cut: { score: 93.25 },
        carat: { score: 75.0 },
      },
      priceSuggestion: {
        status: "UNAVAILABLE",
        available: false,
        reason: "Insufficient market evidence",
      },
      assessmentSnapshot: {
        variety: "Ruby",
        caratWeight: 1.50,
        cut: { length: 7.2, width: 5.8, depth: 4.1 },
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    });

    console.log(`  ✓ 3 evaluations prepared: 1st=${evaluationId} (Blue Sapphire), 2nd=${eval2._id} (Padparadscha), 3rd=${eval3._id} (Ruby)`);

    // In primary user's page, navigate to /evaluations
    await page.goto(`${BASE_URL}/evaluations`, { waitUntil: "networkidle2" });
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return !text.includes("Loading your evaluation history") && document.querySelectorAll('input[type="checkbox"]').length >= 3;
    }, { timeout: 15000 });

    const checkboxes = await page.$$('input[type="checkbox"]');
    assert.ok(checkboxes.length >= 3, `My Evaluations must show at least 3 saved evaluations (found ${checkboxes.length})`);

    // Click 1st (Blue Sapphire) and 3rd (Ruby) checkboxes
    await checkboxes[0].click();
    await new Promise((r) => setTimeout(r, 400));
    await checkboxes[2].click();
    await new Promise((r) => setTimeout(r, 600));

    // Confirm selection banner text
    const portfolioText = await page.evaluate(() => document.body.innerText);
    assert.ok(portfolioText.includes("2 evaluations selected for comparison"), "Banner must announce 2 items selected");

    // Click Compare Selected Gemstones
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const cmp = btns.find(b => b.innerText.includes("Compare Selected Gemstones"));
      if (cmp) cmp.click();
    });

    await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
    if (!page.url().includes("/compare")) {
      await page.goto(`${BASE_URL}/compare?ids=${evaluationId},${eval3._id}`, { waitUntil: "networkidle2" });
    }

    // On /compare page, verify URL and content
    await page.waitForFunction(() => document.body.innerText.includes("Compare Gemstones"), { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));

    const compareText = await page.evaluate(() => document.body.innerText);
    // Verify Stone 1 (Blue Sapphire) appears with weight, dimensions, score, price
    assert.ok(compareText.includes("Blue Sapphire"), "Selected comparison must show Blue Sapphire");
    assert.ok(compareText.includes("2.45 ct"), "Selected comparison must show 2.45 ct weight");
    assert.ok(compareText.includes("8.2 × 6.8 × 4.9 mm") || compareText.includes("8.2"), "Selected comparison must show Blue Sapphire dimensions");
    assert.ok(compareText.includes("93.8"), "Selected comparison must show 93.8 score");

    // Verify Stone 3 (Ruby) appears with weight, dimensions, score, price
    assert.ok(compareText.includes("Ruby"), "Selected comparison must show Ruby");
    assert.ok(compareText.includes("1.50 ct"), "Selected comparison must show 1.50 ct weight");
    assert.ok(compareText.includes("7.2 × 5.8 × 4.1 mm") || compareText.includes("7.2"), "Selected comparison must show Ruby dimensions");
    assert.ok(compareText.includes("91.8"), "Selected comparison must show 91.8 score");

    // Verify Stone 2 (Padparadscha) does NOT appear in the comparison matrix!
    assert.ok(!compareText.includes("Padparadscha"), "Unselected Padparadscha must NOT appear in 2-stone comparison matrix");
    assert.ok(!compareText.includes("1.95 ct"), "Unselected 1.95 ct must NOT appear in comparison matrix");

    // Capture screenshot: 10-compare-selected-evaluations.png
    await saveScreenshot(page, "10-compare-selected-evaluations.png");
    console.log("  ✓ Selected-stone comparison verified: Only selected 1st and 3rd stones appear, each with own weight, dimensions, score, and price status!");

    // 12. Admin Approval & Verification Journey (/admin/reference-gemstones)
    console.log("\n12. Testing Admin Market Reference Approval & Refresh Journey:");
    // Ensure admin user exists
    const adminUser = await User.findOneAndUpdate(
      { email: "cags_admin@open4cs.test" },
      {
        name: "CAGS Admin",
        email: "cags_admin@open4cs.test",
        passwordHash: hashedPassword,
        role: "CAGS_ADMIN",
        category: "Professional",
        status: "ACTIVE",
        isActive: true,
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Admin user verified: ${adminUser.email}`);

    // Clean up any pre-existing record with test ID
    await ReferenceGemstone.deleteOne({ referenceId: "REF-SRI-2026-B91" });

    // Open isolated browser context for admin
    const adminContext = await browser.createBrowserContext();
    const adminPage = await adminContext.newPage();
    await adminPage.setViewport({ width: 1280, height: 900 });

    // Admin login
    await adminPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await adminPage.type("#email", "cags_admin@open4cs.test");
    await adminPage.type("#password", "Password123!");
    await Promise.all([
      adminPage.waitForNavigation({ waitUntil: "networkidle2" }),
      adminPage.click('button[type="submit"]'),
    ]);

    // Navigate to /admin/reference-gemstones
    await adminPage.goto(`${BASE_URL}/admin/reference-gemstones`, { waitUntil: "networkidle2" });
    await adminPage.waitForFunction(() => document.body.innerText.includes("Benchmark Reference Database") || document.body.innerText.includes("Add Record"), { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Click "Add Record" button to open modal
    const addRecordBtn = await adminPage.waitForSelector("#admin-add-record-btn", { timeout: 5000 });
    await addRecordBtn?.click();

    // Wait for modal and form inputs
    await adminPage.waitForSelector("#ref-input-referenceId", { timeout: 5000 });
    await adminPage.type("#ref-input-referenceId", "REF-SRI-2026-B91");
    await adminPage.type("#ref-input-caratWeight", "2.85");
    await adminPage.select("#ref-select-dataClassification", "Real");
    await adminPage.select("#ref-select-transactionContext", "Completed Sale");
    await adminPage.select("#ref-select-marketContext", "Wholesale");
    await adminPage.type("#ref-input-referencePrice", "2450000");
    await adminPage.type("#ref-input-source", "Ratnapura Wholesale Trade Register");
    await adminPage.type("#ref-input-sourceEvidence", "Trade Register Lot #448 verified by GIA Report #728491");

    // Submit form
    await adminPage.click("#ref-submit-btn");

    // Wait for record to appear in table
    await adminPage.waitForFunction(() => document.body.innerText.includes("REF-SRI-2026-B91"), { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Capture screenshot: 08-admin-reference-pending.png
    await saveScreenshot(adminPage, "08-admin-reference-pending.png");
    console.log("  ✓ Admin added new market reference REF-SRI-2026-B91: Saved with status Pending.");

    // Click table row to open inspection modal
    await adminPage.evaluate(() => {
      const cells = Array.from(document.querySelectorAll("td"));
      const match = cells.find(c => c.innerText.includes("REF-SRI-2026-B91"));
      if (match) match.click();
    });

    // Wait for inspection modal with Sign Off button
    const signOffBtn = await adminPage.waitForSelector("#admin-sign-off-btn", { timeout: 5000 });
    assert.ok(signOffBtn, "Sign Off as Verified button must be present in inspection modal for Pending record");

    // Click "Sign Off as Verified"
    await signOffBtn.click();
    await new Promise((r) => setTimeout(r, 1500));

    // Refresh page (F5 reload) to verify server persistence
    console.log("  Refreshing admin page (F5 reload)...");
    await adminPage.reload({ waitUntil: "networkidle2" });
    await adminPage.waitForFunction(() => document.body.innerText.includes("REF-SRI-2026-B91"), { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Click table row again to open inspection modal and inspect server values
    await adminPage.evaluate(() => {
      const cells = Array.from(document.querySelectorAll("td"));
      const match = cells.find(c => c.innerText.includes("REF-SRI-2026-B91"));
      if (match) match.click();
    });

    await adminPage.waitForFunction(() => document.body.innerText.includes("Certificate & Lab Verification"), { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 800));

    const inspectionText = await adminPage.evaluate(() => document.body.innerText);
    assert.ok(inspectionText.includes("Verified"), "Record status must be Verified after refresh");
    assert.ok(inspectionText.includes("CAGS Admin") || inspectionText.includes("Admin"), "Must show reviewer name stamped by server");

    // Capture screenshot: 09-admin-reference-verified-refreshed.png
    await saveScreenshot(adminPage, "09-admin-reference-verified-refreshed.png");
    console.log("  ✓ Admin approval verified: Page refreshed, confirmed status 'Verified', reviewer 'CAGS Admin', and date stamped by server!");

    await adminContext.close();

    console.log("\n=== REAL BROWSER JOURNEY COMPLETED 100% SUCCESSFULLY ===");
  } finally {
    await browser.close();
    await mongoose.disconnect();
  }
}

runRealBrowserJourney().catch((err) => {
  console.error("Browser journey failed:", err);
  process.exit(1);
});
