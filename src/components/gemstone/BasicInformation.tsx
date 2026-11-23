"use client";

import React, { useRef } from "react";
import { ShieldCheck, AlertCircle, Check, UploadCloud, X } from "lucide-react";
import { ShadcnSelect } from "@/components/ui/select";

export interface GemstoneCardItem {
  id: string;
  name: string;
  species: string;
  subtext: string;
  image: string;
  isSupported: boolean;
  colorBand: string;
}

export const GEMSTONE_VARIETIES: GemstoneCardItem[] = [
  {
    id: "Blue Sapphire",
    name: "Blue Sapphire",
    species: "Natural Corundum",
    subtext: "Royal Blue & Cornflower Blue grading rules in force",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    isSupported: true,
    colorBand: "bg-blue-900",
  },
  {
    id: "Padparadscha",
    name: "Padparadscha",
    species: "Natural Corundum",
    subtext: "Delicate pinkish-orange to orangey-pink balance",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=800&q=80",
    isSupported: true,
    colorBand: "bg-rose-900",
  },
  {
    id: "Ruby",
    name: "Ruby",
    species: "Natural Corundum",
    subtext: "Pigeon Blood to Purplish Red corundum grading",
    image: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80",
    isSupported: true,
    colorBand: "bg-red-900",
  },
  {
    id: "Yellow Sapphire",
    name: "Yellow Sapphire",
    species: "Corundum",
    subtext: "Golden & Canary yellow tone scoring in research",
    image: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
    isSupported: false,
    colorBand: "bg-amber-800",
  },
  {
    id: "Pink Sapphire",
    name: "Pink Sapphire",
    species: "Corundum",
    subtext: "Hot pink to pastel magenta scoring model in research",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    isSupported: false,
    colorBand: "bg-pink-900",
  },
  {
    id: "White / Colourless Sapphire",
    name: "White / Colourless Sapphire",
    species: "Corundum",
    subtext: "Leucosapphire diamond-substitute cut rules in research",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
    isSupported: false,
    colorBand: "bg-slate-700",
  },
  {
    id: "Star Sapphire",
    name: "Star Sapphire",
    species: "Phenomenal Corundum",
    subtext: "6-ray asterism chatoyancy model in research",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    isSupported: false,
    colorBand: "bg-indigo-950",
  },
];

const SHAPE_OPTIONS = [
  "Oval · Mixed Cut",
  "Cushion · Modified Brilliant",
  "Round · Brilliant Cut",
  "Emerald / Octagonal Step Cut",
  "Pear · Modified Brilliant",
  "Heart · Brilliant Cut",
  "Cabochon (Smooth Dome)",
];

type BasicInformationProps = {
  variety: string;
  onVarietyChange: (value: string) => void;
  gemstoneCode?: string;
  onGemstoneCodeChange?: (value: string) => void;
  naturalStatus?: "Natural" | "Lab-Grown" | "Not specified";
  onNaturalStatusChange?: (value: "Natural" | "Lab-Grown") => void;
  shape?: string;
  onShapeChange?: (value: string) => void;
  photoUrl?: string;
  onPhotoChange?: (value: string) => void;
};

