"use client";

import Link from "next/link";
import {
  Activity,
  BarChart3,
  Beaker,
  BookOpen,
  Box,
  Clock3,
  Database,
  FileClock,
  Gem,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
    label: "4C Evaluation Rules",
    href: "/admin/evaluation-rules",
    icon: SlidersHorizontal,
  },
  {
    label: "Pricing Matrix",
    href: "/admin/pricing",
    icon: BarChart3,
  },
  {
    label: "Reference Gemstones",
    href: "/admin/reference-gemstones",
    icon: Sparkles,
  },
  {
    label: "Historical Pricing",
    href: "/admin/historical-pricing",
    icon: History,
  },
  {
    label: "Treatment Data",
    href: "/admin/treatment-data",
    icon: Beaker,
  },
  {
    label: "Origin Data",
    href: "/admin/origin-data",
    icon: Database,
  },
  {
    label: "Recommendation Rules",
    href: "/admin/recommendations",
    icon: BookOpen,
  },
  {
    label: "Rule Versions",
    href: "/admin/rule-versions",
    icon: FileClock,
  },
  {
    label: "Audit History",
    href: "/admin/audit",
    icon: Clock3,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({ pathname, user }: AdminSidebarProps) {
  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#101d3a] text-white">
      {/* Brand */}
      <div className="px-5 pt-5">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/40 bg-blue-500/20">
            <Gem className="h-5 w-5 text-blue-300" />
          </div>

          <div>
            <div className="text-sm font-semibold tracking-tight">Open 4Cs</div>

            <div className="text-[11px] text-slate-400">
              CAGS Administration
            </div>
          </div>
        </Link>
      </div>

      {/* Portal badge */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/15 px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-blue-300" />

          <span className="text-xs font-medium text-blue-100">
            CAGS Admin Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-[17px] w-[17px] shrink-0 ${
                    active
                      ? "text-slate-700"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                  strokeWidth={1.8}
                />

                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-xs font-semibold text-amber-300">
            {getInitials(user.name)}
          </div>

          {/* User information */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.name}
            </p>

            <p className="truncate text-[11px] text-slate-400">{user.email}</p>
          </div>

          {/* Logout icon */}
          <button
            type="button"
            title="Sign out"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
