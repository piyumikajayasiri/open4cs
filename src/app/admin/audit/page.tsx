"use client";

import React, { useEffect, useState } from "react";
import {
  Clock3,
  ShieldCheck,
  Search,
  CheckCircle2,
  Upload,
  PenLine,
  Sliders,
  AlertCircle,
  UserCheck,
} from "lucide-react";

interface AuditEntry {
  _id: string;
  action: string;
  performedBy: {
    name: string;
    email: string;
  };
  targetType: string;
  targetId?: string;
  summary: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/audit", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.logs)) {
            setLogs(data.logs);
          }
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      l.action.toLowerCase().includes(q) ||
      l.summary.toLowerCase().includes(q) ||
      l.performedBy.name.toLowerCase().includes(q) ||
      l.targetType.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: string) => {
    if (action.includes("VERIF")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          <span>{action}</span>
        </span>
      );
    }
    if (action.includes("PROPOSE") || action.includes("UPDATE")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
          <PenLine className="w-3 h-3" />
          <span>{action}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
        <Clock3 className="w-3 h-3" />
        <span>{action}</span>
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Governance & Oversight
          </span>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Activity Log & Audit Trail
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Immutable administrative mutations: who approved what, reference verifications, and rule changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Trail Active</span>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by admin, action, or target ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Clock3 className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold">Loading audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Clock3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No activity recorded yet</h3>
            <p className="text-xs text-slate-500">
              Administrative actions (verifying references, rule proposals, catalog edits) are automatically recorded here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const dateStr = new Date(log.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={log._id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      {getActionBadge(log.action)}
                      <span className="text-xs font-mono text-slate-400">{log.targetType}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{log.summary}</p>
                    <p className="text-xs text-slate-500">
                      By <span className="font-semibold text-slate-700">{log.performedBy.name}</span> ({log.performedBy.email})
                    </p>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span className="text-xs font-semibold text-slate-400 block">{dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
