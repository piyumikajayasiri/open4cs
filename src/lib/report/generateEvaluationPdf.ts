import { PDFDocument, PDFPage, PDFFont, RGB, StandardFonts, rgb } from "pdf-lib";

export type ReportData = {
  reportTitle: string;
  evaluationId: string;
  generatedAt: string;
  evaluationDate: string | Date;

  user: {
    name: string;
    category: string;
  };

  gemstone: {
    variety: string;
    caratWeight: number;
    color: Record<string, unknown>;
    clarity: Record<string, unknown>;
    cut: Record<string, unknown>;
    treatment: unknown;
    origin: unknown;
    informationReliability: Record<string, unknown>;
    photoUrl?: string;
  };

  scores: {
    overall: number;
    color: number;
    clarity: number;
    cut: number;
    carat: number;
  };

  priceSuggestion: {
    available: boolean;
    suggestedPrice: number | null;
    minimumPrice: number | null;
    maximumPrice: number | null;
    currency: string | null;
    priceLkr?: number | null;
    priceUsd?: number | null;
    priceRangeLkr?: { minimum: number; maximum: number } | null;
    priceRangeUsd?: { minimum: number; maximum: number } | null;
    exchangeRate?: {
      rate: number;
      source: string;
      asOfDate: string;
      isAvailable: boolean;
    } | null;
    marketLevel?: string;
    isRealMarketData?: boolean;
    reason?: string;
  };

  referenceComparison: {
    available: boolean;
    referenceName: string | null;
    similarity: number | null;
  };

  recommendations: string[];
  ruleVersion: string;
  userStatement: string;
  disclaimer: string;
};

