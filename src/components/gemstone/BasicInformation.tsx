"use client";

import { useState } from "react";

type BasicInformationProps = {
  variety: string;
  caratWeight: string;
  gemstoneCode?: string;
  originValue?: string;
  originReliability?: string;
  treatmentStatus?: string;
  treatmentType?: string;
  shape?: string;
  sellerSource?: string;
  onVarietyChange: (value: string) => void;
  onCaratWeightChange: (value: string) => void;
  onGemstoneCodeChange?: (value: string) => void;
  onOriginValueChange?: (value: string) => void;
  onOriginReliabilityChange?: (value: string) => void;
  onTreatmentStatusChange?: (value: string) => void;
  onTreatmentTypeChange?: (value: string) => void;
  onShapeChange?: (value: string) => void;
  onSellerSourceChange?: (value: string) => void;
  stepMode?: "gemstone" | "basic";
};

const GEMSTONE_VARIETIES = [
  {
    id: "Ceylon Blue Sapphire",
    name: "Ceylon Blue Sapphire",
    subtext: "Best liquidity · 214 reference records",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    bgColor: "bg-blue-900",
  },
  {
    id: "Padparadscha Sapphire",
    name: "Padparadscha Sapphire",
    subtext: "Hue-balance protocol · 86 records",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=800&q=80",
    bgColor: "bg-rose-900",
  },
  {
    id: "Pink Sapphire",
    name: "Pink Sapphire",
    subtext: "Saturation bands · 132 records",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    bgColor: "bg-pink-900",
  },
  {
    id: "Yellow Sapphire",
    name: "Yellow Sapphire",
    subtext: "Tone bands · 98 records",
    image: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
    bgColor: "bg-amber-800",
  },
  {
    id: "White Sapphire",
    name: "White Sapphire",
    subtext: "Cut-weighted · 64 records",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
    bgColor: "bg-slate-700",
  },
  {
    id: "Star Sapphire",
    name: "Star Sapphire",
    subtext: "Support in review · notify me",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    bgColor: "bg-indigo-950",
  },
];

