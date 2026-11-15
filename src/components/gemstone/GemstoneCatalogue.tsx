"use client";
import { displayText } from "@/lib/display-text";
import { useState } from "react";
import Link from "next/link";
import { Gem, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
const stones = [
  { variety: "RUBY", name: "Ruby", description: "Red and purplish-red corundum. Uses the ruby evaluation rule set.", color: "from-rose-100 to-red-200 text-rose-600" },
  { variety: "SAPPHIRE", name: "Sapphire", description: "Blue, pink, yellow, green, purple and colorless corundum. Choose the observed hue during evaluation.", color: "from-blue-100 to-indigo-200 text-blue-600" },
];
export default function GemstoneCatalogue() {
  const [query, setQuery] = useState("");
  const filtered = stones.filter((stone) => `${stone.name} ${stone.description}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8"><header className="flex flex-wrap items-start justify-between gap-4 border-b pb-6"><div><h1 className="text-2xl font-bold">Gemstone Catalogue</h1><p className="mt-2 text-sm text-slate-500">Evaluate supported Sri Lankan ruby and sapphire</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">2 supported varieties</span></header><div className="relative my-6"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><Input aria-label="Search gemstone varieties" placeholder="Search gemstone variety or hue…" className="h-10 pl-10" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="grid gap-6 sm:grid-cols-2">{filtered.map((stone) => <article key={stone.variety} className="overflow-hidden rounded-xl border"><div className={`relative flex h-48 items-center justify-center bg-gradient-to-br ${stone.color}`}><Gem className="size-28" strokeWidth={1} /><span className="absolute left-3 top-3 rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-800">Supported</span></div><div className="space-y-4 p-5"><h2 className="font-semibold">{stone.name}</h2><p className="flex items-center gap-1 text-xs text-blue-600"><MapPin className="size-3" />Sri Lanka</p><p className="min-h-12 text-sm leading-6 text-slate-500">{displayText(stone.description)}</p><Link href={`/evaluate?variety=${stone.variety}`} className="block rounded-lg bg-slate-900 px-4 py-3 text-center text-sm text-white hover:bg-slate-800">Select for Evaluation</Link></div></article>)}</div>{!filtered.length && <p className="py-12 text-center text-sm text-slate-500">No supported varieties match your search.</p>}<p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Star sapphire and padparadscha-specific grading are not supported by the current engine. Real Sri Lankan reference records remain separate from sample data.</p></section>;
}

