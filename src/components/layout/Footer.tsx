"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin") || pathname?.startsWith("/evaluate") || pathname?.startsWith("/catalogue")) {
    return null;
  }

  return (
    <footer className="bg-[#0A1229] text-white border-t border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs">
            4C
          </div>

          <div>
            <p className="font-bold text-white leading-tight text-sm">
              Open 4Cs
            </p>
            <p className="text-[10px] tracking-wider text-slate-400 uppercase font-medium">
              Gemstone Evaluation
            </p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
          <Link href="/learn" className="hover:text-white transition">
            About
          </Link>
          <Link href="/learn" className="hover:text-white transition">
            Contact
          </Link>
          <Link href="/learn" className="hover:text-white transition">
            Disclaimer
          </Link>
          <Link href="/learn" className="hover:text-white transition">
            Privacy
          </Link>
          <Link href="/learn" className="hover:text-white transition">
            Terms
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-slate-400">
          © 2026 Open 4Cs + CAGS
        </p>
      </div>
    </footer>
  );
}
