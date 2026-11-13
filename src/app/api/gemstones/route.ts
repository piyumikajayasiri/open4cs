import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import Gemstone from "@/models/Gemstone";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    let sessionToken: string | undefined;
    try {
      const cookieStore = await cookies();
      sessionToken = cookieStore.get("session")?.value;
    } catch {
      sessionToken = request.cookies.get("session")?.value;
    }
    if (!sessionToken) {
      sessionToken = request.cookies.get("session")?.value;
    }

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required to register gemstone specimens." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const activeUser = await User.findById(session.userId).select("status isActive role");
    if (!activeUser || activeUser.isActive === false || activeUser.status === "SUSPENDED") {
      return NextResponse.json(
        { success: false, message: "Account is inactive or suspended." },
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

    if (data.caratWeight === undefined || data.caratWeight === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Carat weight is required.",
        },
        { status: 400 }
      );
    }

    const gemstone = await Gemstone.create({
      userId: session.userId,
      variety: data.variety,
      caratWeight: Number(data.caratWeight),

      color: {
        hue: data.color?.hue || "",
        tone: data.color?.tone || "",
        saturation: data.color?.saturation || "",
        distribution: data.color?.distribution || "",
        zoning: data.color?.zoning || "",
      },

      clarity: {
        nakedEye: data.clarity?.nakedEye || "",
        loupe10x: data.clarity?.loupe10x || "",
        inclusionType: data.clarity?.inclusionType || "",
        inclusionLocation: data.clarity?.inclusionLocation || "",
        severity: data.clarity?.severity || "",
      },

      cut: {
        length: Number(data.cut?.length) || 0,
        width: Number(data.cut?.width) || 0,
        depth: Number(data.cut?.depth) || 0,
        symmetry: data.cut?.symmetry || "",
        polish: data.cut?.polish || "",
        windowing: data.cut?.windowing || "",
        extinction: data.cut?.extinction || "",
        bulging: data.cut?.bulging || "",
      },

      treatment: {
        status: data.treatment?.status || "",
        type: data.treatment?.type || "",
      },

      origin: {
        value: data.origin?.value || "",
        reliability: data.origin?.reliability || "",
      },

      informationReliability: {
        measurements:
          data.informationReliability?.measurements ??
          "Unverified",

        treatment:
          data.informationReliability?.treatment ??
          "Unverified",

        origin:
          data.informationReliability?.origin ??
          "Unverified",
      },

      photoUrl: data.photoUrl || "",
      naturalStatus: data.naturalStatus || "Natural",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gemstone created successfully.",
        gemstone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gemstone creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create gemstone.",
      },
      { status: 500 }
    );
  }
}
