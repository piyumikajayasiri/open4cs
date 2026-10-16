"use client";

import React, { useEffect, useState } from "react";
import PortalSidebar from "@/components/layout/PortalSidebar";
import ReportsView, { ReportItem } from "@/components/gemstone/ReportsView";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[] | undefined>(undefined);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/evaluations");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: ReportItem[] = data.slice(0, 8).map((item, index) => {
              const code = `RG-2026-${(120 - index).toString().padStart(3, "0")}`;
              const evalId = `EV-2026-${item._id.slice(-4).toUpperCase()}`;
              const variety = item.gemstoneId?.variety?.replace("Sapphire", "").trim() || "Blue";
              const date = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "Sep 24, 2026";

              return {
                id: code,
                evaluationId: item._id,
                gemstoneLabel: `${evalId} · ${variety}`,
                evaluationDate: date,
                reportType: index === 2 ? "Summary Statement" : "Full Evaluation + Price",
                createdAt: date,
              };
            });
            setReports(mapped);
          }
        }
      } catch {
        // use default
      }
    }

    loadReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Left Portal Sidebar */}
      <PortalSidebar activeItem="reports" />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        <ReportsView reports={reports} />
      </main>
    </div>
  );
}
