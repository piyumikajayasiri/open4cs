import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import HistoricalPrice from "@/models/HistoricalPrice";
import { getCurrentUser } from "@/lib/auth/currentUser";

export async function POST(request: Request) {
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
    const data = await request.json();

    if (!data.variety) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemstone variety is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(data.caratWeight) ||
      data.caratWeight <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid carat weight is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(data.referencePrice) ||
      data.referencePrice <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid reference price is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof data.currency !== "string" ||
      !data.currency.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Currency is required.",
        },
        { status: 400 }
      );
    }

    const normalizedCurrency = data.currency.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      return NextResponse.json(
        {
          success: false,
          message: "Currency must be a 3-letter code such as USD or LKR.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const referenceGemstone =
      await ReferenceGemstone.create({
        ...data,
        currency: normalizedCurrency,
        clarity: {
          nakedEye: data.clarity?.nakedEye,
          loupe10x: data.clarity?.loupe10x,
          inclusionType: data.clarity?.inclusionType ?? "",
          inclusionLocation: data.clarity?.inclusionLocation ?? "",
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
      });

    try {
      await HistoricalPrice.create({
        referenceGemstoneId: referenceGemstone._id,
        variety: referenceGemstone.variety,
        caratWeight: referenceGemstone.caratWeight,
        price: referenceGemstone.referencePrice,
        currency: referenceGemstone.currency || normalizedCurrency,
        recordedAt: referenceGemstone.createdAt ?? new Date(),
        source: "REFERENCE_CREATED",
        note: "Reference gemstone created.",
      });
    } catch (histErr) {
      console.error(
        "Failed to create historical price record on reference creation:",
        histErr
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Reference gemstone created successfully.",
        referenceGemstone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Failed to create reference gemstone:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create reference gemstone.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const referenceGemstones =
      await ReferenceGemstone.find().sort({
        createdAt: -1,
      });

    return NextResponse.json(
      {
        success: true,
        referenceGemstones,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Failed to fetch reference gemstones:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reference gemstones.",
      },
      { status: 500 }
    );
  }
}
