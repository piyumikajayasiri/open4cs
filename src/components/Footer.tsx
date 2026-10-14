import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#080F20] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-6 sm:flex-row lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
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
            <span className="block text-xs font-bold">Open 4Cs</span>
            <span className="block text-[8px] font-semibold tracking-widest text-slate-500">
              GEMSTONE EVALUATION
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-slate-400">
          <Link href="/#about" className="hover:text-white">
            About
          </Link>
          <Link href="/#contact" className="hover:text-white">
            Contact
          </Link>
          <Link href="/disclaimer" className="hover:text-white">
            Disclaimer
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
        </div>

        <p className="text-[10px] text-slate-500">
          © {new Date().getFullYear()} Open 4Cs · CAGS
        </p>
      </div>
    </footer>
  );
}
