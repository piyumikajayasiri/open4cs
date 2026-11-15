import type { EvaluationInput, MockGemstoneRecord } from "./types";

export const MOCK_EXAMPLES: Record<EvaluationInput["variety"], EvaluationInput> = {
  RUBY: {
    variety: "RUBY", origin: "Sri Lanka", originReliability: "UNVERIFIED", treatment: "HEATED",
    caratWeight: 1.5, shape: "OVAL",
    color: { hue: "RED", tone: 5, saturation: "STRONG", distribution: "EVEN", zoning: "MINOR" },
    clarity: { nakedEye: "SLIGHTLY_INCLUDED", loupe10x: "MODERATE", severity: "MINOR" },
    cut: { length: 8, width: 6, depth: 3.9, symmetry: "GOOD", polish: "EXCELLENT", windowing: "MINOR", extinction: "NONE", bulging: "NONE" },
  },
  SAPPHIRE: {
    variety: "SAPPHIRE", origin: "Sri Lanka", originReliability: "UNVERIFIED", treatment: "UNHEATED",
    caratWeight: 2, shape: "OVAL",
    color: { hue: "BLUE", tone: 5, saturation: "VIVID", distribution: "EVEN", zoning: "NONE" },
    clarity: { nakedEye: "CLEAN", loupe10x: "MINOR", severity: "MINOR" },
    cut: { length: 9, width: 7, depth: 4.55, symmetry: "EXCELLENT", polish: "GOOD", windowing: "NONE", extinction: "MINOR", bulging: "NONE" },
  },
};

// Historical fixtures contain observations and prices, never grading rules.
export const MOCK_DATASET_VERSION = "mock-history-v1";
const fixtureQuotes = {
  RUBY: { RED: [900, 1400], PURPLISH_RED: [700, 1000] },
  SAPPHIRE: { BLUE: [450, 600], PINK: [300, 450], YELLOW: [180, 260], GREEN: [140, 200], PURPLE: [200, 300], COLORLESS: [90, 130] },
} as const;
export const MOCK_GEMSTONE_RECORDS: readonly MockGemstoneRecord[] = Object.entries(fixtureQuotes).flatMap(([variety, hues]) =>
  Object.entries(hues).flatMap(([hue, quotes]) => (["HEATED", "UNHEATED"] as const).flatMap((treatment, treatmentIndex) =>
    [0.8, 1, 1.2].map((weightFactor, index) => {
      const observations = structuredClone(MOCK_EXAMPLES[variety as EvaluationInput["variety"]]);
      observations.color.hue = hue as EvaluationInput["color"]["hue"];
      observations.treatment = treatment;
      observations.caratWeight = Math.round(observations.caratWeight * weightFactor * 100) / 100;
      const scale = Math.cbrt(weightFactor);
      for (const dimension of ["length", "width", "depth"] as const) observations.cut[dimension] = Math.round(observations.cut[dimension] * scale * 100) / 100;
      return {
        id: ["MOCK", variety, hue, treatment, index + 1].join("-"),
        dataKind: "MOCK" as const, datasetVersion: MOCK_DATASET_VERSION, observations,
        currency: "USD" as const, priceBasis: "MOCK_B2B" as const,
        totalPrice: Math.round(quotes[treatmentIndex] * [0.95, 1, 1.05][index] * observations.caratWeight * 100) / 100,
        recordedAt: "2026-10-" + String(10 + index).padStart(2, "0"),
        source: "Open 4Cs invented development fixtures",
        description: "Invented " + treatment.toLowerCase() + " " + hue.toLowerCase() + " " + variety.toLowerCase() + " record; not a real trade.",
      };
    })
  ))
);
