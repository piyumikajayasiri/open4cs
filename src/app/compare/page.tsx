"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PortalSidebar from "@/components/layout/PortalSidebar";
import ComparableGemstonesView from "@/components/gemstone/ComparableGemstonesView";
import GemstoneCompareMatrixView from "@/components/gemstone/GemstoneCompareMatrixView";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Left Portal Sidebar matching Figma */}
      <PortalSidebar activeItem="compare" />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        {mode === "comparable" ? (
          <ComparableGemstonesView
            stoneId="CEY-2026-0847"
            variety="Ceylon Blue Sapphire"
            caratWeight="2.45"
            color="Vivid Blue"
            clarity="Eye-clean"
            cut="Well cut"
            treatment="Heated"
            toleranceRecordsCount={7}
            snapshotDate="24 Sep 2026"
            onOpenSideBySide={() => router.push("/compare")}
          />
        ) : (
          <GemstoneCompareMatrixView
            onAddEvaluation={() => router.push("/history")}
          />
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
