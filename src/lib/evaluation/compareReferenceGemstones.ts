import { getReferenceGemstones } from "./getReferenceGemstones";
import {
  compareWithReferences,
  GemstoneForComparison,
  ReferenceForComparison,
  ReferenceGemstoneComparison,
} from "./referenceComparison";

export async function compareReferenceGemstones(
  gemstone: GemstoneForComparison
): Promise<ReferenceGemstoneComparison[]> {
  const referenceGemstones =
    await getReferenceGemstones(gemstone.variety);

  const references: ReferenceForComparison[] =
    referenceGemstones.map((reference) => ({
      _id: reference._id.toString(),
      variety: reference.variety,
      caratWeight: reference.caratWeight,
      referencePrice: reference.referencePrice,
      currency: reference.currency ?? "USD",

      color: {
        hue: reference.color.hue,
        tone: reference.color.tone,
        saturation: reference.color.saturation,
        distribution: reference.color.distribution,
        zoning: reference.color.zoning,
      },

      clarity: {
        nakedEye: reference.clarity.nakedEye,
        loupe10x: reference.clarity.loupe10x,
        inclusionType: reference.clarity.inclusionType ?? "",
        inclusionLocation: reference.clarity.inclusionLocation ?? "",
        severity: reference.clarity.severity,
      },

      cut: {
        length: reference.cut.length ?? null,
        width: reference.cut.width ?? null,
        depth: reference.cut.depth ?? null,
        symmetry: reference.cut.symmetry,
        polish: reference.cut.polish,
        windowing: reference.cut.windowing,
        extinction: reference.cut.extinction,
        bulging: reference.cut.bulging,
      },
    }));

  return compareWithReferences(
    gemstone,
    references
  );
}
