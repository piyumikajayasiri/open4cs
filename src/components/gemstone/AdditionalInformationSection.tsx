"use client";

import React, { useState } from "react";

type AdditionalInformationSectionProps = {
  treatmentStatus: string;
  treatmentType: string;
  originValue: string;
  originReliability: string;
  informationReliability: {
    measurements: string;
    treatment: string;
    origin: string;
  };
  onTreatmentStatusChange: (value: string) => void;
  onTreatmentTypeChange: (value: string) => void;
  onOriginValueChange: (value: string) => void;
  onOriginReliabilityChange: (value: string) => void;
  onInformationReliabilityChange: (
    field: "measurements" | "treatment" | "origin",
    value: string
  ) => void;
};

export default function AdditionalInformationSection({
  treatmentStatus,
  originValue,
  informationReliability,
  onTreatmentStatusChange,
  onOriginValueChange,
  onInformationReliabilityChange,
}: AdditionalInformationSectionProps) {
  const [recutPotential, setRecutPotential] = useState("Not recommended — good spread");
  const [otherCharacteristics, setOtherCharacteristics] = useState("No colour zoning · No window");

  const currentTreatment = treatmentStatus || "Heated (H) — mild";
  const currentOrigin = originValue || "Sri Lanka (Ceylon)";
  const treatmentVerification = informationReliability.treatment || "Laboratory Verified";
  const originVerification = informationReliability.origin || "Seller Provided";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Main Form Container (2 cols on large screen) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          {/* 2x3 Grid of Select Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 1. Treatment Status */}
            <div>
              <label
                htmlFor="treatment-status-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Treatment Status
              </label>
              <select
                id="treatment-status-select"
                value={currentTreatment}
                onChange={(e) => onTreatmentStatusChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Heated (H) — mild">Heated (H) — mild</option>
                <option value="Untreated / Natural">Untreated / Natural</option>
                <option value="Heated (Standard)">Heated (Standard)</option>
                <option value="Beryllium Treated">Beryllium Treated</option>
                <option value="Glass Filled">Glass Filled</option>
              </select>
            </div>

            {/* 2. Treatment Verification */}
            <div>
              <label
                htmlFor="treatment-verification-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Treatment Verification
              </label>
              <select
                id="treatment-verification-select"
                value={treatmentVerification}
                onChange={(e) =>
                  onInformationReliabilityChange("treatment", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Laboratory Verified">Laboratory Verified</option>
                <option value="Seller Provided">Seller Provided</option>
                <option value="User Observed">User Observed</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            {/* 3. Origin */}
            <div>
              <label
                htmlFor="origin-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Origin
              </label>
              <select
                id="origin-select"
                value={currentOrigin}
                onChange={(e) => onOriginValueChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Sri Lanka (Ceylon)">Sri Lanka (Ceylon)</option>
                <option value="Madagascar">Madagascar</option>
                <option value="Myanmar (Burma)">Myanmar (Burma)</option>
                <option value="Kashmir">Kashmir</option>
                <option value="Unknown / Undetermined">Unknown / Undetermined</option>
              </select>
            </div>

            {/* 4. Origin Verification */}
            <div>
              <label
                htmlFor="origin-verification-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Origin Verification
              </label>
              <select
                id="origin-verification-select"
                value={originVerification}
                onChange={(e) =>
                  onInformationReliabilityChange("origin", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Seller Provided">Seller Provided</option>
                <option value="Laboratory Verified">Laboratory Verified</option>
                <option value="User Observed">User Observed</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            {/* 5. Recut Potential */}
            <div>
              <label
                htmlFor="recut-potential-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Recut Potential
              </label>
              <select
                id="recut-potential-select"
                value={recutPotential}
                onChange={(e) => setRecutPotential(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Not recommended — good spread">Not recommended — good spread</option>
                <option value="Recut recommended — improve symmetry">Recut recommended — improve symmetry</option>
                <option value="Minor pavilion touchup">Minor pavilion touchup</option>
                <option value="Window closure possible">Window closure possible</option>
              </select>
            </div>

            {/* 6. Other Characteristics */}
            <div>
              <label
                htmlFor="other-characteristics-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Other Characteristics
              </label>
              <select
                id="other-characteristics-select"
                value={otherCharacteristics}
                onChange={(e) => setOtherCharacteristics(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="No colour zoning · No window">No colour zoning · No window</option>
                <option value="Slight colour banding">Slight colour banding</option>
                <option value="Moderate extinction">Moderate extinction</option>
                <option value="Slight windowing">Slight windowing</option>
              </select>
            </div>
          </div>

          {/* Attached Document Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
              <span className="text-base text-slate-500">📎</span>
              <span>GIC-Colombo Report GIC-88412.pdf attached</span>
            </div>

            <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Right Auxiliary Sidebar Cards (1 col on large screen) */}
      <div className="space-y-6">
        {/* Card 1: Information Reliability */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">
            Information Reliability
          </h4>

          <div className="space-y-3">
            {/* Treatment */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Treatment</span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                <span>✔</span> Laboratory Verified
              </span>
            </div>

            {/* Origin */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Origin</span>
              <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                <span>⚠️</span> Seller Provided
              </span>
            </div>

            {/* Recut note */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Recut note</span>
              <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                <span>👁</span> User Observed
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Why this matters */}
        <div className="rounded-2xl border border-[#D5EFE3] bg-[#F0FAF5] p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-sm">📖</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Why this matters
            </h4>
          </div>

          <p className="text-xs text-emerald-900 leading-relaxed">
            Heated Ceylon sapphire carries a modest, published modifier. Unverified origin caps the origin premium until a lab report confirms it — this protects both student and trader.
          </p>
        </div>
      </div>
    </div>
  );
}
