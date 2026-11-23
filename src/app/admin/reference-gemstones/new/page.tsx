"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gem } from "lucide-react";
import ReferenceGemstoneForm from "@/components/admin/ReferenceGemstoneForm";

export default function NewReferenceGemstonePage() {
  const router = useRouter();

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/reference-gemstones"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Market Evidence</span>
        </Link>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Gem className="w-5 h-5" />
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Add Market Reference Record
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Submit a calibrated gemstone observation into the market reference database. Saved as Pending until verified by an authorized gemologist.
          </p>
        </div>
      </div>

      <ReferenceGemstoneForm
        onSuccess={() => {
          router.push("/admin/reference-gemstones");
        }}
        onCancel={() => {
          router.push("/admin/reference-gemstones");
        }}
      />
    </div>
  );
}
