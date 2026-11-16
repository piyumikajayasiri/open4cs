"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Gem, LayoutDashboard, Plus, History, BookOpen, ShieldCheck, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UserIdentity { id: string; name: string; email: string; category: string; role: string }
export default function UserShell({ user, children, currentPage }: { user: UserIdentity; children: ReactNode; currentPage?: string }) {
  const pathname = usePathname();
  const navigation = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/evaluate", label: "New Evaluation", icon: Plus },
    { href: "/dashboard?tab=evaluations", label: "My Evaluations", icon: FileText },
    { href: "/dashboard?tab=history", label: "Evaluation History", icon: History },
    { href: "/compare", label: "Compare Gemstones", icon: Gem },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/catalogue", label: "Gemstone Catalogue", icon: BookOpen },
  ];
  return <div className="flex min-h-screen bg-slate-50 text-slate-900">
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#101b2e] p-4 text-white lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-3 pt-2"><Gem className="size-8 text-blue-400" /><div><strong className="block">Open 4Cs</strong><span className="text-xs text-slate-400">Gemstone Evaluation</span></div></Link>
      <nav className="flex-1 space-y-2">{navigation.map((item) => <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${(currentPage || (pathname.startsWith("/evaluations/") ? "/dashboard?tab=evaluations" : pathname)) === item.href ? "bg-white font-semibold text-slate-900" : "text-slate-300 hover:bg-white/10"}`}><item.icon className="size-4" />{item.label}</Link>)}
        {user.role === "ADMIN" && <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/10"><ShieldCheck className="size-4" />Administration</Link>}
      </nav>
      <div className="border-t border-white/10 pt-4"><p className="truncate text-sm font-medium">{user.name}</p><p className="mt-1 truncate text-xs text-slate-400">{user.email}</p><Button variant="ghost" className="mt-3 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => signOut({ callbackUrl: "/login" })}><LogOut />Sign out</Button></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="border-b bg-white p-4 text-sm lg:hidden"><div className="flex items-center justify-between"><Link href="/dashboard" className="font-bold">Open 4Cs</Link><Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</Button></div><nav aria-label="Account navigation" className="mt-3 flex flex-wrap gap-x-4 gap-y-3 text-xs text-slate-600">{navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav></header><main className="mx-auto max-w-7xl space-y-6 p-5 sm:p-6 lg:p-8">{children}</main></div>
  </div>;
}
