"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "4Cs Evaluation", href: "/#evaluation" },
  { label: "About", href: "/#about" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <nav className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#203D83] text-white">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3 3 9l9 12 9-12-9-6Z" />
              <path d="m3 9 18 0" />
            </svg>
          </span>

          <span>
            <span className="block text-sm font-extrabold leading-tight text-[#142342]">
              Open 4Cs
            </span>
            <span className="block text-[9px] font-bold tracking-widest text-slate-400">
              GEMSTONE EVALUATION
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs font-semibold transition hover:text-blue-600 ${
                pathname === "/" && item.href === "/"
                  ? "text-blue-600"
                  : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 sm:inline-flex"
          >
            Login
          </Link>

          <Link
            href="/#evaluation"
            className="rounded-lg bg-[#101F3D] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-900"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Start Evaluation</span>
          </Link>
        </div>
      </nav>

      <div className="flex items-center justify-center gap-5 border-t border-slate-100 px-3 py-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-[11px] font-semibold ${
              pathname === "/" && item.href === "/"
                ? "text-blue-600"
                : "text-slate-600"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
