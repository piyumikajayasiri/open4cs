"use client";

import React, { useState } from "react";
import { ShadcnSelect } from "@/components/ui/select";

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
              <ShadcnSelect
                id="treatment-status-select"
                value={currentTreatment}
                onValueChange={onTreatmentStatusChange}
                options={[
                  "Heated (H) — mild",
                  "Untreated / Natural",
                  "Heated (Standard)",
                  "Beryllium Treated",
                  "Glass Filled",
                ]}
              />
            </div>

            {/* 2. Treatment Verification */}
            <div>
              <label
                htmlFor="treatment-verification-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Treatment Verification
              </label>
              <ShadcnSelect
                id="treatment-verification-select"
                value={treatmentVerification}
                onValueChange={(val) =>
                  onInformationReliabilityChange("treatment", val)
                }
                options={[
                  "Laboratory Verified",
                  "Seller Provided",
                  "User Observed",
                  "Unverified",
                ]}
              />
            </div>

            {/* 3. Origin */}
            <div>
              <label
                htmlFor="origin-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Origin
              </label>
              <ShadcnSelect
                id="origin-select"
                value={currentOrigin}
                onValueChange={onOriginValueChange}
                options={[
                  "Sri Lanka (Ceylon)",
                  "Madagascar",
                  "Myanmar (Burma)",
                  "Kashmir",
                  "Unknown / Undetermined",
                ]}
              />
            </div>

            {/* 4. Origin Verification */}
            <div>
              <label
                htmlFor="origin-verification-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Origin Verification
              </label>
              <ShadcnSelect
                id="origin-verification-select"
                value={originVerification}
                onValueChange={(val) =>
                  onInformationReliabilityChange("origin", val)
                }
                options={[
                  "Seller Provided",
                  "Laboratory Verified",
                  "User Observed",
                  "Unverified",
                ]}
              />
            </div>

            {/* 5. Recut Potential */}
            <div>
              <label
                htmlFor="recut-potential-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Recut Potential
              </label>
              <ShadcnSelect
                id="recut-potential-select"
                value={recutPotential}
                onValueChange={setRecutPotential}
                options={[
                  "Not recommended — good spread",
                  "Recut recommended — improve symmetry",
                  "Minor pavilion touchup",
                  "Window closure possible",
                ]}
              />
            </div>

            {/* 6. Other Characteristics */}
            <div>
              <label
                htmlFor="other-characteristics-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Other Characteristics
              </label>
              <ShadcnSelect
                id="other-characteristics-select"
                value={otherCharacteristics}
                onValueChange={setOtherCharacteristics}
                options={[
                  "No colour zoning · No window",
                  "Slight colour banding",
                  "Moderate extinction",
                  "Slight windowing",
                ]}
              />
            </div>
          </div>
        </div>

        {/* Informational Guidance Alert */}
        <div className="rounded-2xl border border-blue-100 bg-[#F4F8FF] p-5 shadow-xs flex items-start gap-3">
          <div className="w-5 h-5 rounded-full border border-blue-400 bg-white flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold">i</span>
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              Reliability shapes the confidence interval
            </p>
            <p className="leading-relaxed text-slate-600">
              Laboratory-verified origins and unheated treatments receive tighter pricing spreads. Self-reported or unverified stones trigger automatic verification warnings on appraisal sheets.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column Auxiliary Cards (1 col on large screens) */}
      <div className="space-y-6">
        {/* Card 1: Additional Factors Summary */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            VERIFICATION STATUS
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Origin verified:</span>
              <span className="font-semibold text-slate-900">{originVerification}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Treatment verified:</span>
              <span className="font-semibold text-slate-900">{treatmentVerification}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Recut note:</span>
              <span className="font-semibold text-emerald-700">Spread preserved</span>
            </div>
          </div>
        </div>

        {/* Card 2: Market Tip */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 mb-2">
            💡 Market Intelligence
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unheated Ceylon sapphires with verified origins currently trade at a 40–80% premium over heat-treated equivalents of identical color and clarity.
          </p>
        </div>
      </div>
    </div>
  );
}