export default function BasicInformation({
  variety,
  caratWeight,
  gemstoneCode = "CEY-2026-0847",
  originValue = "Sri Lanka (Ceylon)",
  originReliability = "Seller Provided",
  treatmentStatus = "Heated (H)",
  treatmentType = "Laboratory Verified",
  shape = "Oval · Mixed Cut",
  sellerSource = "Beruwala B2B Market",
  onVarietyChange,
  onCaratWeightChange,
  onGemstoneCodeChange,
  onOriginValueChange,
  onOriginReliabilityChange,
  onTreatmentStatusChange,
  onTreatmentTypeChange,
  onShapeChange,
  onSellerSourceChange,
  stepMode = "gemstone",
}: BasicInformationProps) {
  // Local state fallbacks if handlers not passed
  const [localCode, setLocalCode] = useState(gemstoneCode);
  const [localOrigin, setLocalOrigin] = useState(originValue);
  const [localOriginRel, setLocalOriginRel] = useState(originReliability);
  const [localTreatment, setLocalTreatment] = useState(treatmentStatus);
  const [localTreatmentVer, setLocalTreatmentVer] = useState(treatmentType);
  const [localShape, setLocalShape] = useState(shape);
  const [localSource, setLocalSource] = useState(sellerSource);

  if (stepMode === "gemstone") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GEMSTONE_VARIETIES.map((item) => {
            const isSelected =
              variety === item.id ||
              variety === item.name ||
              (variety === "" && item.id === "Ceylon Blue Sapphire");

            return (
              <div
                key={item.id}
                onClick={() => onVarietyChange(item.name)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-white border transition duration-200 shadow-xs flex flex-col justify-between ${
                  isSelected
                    ? "border-2 border-indigo-600 ring-2 ring-indigo-100 shadow-md"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Gemstone Image Thumbnail */}
                <div className={`h-40 w-full relative ${item.bgColor} overflow-hidden`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                  />

                  {/* Top Right Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-900/90 text-white flex items-center justify-center text-xs font-bold shadow-md">
                      ✓
                    </div>
                  )}
                </div>

                {/* Card Info Footer */}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {item.subtext}
                    </p>
                  </div>

                  {isSelected && (
                    <span className="bg-slate-100 text-slate-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200">
                      Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ================= STEP 2: GEMSTONE INFORMATION (2-COLUMN GRID) =================
  const currentOriginVer = originReliability || localOriginRel;
  const currentTreatmentVer = treatmentType || localTreatmentVer;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: FORM FIELDS (8-col) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Row 1: Gemstone ID & Gemstone Variety */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gemstone ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={gemstoneCode || localCode}
              onChange={(e) => {
                setLocalCode(e.target.value);
                if (onGemstoneCodeChange) onGemstoneCodeChange(e.target.value);
              }}
              placeholder="CEY-2026-0847"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gemstone Variety <span className="text-red-500">*</span>
            </label>
            <select
              value={variety || "Ceylon Blue Sapphire"}
              onChange={(e) => onVarietyChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="Ceylon Blue Sapphire">Ceylon Blue Sapphire</option>
              <option value="Padparadscha Sapphire">Padparadscha Sapphire</option>
              <option value="Pink Sapphire">Pink Sapphire</option>
              <option value="Yellow Sapphire">Yellow Sapphire</option>
              <option value="White Sapphire">White Sapphire</option>
              <option value="Star Sapphire">Star Sapphire</option>
            </select>
          </div>
        </div>

        {/* Row 2: Origin & Origin Verification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <span>Origin</span>
              <span className="text-red-500">*</span>
              <span className="text-slate-400 text-[10px]">🕒</span>
            </label>
            <select
              value={originValue || localOrigin}
              onChange={(e) => {
                setLocalOrigin(e.target.value);
                if (onOriginValueChange) onOriginValueChange(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="Sri Lanka (Ceylon)">Sri Lanka (Ceylon)</option>
              <option value="Madagascar">Madagascar</option>
              <option value="Burma (Myanmar)">Burma (Myanmar)</option>
              <option value="Kashmir">Kashmir</option>
              <option value="Other / Unknown">Other / Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <span>Origin Verification</span>
              <span className="text-slate-400 text-[10px]">🕒</span>
            </label>
            <select
              value={currentOriginVer}
              onChange={(e) => {
                setLocalOriginRel(e.target.value);
                if (onOriginReliabilityChange) onOriginReliabilityChange(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="Seller Provided">Seller Provided</option>
              <option value="Laboratory Verified">Laboratory Verified</option>
              <option value="Unverified / Self-Claimed">Unverified / Self-Claimed</option>
            </select>
          </div>
        </div>

        {/* Row 3: Treatment Status & Treatment Verification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <span>Treatment Status</span>
              <span className="text-red-500">*</span>
              <span className="text-slate-400 text-[10px]">🕒</span>
            </label>
            <select
              value={treatmentStatus || localTreatment}
              onChange={(e) => {
                setLocalTreatment(e.target.value);
                if (onTreatmentStatusChange) onTreatmentStatusChange(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="Heated (H)">Heated (H)</option>
              <option value="Unheated (N)">Unheated (N)</option>
              <option value="Beryllium Treated (BE)">Beryllium Treated (BE)</option>
              <option value="Glass Filled (GF)">Glass Filled (GF)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <span>Treatment Verification</span>
              <span className="text-slate-400 text-[10px]">🕒</span>
            </label>
            <select
              value={currentTreatmentVer}
              onChange={(e) => {
                setLocalTreatmentVer(e.target.value);
                if (onTreatmentTypeChange) onTreatmentTypeChange(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="Laboratory Verified">Laboratory Verified</option>
              <option value="Seller Provided">Seller Provided</option>
              <option value="Unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Row 4: Shape / Cut Style & Seller / Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Shape / Cut Style
            </label>
            <select
              value={shape || localShape}
              onChange={(e) => {
                setLocalShape(e.target.value);
                if (onShapeChange) onShapeChange(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="Oval · Mixed Cut">Oval · Mixed Cut</option>
              <option value="Cushion · Brilliant Cut">Cushion · Brilliant Cut</option>
              <option value="Round · Mixed Cut">Round · Mixed Cut</option>
              <option value="Emerald Cut">Emerald Cut</option>
              <option value="Pear Cut">Pear Cut</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Seller / Source
            </label>
            <input
              type="text"
              value={sellerSource || localSource}
              onChange={(e) => {
                setLocalSource(e.target.value);
                if (onSellerSourceChange) onSellerSourceChange(e.target.value);
              }}
              placeholder="Beruwala B2B Market"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Info Banner Box */}
        <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 text-xs text-slate-600 flex items-start gap-3">
          <span className="text-blue-500 shrink-0 text-base mt-0.5">🕒</span>
          <p className="leading-relaxed">
            Treatment and origin shape the price modifiers. If you are unsure, mark the field Seller Provided or Unverified — the system will flag verification in your recommendations.
          </p>
        </div>

      </div>

      {/* RIGHT COLUMN: INFORMATION RELIABILITY CARD (4-col) */}
      <div className="lg:col-span-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
          
          {/* Card Header */}
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 block leading-tight">
                Information Reliability
              </h3>
              <p className="text-[11px] text-slate-400 block mt-0.5">
                Evidence source used for the evaluation.
              </p>
            </div>
          </div>

          {/* Reliability Items List */}
          <div className="space-y-4 pt-1 text-xs">
            
            {/* Item 1: Gemstone ID */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-semibold text-slate-700">Gemstone ID</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span>👁️</span>
                <span>User Observed</span>
              </span>
            </div>

            {/* Item 2: Origin */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-semibold text-slate-700">Origin</span>
              {currentOriginVer === "Laboratory Verified" ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>✓</span>
                  <span>Lab Verified</span>
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{currentOriginVer}</span>
                </span>
              )}
            </div>

            {/* Item 3: Treatment */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-semibold text-slate-700">Treatment</span>
              {currentTreatmentVer === "Laboratory Verified" ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>✓</span>
                  <span>Laboratory Verified</span>
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{currentTreatmentVer}</span>
                </span>
              )}
            </div>

            {/* Item 4: Carat Weight */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Carat Weight</span>
              <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span>⚖️</span>
                <span>Measured</span>
              </span>
            </div>

          </div>

          {/* Legend Footer Note */}
          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed space-y-1">
            <p>
              <strong className="text-slate-600">Measured</strong> = calibrated instrument · <strong className="text-slate-600">Lab Verified</strong> = report attached · <strong className="text-slate-600">Seller Provided</strong> = needs verification.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
