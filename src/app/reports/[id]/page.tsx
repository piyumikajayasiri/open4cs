"use client";

import React, { use } from "react";
import ReportPreviewView from "@/components/gemstone/ReportPreviewView";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ReportPreviewView
      report={{
        reportId: id.startsWith("RG-") ? id : `RG-2026-${id.slice(-3)}`,
        evaluationId: "EV-2026-0847",
        stoneId: "CEY-2026-0847",
        variety: "Ceylon Blue Sapphire",
        caratWeight: "2.45 ct",
        cutShape: "Oval",
        treatment: "Heated (lab-verified)",
        origin: "Sri Lanka (seller-provided origin)",
        date: "24 Sep 2026",
        ruleVersion: "v4.2",
        colorScore: 8.6,
        clarityScore: 7.9,
        cutScore: 8.1,
        overallScore: 8.2,
        priceRange: "LKR 1.42M – 1.68M",
        pricePerCarat: "LKR 580K – 686K per carat",
        referenceMedian: "LKR 612K/ct",
        tolerance: "±6%",
        status: "Ready to Export",
        totalPages: 4,
        format: "Standard A4 (PDF/A)",
      }}
    />
  );
}
