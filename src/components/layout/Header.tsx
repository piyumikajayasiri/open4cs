"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  category: string;
  role: string;
};

export default function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin") || pathname?.startsWith("/evaluate") || pathname?.startsWith("/catalogue")) {
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
    <header className="border-b border-[var(--border)] bg-white sticky top-0 z-50 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white shadow-xs">
            4C
          </div>

          <div>
            <p className="font-bold text-[var(--foreground)] leading-tight">
              Open 4Cs
            </p>
            <p className="hidden text-xs text-[var(--muted)] sm:block">
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
                ? "bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                : "hover:bg-[var(--surface-soft)] text-[var(--foreground)]"
            }`}
          >
            Evaluate
          </Link>

          <Link
            href="/learn"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === "/learn"
                ? "bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                : "hover:bg-[var(--surface-soft)] text-[var(--foreground)]"
            }`}
          >
            Learn
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === "/dashboard"
                  ? "bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                  : "hover:bg-[var(--surface-soft)] text-[var(--foreground)]"
              }`}
            >
              My Evaluations
            </Link>
          )}

          {user?.role === "CAGS_ADMIN" && (
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith("/admin")
                  ? "bg-amber-100 text-amber-900"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Admin
            </Link>
          )}

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3 pl-2 border-l border-[var(--border)]">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-[var(--foreground)] leading-tight">
                      {user.name}
                    </p>
                    <span className="inline-block text-[10px] uppercase font-semibold text-[var(--primary-dark)] bg-[var(--primary-soft)] px-1.5 py-0.5 rounded">
                      {user.category}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-soft)] transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--surface-soft)] transition"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] transition"
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
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] md:hidden"
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
        <div className="border-t border-[var(--border)] md:hidden bg-white">
          <nav className="mx-auto max-w-6xl space-y-2 px-5 py-4">
            <Link
              href="/#evaluation"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-3 font-semibold hover:bg-[var(--surface-soft)]"
            >
              Evaluate
            </Link>

            <Link
              href="/learn"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-3 font-semibold hover:bg-[var(--surface-soft)]"
            >
              Learn
            </Link>

            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold hover:bg-[var(--surface-soft)]"
              >
                My Evaluations & History
              </Link>
            )}

            {user?.role === "CAGS_ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold hover:bg-[var(--surface-soft)] text-amber-900 bg-amber-50"
              >
                Admin Dashboard
              </Link>
            )}

            {user && (
              <div className="mt-3 border-t border-[var(--border)] pt-4">
                <div className="rounded-xl bg-[var(--surface-soft)] p-4">
                  <p className="font-semibold">{user.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{user.category}</p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-left font-semibold hover:bg-[var(--surface-soft)]"
                >
                  Sign Out
                </button>
              </div>
            )}

            {!user && (
              <div className="mt-3 grid gap-3 border-t border-[var(--border)] pt-4">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-[var(--border)] px-4 py-3 text-center font-semibold"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-[var(--primary)] px-4 py-3 text-center font-semibold text-white"
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
