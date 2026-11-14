"use client";

import Link from "next/link";
import {
  Clock3,
  Gem,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";

type AdminSidebarProps = {
  pathname: string;
  user: {
    name: string;
    email: string;
  };
};

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Gemstone Catalogue",
    href: "/admin/gemstones",
    icon: Gem,
  },
  {
    label: "Market Evidence",
    href: "/admin/reference-gemstones",
    icon: Star,
  },
  {
    label: "Rules & Versions",
    href: "/admin/evaluation-rules",
    icon: SlidersHorizontal,
  },
  {
    label: "Users & Access",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    icon: Clock3,
  },
];

export default function AdminSidebar({ pathname, user }: AdminSidebarProps) {
  function isActive(href: string) {
    if (href === "/admin" || href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <aside className="w-64 bg-[#07131D] text-slate-200 flex flex-col shrink-0 border-r border-slate-800/80 min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-base">
            ◈
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">
              Open 4Cs
            </h1>
            <p className="text-[11px] text-slate-400 truncate">CAGS Administration</p>
          </div>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CAGS Admin Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                active
                  ? "bg-white text-slate-900 font-bold shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? "text-slate-900" : "text-slate-400"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user.name || "CAGS Admin"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user.email || "admin@cags.lk"}
              </p>
            </div>
          </div>

          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
