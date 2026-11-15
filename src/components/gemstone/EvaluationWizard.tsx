"use client";
import { displayText } from "@/lib/display-text";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Gem, LoaderCircle, Save, ShieldCheck, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { blankDraft, draftErrors, EVALUATION_STEPS, firstErrorStep, observationsFromDraft, STEP_FIELDS, type ObservationDraft } from "@/lib/evaluation/wizard";
import type { UserCatalogueEntry } from "./GemstoneCatalogue";
import type { RuleSet, Variety } from "@/lib/evaluation/types";

const pretty = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
const severity = ["NONE", "MINOR", "MODERATE", "SEVERE"];
const titles = ["Select Your Gemstone", "Gemstone Information", "1. Color Evaluation", "2. Clarity Evaluation", "3. Cut Evaluation", "4. Carat Weight", "Additional Factors", "Review Your Evaluation"];
const descriptions = ["Choose an available managed catalogue entry to begin.", "Record what you know about your Sri Lankan gemstone.", "Record hue, tone, saturation and visible zoning.", "Observe with the naked eye, then a 10× loupe.", "Enter measurements and visible cut characteristics.", "Record the measured weight in carats.", "Declare treatment and the source of your origin information.", "Confirm your observations before evaluating and saving."];
const subscribeDraft = (notify: () => void) => { window.addEventListener("storage", notify); return () => window.removeEventListener("storage", notify); };
export default function EvaluationWizard({ userId, initialVariety, initialCatalogueId }: { userId: string; initialVariety?: Variety; initialCatalogueId?: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ObservationDraft>(() => ({ ...blankDraft(), ...(initialVariety ? { variety: initialVariety } : {}) }));
  const [catalogue, setCatalogue] = useState<UserCatalogueEntry[]>([]);
  const [catalogueId, setCatalogueId] = useState(initialCatalogueId || "");
  const selectedEntry = catalogue.find((entry)=>entry._id === catalogueId);
  const [step, setStep] = useState(0);
  const [rules, setRules] = useState<Record<Variety, RuleSet> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const key = useRef<string | null>(null);
  const draftKey = `open4cs-evaluation-draft:${userId}`;
  const draftAvailable = useSyncExternalStore(subscribeDraft, () => { try { return Boolean(localStorage.getItem(draftKey)); } catch { return false; } }, () => false);
  const heading = useRef<HTMLHeadingElement>(null);
  const activeRule = rules?.[draft.variety as Variety];
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalogue", { signal: controller.signal, cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load evaluation rules.");
      setRules(data.rules); setCatalogue(data.catalogue);
      const initial = data.catalogue.find((entry: UserCatalogueEntry)=>entry._id === initialCatalogueId && entry.eligible)
        || data.catalogue.find((entry: UserCatalogueEntry)=>initialVariety && entry.evaluationVariety === initialVariety && entry.eligible);
      if (initial) { setCatalogueId(initial._id); setDraft((previous)=>({...previous,variety:initial.evaluationVariety})); }
    }).catch((error) => { if (!controller.signal.aborted) setLoadError(error.message); });
    return () => controller.abort();
  }, [draftKey, initialCatalogueId, initialVariety]);
  function move(next: number, focusPath?: string) {
    setStep(next);
    requestAnimationFrame(() => { if (focusPath) document.getElementById(`evaluation-${focusPath}`)?.focus(); else heading.current?.focus(); });
  }
  function update(path: string, value: string) {
    setDraft((previous) => ({ ...previous, [path]: value, ...(path === "variety" ? { "color.hue": "" } : {}) }));
    key.current = null; setErrors((previous) => ({ ...previous, [path]: "" })); setMessage("");
  }
  function validate(nextStep?: number) {
    if (!rules) return false;
    const found = draftErrors(draft, rules, nextStep);
    if (!selectedEntry?.eligible || selectedEntry.evaluationVariety !== draft.variety) found.variety = "Select an available managed catalogue entry.";
    if ((nextStep === undefined || nextStep === 1 || nextStep === 7) && draft.shape && !selectedEntry?.supportedShapes?.includes(draft.shape)) found.shape = "Choose a shape enabled for this catalogue entry.";
    if ((nextStep === undefined || nextStep === 2 || nextStep === 7) && draft["color.hue"] && !selectedEntry?.supportedHues?.includes(draft["color.hue"])) found["color.hue"] = "Choose a hue enabled for this catalogue entry.";
    setErrors(found);
    if (Object.keys(found).length) { const path = Object.keys(found)[0]; move(firstErrorStep(found), path); setMessage("Please correct the highlighted fields before continuing."); return false; }
    setMessage(""); return true;
  }
  function saveDraft() {
    try { localStorage.setItem(draftKey, JSON.stringify({ version: 1, draft, step, catalogueId, submissionKey: key.current })); window.dispatchEvent(new Event("storage")); setMessage("Draft saved on this browser for your account. It has not been evaluated."); }
    catch { setMessage("Your browser could not save this draft. You can continue your evaluation."); }
  }
  function restoreDraft() {
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (saved?.version !== 1 || !saved.draft || typeof saved.draft !== "object") throw new Error();
      const paths: readonly string[] = STEP_FIELDS.flat();
      const restored = Object.fromEntries(Object.entries(saved.draft).filter(([path, value]) => paths.includes(path) && typeof value === "string")) as ObservationDraft;
      setDraft({ ...restored, origin: "Sri Lanka" }); setCatalogueId(typeof saved.catalogueId === "string" ? saved.catalogueId : "");
      key.current = typeof saved.submissionKey === "string" ? saved.submissionKey : null;
      move(Number.isInteger(saved.step) && saved.step >= 0 && saved.step <= 7 ? saved.step : 0); setErrors({}); setMessage("Draft restored. Review the observations before submitting.");
    } catch { setMessage("This draft could not be restored. Please start a new evaluation."); }
  }
  async function submit() {
    if (busy || !validate()) return;
    setBusy(true); key.current ||= crypto.randomUUID();
    try {
      // Retain the retry key if a saved response is lost or this draft is resumed.
      try { localStorage.setItem(draftKey, JSON.stringify({ version: 1, draft, step, catalogueId, submissionKey: key.current })); } catch { /* Saving to the server still works. */ }
      const response = await fetch("/api/evaluations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ observations: { ...observationsFromDraft(draft), catalogueId }, submissionKey: key.current }) });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors || {}); setMessage(data.message || "Evaluation could not be saved. Please try again.");
        if (Object.keys(data.errors || {}).length) move(Math.max(0, firstErrorStep(data.errors)), Object.keys(data.errors)[0]);
        setBusy(false); return;
      }
      try { localStorage.removeItem(draftKey); } catch { /* Saved evaluation is available on the dashboard. */ }
      router.push(`/evaluations/${data.evaluation._id}`);
    } catch { setMessage("Connection interrupted. Your observations are still here. Retry to check or save this evaluation without creating a duplicate."); setBusy(false); }
  }
  function field(path: string, label: string, options?: readonly string[]) {
    const id = `evaluation-${path}`;
    return <div key={path} className="space-y-2"><label htmlFor={id} className="text-sm font-medium text-slate-700">{label} <span className="text-red-500">*</span></label>
      {options ? <Select value={draft[path] || ""} onValueChange={(value) => { if (value !== null) update(path, value); }}><SelectTrigger id={id} className="h-11 w-full bg-white" aria-invalid={Boolean(errors[path])} aria-describedby={errors[path] ? `${id}-error` : undefined}><SelectValue placeholder="Select an option">{draft[path] ? pretty(draft[path]) : "Select an option"}</SelectValue></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{pretty(option)}</SelectItem>)}</SelectContent></Select>
        : <Input id={id} type="number" min={path === "color.tone" ? 0 : 0.01} max={path === "color.tone" ? 10 : 100} step={path === "color.tone" ? 1 : "any"} className="h-11 bg-white" value={draft[path] || ""} onChange={(event) => update(path, event.target.value)} onBlur={() => { if (rules) setErrors((previous) => ({ ...previous, [path]: draftErrors(draft, rules)[path] || "" })); }} aria-invalid={Boolean(errors[path])} aria-describedby={errors[path] ? `${id}-error` : undefined} />}
      {errors[path] && <p id={`${id}-error`} className="text-sm text-destructive" role="alert">{errors[path]}</p>}</div>;
  }
  const box = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
  const length = Number(draft["cut.length"]), width = Number(draft["cut.width"]), depth = Number(draft["cut.depth"]);
  const denominator = draft.shape === "ROUND" ? (length + width) / 2 : width;
  const validDimensions = length > 0 && width > 0 && depth > 0 && length >= width;
  if (busy) return <section className="mx-auto max-w-2xl space-y-6 py-12 text-center" aria-live="polite" aria-busy="true"><LoaderCircle className="mx-auto size-12 animate-spin text-blue-600" /><h1 className="text-3xl font-bold">Evaluating your gemstone</h1><p className="text-sm text-slate-500">The server is validating your observations, applying active rules, finding eligible B2B comparables and saving the result.</p><div className={`${box} text-left`}><p className="flex items-center gap-3"><Check className="text-emerald-600" />Form checks passed</p><p className="mt-5 flex items-center gap-3"><LoaderCircle className="animate-spin text-blue-600" />Evaluating and saving…</p></div><p className="text-sm text-slate-500">Your saved result will open when the server confirms completion.</p></section>;
  return <div className="space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><h1 ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">{titles[step]}</h1><p className="mt-2 text-sm text-slate-500">Step {step + 1} of 8 · {descriptions[step]}</p></div><Button variant="outline" onClick={saveDraft}><Save />Save Draft</Button></header>
    <nav aria-label="Evaluation steps" className={`${box} flex overflow-x-auto !p-4`}>{EVALUATION_STEPS.map((label, index) => <div key={label} className="flex min-w-24 flex-1 items-center gap-2 text-xs"><span aria-current={index === step ? "step" : undefined} className={`flex size-6 shrink-0 items-center justify-center rounded-full ${index < step ? "bg-emerald-600 text-white" : index === step ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>{index < step ? <Check className="size-3" /> : index + 1}</span><span className={index === step ? "font-semibold" : "text-slate-500"}>{label}</span></div>)}</nav>
    {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">{displayText(loadError)}<Button variant="outline" className="ml-3" onClick={() => window.location.reload()}>Retry</Button></div>}
    {!rules && !loadError && <p role="status" className="text-sm text-slate-500">Loading evaluation rules…</p>}
    {rules && !catalogue.some((entry)=>entry.eligible) && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No catalogue entries are ready for evaluation. An administrator must configure the catalogue and obtain independent rule approval.</p>}
    {message && <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{displayText(message)}</p>}
    {step === 0 && draftAvailable && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 text-sm"><span>A draft is available in this browser.</span><Button variant="outline" onClick={restoreDraft}>Resume Draft</Button></div>}
    <form noValidate onSubmit={(event) => { event.preventDefault(); if (step === 7) void submit(); else if (validate(step)) move(step + 1); }} className="flex min-h-[65vh] flex-col gap-6"><div className="flex-1">
      {step === 0 ? <div><div id="evaluation-variety" tabIndex={-1} className="grid gap-5 sm:grid-cols-2">{catalogue.filter((entry)=>entry.status === "ACTIVE").map((entry) => <button type="button" key={entry._id} disabled={!entry.eligible} onClick={() => { setCatalogueId(entry._id); update("variety", entry.evaluationVariety!); setDraft((previous)=>({...previous,shape:""})); }} aria-pressed={catalogueId === entry._id} className={`overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition ${catalogueId === entry._id ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-300"}`}><div className={`relative flex h-44 items-center justify-center ${entry.evaluationVariety === "RUBY" ? "bg-gradient-to-br from-rose-50 to-rose-200 text-rose-600" : "bg-gradient-to-br from-blue-50 to-blue-200 text-blue-600"}`}><Gem className="size-24" strokeWidth={1} />{catalogueId === entry._id && <Check className="absolute right-4 top-4 rounded-full bg-slate-900 p-1 text-white" />}</div><div className="p-5"><h2 className="font-semibold">{entry.name}</h2><p className="mt-2 text-sm text-slate-500">{entry.eligible ? `Approved rule: ${entry.ruleVersion}` : entry.unavailableReason}</p></div></button>)}</div>{errors.variety && <p role="alert" className="mt-3 text-sm text-destructive">{errors.variety}</p>}</div>
      : <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]"><section className={`${box} space-y-6`}>
        {step === 1 && <><h2 className="font-semibold">{pretty(draft.variety)} · basic information</h2><div className="grid gap-5 sm:grid-cols-2">{field("origin", "Origin", ["Sri Lanka"])}{field("shape", "Shape / cut style", selectedEntry?.supportedShapes || [])}</div><p className="text-sm text-slate-500">An evaluation ID is generated when your result is saved.</p></>}
        {step === 2 && <><h2 className="font-semibold">Hue, tone & saturation</h2><div className="grid gap-5 sm:grid-cols-2">{field("color.hue", "Hue", selectedEntry?.supportedHues || [])}{field("color.tone", "Tone (whole number, 0–10)")}{field("color.saturation", "Saturation", ["WEAK", "MEDIUM", "STRONG", "VIVID"])}{field("color.distribution", "Color distribution", ["EVEN", "UNEVEN"])}{field("color.zoning", "Color zoning", severity)}</div></>}
        {step === 3 && <><h2 className="font-semibold">Naked-eye & 10× loupe observations</h2><div className="grid gap-5 sm:grid-cols-2">{field("clarity.nakedEye", "Naked-eye observation", ["CLEAN", "SLIGHTLY_INCLUDED", "INCLUDED"])}{field("clarity.loupe10x", "10× loupe inclusions", ["MINOR", "MODERATE", "HEAVY"])}{field("clarity.severity", "Inclusion severity", severity)}</div></>}
        {step === 4 && <><h2 className="font-semibold">Measurements (mm)</h2><div className="grid gap-4 sm:grid-cols-3">{["length", "width", "depth"].map((path) => field(`cut.${path}`, pretty(path)))}</div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-sky-50 p-4"><p className="text-xs text-slate-500">LENGTH : WIDTH</p><strong>{validDimensions ? (length / width).toFixed(2) : "—"}</strong></div><div className="rounded-xl bg-indigo-50 p-4"><p className="text-xs text-slate-500">DEPTH %</p><strong>{validDimensions ? `${(depth / denominator * 100).toFixed(1)}%` : "—"}</strong></div></div><h2 className="font-semibold">Cut characteristics</h2><div className="grid gap-5 sm:grid-cols-2">{["symmetry", "polish"].map((path) => field(`cut.${path}`, pretty(path), ["EXCELLENT", "GOOD", "FAIR", "POOR"]))}{["windowing", "extinction", "bulging"].map((path) => field(`cut.${path}`, pretty(path), severity))}</div></>}
        {step === 5 && <><h2 className="font-semibold">Carat weight</h2>{field("caratWeight", "Carat weight (ct)")}<p className="text-sm text-slate-500">Enter 0.01–100 ct. Use a calibrated scale. the system does not independently verify your measurement.</p><div className="rounded-xl bg-slate-50 p-4 text-sm">Dimensions: {draft["cut.length"]} × {draft["cut.width"]} × {draft["cut.depth"]} mm</div></>}
        {step === 6 && <><h2 className="font-semibold">Treatment & origin information</h2><div className="grid gap-5 sm:grid-cols-2">{field("treatment", "Treatment status", ["UNHEATED", "HEATED", "UNKNOWN"])}{field("originReliability", "Declared origin information source", ["LAB_VERIFIED", "SELLER_PROVIDED", "UNVERIFIED"])}</div><p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">These are your declarations. Selecting “Lab verified” does not attach or verify a report. Unknown treatment allows scoring but withholds a price suggestion.</p></>}
        {step === 7 && <><h2 className="font-semibold">Review your observations</h2>{STEP_FIELDS.map((paths, index) => <div key={index} className="rounded-xl border p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{EVALUATION_STEPS[index]}</h3><Button type="button" variant="ghost" size="sm" onClick={() => move(index)}><Pencil className="size-3" />Edit</Button></div><p className="mt-2 text-sm leading-6 text-slate-500">{paths.map((path) => `${pretty(path.split(".").pop() || path)}: ${draft[path] ? pretty(draft[path]) : "Missing"}`).join(" · ")}</p></div>)}</>}
      </section><aside className="space-y-4"><div className={`${box} space-y-3`}><ShieldCheck className="text-blue-600" /><h2 className="text-sm font-semibold">{step === 3 ? "Observation guide" : "Evaluation information"}</h2><p className="text-sm leading-6 text-slate-500">{step === 3 ? "First inspect with the naked eye in consistent light, then use a 10× loupe. Record what you observe rather than assuming an inclusion grade." : step === 4 ? "Enter the longest face-up dimension as length. Round stones must have a length-to-width ratio no greater than 1.10. Depth uses width, or average diameter for round stones." : "Required fields are marked with *. Your observations will be checked before proceeding and checked again by the server."}</p>{activeRule && <p className="border-t pt-3 text-xs text-blue-600">Active rule: {displayText(activeRule.version)}</p>}</div><div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-900">Scores use independently approved rules. Pricing uses only eligible reviewed B2B quotations in the approved currency. Insufficient evidence produces a saved result without a price.</div></aside></div>}
    </div><footer className="flex items-center justify-between gap-4 border-t pt-5">{step > 0 ? <Button type="button" variant="outline" onClick={() => move(step - 1)}><ArrowLeft />Back</Button> : <Link href="/dashboard" className="text-sm text-slate-500">Cancel</Link>}<Button type="submit" disabled={!rules || !selectedEntry?.eligible}>{step === 7 ? "Evaluate & Save" : step === 6 ? "Review Evaluation" : "Continue"}<ArrowRight /></Button></footer></form>
  </div>;
}


