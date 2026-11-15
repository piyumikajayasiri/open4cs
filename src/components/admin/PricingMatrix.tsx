"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ManagedRecord } from "@/lib/admin/data";
import { Choice, Notice, PageHeader, Panel, pretty, useAdminResource } from "./AdminUI";

export default function PricingMatrix() {
  const { data, error, loading } = useAdminResource<{ records: ManagedRecord[]; truncated: boolean }>("/api/admin/data-records?dataset=MOCK");
  const [variety, setVariety] = useState("ALL");
  const groups = new Map<string, { variety: string; hue: string; treatment: string; band: string; prices: number[] }>();
  for (const record of data?.records || []) {
    if (record.status !== "MOCK" || record.weight <= 0 || variety !== "ALL" && record.variety !== variety) continue;
    const band = record.weight < 1 ? "Under 1 ct" : record.weight < 2 ? "1–1.99 ct" : record.weight < 3 ? "2–2.99 ct" : record.weight < 5 ? "3–4.99 ct" : "5+ ct";
    const key = `${record.variety}:${record.hue}:${record.treatment}:${band}`;
    const group = groups.get(key) || { variety: record.variety, hue: record.hue, treatment: record.treatment, band, prices: [] };
    group.prices.push(record.totalPrice / record.weight); groups.set(key, group);
  }
  return <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8"><PageHeader title="Pricing Matrix" description="Observed price bands from active sample historical records, grouped by variety, hue, treatment and weight."><Link href="/admin/evaluation-rules"><Button>Propose Pricing Rule</Button></Link><Link href="/admin/historical-pricing"><Button variant="outline">Manage Historical Records</Button></Link></PageHeader><Notice message="These ranges summarize invented sample records. The engine uses individual comparable records and quality adjustments, rather than a fixed price from this table." /><Notice message={error} error /><Choice label="Variety" value={variety} options={[{ value: "ALL", label: "All Varieties" }, { value: "RUBY", label: "Ruby" }, { value: "SAPPHIRE", label: "Sapphire" }]} onChange={setVariety} /><Panel className="overflow-x-auto !p-0"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase text-slate-400"><tr>{["Variety", "Colour", "Weight band", "Treatment", "Historical USD / ct", "Records"].map((label) => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>{[...groups.entries()].map(([key, group]) => <tr key={key} className="border-b border-slate-100"><td className="p-4">{pretty(group.variety)}</td><td className="p-4">{pretty(group.hue)}</td><td className="p-4">{group.band}</td><td className="p-4">{pretty(group.treatment)}</td><td className="p-4 font-semibold">{Math.min(...group.prices).toFixed(2)}–{Math.max(...group.prices).toFixed(2)}</td><td className="p-4 text-slate-500">{group.prices.length}</td></tr>)}</tbody></table>{loading && <p className="p-5 text-sm" role="status">Loading historical prices...</p>}{!loading && !groups.size && <p className="p-5 text-sm">No active sample records match this filter.</p>}</Panel>{data?.truncated && <Notice message="Only the latest 500 records are summarized here." />}</div>;
}
