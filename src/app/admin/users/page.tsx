"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
  Clock,
  Key,
} from "lucide-react";
import ToastNotification, { ToastMessage, ToastType } from "@/components/ui/ToastNotification";
import { ShadcnSelect } from "@/components/ui/select";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  category: string;
  role: "USER" | "CAGS_ADMIN";
  status?: "ACTIVE" | "SUSPENDED";
  createdAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCategory, setNewCategory] = useState("Professional");
  const [newRole, setNewRole] = useState<"USER" | "CAGS_ADMIN">("USER");

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: ToastType = "success") => {
    setToasts((prev) => [...prev, { id: String(Date.now()), message, type }]);
  };
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.users)) {
            setUsers(data.users);
          }
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: UserItem) => {
    const currentStatus = user.status || "ACTIVE";
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Failed to update user status.", "error");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
      );
      showToast(`User ${user.name} status updated to ${nextStatus}.`, "success");
    } catch {
      showToast("Network error updating user status.", "error");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showToast("Please provide both name and email.", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          category: newCategory,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Failed to provision user.", "error");
        return;
      }

      setUsers((prev) => [data.user, ...prev]);
      showToast(
        `User ${data.user.name} provisioned! Temp password: ${data.temporaryPassword || "Set"}`,
        "success"
      );
      setNewName("");
      setNewEmail("");
      setShowInviteModal(false);
    } catch {
      showToast("Network error creating user.", "error");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Access Control
          </span>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Users & Role Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage authenticated users, professional roles, and account access statuses.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision User Account</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No users found</h3>
            <p className="text-xs text-slate-500">Click &ldquo;Provision User Account&rdquo; to add a user.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const isSuspended = u.status === "SUSPENDED";
              const isAdmin = u.role === "CAGS_ADMIN";

              return (
                <div
                  key={u._id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{u.name}</span>
                      {isAdmin ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          CAGS Admin
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          User
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSuspended
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isSuspended ? "Suspended" : "Active"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {u.email} · Category: <span className="font-semibold text-slate-700">{u.category}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        isSuspended
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      }`}
                    >
                      {isSuspended ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Reactivate User</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          <span>Suspend Access</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Provision User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Provision User Account</h3>
                  <p className="text-xs text-slate-500">Creates real account in MongoDB with temporary password.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. K. Mendis"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="mendis@gemresearch.lk"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <ShadcnSelect
                    value={newCategory}
                    onValueChange={(val) => setNewCategory(val)}
                    options={["Professional", "Student", "Trader", "Gemologist"]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <ShadcnSelect
                    value={newRole}
                    onValueChange={(val) => setNewRole(val as "USER" | "CAGS_ADMIN")}
                    options={[
                      { value: "USER", label: "Normal User" },
                      { value: "CAGS_ADMIN", label: "CAGS Admin" },
                    ]}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
