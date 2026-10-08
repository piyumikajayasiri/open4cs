import mongoose from "mongoose";

import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import HistoricalPrice from "@/models/HistoricalPrice";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "CAGS_ADMIN") {
      return Response.json(
        { error: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { error: "Invalid reference gemstone ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const referenceGemstone =
      await ReferenceGemstone.findById(id).lean();

    if (!referenceGemstone) {
      return Response.json(
        { error: "Reference gemstone not found." },
        { status: 404 }
      );
    }

    return Response.json({
      referenceGemstone,
    });
  } catch (error) {
    console.error(
      "Failed to load reference gemstone:",
      error
    );

    return Response.json(
      { error: "Failed to load reference gemstone." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "CAGS_ADMIN") {
      return Response.json(
        { error: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { error: "Invalid reference gemstone ID." },
        { status: 400 }
      );
    }

    const data = await request.json();

    if (!data.variety) {
      return Response.json(
        { error: "Gemstone variety is required." },
        { status: 400 }
      );
    }

    const caratWeight = Number(data.caratWeight);

    if (
      !Number.isFinite(caratWeight) ||
      caratWeight <= 0
    ) {
      return Response.json(
        {
          error:
            "Carat weight must be greater than 0.",
        },
        { status: 400 }
      );
    }

    const referencePrice = Number(
      data.referencePrice
    );

    if (
      !Number.isFinite(referencePrice) ||
      referencePrice <= 0
    ) {
      return Response.json(
        {
          error:
            "Reference price must be greater than 0.",
        },
        { status: 400 }
      );
    }

    const normalizedCurrency =
      typeof data.currency === "string"
        ? data.currency.trim().toUpperCase()
        : "";

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      return Response.json(
        {
          error:
            "Currency must contain exactly 3 letters.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingReference = await ReferenceGemstone.findById(id).lean();

    if (!existingReference) {
      return Response.json(
        { error: "Reference gemstone not found." },
        { status: 404 }
      );
    }

    const priceChanged =
      existingReference.referencePrice !== referencePrice;
    const currencyChanged =
      (existingReference.currency || "USD") !== normalizedCurrency;

    const updatedReferenceGemstone =
      await ReferenceGemstone.findByIdAndUpdate(
        id,
        {
          variety: data.variety,
          caratWeight,

          color: data.color,

          clarity: {
            nakedEye: data.clarity?.nakedEye,
            loupe10x: data.clarity?.loupe10x,
            inclusionType:
              data.clarity?.inclusionType ?? "",
            inclusionLocation:
              data.clarity?.inclusionLocation ?? "",
            severity: data.clarity?.severity,
          },

          cut: {
            length:
              typeof data.cut?.length === "number"
                ? data.cut.length
                : null,

            width:
              typeof data.cut?.width === "number"
                ? data.cut.width
                : null,

            depth:
              typeof data.cut?.depth === "number"
                ? data.cut.depth
                : null,

            symmetry: data.cut?.symmetry,
            polish: data.cut?.polish,
            windowing: data.cut?.windowing,
            extinction: data.cut?.extinction,
            bulging: data.cut?.bulging,
          },

          treatment: {
            status: data.treatment?.status,
          },

          origin: {
            value: data.origin?.value,
            reliability: data.origin?.reliability,
          },

          referencePrice,
          currency: normalizedCurrency,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!updatedReferenceGemstone) {
      return Response.json(
        { error: "Reference gemstone not found." },
        { status: 404 }
      );
    }

    if (priceChanged || currencyChanged) {
      try {
        await HistoricalPrice.create({
          referenceGemstoneId: updatedReferenceGemstone._id,
          variety: updatedReferenceGemstone.variety,
          caratWeight: updatedReferenceGemstone.caratWeight,
          price: updatedReferenceGemstone.referencePrice,
          currency: updatedReferenceGemstone.currency || normalizedCurrency,
          recordedAt: new Date(),
          source: "REFERENCE_UPDATED",
          note: "Reference gemstone pricing updated.",
        });
      } catch (histErr) {
        console.error(
          "Failed to create historical price record on reference update:",
          histErr
        );
      }
    }

    return Response.json({
      message:
        "Reference gemstone updated successfully.",
      referenceGemstone: updatedReferenceGemstone,
    });
  } catch (error) {
    console.error(
      "Failed to update reference gemstone:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to update reference gemstone.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "CAGS_ADMIN") {
      return Response.json(
        { error: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { error: "Invalid reference gemstone ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedReferenceGemstone =
      await ReferenceGemstone.findByIdAndDelete(id);

    if (!deletedReferenceGemstone) {
      return Response.json(
        { error: "Reference gemstone not found." },
        { status: 404 }
      );
    }

    return Response.json({
      message:
        "Reference gemstone deleted successfully.",
      deletedReferenceGemstoneId: id,
    });
  } catch (error) {
    console.error(
      "Failed to delete reference gemstone:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to delete reference gemstone.",
      },
      { status: 500 }
    );
  }
}
