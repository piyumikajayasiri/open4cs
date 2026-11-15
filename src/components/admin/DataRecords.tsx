"use client";
import { displayText } from "@/lib/display-text";
import { useRef, useState } from "react";
import Link from "next/link";
import { Plus, Upload, Search, X, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_EXAMPLES } from "@/lib/evaluation/mock-data";
import { validateHistoricalRecord, type Dataset, type ManagedRecord } from "@/lib/admin/data";
import type { EvaluationInput } from "@/lib/evaluation/types";
import { adminRequest, ApiError, Choice, Notice, PageHeader, Panel, pretty, StatusBadge, useAdminResource } from "./AdminUI";
import ConfirmDelete from "./ConfirmDelete";

const severity = ["NONE", "MINOR", "MODERATE", "SEVERE"];
const fields: { path: string; label: string; options?: string[] }[] = [
  { path: "variety", label: "Variety", options: ["RUBY", "SAPPHIRE"] }, { path: "caratWeight", label: "Weight (ct)" },
  { path: "origin", label: "Origin", options: ["Sri Lanka"] },
  { path: "shape", label: "Shape", options: ["OVAL", "ROUND", "CUSHION", "PEAR", "EMERALD"] },
  { path: "treatment", label: "Treatment", options: ["HEATED", "UNHEATED", "UNKNOWN"] },
  { path: "originReliability", label: "Origin information source", options: ["LAB_VERIFIED", "SELLER_PROVIDED", "UNVERIFIED"] },
  { path: "color.hue", label: "Hue", options: ["RED", "PURPLISH_RED", "BLUE", "PINK", "YELLOW", "GREEN", "PURPLE", "COLORLESS"] },
  { path: "color.tone", label: "Tone (0–10)" }, { path: "color.saturation", label: "Saturation", options: ["WEAK", "MEDIUM", "STRONG", "VIVID"] },
  { path: "color.distribution", label: "Colour distribution", options: ["EVEN", "UNEVEN"] }, { path: "color.zoning", label: "Zoning", options: severity },
  { path: "clarity.nakedEye", label: "Naked-eye clarity", options: ["CLEAN", "SLIGHTLY_INCLUDED", "INCLUDED"] },
  { path: "clarity.loupe10x", label: "10× loupe inclusions", options: ["MINOR", "MODERATE", "HEAVY"] }, { path: "clarity.severity", label: "Inclusion severity", options: severity },
  ...["length", "width", "depth"].map((key) => ({ path: `cut.${key}`, label: `${pretty(key)} (mm)` })),
  ...["symmetry", "polish"].map((key) => ({ path: `cut.${key}`, label: pretty(key), options: ["EXCELLENT", "GOOD", "FAIR", "POOR"] })),
  ...["windowing", "extinction", "bulging"].map((key) => ({ path: `cut.${key}`, label: pretty(key), options: severity })),
];
function initialFields(dataset: Dataset, record?: ManagedRecord): Record<string, string> {
  const sample = record?.observations || (!record && dataset === "MOCK" ? MOCK_EXAMPLES.RUBY : null);
  return Object.fromEntries(fields.map((field) => {
    if (!sample) return [field.path, field.path === "variety" ? "RUBY" : ""];
    const [root, key] = field.path.split(".");
    const value = key ? (sample[root as "color" | "clarity" | "cut"] as unknown as Record<string, unknown> | undefined)?.[key] : sample[root as keyof EvaluationInput];
    return [field.path, value === null || value === undefined || typeof value === "number" && !Number.isFinite(value) ? "" : String(value)];
  }));
}
function RecordEditor({ dataset, record: existing, onClose, onSaved }: { dataset: Dataset; record?: ManagedRecord; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState(() => initialFields(dataset, existing));
  const [metadata, setMetadata] = useState({ id: existing?.recordId || "", source: existing?.source || "", recordedAt: existing?.date || "", totalPrice: existing ? String(existing.totalPrice) : "", currency: existing?.currency || "USD", priceBasis: existing?.priceBasis || (dataset === "MOCK" ? "MOCK_B2B" : "B2B_QUOTE"), description: existing?.description || "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  async function save() {
    const observation: Record<string, unknown> = { origin: "Sri Lanka", color: { ...existing?.observations?.color }, clarity: { ...existing?.observations?.clarity }, cut: { ...existing?.observations?.cut } };
    for (const field of fields) {
      const [root, key] = field.path.split("."); const value = field.options ? values[field.path] : values[field.path] ? Number(values[field.path]) : null;
      if (key) (observation[root] as Record<string, unknown>)[key] = value; else observation[root] = value;
    }
    const record = { ...metadata, id: metadata.id || `MOCK-ADMIN-${crypto.randomUUID().toUpperCase()}`, dataKind: dataset, observations: observation, totalPrice: Number(metadata.totalPrice) };
    const next = validateHistoricalRecord(record, dataset); setErrors(next);
    if (Object.keys(next).length) { setMessage("Correct the fields below before saving."); return; }
    setSaving(true); setMessage("");
    try { await adminRequest(existing ? `/api/admin/data-records/${existing.key}` : "/api/admin/data-records", existing ? "PATCH" : "POST", { dataset, record, ...(existing ? { action: "UPDATE", revision: existing.revision } : {}) }); onSaved(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save."); if (error instanceof ApiError) setErrors(error.errors); }
    finally { setSaving(false); }
  }
  const errorFor = (path: string) => errors[path] && <p role="alert" className="text-xs text-destructive">{errors[path]}</p>;
  return <Panel className="space-y-5"><div className="flex justify-between"><h2 className="text-lg font-semibold">{existing ? "Edit" : "Add"} {dataset === "MOCK" ? "sample historical" : "Sri Lankan reference"} record{existing ? ` · ${displayText(existing.recordId)}` : ""}</h2><Button variant="ghost" size="icon" aria-label="Close form" disabled={saving} onClick={onClose}><X /></Button></div>
    <Notice message={existing ? dataset === "REFERENCE" ? "Saving changes returns this reference to Pending and clears its prior verification. The previous values remain in audit history." : "Changes affect future sample price comparisons. Previous values remain in audit history." : dataset === "MOCK" ? "Test observations are prefilled for convenience. All prices and descriptions you add here are labelled sample." : "Enter actual source observations. No sample values are filled in. New references remain pending and excluded from the sample engine."} />
    <form onSubmit={(event) => { event.preventDefault(); save(); }} noValidate><fieldset disabled={saving} className="space-y-5"><legend className="sr-only">Historical record details</legend>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fields.map((field) => <label key={field.path} className="space-y-1 text-xs">{field.label}{field.options ? <Choice label={field.label} value={values[field.path]} options={field.options.filter((option) => field.path !== "color.hue" || (values.variety === "RUBY" ? ["RED", "PURPLISH_RED"].includes(option) : !["RED", "PURPLISH_RED"].includes(option))).map((value) => ({ value, label: pretty(value) }))} onChange={(value) => setValues({ ...values, [field.path]: value, ...(field.path === "variety" ? { "color.hue": "" } : {}) })} /> : <Input type="number" step="any" aria-invalid={Boolean(errors[field.path])} value={values[field.path]} onChange={(event) => setValues({ ...values, [field.path]: event.target.value })} />}{errorFor(field.path)}</label>)}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(["source", "recordedAt", "totalPrice", "description"] as const).map((key) => <label key={key} className="space-y-1 text-xs">{key === "recordedAt" ? "Record date" : key === "totalPrice" ? "Total price (not per carat)" : pretty(key)}<Input type={key === "recordedAt" ? "date" : key === "totalPrice" ? "number" : "text"} step={key === "totalPrice" ? "any" : undefined} aria-invalid={Boolean(errors[key])} value={metadata[key]} onChange={(event) => setMetadata({ ...metadata, [key]: event.target.value })} />{errorFor(key)}</label>)}
        <label className="space-y-1 text-xs">Currency<Input value={metadata.currency} disabled={dataset === "MOCK"} maxLength={3} onChange={(event) => setMetadata({ ...metadata, currency: event.target.value.toUpperCase() })} />{errorFor("currency")}</label>
        {dataset === "REFERENCE" && <label className="space-y-1 text-xs">Price basis<Choice label="Price basis" value={metadata.priceBasis} options={["B2B_QUOTE", "COMPLETED_SALE", "RETAIL_ESTIMATE"].map((value) => ({ value, label: pretty(value) }))} onChange={(value) => setMetadata({ ...metadata, priceBasis: value })} />{errorFor("dataset")}</label>}
      </div><Notice message={message} error /><div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Record"}</Button><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button></div>
    </fieldset></form>
  </Panel>;
}

export default function DataRecords({ initialDataset = "REFERENCE", startCreate = false, initialRecordId = "" }: { initialDataset?: Dataset; startCreate?: boolean; initialRecordId?: string }) {
  const [dataset, setDataset] = useState<Dataset>(initialDataset);
  const { data, loading, error, reload } = useAdminResource<{ records: ManagedRecord[]; total: number; truncated: boolean }>(`/api/admin/data-records?dataset=${dataset}`);
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("ALL"); const [source, setSource] = useState("ALL");
  const [creating, setCreating] = useState(startCreate);
  const [editing, setEditing] = useState<ManagedRecord | null>(null);
  const [deleting, setDeleting] = useState<ManagedRecord | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null); const [selectedKey, setSelectedKey] = useState(initialRecordId);
  const selected = data?.records.find((record) => record.key === selectedKey) || null;
  const [quality, setQuality] = useState(false); const [permitted, setPermitted] = useState(false);
  const [staged, setStaged] = useState<unknown[] | null>(null); const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState(""); const [failure, setFailure] = useState(false); const [busy, setBusy] = useState(false);
  const records = (data?.records || []).filter((record) => (status === "ALL" || record.status === status) && (source === "ALL" || record.source === source)
    && `${record.recordId} ${record.variety} ${record.hue} ${record.source} ${record.treatment}`.toLowerCase().includes(search.toLowerCase()));
  async function act(record: ManagedRecord, action: string) {
    setBusy(true); setMessage("");
    try { await adminRequest(`/api/admin/data-records/${record.key}`, "PATCH", { dataset, action, revision: record.revision, qualityReviewed: quality, permittedUseConfirmed: permitted }); setSelectedKey(""); setFailure(false); setMessage("Record updated and the change recorded in audit history."); await reload(); }
    catch (error) { setFailure(true); setMessage(error instanceof Error ? error.message : "Unable to update record."); }
    finally { setBusy(false); }
  }
  async function deleteRecord() {
    if (!deleting || busy) return;
    setBusy(true); setDeleteError("");
    try {
      await adminRequest("/api/admin/data-records/" + deleting.key, "DELETE", { dataset: deleting.dataset, revision: deleting.revision });
      if (editing?.key === deleting.key) setEditing(null);
      setDeleting(null); setSelectedKey(""); setFailure(false); setMessage("Record deleted. Its audit history has been retained."); await reload();
    } catch (error) { setDeleteError(error instanceof Error ? error.message : "Unable to delete record."); }
    finally { setBusy(false); }
  }
  async function importRecords() {
    setBusy(true); setMessage("");
    try { const result = await adminRequest("/api/admin/data-records", "POST", { dataset: "MOCK", records: staged }); setStaged(null); setFailure(false); setMessage(`Imported ${result.added} sample records. Reference data was not changed.`); await reload(); }
    catch (error) { setFailure(true); setMessage(error instanceof Error ? error.message : "Unable to import records."); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
    <ConfirmDelete open={Boolean(deleting)} title={"Delete " + (deleting?.recordId || "record") + "?"} description={deleting?.dataset === "MOCK" ? "This removes the record from the list and future price comparisons. Its previous values and audit history are retained." : "This removes the reference from the active record list. Its source evidence and audit history are retained."} busy={busy} error={deleteError} onCancel={() => setDeleting(null)} onConfirm={deleteRecord} />
    <PageHeader title="Reference, Historical, Treatment & Origin Data" description="The evidence behind each suggestion. Keep development records separate from reviewed references.">
      <Button variant="outline" disabled={dataset !== "MOCK" || busy} onClick={() => fileRef.current?.click()}><Upload /> Bulk Import Sample Data</Button><Button variant="outline" disabled={busy} onClick={reload}>Refresh</Button><Button disabled={busy} onClick={() => { setEditing(null); setCreating(true); }}><Plus /> Add Record</Button>
    </PageHeader>
    <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" aria-label="Import sample records JSON" onChange={async (event) => {
      const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
      try { if (file.size > 2_000_000) throw new Error("Use a JSON file smaller than 2 MB."); const parsed = JSON.parse(await file.text()); if (!Array.isArray(parsed) || !parsed.length || parsed.length > 200) throw new Error("Provide an array of 1–200 sample historical records."); setStaged(parsed); setMessage(""); }
      catch (error) { setFailure(true); setMessage(error instanceof Error ? error.message : "Unable to read file."); }
    }} />
    <div className="flex flex-wrap gap-2">{(["REFERENCE", "MOCK"] as Dataset[]).map((value) => <Button key={value} variant={dataset === value ? "default" : "outline"} onClick={() => { setDataset(value); setSource("ALL"); setStatus("ALL"); setSelectedKey(""); setCreating(false); setEditing(null); setStaged(null); setMessage(""); }}>{value === "REFERENCE" ? "Sri Lankan Reference Data" : "Sample Historical Records"}</Button>)}</div>
    <Notice message={dataset === "MOCK" ? "Sample records are used by the development engine only. They do not represent verified gemstone trades." : "References stay outside the sample engine, including verified records. Verification requires source, quality and permitted-use checks by a different administrator."} />
    <Notice message={error || message} error={Boolean(error) || failure} />
    {staged && <Panel className="space-y-3"><h2 className="font-semibold">Review bulk import</h2><p className="text-sm">{staged.length} records selected. Use the sample-data import format with USD prices. Duplicate identifiers are rejected. The full batch is saved together.</p><Button disabled={busy} onClick={importRecords}>Import {staged.length} Sample Records</Button><Button className="ml-2" variant="outline" disabled={busy} onClick={() => setStaged(null)}>Cancel</Button></Panel>}
    {(creating || editing) && <div ref={editorRef}><RecordEditor key={editing?.key || dataset} dataset={dataset} record={editing || undefined} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); setFailure(false); setMessage("Record saved. Edited references require a new independent review."); reload(); }} /></div>}
    <div className="flex flex-wrap gap-3"><div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-slate-400" /><Input className="h-9 pl-9" placeholder="Search records..." aria-label="Search records" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Choice label="Source" value={source} options={[{ value: "ALL", label: "All Sources" }, ...[...new Set((data?.records || []).map((record) => record.source))].map((value) => ({ value, label: value }))]} onChange={setSource} /><Choice label="Status" value={status} options={["ALL", ...(dataset === "MOCK" ? ["MOCK", "INACTIVE"] : ["PENDING", "VERIFIED", "REJECTED"])].map((value) => ({ value, label: value === "ALL" ? "All Statuses" : pretty(value) }))} onChange={setStatus} /></div>
    <Panel className="overflow-x-auto !p-0"><table className="w-full text-left text-xs"><thead className="border-b text-[10px] uppercase tracking-wide text-slate-500"><tr>{["Record", "Stone / weight", "Quality", "Source", "Price basis", "Status", "Actions"].map((label) => <th key={label} className="px-4 py-4">{label}</th>)}</tr></thead><tbody>{records.map((record) => <tr key={record.key} className="border-b border-slate-100 last:border-0"><td className="px-4 py-4"><button className="font-medium text-blue-600 hover:underline" onClick={() => { setSelectedKey(record.key); setQuality(false); setPermitted(false); }}>{displayText(record.recordId)}</button></td><td className="px-4 py-4">{pretty(record.variety)} · {record.weight} ct<p className="mt-1 text-slate-400">{pretty(record.hue)}</p></td><td className="px-4 py-4 text-slate-500">{pretty(record.quality)}</td><td className="max-w-56 px-4 py-4 text-slate-500">{displayText(record.source)}<p className="mt-1 text-slate-400">{pretty(record.treatment)} · {record.date || "Date missing"}</p></td><td className="px-4 py-4">{record.currency} {record.totalPrice.toLocaleString()} total<p className="mt-1 text-slate-500">{record.weight > 0 ? `${(record.totalPrice / record.weight).toLocaleString(undefined, { maximumFractionDigits: 2 })}/ct` : "Weight missing"} · {pretty(record.priceBasis)}</p></td><td className="px-4 py-4"><StatusBadge status={record.status} /></td><td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="icon-sm" disabled={busy} aria-label={`Edit ${record.recordId}`} onClick={() => { setEditing(record); setCreating(false); setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth" }), 0); }}><Pencil className="size-3.5" /></Button><Button variant="ghost" size="icon-sm" disabled={busy} aria-label={`Delete ${record.recordId}`} onClick={() => { setDeleting(record); setDeleteError(""); }}><Trash2 className="size-3.5 text-red-600" /></Button></div></td></tr>)}</tbody></table>{loading && <p role="status" className="p-5 text-sm">Loading records...</p>}{!loading && !records.length && <p className="p-5 text-sm">No records match these filters.</p>}<p className="border-t p-3 text-xs text-slate-400">Showing {records.length} of {data?.total || 0} records{data?.truncated ? ". only the latest 500 are loaded" : ""}.</p></Panel>
    {selected && <Panel className="space-y-4"><div className="flex justify-between"><h2 className="font-semibold">Review {displayText(selected.recordId)}</h2><Button variant="ghost" size="icon" aria-label="Close record details" onClick={() => setSelectedKey("")}><X /></Button></div><p className="text-sm text-slate-500">{displayText(selected.description)}</p><p className="text-sm">Source: {displayText(selected.source)}. Basis: {pretty(selected.priceBasis)}. Date: {selected.date || "Missing"}.</p>
      {dataset === "MOCK" ? <Button disabled={busy} onClick={() => act(selected, selected.status === "INACTIVE" ? "ACTIVATE" : "DEACTIVATE")}>{selected.status === "INACTIVE" ? "Include in Sample Engine" : "Exclude from Sample Engine"}</Button> : selected.status !== "VERIFIED" ? <div className="space-y-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={quality} onChange={(event) => setQuality(event.target.checked)} />I reviewed the observations and source quality.</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={permitted} onChange={(event) => setPermitted(event.target.checked)} />Permitted use of this source has been confirmed.</label><Button disabled={busy || !quality || !permitted} onClick={() => act(selected, "VERIFY")}>Verify Reference</Button><Button className="ml-2" variant="outline" disabled={busy} onClick={() => act(selected, "REJECT")}>Reject Reference</Button></div> : <StatusBadge status="VERIFIED" />}
    </Panel>}
    <div className="grid gap-4 md:grid-cols-3"><Panel><h2 className="text-sm font-semibold">Treatment matching</h2><p className="mt-2 text-xs text-slate-500">Heated and unheated records are compared separately. Unknown treatment withholds pricing.</p><Link href="/admin/treatment-data" className="mt-4 inline-block text-xs text-blue-600">View treatment policy</Link></Panel><Panel><h2 className="text-sm font-semibold">Origin policy</h2><p className="mt-2 text-xs text-slate-500">Sri Lankan origin only. Reliability is declared separately. no automatic origin premium.</p><Link href="/admin/origin-data" className="mt-4 inline-block text-xs text-blue-600">View origin policy</Link></Panel><Panel><h2 className="text-sm font-semibold">Recommendations</h2><p className="mt-2 text-xs text-slate-500">Review the guidance generated from scores and missing information.</p><Link href="/admin/evaluation-rules/test" className="mt-4 inline-block text-xs text-blue-600">Test generated guidance</Link></Panel></div>
  </div>;
}
