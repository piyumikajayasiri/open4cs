import { evaluateGemstone } from "../src/lib/evaluation/evaluateGemstone";

const inputA = {
  variety: "Blue Sapphire",
  caratWeight: 2.45,
  color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
  clarity: { nakedEye: "Eye-clean", loupe10x: "Very Slight", inclusionType: "Silk needles", inclusionLocation: "Off-table", severity: "Minor" },
  cut: { length: 8.2, width: 6.8, depth: 4.9, symmetry: "Very Good", polish: "Excellent", windowing: "None", extinction: "None", bulging: "None" },
  treatment: { status: "Untreated", type: "None" },
  origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
  informationReliability: { measurements: "Measured" as const, treatment: "Laboratory Verified" as const, origin: "Laboratory Verified" as const },
};
const resA = evaluateGemstone(inputA);
console.log("Scenario A actual:", {
  color: resA.color.score,
  clarity: resA.clarity.score,
  cut: resA.cut.score,
  carat: resA.carat.score,
  overall: resA.overall4C.score
});

const inputB = {
  variety: "Padparadscha",
  caratWeight: 1.95,
  color: { hue: "Pinkish Orange", tone: "5", saturation: "Strong", distribution: "Even", zoning: "None" },
  clarity: { nakedEye: "Eye-clean", loupe10x: "Very Slight", inclusionType: "Silk needles", inclusionLocation: "Off-table", severity: "Minor" },
  cut: { length: 7.6, width: 6.0, depth: 3.8, symmetry: "Very Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
  treatment: { status: "Untreated", type: "None" },
  origin: { value: "Sri Lanka", reliability: "Laboratory Verified" },
  informationReliability: { measurements: "Measured" as const, treatment: "Laboratory Verified" as const, origin: "Laboratory Verified" as const },
};
const resB = evaluateGemstone(inputB);
console.log("Scenario B actual:", {
  color: resB.color.score,
  clarity: resB.clarity.score,
  cut: resB.cut.score,
  carat: resB.carat.score,
  overall: resB.overall4C.score
});

const inputC = {
  variety: "Ruby",
  caratWeight: 1.50,
  color: { hue: "Pigeon Blood Red", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
  clarity: { nakedEye: "Clean", loupe10x: "Very Slight", inclusionType: "Minor rutile", inclusionLocation: "Pavilion", severity: "Minor" },
  cut: { length: 6.8, width: 5.2, depth: 3.4, symmetry: "Good", polish: "Good", windowing: "None", extinction: "None", bulging: "None" },
  treatment: { status: "Unknown", type: "Unverified" },
  origin: { value: "Unknown", reliability: "Unverified" },
  informationReliability: { measurements: "User Observed" as const, treatment: "Unverified" as const, origin: "Unverified" as const },
};
const resC = evaluateGemstone(inputC);
console.log("Scenario C actual:", {
  color: resC.color.score,
  clarity: resC.clarity.score,
  cut: resC.cut.score,
  carat: resC.carat.score,
  overall: resC.overall4C.score
});
