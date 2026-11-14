import { evaluateGemstone } from "../src/lib/evaluation/evaluateGemstone";
import { FOUR_C_WEIGHTS } from "../src/lib/evaluation/rules";

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

const evalA = evaluateGemstone(inputA);
const evalB = evaluateGemstone(inputB);
const evalC = evaluateGemstone(inputC);

const calcA = (evalA.color.score! * FOUR_C_WEIGHTS.color) + (evalA.clarity.score! * FOUR_C_WEIGHTS.clarity) + (evalA.cut.score! * FOUR_C_WEIGHTS.cut) + (evalA.carat.score! * FOUR_C_WEIGHTS.carat);
const calcB = (evalB.color.score! * FOUR_C_WEIGHTS.color) + (evalB.clarity.score! * FOUR_C_WEIGHTS.clarity) + (evalB.cut.score! * FOUR_C_WEIGHTS.cut) + (evalB.carat.score! * FOUR_C_WEIGHTS.carat);
const calcC = (evalC.color.score! * FOUR_C_WEIGHTS.color) + (evalC.clarity.score! * FOUR_C_WEIGHTS.clarity) + (evalC.cut.score! * FOUR_C_WEIGHTS.cut) + (evalC.carat.score! * FOUR_C_WEIGHTS.carat);

console.log("=== PRODUCTION ENGINE AUTOMATIC RECALCULATION ===");
console.log("Scenario A (Blue Sapphire):", {
  Color: evalA.color.score,
  Clarity: evalA.clarity.score,
  Cut: evalA.cut.score,
  Carat: evalA.carat.score,
  FormulaSum: calcA.toFixed(4),
  CompositeScore: evalA.overall4C.score
});
console.log("Scenario B (Padparadscha):", {
  Color: evalB.color.score,
  Clarity: evalB.clarity.score,
  Cut: evalB.cut.score,
  Carat: evalB.carat.score,
  FormulaSum: calcB.toFixed(4),
  CompositeScore: evalB.overall4C.score
});
console.log("Scenario C (Ruby):", {
  Color: evalC.color.score,
  Clarity: evalC.clarity.score,
  Cut: evalC.cut.score,
  Carat: evalC.carat.score,
  FormulaSum: calcC.toFixed(4),
  CompositeScore: evalC.overall4C.score
});
