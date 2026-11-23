import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  calculateComparableReferencePrice,
  ComparableReferenceInput,
  CandidateGemstoneContext,
} from "@/lib/evaluation/comparablePrice";
import {
  compareWithReferences,
  ReferenceForComparison,
  GemstoneForComparison,
} from "@/lib/evaluation/referenceComparison";

export const dynamic = "force-dynamic";

const FX_RATES: Record<string, number> = {
  LKR: 1.0,
  USD: 304.25,
  CHF: 341.50,
  GBP: 398.00,
  HKD: 39.00,
};

function normalizeToLkr(amount: number, currency?: string): number {
  const rate = (currency && FX_RATES[currency]) || 1.0;
  return Math.round(amount * rate);
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "CAGS_ADMIN") {
      return NextResponse.json(
        { success: false, message: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    await connectDB();

    const allRecords = await ReferenceGemstone.find({ status: "ACTIVE" }).lean();

    const realRecords = allRecords.filter((r) => r.dataClassification === "Real");
    const demoRecords = allRecords.filter((r) => r.dataClassification === "Demo");
    const wholesaleCompleted = realRecords.filter(
      (r) => r.transactionContext === "Completed Sale" && r.marketContext === "Wholesale"
    );

    const varieties = ["Blue Sapphire", "Padparadscha", "Ruby"];
    const varietyMetrics: Record<string, {
      totalCount: number;
      wholesaleCount: number;
      auctionCount: number;
      retailCount: number;
      status: "CALIBRATED" | "PROVISIONAL" | "UNAVAILABLE";
      loocvCount: number;
      loocvMdape: number;
      loocvMape: number;
      avgPricePerCaratLkr: number;
      dispersionPct: number;
      pricePerCaratMin: number;
      pricePerCaratMax: number;
      recentSaleDate?: string;
    }> = {};

    const totalLoocvErrors: number[] = [];

    for (const v of varieties) {
      const vRecords = realRecords.filter((r) => r.variety === v);
      const vWholesale = vRecords.filter(
        (r) => r.transactionContext === "Completed Sale" && r.marketContext === "Wholesale"
      );
      const vAuction = vRecords.filter((r) => r.marketContext === "Auction");
      const vRetail = vRecords.filter((r) => r.marketContext === "Retail");

      const perCaratRates = vWholesale.map((r) => {
        const totalLkr = normalizeToLkr(r.referencePrice || r.priceAmount || 0, r.currency);
        return r.caratWeight > 0 ? Math.round(totalLkr / r.caratWeight) : totalLkr;
      });

      const avgPpc = perCaratRates.length > 0
        ? Math.round(perCaratRates.reduce((a, b) => a + b, 0) / perCaratRates.length)
        : 0;

      const ppcMin = perCaratRates.length > 0 ? Math.min(...perCaratRates) : 0;
      const ppcMax = perCaratRates.length > 0 ? Math.max(...perCaratRates) : 0;

      // Status determined by wholesale count policy
      const status: "CALIBRATED" | "PROVISIONAL" | "UNAVAILABLE" =
        vWholesale.length >= 3 ? "CALIBRATED" : vWholesale.length >= 1 ? "PROVISIONAL" : "UNAVAILABLE";

      // Run LOOCV on wholesale completed sales if >= 3
      const errors: number[] = [];
      if (vWholesale.length >= 3) {
        for (const target of vWholesale) {
          const pool = vWholesale.filter((r) => r._id.toString() !== target._id.toString());
          const targetLkr = normalizeToLkr(target.referencePrice || target.priceAmount || 0, target.currency);

          const referencesForComp: ReferenceForComparison[] = pool.map((r) => {
            const lkr = normalizeToLkr(r.referencePrice || r.priceAmount || 0, r.currency);
            return {
              _id: r._id.toString(),
              referenceId: r.referenceId,
              variety: r.variety,
              caratWeight: r.caratWeight,
              referencePrice: lkr,
              pricePerCarat: r.pricePerCarat || (r.caratWeight > 0 ? Math.round(lkr / r.caratWeight) : lkr),
              currency: "LKR",
              color: {
                hue: r.color.hue,
                tone: r.color.tone,
                saturation: r.color.saturation,
                distribution: r.color.distribution || "Even",
                zoning: r.color.zoning || "None",
              },
              clarity: {
                nakedEye: r.clarity.nakedEye,
                loupe10x: r.clarity.loupe10x,
                inclusionType: r.clarity.inclusionType || "",
                inclusionLocation: r.clarity.inclusionLocation || "",
                severity: r.clarity.severity || "Minor",
              },
              cut: {
                length: r.cut?.length || null,
                width: r.cut?.width || null,
                depth: r.cut?.depth || null,
                symmetry: r.cut?.symmetry || "Good",
                polish: r.cut?.polish || "Good",
                windowing: r.cut?.windowing || "None",
                extinction: r.cut?.extinction || "None",
                bulging: r.cut?.bulging || "None",
              },
              treatment: r.treatment,
              origin: r.origin,
              dataClassification: "Real",
              transactionContext: r.transactionContext,
              marketContext: r.marketContext,
              source: r.source,
              saleDate: r.saleDate,
            };
          });

          const candidateGemstone: GemstoneForComparison = {
            variety: target.variety,
            caratWeight: target.caratWeight,
            color: {
              hue: target.color.hue,
              tone: target.color.tone,
              saturation: target.color.saturation,
              distribution: target.color.distribution || "Even",
              zoning: target.color.zoning || "None",
            },
            clarity: {
              nakedEye: target.clarity.nakedEye,
              loupe10x: target.clarity.loupe10x,
              inclusionType: target.clarity.inclusionType || "",
              inclusionLocation: target.clarity.inclusionLocation || "",
              severity: target.clarity.severity || "Minor",
            },
            cut: {
              length: target.cut?.length || null,
              width: target.cut?.width || null,
              depth: target.cut?.depth || null,
              symmetry: target.cut?.symmetry || "Good",
              polish: target.cut?.polish || "Good",
              windowing: target.cut?.windowing || "None",
              extinction: target.cut?.extinction || "None",
              bulging: target.cut?.bulging || "None",
            },
          };

          const comparisons = compareWithReferences(candidateGemstone, referencesForComp);
          const comparableInputs: ComparableReferenceInput[] = comparisons.map((comp) => ({
            referenceId: comp.referenceId,
            referencePrice: comp.referencePrice,
            caratWeight: comp.caratWeight,
            pricePerCarat: comp.pricePerCarat,
            currency: "LKR",
            treatment: comp.treatment,
            origin: comp.origin,
            similarity: comp.similarity,
            observationDate: comp.observationDate || comp.saleDate,
            saleDate: comp.saleDate,
            dataClassification: comp.dataClassification,
            transactionContext: comp.transactionContext,
            marketContext: comp.marketContext,
            source: comp.source,
          }));

          const candidateContext: CandidateGemstoneContext = {
            caratWeight: target.caratWeight,
            treatment: target.treatment,
            origin: target.origin,
          };

          const result = calculateComparableReferencePrice(comparableInputs, candidateContext);
          if (result && result.suggestedTotalPrice > 0) {
            const absErr = Math.abs(result.suggestedTotalPrice - targetLkr);
            const aoe = (absErr / targetLkr) * 100;
            errors.push(aoe);
            totalLoocvErrors.push(aoe);
          }
        }
      }

      // Find latest sale date
      const sortedSales = vRecords
        .map((r) => r.saleDate)
        .filter((d): d is string => Boolean(d))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      // Variance & Dispersion
      let dispersion = 0;
      if (perCaratRates.length > 1 && avgPpc > 0) {
        const sumSq = perCaratRates.reduce((acc, p) => acc + Math.pow(p - avgPpc, 2), 0);
        const stdDev = Math.sqrt(sumSq / (perCaratRates.length - 1));
        dispersion = Number(((stdDev / avgPpc) * 100).toFixed(1));
      }

      varietyMetrics[v] = {
        totalCount: vRecords.length,
        wholesaleCount: vWholesale.length,
        auctionCount: vAuction.length,
        retailCount: vRetail.length,
        status,
        loocvCount: errors.length,
        loocvMdape: errors.length > 0 ? Number(calculateMedian(errors).toFixed(1)) : 0,
        loocvMape: errors.length > 0 ? Number((errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1)) : 0,
        avgPricePerCaratLkr: avgPpc,
        dispersionPct: dispersion,
        pricePerCaratMin: ppcMin,
        pricePerCaratMax: ppcMax,
        recentSaleDate: sortedSales[0] || "",
      };
    }

    const overallMdape = totalLoocvErrors.length > 0 ? Number(calculateMedian(totalLoocvErrors).toFixed(1)) : 0;
    const overallMape = totalLoocvErrors.length > 0
      ? Number((totalLoocvErrors.reduce((a, b) => a + b, 0) / totalLoocvErrors.length).toFixed(1))
      : 0;

    // Health Score calculation (0-100)
    // 40% for wholesale coverage across 3 categories
    // 30% for accuracy (< 20% MdAPE = 30 pts)
    // 30% for real evidence proportion
    const coveragePts = (Object.values(varietyMetrics).filter((m) => m.status === "CALIBRATED").length / 3) * 40;
    const accuracyPts = overallMdape > 0 ? Math.max(0, 30 - Math.max(0, overallMdape - 10) * 1.5) : 15;
    const realRatioPts = allRecords.length > 0 ? (realRecords.length / allRecords.length) * 30 : 0;
    const healthScore = Math.min(100, Math.round(coveragePts + accuracyPts + realRatioPts));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalRecords: allRecords.length,
        realRecords: realRecords.length,
        demoRecords: demoRecords.length,
        wholesaleCompleted: wholesaleCompleted.length,
        healthScore,
        overallLoocvMdape: overallMdape,
        overallLoocvMape: overallMape,
        calibratedCategories: Object.values(varietyMetrics).filter((m) => m.status === "CALIBRATED").length,
      },
      varieties: varietyMetrics,
    });
  } catch (err) {
    console.error("Reference validation audit error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to run reference validation audit." },
      { status: 500 }
    );
  }
}
