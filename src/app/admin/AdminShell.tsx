"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";

type AdminShellProps = {
  children: React.ReactNode;
  user: { name: string; email: string };
};

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  return <div className="min-h-screen bg-[#f6f8fb]">
    <header className="flex items-center justify-between border-b bg-white p-4 lg:hidden">
      <Link href="/admin/dashboard" className="font-semibold">Open 4Cs Administration</Link>
      <button type="button" aria-label={menuOpen ? "Close administration menu" : "Open administration menu"} aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border p-2">
        {menuOpen ? <X className="size-5"/> : <Menu className="size-5"/>}
      </button>
    </header>
    {menuOpen && <button type="button" aria-label="Close administration menu backdrop" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"/>}
    <AdminSidebar pathname={pathname} user={user} open={menuOpen} onNavigate={() => setMenuOpen(false)}/>
    <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
      <div className="min-w-0 flex-1">{children}</div>
      <AdminFooter />
    </div>
  </div>;
}
