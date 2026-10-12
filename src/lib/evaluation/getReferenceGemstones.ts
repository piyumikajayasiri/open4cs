import { connectToDatabase } from "@/lib/mongodb";
import ReferenceGemstone from "@/models/ReferenceGemstone";

export async function getReferenceGemstones(
  variety: string
) {
  await connectToDatabase();

  const referenceGemstones =
    await ReferenceGemstone.find({
      variety: {
        $regex: `^${variety.trim()}$`,
        $options: "i",
      },
    }).lean();

  return referenceGemstones;
}
