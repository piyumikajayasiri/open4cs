"use client";
import { displayText } from "@/lib/display-text";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import EvaluationResult from "./EvaluationResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_EXAMPLES } from "@/lib/evaluation/mock-data";
import type { EvaluationInput, Variety, RuleSet } from "@/lib/evaluation/types";
import type { evaluateMock } from "@/lib/evaluation/engine";

type Result = ReturnType<typeof evaluateMock>;
type Section = "color" | "clarity" | "cut";
const title = (value: string) => displayText(value).replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase());
const severity = ["NONE", "MINOR", "MODERATE", "SEVERE"];

export default function RulePreview({ mode = "preview" }: { mode?: "preview" | "submit" }) {
  const [saved, setSaved] = useState<{ id: string; evaluationId: string } | null>(null);
  const submissionKey = useRef<string | null>(null);
  const [input, setInput] = useState<EvaluationInput>(structuredClone(MOCK_EXAMPLES.RUBY));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [catalog, setCatalog] = useState<Record<Variety, RuleSet> | null>(null);
  const [recordCount, setRecordCount] = useState(0);
  const [loadError, setLoadError] = useState("");
  const rules = catalog?.[input.variety];

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/evaluations/preview", { signal: controller.signal, cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load sample records and rules.");
        setCatalog(data.rules); setRecordCount(data.recordCount);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Unable to load sample data.");
      }
    }
    load();
    return () => controller.abort();
  }, []);

  function update(path: string, value: string | number) {
    const [section, field] = path.split(".");
    setInput((previous) => field ? { ...previous, [section]: { ...previous[section as Section], [field]: value } } : { ...previous, [path]: value });
    setResult(null); setSaved(null); submissionKey.current = null;
    setErrors((previous) => ({ ...previous, [path]: "" }));
  }

  function field(path: string, label: string, value: string | number, options?: readonly string[]) {
    const id = `preview-${path}`;
    return <div key={path} className="space-y-2">
      <label id={`${id}-label`} htmlFor={id} className="text-sm font-medium">{label}</label>
      {options ? <Select value={String(value)} onValueChange={(next) => { if (next !== null) update(path, next); }}>
        <SelectTrigger id={id} className="h-10 w-full" aria-labelledby={`${id}-label`} aria-invalid={Boolean(errors[path])} aria-describedby={errors[path] ? `${id}-error` : undefined}><SelectValue>{title(String(value))}</SelectValue></SelectTrigger>
        <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{title(option)}</SelectItem>)}</SelectContent>
      </Select> : <Input id={id} type="number" step={path === "color.tone" ? 1 : "any"} className="h-10" value={Number.isFinite(value) ? value : ""}
        aria-invalid={Boolean(errors[path])} aria-describedby={errors[path] ? `${id}-error` : undefined}
        onChange={(event) => update(path, event.target.value === "" ? NaN : Number(event.target.value))} />}
      {errors[path] && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{errors[path]}</p>}
    </div>;
  }

  async function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || mode === "submit" && saved) return;
    setSaving(true); setErrors({}); setMessage(""); setResult(null);
    try {
      if (mode === "submit" && !submissionKey.current) submissionKey.current = crypto.randomUUID();
      const response = await fetch(mode === "submit" ? "/api/evaluations" : "/api/evaluations/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "submit" ? { observations: input, submissionKey: submissionKey.current } : input) });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors || {}); setMessage(data.message || "Preview failed.");
        const first = Object.keys(data.errors || {})[0];
        if (first) document.getElementById(`preview-${first}`)?.focus();
        return;
      }
      setResult(mode === "submit" ? data.evaluation.result : data.evaluation);
      if (mode === "submit") setSaved({ id: data.evaluation._id, evaluationId: data.evaluation.evaluationId });
    } catch { setMessage("Unable to connect. Please try again."); }
    finally { setSaving(false); }
  }

  if (!rules) return <div className="rounded-xl border bg-white p-5 space-y-3">
    <p role={loadError ? "alert" : "status"}>{displayText(loadError || "Loading historical sample records and evaluation rules...")}</p>
    {loadError && <Button type="button" variant="outline" onClick={() => window.location.reload()}>Try again</Button>}
  </div>;

  return <div className="space-y-6">
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      <strong>{mode === "submit" ? "Gemstone evaluation" : "Sample evaluation preview"}</strong><p>All scores, thresholds, comparable records and prices are invented for testing. These rules are provisional and have not been approved by CAGS. {mode === "submit" ? "Submitting evaluates your observations and saves the results to your account." : "Previews are not saved."}</p>
    </div>
    <section className="rounded-xl border bg-white p-5 space-y-4">
      <div className="flex flex-wrap gap-2">{(["RUBY", "SAPPHIRE"] as Variety[]).map((variety) => <Button type="button" key={variety} variant={input.variety === variety ? "default" : "outline"} disabled={saving} onClick={() => {
        setInput(structuredClone(MOCK_EXAMPLES[variety])); setErrors({}); setMessage(""); setResult(null); setSaved(null); submissionKey.current = null;
      }}>Load sample {variety.toLowerCase()}</Button>)}</div>
      <h2 className="text-lg font-semibold">{title(input.variety)} rules: {displayText(rules.version)}</h2>
      <p className="text-sm text-muted-foreground">Sample weights: colour {rules.weights.color * 100}%, clarity {rules.weights.clarity * 100}%, cut {rules.weights.cut * 100}%, size {rules.weights.carat * 100}%. The size score is a test convention, not a quality grade.</p>
      <p className="text-sm text-muted-foreground">{recordCount} historical sample records loaded. Sri Lankan origin only. Prices come from at least {rules.matching.minimumComparables} matching historical records, with a provisional range of ±{rules.rangePercentage}%. No fixed base price is used.</p>
    </section>
    {saved && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-3"><h2 className="font-semibold text-emerald-900">Evaluation saved</h2><p className="text-sm text-emerald-800">Your results and the applied rule version have been saved.</p><div className="flex flex-wrap gap-4 text-sm"><Link className="font-medium text-blue-700 underline" href={"/evaluations/" + saved.id}>View saved evaluation</Link><Link className="font-medium text-blue-700 underline" href="/dashboard">Go to dashboard</Link></div></div>}
    <form onSubmit={preview} noValidate className="space-y-6">
      <fieldset disabled={saving} className="space-y-6">
        <legend className="sr-only">Sample gemstone observations</legend>
        <section className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">Basic information</h2>
          <p className="text-sm text-muted-foreground">Origin: Sri Lanka (test declaration). Changing a reliability label does not verify origin.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field("caratWeight", "Weight (ct)", input.caratWeight)}
            {field("shape", "Shape", input.shape, ["OVAL", "ROUND", "CUSHION", "PEAR", "EMERALD"])}
            {field("treatment", "Treatment", input.treatment, ["UNHEATED", "HEATED", "UNKNOWN"])}
            {field("originReliability", "Origin information source", input.originReliability, ["LAB_VERIFIED", "SELLER_PROVIDED", "UNVERIFIED"])}
          </div>
        </section>
        <section className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">Colour</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field("color.hue", "Hue", input.color.hue, rules.hues)}
            {field("color.tone", "Tone (whole number, 0–10)", input.color.tone)}
            {field("color.saturation", "Saturation", input.color.saturation, ["WEAK", "MEDIUM", "STRONG", "VIVID"])}
            {field("color.distribution", "Distribution / uniformity", input.color.distribution, ["EVEN", "UNEVEN"])}
            {field("color.zoning", "Zoning", input.color.zoning, severity)}
          </div>
        </section>
        <section className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">Clarity</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field("clarity.nakedEye", "Naked-eye observations", input.clarity.nakedEye, ["CLEAN", "SLIGHTLY_INCLUDED", "INCLUDED"])}
            {field("clarity.loupe10x", "10× loupe inclusions", input.clarity.loupe10x, ["MINOR", "MODERATE", "HEAVY"])}
            {field("clarity.severity", "Inclusion severity", input.clarity.severity, severity)}
          </div>
        </section>
        <section className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">Cut and measurements</h2>
          <p className="text-sm text-muted-foreground">Enter the longest face-up dimension as length. Test limits: 0.01–100 mm and 0.01–100 ct.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(["length", "width", "depth"] as const).map((key) => field(`cut.${key}`, `${title(key)} (mm)`, input.cut[key]))}
            {(["symmetry", "polish"] as const).map((key) => field(`cut.${key}`, title(key), input.cut[key], ["EXCELLENT", "GOOD", "FAIR", "POOR"]))}
            {(["windowing", "extinction", "bulging"] as const).map((key) => field(`cut.${key}`, title(key), input.cut[key], severity))}
          </div>
        </section>
        {message && <p role="alert" className="text-sm text-destructive">{displayText(message)}</p>}
        <Button type="submit" disabled={saving || mode === "submit" && Boolean(saved)}>{saving ? mode === "submit" ? "Evaluating and saving..." : "Calculating..." : mode === "submit" ? saved ? "Saved" : "Evaluate & Save" : "Run sample evaluation"}</Button>
      </fieldset>
    </form>
    {result && <EvaluationResult result={result} input={input} />}
  </div>;
}
