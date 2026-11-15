import Link from "next/link";
import { Gem, SlidersHorizontal, Database, History, Users } from "lucide-react";
const sections = [
  { href: "/admin/gemstones", title: "Gemstone Catalogue", text: "Manage supported gemstone varieties.", icon: Gem },
  { href: "/admin/evaluation-rules", title: "4C Rules & Pricing", text: "Propose, review and compare sample rule versions.", icon: SlidersHorizontal },
  { href: "/admin/historical-pricing", title: "Historical & Reference Data", text: "Manage evidence while keeping sample and reference data separate.", icon: Database },
  { href: "/admin/rule-versions", title: "Versions & Audit", text: "Follow administrative changes and independent reviews.", icon: History },
  { href: "/admin/users", title: "User Management", text: "Manage user accounts and administrator access.", icon: Users },
];
export default function AdminDashboard() {
  return <main className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8"><div><h1 className="text-2xl font-bold">Administration Dashboard</h1><p className="mt-2 text-sm text-slate-500">Manage evaluation rules, source data and governance for Open 4Cs.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sections.map((section) => <Link key={section.href} href={section.href} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"><section.icon className="mb-4 size-6 text-blue-600" /><h2 className="font-semibold">{section.title}</h2><p className="mt-2 text-sm text-slate-500">{section.text}</p></Link>)}</div></main>;
}
