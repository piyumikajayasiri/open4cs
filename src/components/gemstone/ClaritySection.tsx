"use client";

import React from "react";

type ClaritySectionProps = {
  nakedEye: string;
  loupe10x: string;
  inclusionType: string;
  inclusionLocation: string;
  severity: string;
  onNakedEyeChange: (value: string) => void;
  onLoupe10xChange: (value: string) => void;
  onInclusionTypeChange: (value: string) => void;
  onInclusionLocationChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
};

export default function ClaritySection({
  nakedEye,
  loupe10x,
  inclusionType,
  inclusionLocation,
  severity,
  onNakedEyeChange,
  onLoupe10xChange,
  onInclusionTypeChange,
  onInclusionLocationChange,
  onSeverityChange,
}: ClaritySectionProps) {
  // Naked eye options matching Figma UI
  const nakedEyeOptions = [
    { label: "Eye-clean", value: "Clean" },
    { label: "Slightly Included", value: "Slight" },
    { label: "Moderately Included", value: "Noticeable" },
    { label: "Heavily Included", value: "Obvious" },
  ];

  // Helper score calculation for Clarity preview score
  const calculatePreviewScore = () => {
    let neScore = 100;
    if (nakedEye === "Slight") neScore = 75;
    else if (nakedEye === "Noticeable") neScore = 55;
    else if (nakedEye === "Obvious") neScore = 35;

    let loupeScore = 90;
    if (loupe10x === "Clean") loupeScore = 100;
    else if (loupe10x === "Slight") loupeScore = 75;
    else if (loupe10x === "Noticeable") loupeScore = 55;

    let sevScore = 85;
    if (severity === "None") sevScore = 100;
    else if (severity === "Moderate") sevScore = 65;
    else if (severity === "Severe") sevScore = 40;

    const totalScore = (neScore * 0.40 + loupeScore * 0.35 + sevScore * 0.25) / 10;
    return totalScore.toFixed(1);
  };

  const previewScore = calculatePreviewScore();
  const currentGradeLabel =
    nakedEye === "Clean" || !nakedEye
      ? "Eye-clean"
      : nakedEye === "Slight"
      ? "Slightly Included"
      : nakedEye === "Noticeable"
      ? "Moderately Included"
      : "Heavily Included";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Left Forms (2 Cols wide on large screens) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card 1: Naked Eye Observation */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Naked Eye Observation
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {nakedEyeOptions.map((opt) => {
              const isSelected =
                nakedEye === opt.value ||
                (!nakedEye && opt.value === "Clean");

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onNakedEyeChange(opt.value)}
                  className={`px-4 py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition border text-center ${
                    isSelected
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: 10x Loupe Observation */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-5">
            10× Loupe Observation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Inclusion Visibility */}
            <div>
              <label
                htmlFor="inclusion-visibility"
                className="block text-xs font-semibold text-slate-600 mb-2"
              >
                Inclusion Visibility
              </label>
              <select
                id="inclusion-visibility"
                value={loupe10x || "Very Slight"}
                onChange={(e) => onLoupe10xChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Very Slight">Barely visible at 10×</option>
                <option value="Clean">Not visible under 10× (Clean)</option>
                <option value="Slight">Easily visible at 10×</option>
                <option value="Noticeable">Noticeable at 10×</option>
                <option value="Obvious">Obvious under 10×</option>
              </select>
            </div>

            {/* Inclusion Type */}
            <div>
              <label
                htmlFor="inclusion-type"
                className="block text-xs font-semibold text-slate-600 mb-2"
              >
                Inclusion Type
              </label>
              <select
                id="inclusion-type"
                value={inclusionType || "Fine silk needles"}
                onChange={(e) => onInclusionTypeChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Fine silk needles">Fine silk needles</option>
                <option value="Feathers & fissures">Feathers & fissures</option>
                <option value="Mineral crystals">Mineral crystals</option>
                <option value="Clouds & pinpoints">Clouds & pinpoints</option>
                <option value="Cavities or chips">Cavities or chips</option>
                <option value="None / Clean">None / Clean</option>
              </select>
            </div>

            {/* Inclusion Location */}
            <div>
              <label
                htmlFor="inclusion-location"
                className="block text-xs font-semibold text-slate-600 mb-2"
              >
                Inclusion Location
              </label>
              <select
                id="inclusion-location"
                value={inclusionLocation || "Near edge — low impact"}
                onChange={(e) => onInclusionLocationChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Near edge — low impact">Near edge — low impact</option>
                <option value="Table center — high impact">Table center — high impact</option>
                <option value="Pavilion side — moderate impact">Pavilion side — moderate impact</option>
                <option value="Girdle region — low impact">Girdle region — low impact</option>
                <option value="Scattered throughout">Scattered throughout</option>
              </select>
            </div>

            {/* Inclusion Severity */}
            <div>
              <label
                htmlFor="inclusion-severity"
                className="block text-xs font-semibold text-slate-600 mb-2"
              >
                Inclusion Severity
              </label>
              <select
                id="inclusion-severity"
                value={severity || "Minor"}
                onChange={(e) => onSeverityChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Minor">Minor (Grade 2)</option>
                <option value="None">None (Grade 1)</option>
                <option value="Moderate">Moderate (Grade 3)</option>
                <option value="Severe">Severe (Grade 4)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Auxiliary Cards */}
      <div className="space-y-6">
        {/* Card 1: Observation guide */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4 text-blue-600">
            <svg
              className="w-5 h-5 flex-shrink-0 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="text-sm font-bold text-slate-900">
              Observation guide
            </h4>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <span className="text-slate-400 mt-0.5">👁</span>
              <p>
                <strong className="text-slate-800 font-semibold">Step 1</strong>{" "}
                — Naked eye at 30 cm in daylight-equivalent light.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-slate-400 mt-0.5">🔍</span>
              <p>
                <strong className="text-slate-800 font-semibold">Step 2</strong>{" "}
                — 10× loupe, tilt through crown and pavilion.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-slate-400 mt-0.5">📍</span>
              <p>
                <strong className="text-slate-800 font-semibold">Step 3</strong>{" "}
                — Note location: table-centre inclusions weigh heavier.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Clarity Preview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            CLARITY PREVIEW
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {previewScore}
            </span>
            <span className="text-sm font-bold text-slate-800">
              · {currentGradeLabel}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(10, Number(previewScore) * 10))}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
