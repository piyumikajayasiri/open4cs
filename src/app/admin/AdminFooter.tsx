export default function AdminFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="flex flex-col gap-2 px-8 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>Open 4Cs · CAGS Administration</p>

        <div className="flex items-center gap-4">
          <span>Rule-based evaluation platform</span>
          <span>•</span>
          <span>© {new Date().getFullYear()} CAGS</span>
        </div>
      </div>
    </footer>
  );
}
