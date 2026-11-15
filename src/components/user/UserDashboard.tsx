"use client";
import { displayText } from "@/lib/display-text";
import { useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EvaluationSummary } from "@/lib/evaluation/submission";
import { Choice, Notice, Panel, pretty, useAdminResource as useResource } from "@/components/admin/AdminUI";

interface DashboardData {
  evaluations: EvaluationSummary[];
  stats: { total: number; priced: number; thisMonth: number };
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
export function savedDate(value: string) {
  return value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" }) : "Date unavailable";
}
export default function UserDashboard({ history = false }: { history?: boolean }) {
  const [page, setPage] = useState(1), [variety, setVariety] = useState("ALL");
  const [selected, setSelected] = useState<EvaluationSummary[]>([]);
  const [comparing, setComparing] = useState(false);
  const pageSize = history ? 20 : 8;
  const { data, error, loading, reload } = useResource<DashboardData>(`/api/evaluations?page=${page}&pageSize=${pageSize}${variety !== "ALL" ? `&variety=${variety}` : ""}`);
  const metrics = [
    ["Saved Evaluations", data?.stats.total], ["With a Price Suggestion", data?.stats.priced], ["Created This Month", data?.stats.thisMonth],
    ["Price Unavailable", data ? data.stats.total - data.stats.priced : undefined],
  ];
  function toggle(item: EvaluationSummary) { setSelected((previous) => previous.some((entry) => entry._id === item._id) ? previous.filter((entry) => entry._id !== item._id) : previous.length < 3 ? [...previous, item] : previous); }
  return <>
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">{history ? "Evaluation History" : "Your Evaluations"}</h1><p className="mt-2 text-sm text-slate-500">Saved observations, scores and price suggestions from your account.</p></div><div className="flex gap-2"><Button variant="outline" disabled={loading} onClick={reload}><RefreshCw />Refresh</Button><Link href="/evaluate"><Button><Plus />New Evaluation</Button></Link></div></header>
    <Notice message="Current results use provisional sample rules and historical sample records. Saved results retain the exact rule and comparable snapshots used at submission. they are not certified valuations." />
    <Notice message={error} error />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <Panel key={String(label)}><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value ?? "—"}</p></Panel>)}</div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2"><Choice label="Gemstone variety" value={variety} options={[{ value: "ALL", label: "All Varieties" }, { value: "RUBY", label: "Ruby" }, { value: "SAPPHIRE", label: "Sapphire" }]} onChange={(value) => { setVariety(value); setPage(1); }} /><Button variant={comparing ? "default" : "outline"} disabled={selected.length < 2 && !comparing} onClick={() => setComparing(!comparing)}>{comparing ? "Close Comparison" : `Compare Selected (${selected.length}/3)`}</Button></div>{!history && <Link href="/dashboard?tab=history" className="text-sm text-blue-600">View full history <ArrowRight className="inline size-4" /></Link>}</div>
    {comparing && <Panel className="overflow-x-auto"><h2 className="mb-4 font-semibold">Compare saved results</h2><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Characteristic</th>{selected.map((item) => <th key={item._id} className="p-3"><Link href={`/evaluations/${item._id}`} className="text-blue-600">{pretty(item.variety)} · {item.caratWeight ?? "—"} ct</Link></th>)}</tr></thead><tbody>{(["overall", "color", "clarity", "cut", "carat"] as const).map((key) => <tr key={key} className="border-t"><td className="p-3">{key === "carat" ? "Size" : pretty(key)}</td>{selected.map((item) => <td key={item._id} className="p-3">{item.scores[key] === null ? "Not scored" : `${item.scores[key]}/10`}</td>)}</tr>)}<tr className="border-t"><td className="p-3">Saved price range</td>{selected.map((item) => <td key={item._id} className="p-3">{item.priceRange}</td>)}</tr><tr className="border-t"><td className="p-3">Rule version</td>{selected.map((item) => <td key={item._id} className="p-3">{displayText(item.ruleVersion)}</td>)}</tr></tbody></table></Panel>}
    <Panel className="overflow-x-auto !p-0"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase text-slate-400"><tr>{["Compare", "Evaluation", "Saved", "Overall score", "Suggested range", "Rule version", ""].map((label, index) => <th key={index} className="px-4 py-4">{label}</th>)}</tr></thead><tbody>{(data?.evaluations || []).map((item) => {
      const checked = selected.some((entry) => entry._id === item._id);
      return <tr key={item._id} className="border-b border-slate-100 last:border-0"><td className="px-4 py-4"><input type="checkbox" aria-label={`Compare ${item.evaluationId}`} checked={checked} disabled={!checked && selected.length >= 3} onChange={() => toggle(item)} /></td><td className="px-4 py-4"><Link href={`/evaluations/${item._id}`} className="font-semibold text-blue-600">{pretty(item.variety)}{item.caratWeight !== null ? ` · ${item.caratWeight} ct` : ""}</Link><p className="mt-1 max-w-48 truncate text-xs text-slate-400" title={item.evaluationId}>{displayText(item.evaluationId)}</p><span className="mt-2 inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800">{pretty(item.dataKind)} · {pretty(item.status)}</span></td><td className="px-4 py-4 text-xs text-slate-500">{savedDate(item.createdAt)}</td><td className="px-4 py-4 font-semibold">{item.scores.overall === null ? "Not scored" : `${item.scores.overall}/10`}</td><td className="px-4 py-4"><p className="font-medium">{item.priceRange}</p>{item.priceStatus === "UNAVAILABLE" && <p className="mt-1 max-w-64 text-xs text-slate-500">{item.priceReason}</p>}</td><td className="px-4 py-4 text-xs text-slate-500">{displayText(item.ruleVersion)}</td><td className="px-4 py-4"><Link href={`/evaluations/${item._id}`} className="text-blue-600">View result</Link></td></tr>;
    })}</tbody></table>{loading && <p className="p-6 text-sm text-slate-500" role="status">Loading your evaluations...</p>}{!loading && !error && !data?.evaluations.length && <div className="space-y-3 p-8 text-center"><h2 className="font-semibold">No saved evaluations yet</h2><p className="text-sm text-slate-500">Submit an evaluation to see its scores and price suggestion here.</p><Link href="/evaluate" className="inline-block text-sm text-blue-600">Start an evaluation</Link></div>}</Panel>
    {data && <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><p className="text-slate-500">{data.pagination.total} evaluation(s) · page {data.pagination.page} of {data.pagination.totalPages} · dates in Sri Lanka time</p><div className="flex gap-2"><Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" disabled={loading || page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
  </>;
}

