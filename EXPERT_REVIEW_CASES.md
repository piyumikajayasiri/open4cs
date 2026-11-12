# Open 4Cs Gemstone Scoring Validation & Expert Review Cases

**Document Version:** 2.0.0  
**Effective Date:** 2026-11-12  
**Evaluation Rule Version:** `prototype-v1`  
**Review Status:** Prepared for Formal Gemmological Peer Review (No certified approvals claimed)  

---

## 1. Quality, Evidence Completeness, and Market Confidence Separation

The Open 4Cs framework strictly distinguishes between three independent evaluation dimensions:

1. **Physical Gemstone Quality (Overall 4C Score 0–100):**  
   Computed exclusively from intrinsic physical attributes: Color (35%), Clarity (25%), Cut (20%), and Carat (20%). Never penalized or boosted by missing paper certificates.
2. **Evidence Completeness & Information Reliability:**  
   Tracks whether measurements, treatment status, and origin claims are `Measured`, `Laboratory Verified`, `Seller Provided`, `User Observed`, or `Unverified`. Determines audit confidence, NOT physical beauty.
3. **Market Valuation Confidence:**  
   Governed by data sufficiency ($\ge 3$ verified completed-sale market references required with $\ge 70\%$ 4C similarity). If sufficient verified market data is unavailable, pricing is marked `UNAVAILABLE` while the 4C quality evaluation remains fully valid.

---

## 2. Variety-Specific Scoring Rules & Boundaries

### 2.1 Blue Sapphire (*Corundum, Blue Variety*)
- **Applicable Color Rules:**
  - Whitelisted Hues: *Royal Blue* (100), *Cornflower Blue* (95), *Vivid Blue* (90), *Violetish Blue* (85), *Steel Blue* (70), *Teal Blue* (60).
  - Tone Scale (GIA 1–9): Medium (5–6) optimal = 100; Tone 4 = 85; Tone 7 = 80; Tone 3 & 8 = 65; Tone 2 & 9 = 50; Tone 1 = 40.
  - Saturation Scale: *Vivid* (100), *Strong* (85), *Medium* (70), *Slightly Greyish* (55), *Greyish* (40).
  - Distribution & Zoning: Even (100) down to Uneven (60); None visible (100) down to Severe (40).
- **Clarity Expectations (Type II Gemstone):**
  - Moderate silk and liquid feathers are typical in natural corundum. Top marks require eye-clean appearance.
- **Cut Assumptions:**
  - Length-to-width ratio: 1.10–1.30 ideal for ovals/cushions. Depth percentage: 60%–75% avoids excessive windowing or dark pavilion extinction.
- **Unsupported Inputs:**
  - Non-blue hues (e.g. *Pigeon Blood Red*, *Pinkish Orange*) rejected with HTTP 400.
- **Missing Data Behavior:**
  - Zero or missing dimensions return `PENDING` / `UNAVAILABLE` without guessing.

---

### 2.2 Padparadscha (*Corundum, Pink-Orange Variety*)
- **Applicable Color Rules:**
  - Whitelisted Hues: *Pinkish Orange* (100), *Orangish Pink* (100), *Orange-Pink* (95), *Sunset Orange* (85), *Salmon Pink* (80).
  - Tone Delicacy: Pastel to medium depth is mandatory (Tone 4–5 optimal = 100). Excessively dark tone (Tone 7–9) penalized to 60 because dark corundum ceases to display true Padparadscha pastel brilliance.
  - Saturation Scale: *Vivid/Strong* (100), *Medium* (80), *Slightly Greyish* (45), *Greyish* (30). Brown overtones strictly disqualify.
- **Clarity Expectations:**
  - High transparency is essential; inclusions disrupting the delicate pastel color transmission significantly reduce visual value.
- **Cut Assumptions:**
  - Native cuts frequently preserve rough weight, leading to windowing. Windowing penalties strictly enforced.
- **Unsupported Inputs:**
  - Pure blue, pure yellow, or intense blood red hues rejected with HTTP 400.
- **Missing Data Behavior:**
  - Missing cut dimensions or weights prevent overall composite score calculation.

---

