import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import EvaluationRule from "@/models/EvaluationRule";
import AuditLog from "@/models/AuditLog";

const SEED_RULES = [
  {
    ruleId: "COL-03",
    category: "Color",
    description: "Vivid saturation + tone 5–6 premium",
    effect: "+9%",
    effectType: "positive",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Tone between 5.0 and 6.0 AND Saturation === 'Vivid'",
    rationale: "Colombo lot data shows a consistent 9% price premium for medium-deep vivid blue corundum without extinction.",
    lastUpdated: "Sep 22, 2026",
    author: "Dr. K. Mendis",
    sourceUrl: "https://www.gia.edu/sapphire-quality-factor",
  },
  {
    ruleId: "CLA-02",
    category: "Clarity",
    description: "Eye-clean with off-table silk",
    effect: "+3%",
    effectType: "positive",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Naked eye clarity === 'Eye Clean' AND Rutile silk off-center",
    rationale: "Microscopic silk outside the central table facet softens dispersion positively without impeding light return.",
    lastUpdated: "Sep 18, 2026",
    author: "Prof. S. Wickramasinghe",
    sourceUrl: "https://www.gia.edu/sapphire-quality-factor",
  },
  {
    ruleId: "CUT-02",
    category: "Cut",
    description: "Depth > 70% penalty",
    effect: "-2%",
    effectType: "negative",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Depth percentage > 70.0%",
    rationale: "Excess pavilion depth traps dead weight that yields no face-up millimeter spread, resulting in trade discount.",
    lastUpdated: "Sep 14, 2026",
    author: "Master Cutter N. Perera",
    sourceUrl: "https://www.gia.edu/sapphire/buyers-guide",
  },
  {
    ruleId: "TRT-01",
    category: "Pricing",
    description: "Heated (H) verified modifier",
    effect: "-4%",
    effectType: "negative",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Treatment === 'Heated (H)' without diffusion",
    rationale: "Traditional heat treatment benchmark baseline adjustment relative to prime natural unheated standard.",
    lastUpdated: "Sep 22, 2026",
    author: "CAGS Pricing Board",
    sourceUrl: "https://www.gemresearch.ch/faq",
  },
  {
    ruleId: "ORG-02",
    category: "Pricing",
    description: "Ceylon premium capped if unverified",
    effect: "+0-5%",
    effectType: "positive",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Origin === 'Sri Lanka' AND Lab Report !== 'Accredited'",
    rationale: "Unverified trade origin declarations are restricted to conservative baseline ranges to maintain pricing integrity.",
    lastUpdated: "Aug 30, 2026",
    author: "CAGS Audit Committee",
    sourceUrl: "https://www.gia.edu/gem-lab-colored-stone-report-compare",
  },
  {
    ruleId: "PM-4.3",
    category: "Pricing",
    description: "Unheated premium revision",
    effect: "+18%",
    effectType: "positive",
    version: "draft",
    status: "Pending",
    triggerCondition: "Treatment === 'Natural Unheated' AND Weight >= 2.00ct",
    rationale: "Elevates scarcity tier multiplier for verified untreated Ceylon blue sapphires following 2026 Q3 Colombo auction clearance.",
    lastUpdated: "Oct 28, 2026",
    author: "Dr. K. Mendis",
    sourceUrl: "https://www.gemresearch.ch/faq",
  },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "CAGS_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let rules = await EvaluationRule.find().sort({ createdAt: -1 }).lean();

    // Auto-seed initial canonical rules if database empty
    if (rules.length === 0) {
      await EvaluationRule.insertMany(SEED_RULES);
      rules = await EvaluationRule.find().sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, rules });
  } catch (error) {
    console.error("GET evaluation rules error:", error);
    return NextResponse.json({ success: false, message: "Failed to load rules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "CAGS_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const { ruleId, category, description, effect, triggerCondition, rationale, version } = body;

    if (!ruleId || !category || !description || !effect) {
      return NextResponse.json(
        { success: false, message: "Rule ID, category, description, and effect are required." },
        { status: 400 }
      );
    }

    const cleanRuleId = String(ruleId).trim().toUpperCase();

    const existing = await EvaluationRule.findOne({ ruleId: cleanRuleId });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Rule ID ${cleanRuleId} already exists.` },
        { status: 409 }
      );
    }

    const newRule = await EvaluationRule.create({
      ruleId: cleanRuleId,
      category,
      description: String(description).trim(),
      effect: String(effect).trim(),
      effectType: String(effect).startsWith("-") ? "negative" : "positive",
      version: version ? String(version).trim() : "draft",
      status: "Pending",
      triggerCondition: triggerCondition ? String(triggerCondition).trim() : `${category} calibrated criteria`,
      rationale: rationale ? String(rationale).trim() : "Proposed rule modification.",
      author: user.name || "CAGS Admin",
      lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    });

    await AuditLog.create({
      action: "RULE_PROPOSED",
      performedBy: {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
      targetType: "EvaluationRule",
      targetId: newRule._id.toString(),
      summary: `${user.name} proposed rule ${cleanRuleId} (${category}): ${effect}`,
      details: { ruleId: cleanRuleId, effect, description },
    });

    return NextResponse.json({
      success: true,
      message: `Rule ${cleanRuleId} successfully submitted for review.`,
      rule: newRule,
    }, { status: 201 });
  } catch (error) {
    console.error("POST evaluation rule error:", error);
    return NextResponse.json({ success: false, message: "Failed to create rule" }, { status: 500 });
  }
}
