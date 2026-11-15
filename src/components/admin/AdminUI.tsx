"use client";
import { displayText } from "@/lib/display-text";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export class ApiError extends Error {
  errors: Record<string, string>;
  constructor(message: string, errors: Record<string, string> = {}) { super(message); this.errors = errors; }
}
export async function adminRequest(url: string, method = "GET", body?: unknown) {
  const response = await fetch(url, { method, cache: "no-store", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.message || "Unable to complete the request.", data.errors);
  return data;
}
export function useAdminResource<T>(url: string) {
  const [resource, setResource] = useState<{ url: string; value: T } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    const current = ++sequence.current;
    setLoading(true); setError("");
    try { const value = await adminRequest(url); if (current === sequence.current) setResource({ url, value }); }
    catch (error) { if (current === sequence.current) setError(error instanceof Error ? error.message : "Unable to load records."); }
    finally { if (current === sequence.current) setLoading(false); }
  }, [url]);
  useEffect(() => { let cancelled = false; queueMicrotask(() => { if (!cancelled) reload(); }); return () => { cancelled = true; }; }, [reload]);
  return { data: resource?.url === url ? resource.value : null, error, loading, reload };
}
export const pretty = (text: string) => displayText(text).replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
export function StatusBadge({ status }: { status: string }) {
  const positive = ["ACTIVE", "VERIFIED"].includes(status);
  const negative = ["INACTIVE", "REJECTED"].includes(status);
  return <Badge variant="outline" className={positive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : negative ? "border-rose-200 bg-rose-50 text-rose-700" : status === "PENDING" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-600"}>{pretty(status)}</Badge>;
}
export function PageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">{displayText(title)}</h1><p className="mt-1 text-sm text-slate-500">{displayText(description)}</p></div><div className="flex flex-wrap gap-2">{children}</div></header>;
}
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}
export function Notice({ message, error = false }: { message: string; error?: boolean }) {
  return message ? <p role={error ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-blue-100 bg-blue-50 text-blue-900"}`}>{displayText(message)}</p> : null;
}
export function Choice({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <div className="space-y-1"><span className="sr-only">{label}</span><Select value={value} onValueChange={(next) => { if (next !== null) onChange(next); }}><SelectTrigger className="h-9 w-full min-w-36" aria-label={label}><SelectValue>{displayText(options.find((option) => option.value === value)?.label || "Choose...")}</SelectValue></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{displayText(option.label)}</SelectItem>)}</SelectContent></Select></div>;
}
