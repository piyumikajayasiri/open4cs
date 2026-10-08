import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

export async function generateEvaluationPdf(report: ReportData) {
  const pdf = await PDFDocument.create();

  let page = pdf.addPage([595.28, 841.89]);

  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const pageWidth = page.getWidth();

  let y = page.getHeight() - margin;

  function ensureSpace(requiredHeight = 50) {
    if (y - requiredHeight > margin) {
      return;
    }

    page = pdf.addPage([595.28, 841.89]);
    y = page.getHeight() - margin;
  }

  function heading(text: string) {
    ensureSpace(45);

    page.drawText(text, {
      x: margin,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0.05, 0.3, 0.22),
    });

    y -= 24;
  }

  function line(label: string, value: string) {
    ensureSpace(22);

    page.drawText(`${label}:`, {
      x: margin,
      y,
      size: 10,
      font: boldFont,
    });

    page.drawText(value, {
      x: margin + 160,
      y,
      size: 10,
      font: regularFont,
    });

    y -= 16;
  }

  function paragraph(text: string) {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;

      if (
        regularFont.widthOfTextAtSize(candidate, 10) >
        pageWidth - margin * 2
      ) {
        if (current) {
          lines.push(current);
        }
        current = word;
      } else {
        current = candidate;
      }
    }

    if (current) {
      lines.push(current);
    }

    for (const textLine of lines) {
      ensureSpace(18);

      page.drawText(textLine, {
        x: margin,
        y,
        size: 10,
        font: regularFont,
      });

      y -= 14;
    }

    y -= 6;
  }

  // Header Title
  page.drawText(report.reportTitle, {
    x: margin,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.05, 0.3, 0.22),
  });

  y -= 24;

  page.drawText("Educational Gemstone Evaluation & Price Suggestion Report", {
    x: margin,
    y,
    size: 10,
    font: regularFont,
    color: rgb(0.4, 0.45, 0.43),
  });

  y -= 16;

  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: rgb(0.85, 0.89, 0.87),
  });

  y -= 24;

  // Report Information
  heading("Report Information");
  line("Evaluation ID", report.evaluationId);
  line("Evaluation Date", formatDate(report.evaluationDate));
  line("Report Generated", formatDate(report.generatedAt));
  line("Rule Version", report.ruleVersion);

  y -= 10;

  // User Section
  heading("User");
  line("Name", report.user.name);
  line("Category", report.user.category);

  y -= 10;

  // Gemstone Basic Specs
  heading("Gemstone Overview");
  line("Variety", report.gemstone.variety);
  line("Carat Weight", `${formatNumber(report.gemstone.caratWeight)} ct`);

  y -= 10;

  // Color Observations
  heading("Color Observations");
  line("Main Color / Hue", formatValue(report.gemstone.color?.hue));
  line("Tone", formatValue(report.gemstone.color?.tone));
  line("Saturation", formatValue(report.gemstone.color?.saturation));
  line("Distribution", formatValue(report.gemstone.color?.distribution));
  line("Color Zoning", formatValue(report.gemstone.color?.zoning));

  y -= 10;

  // Clarity Observations
  heading("Clarity Observations");
  line("Naked-Eye Observation", formatValue(report.gemstone.clarity?.nakedEye));
  line("10x Loupe Observation", formatValue(report.gemstone.clarity?.loupe10x));
  line("Inclusion Type", formatValue(report.gemstone.clarity?.inclusionType));
  line("Inclusion Location", formatValue(report.gemstone.clarity?.inclusionLocation));
  line("Severity", formatValue(report.gemstone.clarity?.severity));

  y -= 10;

  // Cut & Measurements
  heading("Cut & Measurements");
  line("Length", formatMeasurement(report.gemstone.cut?.length));
  line("Width", formatMeasurement(report.gemstone.cut?.width));
  line("Depth", formatMeasurement(report.gemstone.cut?.depth));
  line("Symmetry", formatValue(report.gemstone.cut?.symmetry));
  line("Polish", formatValue(report.gemstone.cut?.polish));
  line("Windowing", formatValue(report.gemstone.cut?.windowing));
  line("Extinction", formatValue(report.gemstone.cut?.extinction));
  line("Bulging", formatValue(report.gemstone.cut?.bulging));

  y -= 10;

  // Treatment & Origin
  heading("Treatment & Origin");
  line("Treatment", formatValue(getNestedDisplayValue(report.gemstone.treatment)));
  line("Origin", formatValue(getNestedDisplayValue(report.gemstone.origin)));

  y -= 10;

  // Information Reliability
  heading("Information Reliability");
  line("Measurements", formatValue(report.gemstone.informationReliability?.measurements));
  line("Treatment Information", formatValue(report.gemstone.informationReliability?.treatment));
  line("Origin Information", formatValue(report.gemstone.informationReliability?.origin));
  paragraph(
    "These labels describe the reported source or reliability of the information. They do not mean that Open 4Cs independently verified the gemstone."
  );

  y -= 10;

  // 4C Evaluation Scores
  heading("4C Evaluation Scores");
  line("Overall 4C Score", `${formatNumber(report.scores.overall)} / 100`);
  line("Color", `${formatNumber(report.scores.color)} / 100`);
  line("Clarity", `${formatNumber(report.scores.clarity)} / 100`);
  line("Cut", `${formatNumber(report.scores.cut)} / 100`);
  line("Carat Weight", `${formatNumber(report.scores.carat)} / 100`);

  y -= 10;

  // Price Suggestion
  heading("Price Suggestion");
  if (
    report.priceSuggestion.available &&
    report.priceSuggestion.suggestedPrice != null &&
    report.priceSuggestion.currency
  ) {
    line(
      "Suggested B2B Price",
      formatMoney(
        report.priceSuggestion.suggestedPrice,
        report.priceSuggestion.currency
      )
    );

    if (
      report.priceSuggestion.minimumPrice != null &&
      report.priceSuggestion.maximumPrice != null
    ) {
      line(
        "Estimated Range",
        `${formatMoney(
          report.priceSuggestion.minimumPrice,
          report.priceSuggestion.currency
        )} - ${formatMoney(
          report.priceSuggestion.maximumPrice,
          report.priceSuggestion.currency
        )}`
      );
    }
  } else {
    paragraph("A price suggestion was not available for this evaluation.");
  }

  y -= 10;

  // Reference Comparison
  heading("Reference Comparison");
  if (
    report.referenceComparison.available &&
    report.referenceComparison.referenceName
  ) {
    line("Reference Specimen", report.referenceComparison.referenceName);

    if (report.referenceComparison.similarity != null) {
      line("Similarity", `${formatNumber(report.referenceComparison.similarity)}%`);
    }
  } else {
    paragraph("No suitable reference comparison was available.");
  }

  y -= 10;

  // Recommendations
  heading("Recommendations");
  if (report.recommendations.length > 0) {
    report.recommendations.forEach((recommendation, index) => {
      paragraph(`${index + 1}. ${recommendation}`);
    });
  } else {
    paragraph("No additional recommendations were generated.");
  }

  y -= 10;

  // User Statement
  heading("User Statement");
  paragraph(report.userStatement);

  y -= 10;

  // Important Notice
  heading("Important Notice");
  paragraph(report.disclaimer);

  // Add Page Numbers
  const pages = pdf.getPages();
  pages.forEach((currentPage, index) => {
    const pageNumber = `Page ${index + 1} of ${pages.length}`;
    currentPage.drawText(pageNumber, {
      x: currentPage.getWidth() - margin - 60,
      y: 25,
      size: 8,
      font: regularFont,
      color: rgb(0.4, 0.45, 0.43),
    });
  });

  return pdf.save();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getNestedDisplayValue(value: unknown): unknown {
  if (typeof value === "object" && value !== null) {
    const objectValue = value as Record<string, unknown>;
    return (
      objectValue.status ??
      objectValue.value ??
      objectValue.name ??
      "Not available"
    );
  }

  return value;
}

function formatMeasurement(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? `${formatNumber(value)} mm`
    : "Not available";
}

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2);
}

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number, currency: string) {
  return `${currency} ${value.toLocaleString("en", {
    maximumFractionDigits: 2,
  })}`;
}