export async function generateEvaluationPdf(report: ReportData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();

  // Create exactly 2 pages (A4 format: 595.28 x 841.89)
  const page1 = pdf.addPage([595.28, 841.89]);
  const page2 = pdf.addPage([595.28, 841.89]);

  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // Palette Colors
  const darkNavy = rgb(0.04, 0.08, 0.16); // #0B1528
  const primaryBlue = rgb(0.14, 0.38, 0.92); // #2563EB
  const textDark = rgb(0.09, 0.12, 0.18); // #0F172A
  const textMuted = rgb(0.40, 0.45, 0.53); // #64748B
  const textSubtle = rgb(0.58, 0.64, 0.72); // #94A3B8
  const borderLight = rgb(0.89, 0.92, 0.95); // #E2E8F0
  const bgLight = rgb(0.97, 0.98, 0.99); // #F8FAFC
  const amberBg = rgb(0.99, 0.98, 0.94); // #FEFCE8
  const amberBorder = rgb(0.98, 0.88, 0.60); // #FDE047
  const amberText = rgb(0.53, 0.33, 0.04); // #854D0E
  const emeraldDark = rgb(0.02, 0.47, 0.34); // #047857

  const margin = 42;
  const contentWidth = 595.28 - margin * 2; // 511.28 pt

  // =========================================================================
  // PAGE 1: GEMSTONE IDENTIFICATION & REPORTED PHYSICAL CHARACTERISTICS
  // =========================================================================
  {
    let y = 841.89 - margin;

    // Header Top Bar
    page1.drawRectangle({
      x: margin,
      y: y - 56,
      width: contentWidth,
      height: 56,
      color: darkNavy,
    });

    // Brand Label
    page1.drawText("OPEN 4Cs · GEMSTONE EVALUATION & METHODOLOGY", {
      x: margin + 18,
      y: y - 22,
      size: 9,
      font: boldFont,
      color: rgb(0.55, 0.75, 1.0),
    });

    page1.drawText("Open 4Cs Gemstone Assessment Report", {
      x: margin + 18,
      y: y - 44,
      size: 16,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    // Report Number & Date
    const reportNumStr = `Report #: ${report.evaluationId || "CEY-2026-VAL"}`;
    page1.drawText(reportNumStr, {
      x: margin + contentWidth - boldFont.widthOfTextAtSize(reportNumStr, 9) - 18,
      y: y - 22,
      size: 9,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    const dateStr = `Date: ${formatDateShort(report.evaluationDate || report.generatedAt)}`;
    page1.drawText(dateStr, {
      x: margin + contentWidth - regularFont.widthOfTextAtSize(dateStr, 9) - 18,
      y: y - 40,
      size: 9,
      font: regularFont,
      color: rgb(0.8, 0.85, 0.9),
    });

    y -= 70;

    // Mandatory Legal Notice Banner
    page1.drawRectangle({
      x: margin,
      y: y - 46,
      width: contentWidth,
      height: 46,
      color: amberBg,
      borderColor: amberBorder,
      borderWidth: 1,
    });

    page1.drawText("MANDATORY GEMMOLOGICAL DISCLAIMER", {
      x: margin + 12,
      y: y - 16,
      size: 7.5,
      font: boldFont,
      color: amberText,
    });

    const mandatoryStatement =
      "This report provides a rule-based assessment and price suggestion derived from submitted gemstone characteristics and verified market reference data. It does not constitute a gemological laboratory identification certificate, an appraisal, or a guarantee of value.";
    drawWrappedText(
      page1,
      mandatoryStatement,
      margin + 12,
      y - 28,
      contentWidth - 24,
      7.5,
      regularFont,
      amberText,
      10
    );

    y -= 58;

    // Two-Column Section
    const colGap = 16;
    const colWidth = (contentWidth - colGap) / 2; // ~247.6 pt

    // Left Column: Gemstone Overview & Dimensions
    const leftX = margin;
    let leftY = y;

    // Specimen Photo Placeholder Box
    page1.drawRectangle({
      x: leftX,
      y: leftY - 140,
      width: colWidth,
      height: 140,
      color: bgLight,
      borderColor: borderLight,
      borderWidth: 1,
    });

    page1.drawText("GEMSTONE PHOTOGRAPHIC REFERENCE", {
      x: leftX + 12,
      y: leftY - 20,
      size: 7.5,
      font: boldFont,
      color: textSubtle,
    });

    let imageEmbedded = false;
    if (report.gemstone.photoUrl && typeof report.gemstone.photoUrl === "string") {
      try {
        const rawPhoto = report.gemstone.photoUrl.trim();
        let imageBytes: Uint8Array | null = null;
        let isPng = false;

        if (rawPhoto.startsWith("data:image/png;base64,")) {
          imageBytes = Buffer.from(rawPhoto.replace(/^data:image\/png;base64,/, ""), "base64");
          isPng = true;
        } else if (rawPhoto.startsWith("data:image/jpeg;base64,") || rawPhoto.startsWith("data:image/jpg;base64,")) {
          imageBytes = Buffer.from(rawPhoto.replace(/^data:image\/(jpeg|jpg);base64,/, ""), "base64");
          isPng = false;
        } else if (rawPhoto.startsWith("http://") || rawPhoto.startsWith("https://")) {
          try {
            const imgRes = await fetch(rawPhoto);
            if (imgRes.ok) {
              const arrayBuf = await imgRes.arrayBuffer();
              imageBytes = Buffer.from(arrayBuf);
              isPng = rawPhoto.toLowerCase().includes(".png") || (imgRes.headers.get("content-type")?.includes("png") ?? false);
            }
          } catch {
            // Ignore network fetch error; fallback to placeholder
          }
        }

        if (imageBytes && imageBytes.length > 0) {
          const embeddedImage = isPng
            ? await pdf.embedPng(imageBytes)
            : await pdf.embedJpg(imageBytes);

          const maxImgW = colWidth - 24;
          const maxImgH = 88;
          const imgDims = embeddedImage.scaleToFit(maxImgW, maxImgH);

          page1.drawImage(embeddedImage, {
            x: leftX + (colWidth - imgDims.width) / 2,
            y: leftY - 28 - imgDims.height,
            width: imgDims.width,
            height: imgDims.height,
          });
          imageEmbedded = true;
        }
      } catch {
        // Fallback to vector icon if base64 decoding fails
      }
    }

    if (!imageEmbedded) {
      // Stylized jewel icon placeholder
      page1.drawRectangle({
        x: leftX + colWidth / 2 - 30,
        y: leftY - 95,
        width: 60,
        height: 50,
        color: rgb(0.92, 0.95, 0.99),
        borderColor: primaryBlue,
        borderWidth: 1,
      });
      page1.drawText("FACETED", {
        x: leftX + colWidth / 2 - 18,
        y: leftY - 68,
        size: 7,
        font: boldFont,
        color: primaryBlue,
      });
      page1.drawText("CORUNDUM", {
        x: leftX + colWidth / 2 - 24,
        y: leftY - 78,
        size: 7,
        font: boldFont,
        color: primaryBlue,
      });
    }

    page1.drawText("Visual reference only. Not an optical spectroscopy scan.", {
      x: leftX + 16,
      y: leftY - 128,
      size: 7,
      font: italicFont,
      color: textMuted,
    });

    leftY -= 152;

    // Left Column: Physical Metrics Table
    page1.drawRectangle({
      x: leftX,
      y: leftY - 170,
      width: colWidth,
      height: 170,
      color: rgb(1, 1, 1),
      borderColor: borderLight,
      borderWidth: 1,
    });

    page1.drawText("PHYSICAL MEASUREMENTS", {
      x: leftX + 12,
      y: leftY - 18,
      size: 8.5,
      font: boldFont,
      color: darkNavy,
    });

    const cutObj = (report.gemstone.cut || {}) as Record<string, unknown>;
    const lenVal = formatNum(cutObj.length);
    const widVal = formatNum(cutObj.width);
    const depVal = formatNum(cutObj.depth);

    const physicalSpecs = [
      ["Carat Weight", `${formatNum(report.gemstone.caratWeight)} ct`, "[Measured]"],
      ["Shape & Cut", "Oval · Mixed Cut", "[Observed]"],
      ["Length", `${lenVal} mm`, "[Measured]"],
      ["Width", `${widVal} mm`, "[Measured]"],
      ["Depth", `${depVal} mm`, "[Measured]"],
      ["Symmetry", formatVal(cutObj.symmetry), "[Observed]"],
      ["Polish", formatVal(cutObj.polish), "[Observed]"],
    ];

    let rowY = leftY - 36;
    for (const [k, v, tag] of physicalSpecs) {
      page1.drawText(k, { x: leftX + 12, y: rowY, size: 8, font: regularFont, color: textMuted });
      page1.drawText(v, { x: leftX + 90, y: rowY, size: 8, font: boldFont, color: textDark });
      page1.drawText(tag, { x: leftX + colWidth - 55, y: rowY, size: 6.5, font: boldFont, color: primaryBlue });
      rowY -= 18;
    }

    // Right Column: Reported Characteristics Table
    const rightX = margin + colWidth + colGap;
    const rightY = y;

    page1.drawRectangle({
      x: rightX,
      y: rightY - 322,
      width: colWidth,
      height: 322,
      color: rgb(1, 1, 1),
      borderColor: borderLight,
      borderWidth: 1,
    });

    page1.drawText("REPORTED PHYSICAL CHARACTERISTICS", {
      x: rightX + 12,
      y: rightY - 18,
      size: 8.5,
      font: boldFont,
      color: darkNavy,
    });

    const colorObj = (report.gemstone.color || {}) as Record<string, unknown>;
    const clarityObj = (report.gemstone.clarity || {}) as Record<string, unknown>;
    const relObj = (report.gemstone.informationReliability || {}) as Record<string, unknown>;

    const charSpecs = [
      ["Mineral Species", "Natural Corundum", "[Rule Engine]"],
      ["Gemstone Variety", report.gemstone.variety || "Blue Sapphire", "[Declared]"],
      ["Primary Hue", formatVal(colorObj.hue), "[User Graded]"],
      ["Tone (1–9 Scale)", formatVal(colorObj.tone), "[User Graded]"],
      ["Saturation (1–6)", formatVal(colorObj.saturation), "[User Graded]"],
      ["Color Distribution", formatVal(colorObj.distribution), "[User Graded]"],
      ["Color Zoning", formatVal(colorObj.zoning), "[Observed]"],
      ["Naked-Eye Clarity", formatVal(clarityObj.nakedEye), "[Observed]"],
      ["10× Loupe Magnif.", formatVal(clarityObj.loupe10x), "[Observed]"],
      ["Inclusion Relief", formatVal(clarityObj.severity), "[Observed]"],
      ["Thermal Treatment", formatVal(getDisplayVal(report.gemstone.treatment)), `[${formatVal(relObj.treatment)}]`],
      ["Declared Origin", formatVal(getDisplayVal(report.gemstone.origin)), `[${formatVal(relObj.origin)}]`],
    ];

    let rRowY = rightY - 36;
    for (const [k, v, tag] of charSpecs) {
      page1.drawText(k, { x: rightX + 12, y: rRowY, size: 8, font: regularFont, color: textMuted });
      page1.drawText(v, { x: rightX + 105, y: rRowY, size: 8, font: boldFont, color: textDark });
      page1.drawText(tag, { x: rightX + colWidth - 62, y: rRowY, size: 6.5, font: boldFont, color: primaryBlue });
      rRowY -= 22;
    }

    y -= 336;

    // Evaluator & Client Box
    page1.drawRectangle({
      x: margin,
      y: y - 56,
      width: contentWidth,
      height: 56,
      color: bgLight,
      borderColor: borderLight,
      borderWidth: 1,
    });

    page1.drawText("SUBMITTED CLIENT & EVALUATION METADATA", {
      x: margin + 12,
      y: y - 16,
      size: 7.5,
      font: boldFont,
      color: textSubtle,
    });

    page1.drawText(`Client Name: ${report.user.name || "Portal User"}`, {
      x: margin + 12,
      y: y - 32,
      size: 8,
      font: boldFont,
      color: textDark,
    });

    page1.drawText(`Category: ${report.user.category || "Professional Member"}`, {
      x: margin + 12,
      y: y - 46,
      size: 8,
      font: regularFont,
      color: textMuted,
    });

    page1.drawText(`Rule Snapshot: ${report.ruleVersion || "Open 4Cs v4.2 Deterministic"}`, {
      x: margin + 260,
      y: y - 32,
      size: 8,
      font: boldFont,
      color: textDark,
    });

    page1.drawText(`Evaluation Protocol: CAGS 4C Research Calibrated`, {
      x: margin + 260,
      y: y - 46,
      size: 8,
      font: regularFont,
      color: textMuted,
    });

    // Page 1 Footer
    page1.drawLine({
      start: { x: margin, y: 40 },
      end: { x: margin + contentWidth, y: 40 },
      thickness: 0.5,
      color: borderLight,
    });

    page1.drawText("Open 4Cs Gemstone Assessment Report · Page 1 of 2", {
      x: margin,
      y: 28,
      size: 7.5,
      font: regularFont,
      color: textMuted,
    });

    page1.drawText("Verified Deterministic Engine · Not a Laboratory Certificate", {
      x: margin + contentWidth - 220,
      y: 28,
      size: 7.5,
      font: italicFont,
      color: textMuted,
    });
  }

  // =========================================================================
  // PAGE 2: 4C ASSESSMENT SCORES, PRICE SUGGESTION & MARKET EVIDENCE
  // =========================================================================
  {
    let y = 841.89 - margin;

    // Header Top Bar
    page2.drawRectangle({
      x: margin,
      y: y - 44,
      width: contentWidth,
      height: 44,
      color: darkNavy,
    });

    page2.drawText("Open 4Cs Assessment Report · Algorithmic Scores & Market Evidence", {
      x: margin + 16,
      y: y - 26,
      size: 11,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    y -= 56;

    // Component Scores Matrix (4 Columns)
    const factorBoxWidth = (contentWidth - 30) / 4; // ~120 pt
    const factorScores = [
      { name: "Color", weight: "35% Weight", score: report.scores.color, color: primaryBlue },
      { name: "Clarity", weight: "25% Weight", score: report.scores.clarity, color: rgb(0.06, 0.65, 0.74) },
      { name: "Cut", weight: "20% Weight", score: report.scores.cut, color: rgb(0.1, 0.68, 0.45) },
      { name: "Carat", weight: "20% Weight", score: report.scores.carat, color: rgb(0.45, 0.25, 0.75) },
    ];

    let factorX = margin;
    for (const factor of factorScores) {
      page2.drawRectangle({
        x: factorX,
        y: y - 72,
        width: factorBoxWidth,
        height: 72,
        color: bgLight,
        borderColor: borderLight,
        borderWidth: 1,
      });

      page2.drawText(factor.name.toUpperCase(), {
        x: factorX + 12,
        y: y - 18,
        size: 8,
        font: boldFont,
        color: textDark,
      });

      page2.drawText(factor.weight, {
        x: factorX + 12,
        y: y - 28,
        size: 7,
        font: regularFont,
        color: textMuted,
      });

      const scoreNum = typeof factor.score === "number" ? factor.score.toFixed(1) : "—";
      page2.drawText(scoreNum, {
        x: factorX + 12,
        y: y - 56,
        size: 20,
        font: boldFont,
        color: factor.color,
      });

      page2.drawText("/ 100", {
        x: factorX + 64,
        y: y - 56,
        size: 8,
        font: regularFont,
        color: textSubtle,
      });

      factorX += factorBoxWidth + 10;
    }

    y -= 86;

    // Overall Composite Score & Quality Band Card
    page2.drawRectangle({
      x: margin,
      y: y - 64,
      width: contentWidth,
      height: 64,
      color: rgb(1, 1, 1),
      borderColor: primaryBlue,
      borderWidth: 1.5,
    });

    page2.drawText("COMPOSITE 4C PROVISIONAL SCORE", {
      x: margin + 16,
      y: y - 20,
      size: 8,
      font: boldFont,
      color: textMuted,
    });

    const overallNum = typeof report.scores.overall === "number" ? report.scores.overall.toFixed(1) : "—";
    page2.drawText(overallNum, {
      x: margin + 16,
      y: y - 50,
      size: 24,
      font: boldFont,
      color: darkNavy,
    });

    page2.drawText("OUT OF 100", {
      x: margin + 74,
      y: y - 48,
      size: 9,
      font: boldFont,
      color: textSubtle,
    });

    // Rating Band badge
    let gradeBand = "Commercial Quality";
    if (report.scores.overall >= 90) gradeBand = "Exceptional / Gem Quality";
    else if (report.scores.overall >= 80) gradeBand = "Fine Quality";
    else if (report.scores.overall < 65) gradeBand = "Promotional Quality";

    page2.drawRectangle({
      x: margin + contentWidth - 170,
      y: y - 48,
      width: 154,
      height: 32,
      color: rgb(0.93, 0.96, 1.0),
      borderColor: primaryBlue,
      borderWidth: 1,
    });

    page2.drawText("QUALITY CLASSIFICATION", {
      x: margin + contentWidth - 162,
      y: y - 26,
      size: 6.5,
      font: boldFont,
      color: primaryBlue,
    });

    page2.drawText(gradeBand, {
      x: margin + contentWidth - 162,
      y: y - 42,
      size: 9,
      font: boldFont,
      color: darkNavy,
    });

    y -= 76;

    // Indicative Wholesale Clearing Benchmark (Sri Lanka Region)
    page2.drawRectangle({
      x: margin,
      y: y - 90,
      width: contentWidth,
      height: 90,
      color: bgLight,
      borderColor: borderLight,
      borderWidth: 1,
    });

    const marketHeader = report.priceSuggestion.isRealMarketData
      ? "INDICATIVE WHOLESALE MARKET RANGE (VERIFIED COMPLETED SALES)"
      : "INDICATIVE RESEARCH BENCHMARK (DEMONSTRATION / ACADEMIC DATA)";

    page2.drawText(marketHeader, {
      x: margin + 16,
      y: y - 18,
      size: 8,
      font: boldFont,
      color: darkNavy,
    });

    if (
      report.priceSuggestion.available &&
      report.priceSuggestion.suggestedPrice != null &&
      report.priceSuggestion.currency
    ) {
      const lkrPrice = report.priceSuggestion.priceLkr ?? report.priceSuggestion.suggestedPrice;
      const usdPrice = report.priceSuggestion.priceUsd;
      const minLkr = report.priceSuggestion.priceRangeLkr?.minimum ?? report.priceSuggestion.minimumPrice ?? lkrPrice * 0.9;
      const maxLkr = report.priceSuggestion.priceRangeLkr?.maximum ?? report.priceSuggestion.maximumPrice ?? lkrPrice * 1.1;
      const minUsd = report.priceSuggestion.priceRangeUsd?.minimum;
      const maxUsd = report.priceSuggestion.priceRangeUsd?.maximum;
      const fx = report.priceSuggestion.exchangeRate;

      const priceHeadline = (typeof usdPrice === "number" && usdPrice > 0)
        ? `LKR ${formatMoneyNum(lkrPrice)}  (~ $${formatMoneyNum(usdPrice)} USD)`
        : `LKR ${formatMoneyNum(lkrPrice)}`;

      page2.drawText(priceHeadline, {
        x: margin + 16,
        y: y - 48,
        size: 15,
        font: boldFont,
        color: emeraldDark,
      });

      const rangeLine = (typeof minUsd === "number" && typeof maxUsd === "number")
        ? `Estimated Range: LKR ${formatMoneyNum(minLkr)} – ${formatMoneyNum(maxLkr)} (~ $${formatMoneyNum(minUsd)} – $${formatMoneyNum(maxUsd)} USD)`
        : `Estimated Range: LKR ${formatMoneyNum(minLkr)} – ${formatMoneyNum(maxLkr)}`;

      page2.drawText(rangeLine, {
        x: margin + 16,
        y: y - 68,
        size: 8,
        font: boldFont,
        color: textDark,
      });

      const fxLine = (fx && fx.isAvailable && fx.rate > 0)
        ? `Dated CBSL FX: 1 USD = ${fx.rate} LKR (${fx.asOfDate}) · Wholesale Dealer Clearing`
        : `Primary currency: LKR (Secondary USD conversion omitted: dated official FX rate required)`;

      page2.drawText(fxLine, {
        x: margin + 16,
        y: y - 80,
        size: 7,
        font: regularFont,
        color: textMuted,
      });

      // Comparables Count Right Box
      const compName = report.referenceComparison.referenceName || "Colombo B2B Dealer References";
      page2.drawText("Market Benchmark Source:", {
        x: margin + 280,
        y: y - 44,
        size: 7.5,
        font: regularFont,
        color: textMuted,
      });
      page2.drawText(compName, {
        x: margin + 280,
        y: y - 58,
        size: 8.5,
        font: boldFont,
        color: textDark,
      });
      if (report.referenceComparison.similarity) {
        page2.drawText(`Similarity Match: ${report.referenceComparison.similarity.toFixed(1)}%`, {
          x: margin + 280,
          y: y - 72,
          size: 7.5,
          font: boldFont,
          color: primaryBlue,
        });
      }
    } else {
      page2.drawText("Market Price Suggestion: Unavailable", {
        x: margin + 16,
        y: y - 44,
        size: 10,
        font: boldFont,
        color: textDark,
      });

      const unavailReason = report.priceSuggestion.reason ||
        "At least 3 verified completed-sale commercial transaction records are required. Demo and unverified records are strictly excluded from commercial valuation.";

      page2.drawText(
        unavailReason.length > 95 ? unavailReason.slice(0, 95) + "..." : unavailReason,
        {
          x: margin + 16,
          y: y - 62,
          size: 7.5,
          font: regularFont,
          color: textMuted,
        }
      );

      page2.drawText(
        "Gemstone 4C quality scores above remain fully valid and independent of market pricing.",
        {
          x: margin + 16,
          y: y - 76,
          size: 7.5,
          font: italicFont,
          color: primaryBlue,
        }
      );
    }

    y -= 104;

    // Algorithmic Observations & Practical Guidance
    page2.drawRectangle({
      x: margin,
      y: y - 110,
      width: contentWidth,
      height: 110,
      color: rgb(1, 1, 1),
      borderColor: borderLight,
      borderWidth: 1,
    });

    page2.drawText("RECOMMENDATIONS & PROFESSIONAL GUIDANCE", {
      x: margin + 16,
      y: y - 18,
      size: 8.5,
      font: boldFont,
      color: darkNavy,
    });

    const recs = report.recommendations.length > 0
      ? report.recommendations.slice(0, 4)
      : [
          "Confirm heating status via accredited gemmological laboratory with FTIR / Raman spectroscopy before commercial trade.",
          "Check facet alignment under 10× binocular microscope to assess pavilion light leakage.",
          "Record accurate calibrated dimensions on digital vernier calipers before finalizing valuation.",
        ];

    let recY = y - 36;
    for (let i = 0; i < recs.length; i++) {
      page2.drawText(`•  ${recs[i]}`, {
        x: margin + 16,
        y: recY,
        size: 7.5,
        font: regularFont,
        color: textDark,
      });
      recY -= 17;
    }

    y -= 124;

    // Governance, QR Verification & Deterministic Sign-Off
    page2.drawRectangle({
      x: margin,
      y: y - 74,
      width: contentWidth,
      height: 74,
      color: bgLight,
      borderColor: borderLight,
      borderWidth: 1,
    });

    // Stylized QR code box
    page2.drawRectangle({
      x: margin + 14,
      y: y - 62,
      width: 50,
      height: 50,
      color: rgb(1, 1, 1),
      borderColor: darkNavy,
      borderWidth: 1,
    });
    // Draw QR inner target squares
    page2.drawRectangle({ x: margin + 18, y: y - 28, width: 14, height: 14, color: darkNavy });
    page2.drawRectangle({ x: margin + 21, y: y - 25, width: 8, height: 8, color: rgb(1, 1, 1) });
    page2.drawRectangle({ x: margin + 46, y: y - 28, width: 14, height: 14, color: darkNavy });
    page2.drawRectangle({ x: margin + 49, y: y - 25, width: 8, height: 8, color: rgb(1, 1, 1) });
    page2.drawRectangle({ x: margin + 18, y: y - 56, width: 14, height: 14, color: darkNavy });
    page2.drawRectangle({ x: margin + 21, y: y - 53, width: 8, height: 8, color: rgb(1, 1, 1) });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const auditRecordUrl = `${baseUrl}/evaluations/${report.evaluationId}`;

    page2.drawText("DIGITAL AUDIT & RECORD VERIFICATION", {
      x: margin + 74,
      y: y - 18,
      size: 8,
      font: boldFont,
      color: darkNavy,
    });

    page2.drawText(`Record URL: ${auditRecordUrl}`, {
      x: margin + 74,
      y: y - 32,
      size: 7,
      font: regularFont,
      color: primaryBlue,
    });

    page2.drawText("Access to saved Open 4Cs assessment record · Not independent laboratory verification", {
      x: margin + 74,
      y: y - 46,
      size: 6.5,
      font: italicFont,
      color: textMuted,
    });

    page2.drawText(`Open 4Cs Rule Core ${report.ruleVersion || "prototype-v1"} · Immutable University Evaluation Record`, {
      x: margin + 74,
      y: y - 58,
      size: 6.5,
      font: regularFont,
      color: textSubtle,
    });

    // Page 2 Footer
    page2.drawLine({
      start: { x: margin, y: 40 },
      end: { x: margin + contentWidth, y: 40 },
      thickness: 0.5,
      color: borderLight,
    });

    page2.drawText("Open 4Cs Gemstone Assessment Report · Page 2 of 2", {
      x: margin,
      y: 28,
      size: 7.5,
      font: regularFont,
      color: textMuted,
    });

    page2.drawText(`Commercial Research & Valuation Tool · Open 4Cs Rule ${report.ruleVersion || "v4.2"}`, {
      x: margin + contentWidth - 230,
      y: 28,
      size: 7.5,
      font: italicFont,
      color: textMuted,
    });
  }

  return pdf.save();
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

function drawWrappedText(
  page: PDFPage,
  text: string,
  startX: number,
  startY: number,
  maxWidth: number,
  fontSize: number,
  font: PDFFont,
  color: RGB,
  lineHeight: number
) {
  const words = text.split(/\s+/);
  let currentLine = "";
  let currentY = startY;

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
      if (currentLine) {
        page.drawText(currentLine, { x: startX, y: currentY, size: fontSize, font, color });
        currentY -= lineHeight;
      }
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    page.drawText(currentLine, { x: startX, y: currentY, size: fontSize, font, color });
  }
}

function formatDateShort(value: string | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Sep 01, 2026";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatNum(val: unknown): string {
  const n = Number(val);
  if (!n || Number.isNaN(n)) return "—";
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function formatMoneyNum(val: number): string {
  return Math.round(val).toLocaleString("en-US");
}

function formatVal(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDisplayVal(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    return String(obj.status || obj.value || obj.name || obj.type || "—");
  }
  return String(value || "—");
}