export default function BasicInformation({
  variety,
  onVarietyChange,
  gemstoneCode = "",
  onGemstoneCodeChange,
  naturalStatus = "Not specified",
  onNaturalStatusChange,
  shape = "Oval · Mixed Cut",
  onShapeChange,
  photoUrl = "",
  onPhotoChange,
}: BasicInformationProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedVarietyObj = GEMSTONE_VARIETIES.find(
    (v) =>
      v.id.toLowerCase() === variety.toLowerCase() ||
      v.name.toLowerCase() === variety.toLowerCase() ||
      (variety.toLowerCase().includes("blue") && v.id === "Blue Sapphire") ||
      (variety.toLowerCase().includes("pad") && v.id === "Padparadscha") ||
      (variety.toLowerCase().includes("ruby") && v.id === "Ruby")
  ) || GEMSTONE_VARIETIES[0];

  const isCurrentSupported = selectedVarietyObj.isSupported;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload an image smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (onPhotoChange && result) {
        onPhotoChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (onPhotoChange) onPhotoChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      {/* ================= 1. VARIETY SELECTOR CARDS ================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-sm font-bold text-slate-900 block">
              Gemstone Variety <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Select the species and color variety. Only varieties with calibrated CAGS scoring models are enabled for active evaluation.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            3 supported · 4 in development
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {GEMSTONE_VARIETIES.map((item) => {
            const isSelected = selectedVarietyObj.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onVarietyChange(item.name)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-white border transition duration-150 flex flex-col justify-between ${
                  isSelected
                    ? "border-2 border-blue-600 ring-4 ring-blue-500/10 shadow-md"
                    : "border-slate-200/90 hover:border-slate-300 hover:shadow-2xs"
                }`}
              >
                {/* Thumbnail */}
                <div className={`h-36 w-full relative ${item.colorBand} overflow-hidden`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Badges Top */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                        item.isSupported
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-900/80 text-slate-200 backdrop-blur-xs"
                      }`}
                    >
                      {item.isSupported ? "Supported" : "In Development"}
                    </span>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-3.5 space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {item.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning if unsupported variety is selected */}
        {!isCurrentSupported && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 animate-in fade-in-0 duration-200">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">
                Evaluation Not Yet Supported for {selectedVarietyObj.name}
              </span>
              <p className="leading-relaxed">
                Scientific scoring weights and market reference datasets are currently undergoing CAGS gemmological review for this variety.
                To complete an automated evaluation and generate a report, please select{" "}
                <strong>Blue Sapphire</strong>, <strong>Padparadscha</strong>, or <strong>Ruby</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ================= 2. NATURAL VS LAB-GROWN DECLARATION ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <label className="text-xs sm:text-sm font-bold text-slate-900 block">
            Natural vs. Lab-Grown Declaration <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Gemological grading systems evaluate natural geological specimens and laboratory-synthesized crystals under separate protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            id="natural-status-natural"
            onClick={() => onNaturalStatusChange && onNaturalStatusChange("Natural")}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
              naturalStatus === "Natural"
                ? "bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/20"
                : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Natural Corundum</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                  Engine Calibrated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Formed via natural geological metamorphic or igneous crystallization. Supported by Open 4Cs price comparables.
              </p>
            </div>
          </div>

          <div
            id="natural-status-labgrown"
            onClick={() => onNaturalStatusChange && onNaturalStatusChange("Lab-Grown")}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
              naturalStatus === "Lab-Grown"
                ? "bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20"
                : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Lab-Grown / Synthetic</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                  Separate Market
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Synthesized via Flame Fusion (Verneuil), Flux, or Hydrothermal methods.
              </p>
            </div>
          </div>
        </div>

        {naturalStatus === "Lab-Grown" && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Honest Pricing Disclosure:</strong> Open 4Cs scoring rules and price comparables are calibrated exclusively for natural corundum. Lab-grown corundum operates under industrial production supply curves and is not currently priced by this engine.
          </div>
        )}
      </div>

      {/* ================= 3. PHOTO REFERENCE UPLOAD ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-900 block">
              Gemstone Photographic Reference <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Attach a face-up photograph of the gemstone. The image is included in your generated assessment report.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium shrink-0">JPG, PNG, WebP up to 5MB</span>
        </div>

        {photoUrl ? (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 relative">
              <img
                src={photoUrl}
                alt="Gemstone preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">
                Photographic reference attached
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ready to be embedded into Open 4Cs Assessment Report PDF.
              </p>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove photo</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition"
          >
            <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-800 block">
              Click to select or drag and drop gemstone photograph
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports standard high-resolution gemstone macro photography
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
          <strong>Neutral Disclosure:</strong> Visual reference only. Consumer smartphone photos cannot determine natural origin, microscopic inclusion relief, or quantitative spectral absorption.
        </div>
      </div>

      {/* ================= 4. GEMSTONE ID & CUT SHAPE ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
          Identification & Faceting Style
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Gemstone Lot / Inventory ID <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={gemstoneCode}
              onChange={(e) => onGemstoneCodeChange && onGemstoneCodeChange(e.target.value)}
              placeholder="e.g. CEY-2026-0847"
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Used to track this stone in your evaluation history and on PDF reports.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Shape & Cutting Style <span className="text-rose-500">*</span>
            </label>
            <ShadcnSelect
              value={shape}
              onValueChange={(val) => onShapeChange && onShapeChange(val)}
              options={SHAPE_OPTIONS}
              placeholder="Select shape..."
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Determines acceptable length-to-width and depth tolerances on the Cut step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
