"use client";
import { displayText } from "@/lib/display-text";
import { useRef, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Power, Plus, History, FlaskConical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ruleRows, type RuleCategory, type RuleStatus } from "@/lib/admin/policy";
import type { RuleSet, Variety } from "@/lib/evaluation/types";
import { adminRequest, Choice, Notice, PageHeader, Panel, pretty, StatusBadge, useAdminResource } from "./AdminUI";
import ConfirmDelete from "./ConfirmDelete";

export type ManagedVersion = { _id: string; version: string; variety: Variety; status: RuleStatus; definition: RuleSet; summary: string; revision?: number; createdBy?: string; createdByName?: string; approvedByName?: string; activatedAt?: string; createdAt?: string };
const categories = ["ALL", "COLOR", "CLARITY", "CUT", "PRICING"] as const;
export default function RuleManager() {
  const { data, error, loading, reload } = useAdminResource<{ versions: ManagedVersion[]; nextVersions: Record<Variety, number> }>("/api/admin/rules");
  const [variety, setVariety] = useState<Variety>("RUBY");
  const [chosen, setChosen] = useState("");
  const [category, setCategory] = useState<RuleCategory | "ALL">("ALL");
  const [editor, setEditor] = useState<ManagedVersion | null>(null);
  const [editing, setEditing] = useState(false);
  const [version, setVersion] = useState("");
  const [summary, setSummary] = useState("");
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState("");
  const [deleting, setDeleting] = useState<ManagedVersion | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const formRef = useRef<HTMLElement>(null);
  const versions = (data?.versions || []).filter((item) => item.variety === variety);
  const selected = versions.find((item) => item.version === chosen) || versions.find((item) => item.status === "ACTIVE") || versions[0];
  const rows = selected ? ruleRows(selected.definition) : [];
  function propose(base: ManagedVersion, edit = false) {
    setEditor(base); setEditing(edit); setSummary(edit ? base.summary : ""); setMessage("");
    setChanges(Object.fromEntries(ruleRows(base.definition).map((row) => [row.path, String(Number((row.value * row.inputScale).toFixed(8)))])));
    const next = data?.nextVersions?.[base.variety] || Math.max(...versions.map((item) => Number(item.version.match(/v(\d+)$/)?.[1] || 0))) + 1;
    setVersion(edit ? base.version : `mock-${base.variety.toLowerCase()}-v${next}`);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }
  async function transition(item: ManagedVersion, action: string) {
    setBusy(true); setMessage("");
    try { await adminRequest(`/api/admin/rules/${encodeURIComponent(item.version)}`, "PATCH", { action, revision: item.revision ?? 0 }); setFailure(false); setMessage("Version updated. The engine uses only the active version for this variety."); await reload(); }
    catch (error) { setFailure(true); setMessage(error instanceof Error ? error.message : "Unable to update version."); }
    finally { setBusy(false); }
  }
  async function save() {
    if (!editor) return;
    if (summary.trim().length < 10 || summary.length > 1000) { setFailure(true); setMessage("Explain the proposal in 10–1000 characters."); return; }
    if (Object.values(changes).some((value) => !value.trim() || !Number.isFinite(Number(value)))) { setFailure(true); setMessage("Every numeric rule must have a valid value."); return; }
    setBusy(true); setMessage("");
    try {
      const scales = new Map(ruleRows(editor.definition).map((row) => [row.path, row.inputScale]));
      const payload = { action: "UPDATE", revision: editor.revision ?? 0, baseVersion: editor.version, version, summary, changes: Object.fromEntries(Object.entries(changes).map(([path, value]) => [path, Number(value) / (scales.get(path) || 1)])) };
      await adminRequest(editing ? `/api/admin/rules/${encodeURIComponent(editor.version)}` : "/api/admin/rules", editing ? "PATCH" : "POST", payload);
      setEditor(null); setChosen(version); setFailure(false); setMessage("Draft saved. Submit it for independent review when ready."); await reload();
    } catch (error) { setFailure(true); setMessage(error instanceof Error ? error.message : "Unable to save proposal."); }
    finally { setBusy(false); }
  }
  async function deleteDraft() {
    if (!deleting || busy) return;
    setBusy(true); setDeleteError("");
    try {
      await adminRequest(`/api/admin/rules/${encodeURIComponent(deleting.version)}`, "DELETE", { revision: deleting.revision ?? 0 });
      if (editor?.version === deleting.version) setEditor(null);
      setDeleting(null); setChosen(""); setFailure(false); setMessage("Draft deleted. Its audit history is retained and its version number will not be reused."); await reload();
    } catch (error) { setDeleteError(error instanceof Error ? error.message : "Unable to delete draft."); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
    <ConfirmDelete open={Boolean(deleting)} title={`Delete ${deleting?.version || "draft"}?`} description="This deletes the draft version from the management list. The active engine version is unaffected, and the audit trail is retained." busy={busy} error={deleteError} onCancel={() => setDeleting(null)} onConfirm={deleteDraft} />
    <PageHeader title="4C Rules & Pricing" description="Versioned scoring, matching and price adjustments for ruby and sapphire.">
      <Link href="/admin/rule-versions"><Button variant="outline"><History /> Version History</Button></Link>
      <Link href="/admin/evaluation-rules/test"><Button variant="outline"><FlaskConical /> Test Evaluation</Button></Link>
      <Button disabled={!selected || busy} onClick={() => selected && propose(selected)}><Plus /> Propose Rule Version</Button>
    </PageHeader>
    <p className="text-sm"><Link href="/admin/approved-rules" className="text-blue-600 underline">Open approved rules and catalogue integration</Link> · This page manages sample rules only.</p><Notice message="Development dataset: these are provisional sample rules. Activation applies to the sample engine and does not represent CAGS approval." />
    <Notice message={error || message} error={Boolean(error) || failure} />
    <div className="flex flex-wrap gap-3"><Choice label="Gemstone variety" value={variety} options={[{ value: "RUBY", label: "Ruby" }, { value: "SAPPHIRE", label: "Sapphire" }]} onChange={(value) => { setVariety(value as Variety); setChosen(""); setEditor(null); }} />
      {selected && <Choice label="Rule version" value={selected.version} options={versions.map((item) => ({ value: item.version, label: `${item.version} · ${pretty(item.status)}` }))} onChange={setChosen} />}
      <Button variant="outline" onClick={reload} disabled={loading}>Refresh</Button>
    </div>
    <div className="flex flex-wrap gap-2">{categories.map((item) => <Button key={item} size="sm" variant={category === item ? "default" : "secondary"} onClick={() => setCategory(item)}>{item === "ALL" ? "All rules" : pretty(item)} ({rows.filter((row) => item === "ALL" || row.category === item).length})</Button>)}</div>
    <Panel className="overflow-x-auto !p-0"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-slate-400"><tr>{["Rule ID", "Description", "Effect / value", "Version", "Status", "Actions"].map((name) => <th key={name} className="px-5 py-4">{name}</th>)}</tr></thead>
      <tbody>{rows.filter((row) => category === "ALL" || row.category === category).map((row) => <tr key={row.path} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4 font-mono text-xs text-blue-600">{row.id}</td><td className="px-5 py-4"><p className="capitalize">{displayText(row.description)}</p>{detail === row.path && <p className="mt-2 text-xs text-slate-500">Stored parameter: {row.path}. Changes require a new draft. active and archived versions are preserved.</p>}</td><td className="px-5 py-4 font-medium text-emerald-700">{row.effect}</td><td className="px-5 py-4 text-xs text-slate-500">{displayText(selected?.version)}</td><td className="px-5 py-4"><StatusBadge status={selected.status} /></td><td className="px-5 py-4"><div className="flex gap-1"><Button variant="ghost" size="icon-sm" aria-label={`Edit ${row.description}`} onClick={() => propose(selected, selected.status === "DRAFT")}><Pencil className="size-3.5" /></Button><Button variant="ghost" size="icon-sm" aria-label={`View ${row.description}`} onClick={() => setDetail(detail === row.path ? "" : row.path)}><Eye className="size-3.5" /></Button></div></td></tr>)}</tbody>
    </table>{loading && <p className="p-5 text-sm" role="status">Loading rules...</p>}{!loading && !rows.length && <p className="p-5 text-sm">No rule versions are available.</p>}</Panel>
    {selected && <div className="flex flex-wrap items-center gap-3"><StatusBadge status={selected.status} /><span className="text-sm text-slate-500">{displayText(selected.summary || "Seeded provisional rules")}</span>
      <Button variant="outline" disabled={busy} onClick={() => propose(selected, selected.status === "DRAFT")}><Pencil />{selected.status === "DRAFT" ? "Edit Draft" : "Edit as New Draft"}</Button>
      {selected.status === "DRAFT" && <Button disabled={busy} onClick={() => transition(selected, "SUBMIT")}><Power /> Submit for Review</Button>}
      {selected.status === "DRAFT" && <Button variant="destructive" disabled={busy} onClick={() => { setDeleting(selected); setDeleteError(""); }}><Trash2 /> Delete Draft Version</Button>}
      {selected.status === "PENDING" && <><Button disabled={busy} onClick={() => transition(selected, "ACTIVATE")}><Power /> Activate Sample Version</Button><Button variant="outline" disabled={busy} onClick={() => transition(selected, "RETURN")}>Return to Draft</Button></>}
    </div>}
    {selected && <div className="grid gap-3 sm:grid-cols-3"><Panel><p className="text-xs uppercase text-slate-400">Historical matching</p><p className="mt-2 font-semibold">{selected.definition.matching.minimumComparables}–{selected.definition.matching.maximumComparables} comparable records</p><p className="mt-1 text-xs text-slate-500">Same variety, hue, shape and treatment</p></Panel><Panel><p className="text-xs uppercase text-slate-400">Quality adjustment</p><p className="mt-2 font-semibold">{selected.definition.pricing.adjustmentPerScorePoint * 100}% per score point</p><p className="mt-1 text-xs text-slate-500">Capped at ±{selected.definition.pricing.maximumAdjustmentPercentage}%</p></Panel><Panel><p className="text-xs uppercase text-slate-400">Suggested range</p><p className="mt-2 font-semibold">Median historical price ±{selected.definition.rangePercentage}%</p><p className="mt-1 text-xs text-slate-500">No fixed-price fallback</p></Panel></div>}
    {editor && <section ref={formRef} aria-label="Rule proposal" className="rounded-xl border bg-white p-5 space-y-4"><h2 className="text-lg font-semibold">{editing ? "Edit draft" : "Propose a new version"}</h2><p className="text-sm text-slate-500">A different administrator must activate a submitted proposal. The four score contributions must total 100%. score tables must stay between 0 and 10.</p>
      <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm">Version<Input value={displayText(version)} disabled={editing || busy} onChange={(event) => setVersion(event.target.value.replace(/^sample-/i, "mock-"))} /></label><label className="space-y-2 text-sm">Reason for change<Input minLength={10} maxLength={1000} value={summary} disabled={busy} onChange={(event) => setSummary(event.target.value)} /></label></div>
      <div className="grid max-h-96 gap-4 overflow-y-auto rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">{ruleRows(editor.definition).map((row) => <label key={row.path} className="space-y-1 text-xs capitalize">{displayText(row.description)}<Input type="number" step="any" value={changes[row.path] ?? ""} disabled={busy} onChange={(event) => setChanges({ ...changes, [row.path]: event.target.value })} /></label>)}</div>
      <Notice message={message} error={failure} /><div className="flex gap-2"><Button disabled={busy} onClick={save}>{busy ? "Saving..." : "Save Draft"}</Button><Button variant="outline" disabled={busy} onClick={() => setEditor(null)}>Cancel</Button></div>
    </section>}
  </div>;
}