### 2.3 Ruby (*Corundum, Red Variety*)
- **Applicable Color Rules:**
  - Whitelisted Hues: *Pigeon Blood Red* (100), *Vivid Red* (95), *Purplish Red* (85), *Orangish Red* (75).
  - Tone Scale: Tone 5–6 optimal = 100. Overly light red ($<4$) crosses the gemmological boundary into Pink Sapphire.
  - Saturation Scale: *Vivid* (100), *Strong* (90), *Moderate* (70).
- **Clarity Expectations (Type II Gemstone):**
  - Rubies naturally contain dense silk needles, twin planes, and calcite rhombs. Clean or eye-clean rubies represent supreme rarity.
- **Cut Assumptions:**
  - Bulging pavilions (cut to retain weight from alluvial rough) are checked via depth percentage calculations.
- **Unsupported Inputs:**
  - Blue, yellow, or pinkish-orange hues rejected with HTTP 400.

---

## 3. Test Cases Prepared for Expert Gemmological Review

The following six concrete cases have been evaluated using the Open 4Cs engine (`prototype-v1`) to facilitate structured review by CAGS and NGJA gemmologists.

### Case 1: Premium Ceylon Royal Blue Sapphire (Loose Faceted)
- **Inputs:**
  - Variety: Blue Sapphire | Weight: 2.45 ct | Shape: Cushion (8.2 × 6.8 × 4.9 mm)
  - Color: Hue *Royal Blue*, Tone `6`, Saturation *Vivid*, Distribution *Even*, Zoning *None*
  - Clarity: Eye-clean, 10× Very Slight Silk, Severity *Minor*
  - Cut: Symmetry *Very Good*, Polish *Excellent*, Windowing *None*, Extinction *Minimal*
  - Treatment: Untreated (Laboratory Verified) | Origin: Sri Lanka (Laboratory Verified)
- **Engine Scores:**
  - Color: **100.00** | Clarity: **92.75** | Cut: **98.75** | Carat: **85.00**
  - **Overall 4C Score:** **94.94 / 100** (Commercial Grade: *Outstanding / Commercial Master*)
- **Expected Assessment & Review Discussion:**
  - *Expected Gemmological Consensus:* Near-top tier collector-quality stone.
  - *Potential Disagreement:* Is 85 for a 2.45 ct stone appropriate, or should stones $>2.0$ ct receive a higher carat weight bonus?
  - *Calibration Result:* Maintained at 85 to ensure 100 carat scores remain reserved for extraordinary $>3.0$ ct stones.

---

### Case 2: Commercial Heated Ceylon Blue Sapphire with Windowing
- **Inputs:**
  - Variety: Blue Sapphire | Weight: 1.80 ct | Shape: Oval (7.5 × 5.8 × 3.2 mm)
  - Color: Hue *Vivid Blue*, Tone `5`, Saturation *Strong*, Distribution *Slightly Uneven*
  - Clarity: Slightly Included (Eye-visible feather), 10× Moderate Feathers
  - Cut: Symmetry *Good*, Polish *Good*, Windowing *Moderate*, Extinction *Slight*
  - Treatment: Heated (Seller Provided) | Origin: Sri Lanka (Seller Provided)
- **Engine Scores:**
  - Color: **81.00** | Clarity: **55.00** | Cut: **68.00** | Carat: **80.00**
  - **Overall 4C Score:** **71.70 / 100** (Commercial Grade: *Commercial Good*)
- **Expected Assessment & Review Discussion:**
  - *Expected Gemmological Consensus:* Sound commercial jeweler grade; noticeable tilt windowing.
  - *Calibration Result:* Windowing deduction properly scales down the Cut score from 75 to 68.

---

### Case 3: Untreated Ceylon Padparadscha (Sunset Balance)
- **Inputs:**
  - Variety: Padparadscha | Weight: 1.95 ct | Shape: Cushion (7.6 × 6.0 × 3.8 mm)
  - Color: Hue *Pinkish Orange*, Tone `5`, Saturation *Strong*, Distribution *Even*
  - Clarity: Clean, 10× Very Slight Crystals, Severity *Minor*
  - Cut: Symmetry *Very Good*, Polish *Good*, Windowing *None*, Extinction *None*
  - Treatment: Untreated (Laboratory Verified) | Origin: Sri Lanka (High)
