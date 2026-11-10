"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserState {
  name: string;
  email: string;
  role: string;
  category: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname]);

  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/evaluate") ||
    pathname?.startsWith("/evaluations") ||
    pathname?.startsWith("/history") ||
    pathname?.startsWith("/compare") ||
    pathname?.startsWith("/catalogue") ||
    pathname?.startsWith("/settings")
  ) {
    return null;
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      // ignore
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-xs">
            4C
          </div>

          <div>
            <p className="font-bold text-slate-900 leading-tight">
              Open 4Cs
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              Gemstone Evaluation
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === "/"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Evaluate
          </Link>

          <Link
            href="/learn"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === "/learn"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Learn
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === "/dashboard"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              My Evaluations
            </Link>
          )}

          {user?.role === "CAGS_ADMIN" && (
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname?.startsWith("/admin")
                  ? "bg-amber-100 text-amber-900 font-semibold"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Admin
            </Link>
          )}

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.name}
                    </p>
                    <span className="inline-block text-[10px] uppercase font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {user.category}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-900 bg-white transition shadow-2xs"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-xs"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="text-xl leading-none">
            {menuOpen ? "×" : "☰"}
          </span>
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-200 md:hidden bg-white">
          <nav className="mx-auto max-w-6xl space-y-2 px-5 py-4">
            <Link
              href="/#evaluation"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100"
            >
              Evaluate
            </Link>

            <Link
              href="/learn"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100"
            >
              Learn
            </Link>

            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100"
              >
                My Evaluations & History
              </Link>
            )}

            {user?.role === "CAGS_ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100"
              >
                Admin Dashboard
              </Link>
            )}

            {user && (
              <div className="mt-3 border-t border-slate-200 pt-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{user.category}</p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-left font-semibold text-slate-800 hover:bg-slate-100"
                >
                  Sign Out
                </button>
              </div>
            )}

            {!user && (
              <div className="mt-3 grid gap-3 border-t border-slate-200 pt-4">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-100"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700"
                >
                  Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
