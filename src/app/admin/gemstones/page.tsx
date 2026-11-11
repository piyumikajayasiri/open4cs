"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  Power,
  X,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import ToastNotification, {
  ToastMessage,
  ToastType,
} from "@/components/ui/ToastNotification";

export interface VarietyItem {
  id: string;
  name: string;
  species: string;
  shapes: string;
  referenceCoverage: string;
  ruleVersion: string;
  status: "Supported" | "In Review" | "Suspended";
  origin: string;
  description?: string;
}

const DEFAULT_VARIETIES: VarietyItem[] = [
  {
    id: "var-1",
    name: "Ceylon Blue Sapphire",
    species: "Corundum",
    shapes: "Oval/Round",
    referenceCoverage: "214 refs",
    ruleVersion: "v4.2",
    status: "Supported",
    origin: "Sri Lanka (Ceylon)",
    description:
      "Premier benchmark variety with comprehensive color, clarity, and cut rule calibration.",
  },
  {
    id: "var-2",
    name: "Padparadscha Sapphire",
    species: "Corundum",
    shapes: "Oval",
    referenceCoverage: "88 refs",
    ruleVersion: "v4.2",
    status: "Supported",
    origin: "Sri Lanka (Ceylon)",
    description:
      "Delicate pinkish-orange corundum with strict spectral saturation bounds.",
  },
  {
    id: "var-3",
    name: "Pink Sapphire",
    species: "Corundum",
    shapes: "Oval/Cushion",
    referenceCoverage: "132 refs",
    ruleVersion: "v4.1",
    status: "Supported",
    origin: "Sri Lanka (Ceylon)",
    description:
      "Vibrant hot-to-pastel pink corundum calibrated under Rule Version 4.1 standards.",
  },
  {
    id: "var-4",
    name: "Yellow Sapphire",
    species: "Corundum",
    shapes: "Oval",
    referenceCoverage: "98 refs",
    ruleVersion: "v4.2",
    status: "Supported",
    origin: "Sri Lanka (Ceylon)",
    description:
      "Canary and golden yellow corundum with iron trace element modifiers.",
  },
  {
    id: "var-5",
    name: "White Sapphire",
    species: "Corundum",
    shapes: "Round",
    referenceCoverage: "64 refs",
    ruleVersion: "v4.0",
    status: "Supported",
    origin: "Sri Lanka (Ceylon)",
    description:
      "Colorless natural sapphire frequently cut into brilliant rounds for diamond alternatives.",
  },
  {
    id: "var-6",
    name: "Star Sapphire",
    species: "Corundum",
    shapes: "Cabochon",
    referenceCoverage: "21 refs",
    ruleVersion: "—",
    status: "In Review",
    origin: "Sri Lanka (Ceylon)",
    description:
      "Phenomenal corundum exhibiting 6-ray asterism; pending CAGS board rule sign-off.",
  },
];