- **Engine Scores:**
  - Color: **94.50** | Clarity: **92.75** | Cut: **92.50** | Carat: **80.00**
  - **Overall 4C Score:** **90.76 / 100** (Commercial Grade: *Fine / Premium*)
- **Expected Assessment & Review Discussion:**
  - *Expected Gemmological Consensus:* Highly prized untreated specimen exhibiting genuine Lotus-standard pink-orange balance.
  - *Calibration Result:* Delicate medium-tone 5 yields optimal color score without excessive dark tone penalty.

---

### Case 4: Over-Dark Padparadscha Candidate (Tone Disqualification)
- **Inputs:**
  - Variety: Padparadscha | Weight: 2.10 ct | Shape: Oval (8.0 × 6.1 × 4.2 mm)
  - Color: Hue *Sunset Orange*, Tone `8` (Very Dark), Saturation *Vivid*, Distribution *Even*
  - Clarity: Clean, 10× Very Slight Silk
  - Cut: Symmetry *Good*, Polish *Good*, Windowing *None*, Extinction *Noticeable*
  - Treatment: Heated | Origin: Sri Lanka
- **Engine Scores:**
  - Color: **66.00** (Tone 8 heavily penalized) | Clarity: **92.75** | Cut: **78.00** | Carat: **90.00**
  - **Overall 4C Score:** **80.89 / 100** (Commercial Grade: *Very Good*)
- **Expected Assessment & Review Discussion:**
  - *Expected Gemmological Consensus:* Many gemmological laboratories (e.g. Lotus, GIA) disqualify dark-toned specimens from the Padparadscha nomenclature, reclassifying them as Orange or Fancy Sapphire.
  - *Calibration Result:* Color score appropriately drops to 66 due to excessive tone depth.

---

### Case 5: Mogok Pigeon Blood Ruby (Untreated Collector Specimen)
- **Inputs:**
  - Variety: Ruby | Weight: 1.85 ct | Shape: Oval (7.3 × 5.7 × 3.7 mm)
  - Color: Hue *Pigeon Blood Red*, Tone `6`, Saturation *Vivid*, Distribution *Even*
  - Clarity: Clean (Eye-clean), 10× Minor Fine Silk, Severity *Minor*
  - Cut: Symmetry *Very Good*, Polish *Good*, Windowing *None*, Extinction *None*
  - Treatment: Untreated (Laboratory Verified) | Origin: Myanmar (High)
- **Engine Scores:**
  - Color: **100.00** | Clarity: **92.75** | Cut: **92.50** | Carat: **80.00**
  - **Overall 4C Score:** **92.69 / 100** (Commercial Grade: *Fine / Premium*)
- **Expected Assessment & Review Discussion:**
  - *Expected Gemmological Consensus:* Top-rank untreated ruby. In natural rubies, eye-clean clarity with minor silk is exceedingly rare.
  - *Calibration Result:* Scored at 92.69 overall composite score.

---

### Case 6: Heavily Included Commercial Ruby
- **Inputs:**
  - Variety: Ruby | Weight: 1.20 ct | Shape: Oval (6.5 × 5.0 × 3.2 mm)
  - Color: Hue *Purplish Red*, Tone `6`, Saturation *Strong*, Distribution *Slightly Uneven*
  - Clarity: Heavily Included (Surface-reaching fracture, visible clouds), Severity *Severe*
  - Cut: Symmetry *Fair*, Polish *Fair*, Windowing *Noticeable*, Extinction *Slight*
  - Treatment: Heated (Glass-filled residue suspected) | Origin: Other
- **Engine Scores:**
  - Color: **81.00** | Clarity: **36.25** | Cut: **52.50** | Carat: **80.00**
  - **Overall 4C Score:** **63.91 / 100** (Commercial Grade: *Commercial Lower*)
- **Expected Assessment & Review Discussion:**
  - *Expected Gemmological Consensus:* Low commercial utility; severe fractures threaten stone durability.
  - *Calibration Result:* Clarity score drops to 36.25, pulling the overall stone score down to commercial tier.
