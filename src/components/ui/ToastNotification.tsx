"use client";

import React, { useEffect } from "react";

export type ToastType = "success" | "info" | "warning" | "error";

export type ToastMessage = {
  id: string;
  message: string;
  type?: ToastType;
};

type ToastNotificationProps = {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
};

export default function ToastNotification({
  toasts,
  onDismiss,
}: ToastNotificationProps) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      onDismiss(toasts[0].id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const type = toast.type || "success";
        const isSuccess = type === "success";
        const isInfo = type === "info";
        const isWarning = type === "warning";
        const isError = type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border transition-all duration-200 transform translate-y-0 ${
              isSuccess
                ? "bg-[#064E3B] text-emerald-50 border-emerald-700"
                : isInfo
                ? "bg-[#0F172A] text-slate-100 border-slate-700"
                : isWarning
                ? "bg-[#78350F] text-amber-50 border-amber-600"
                : "bg-[#7F1D1D] text-red-50 border-red-700"
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {isSuccess && (
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  ✓
                </span>
              )}
              {isInfo && (
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  ℹ
                </span>
              )}
              {isWarning && (
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  ⚠
                </span>
              )}
              {isError && (
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  ✕
                </span>
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition p-1 text-xs"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