export default function GemstoneCataloguePage() {
  const [varieties, setVarieties] = useState<VarietyItem[]>(DEFAULT_VARIETIES);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals state
  const [viewingItem, setViewingItem] = useState<VarietyItem | null>(null);
  const [editingItem, setEditingItem] = useState<VarietyItem | null>(null);
  const [togglingItem, setTogglingItem] = useState<VarietyItem | null>(null);

  // Edit form state
  const [editShapes, setEditShapes] = useState("");
  const [editRuleVersion, setEditRuleVersion] = useState("");

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch live gemstones and combine with benchmark dataset
  useEffect(() => {
    async function fetchGemstones() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/gemstone-varieties", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.gemstoneVarieties) && data.gemstoneVarieties.length > 0) {
            const dbMap = new Map<string, Record<string, unknown>>();
            data.gemstoneVarieties.forEach((v: Record<string, unknown>) => {
              const vName = typeof v.name === "string" ? v.name.toLowerCase().trim() : "";
              if (vName) {
                dbMap.set(vName, v);
              }
            });

            setVarieties((prev) =>
              prev.map((item) => {
                const match = dbMap.get(item.name.toLowerCase().trim());
                if (match) {
                  const shapes = Array.isArray(match.supportedShapes)
                    ? match.supportedShapes.join("/")
                    : item.shapes;
                  const ruleVersion = typeof match.ruleVersion === "string" && match.ruleVersion
                    ? match.ruleVersion
                    : item.ruleVersion;
                  const status = match.isActive === false
                    ? "Suspended"
                    : item.status;
                  return {
                    ...item,
                    id: String(match._id || item.id),
                    shapes,
                    ruleVersion,
                    status,
                    description: typeof match.description === "string" ? match.description : item.description,
                  };
                }
                return item;
              })
            );
          }
        }
      } catch (err) {
        console.error("Could not fetch remote gemstone varieties:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGemstones();
  }, []);

  // Filtered varieties by search query
  const filteredVarieties = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return varieties;
    return varieties.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.species.toLowerCase().includes(q) ||
        v.shapes.toLowerCase().includes(q) ||
        v.ruleVersion.toLowerCase().includes(q) ||
        v.status.toLowerCase().includes(q)
    );
  }, [varieties, search]);

  // Handlers
  const openEditModal = (item: VarietyItem) => {
    setEditingItem(item);
    setEditShapes(item.shapes);
    setEditRuleVersion(item.ruleVersion);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      if (!editingItem.id.startsWith("var-")) {
        const res = await fetch(`/api/admin/gemstone-varieties/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shapes: editShapes.trim() || editingItem.shapes,
            ruleVersion: editRuleVersion.trim() || editingItem.ruleVersion,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to update variety configuration.");
        }
      }

      setVarieties((prev) =>
        prev.map((v) =>
          v.id === editingItem.id
            ? {
                ...v,
                shapes: editShapes.trim() || v.shapes,
                ruleVersion: editRuleVersion.trim() || v.ruleVersion,
              }
            : v
        )
      );

      showToast(`Updated variety configuration for ${editingItem.name}.`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update variety.", "error");
    } finally {
      setEditingItem(null);
    }
  };

  const handleConfirmToggle = async () => {
    if (!togglingItem) return;

    const nextStatus =
      togglingItem.status === "Supported"
        ? "Suspended"
        : "Supported";

    try {
      if (!togglingItem.id.startsWith("var-")) {
        const res = await fetch(`/api/admin/gemstone-varieties/${togglingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isActive: nextStatus === "Supported",
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to toggle variety status.");
        }
      }

      setVarieties((prev) =>
        prev.map((v) =>
          v.id === togglingItem.id ? { ...v, status: nextStatus } : v
        )
      );

      showToast(
        `${togglingItem.name} status updated to ${nextStatus}.`,
        nextStatus === "Supported" ? "success" : "info"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to toggle variety status.", "error");
    } finally {
      setTogglingItem(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gemstone Catalogue Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Support status, reference coverage and the rule version each variety evaluates under
          </p>
        </div>

        <div>
          <Link
            href="/admin/gemstones/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Variety</span>
          </Link>
        </div>
      </div>

      {/* ================= SEARCH BAR ================= */}
      <div className="max-w-md w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search varieties..."
          className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
        />
      </div>

      {/* ================= VARIETIES TABLE ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-white">
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  VARIETY
                </th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  SPECIES / SHAPES
                </th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  REFERENCE COVERAGE
                </th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  RULE VERSION
                </th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  STATUS
                </th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredVarieties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-slate-500 text-xs sm:text-sm">
                    No varieties match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredVarieties.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition duration-150"
                  >
                    {/* Variety Name */}
                    <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">
                      {item.name}
                    </td>

                    {/* Species / Shapes */}
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      <span>{item.species}</span>
                      <span className="mx-1 text-slate-300">·</span>
                      <span>{item.shapes}</span>
                    </td>

                    {/* Reference Coverage */}
                    <td className="py-4 px-6 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {item.referenceCoverage}
                    </td>

                    {/* Rule Version */}
                    <td className="py-4 px-6 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {item.ruleVersion}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          item.status === "Supported"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/90"
                            : item.status === "In Review"
                            ? "bg-amber-50 text-amber-800 border border-amber-200/90"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions: Pencil, Eye, Power */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5 text-slate-400">
                        {/* Edit Action */}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title={`Edit ${item.name}`}
                          className="p-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        {/* View Action */}
                        <button
                          type="button"
                          onClick={() => setViewingItem(item)}
                          title={`View ${item.name} details`}
                          className="p-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        {/* Power / Toggle Action */}
                        <button
                          type="button"
                          onClick={() => setTogglingItem(item)}
                          title={`Toggle ${item.name} status`}
                          className="p-1.5 rounded-lg hover:text-amber-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Power className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= VIEW DETAILS MODAL ================= */}
      {viewingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Variety Overview
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {viewingItem.name}
                </h3>
                <p className="text-xs text-slate-500">{viewingItem.species} Species</p>
              </div>

              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Supported Shapes</span>
                <span className="font-bold text-slate-900">{viewingItem.shapes}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Reference Coverage</span>
                <span className="font-bold text-slate-900">{viewingItem.referenceCoverage}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Active Rule Version</span>
                <span className="font-bold text-slate-900">{viewingItem.ruleVersion}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Geographic Origin</span>
                <span className="font-bold text-slate-900">{viewingItem.origin}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700">Description & Usage</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {viewingItem.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/admin/reference-gemstones"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Browse Benchmark References</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT VARIETY MODAL ================= */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit Variety Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{editingItem.name}</p>
              </div>

              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supported Shapes (e.g. Oval/Round)
                </label>
                <input
                  type="text"
                  value={editShapes}
                  onChange={(e) => setEditShapes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Rule Version
                </label>
                <input
                  type="text"
                  value={editRuleVersion}
                  onChange={(e) => setEditRuleVersion(e.target.value)}
                  placeholder="e.g. v4.2 or —"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold transition shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= POWER / STATUS TOGGLE CONFIRMATION MODAL ================= */}
      {togglingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {togglingItem.status === "Supported"
                  ? "Suspend Variety?"
                  : "Activate Variety?"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {togglingItem.status === "Supported"
                  ? `Are you sure you want to suspend "${togglingItem.name}"? New evaluations will not accept this variety until reactivated.`
                  : `Are you sure you want to mark "${togglingItem.name}" as Supported for production evaluations?`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTogglingItem(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition shadow-xs ${
                  togglingItem.status === "Supported"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
