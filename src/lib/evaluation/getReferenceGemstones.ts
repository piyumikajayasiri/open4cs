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
      verificationStatus: "Verified",
      status: { $ne: "INACTIVE" },
      isActive: { $ne: false },
    }).lean();

  return referenceGemstones;
}
