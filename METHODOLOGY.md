# Open 4Cs Gemstone Evaluation & Pricing Methodology

> **Academic Project Specification**  
> **System:** Open 4Cs — Gemstone Evaluation and Price Suggestion System  
> **Rule Version:** Deterministic Core v4.2  
> **Target Specimen Scope:** Loose Faceted Natural Corundum (*Blue Sapphire*, *Padparadscha*, *Ruby*)

---

## 1. Executive Summary & Foundational Architecture

The Open 4Cs system is an evidence-based, deterministic gemmological assessment and wholesale price estimation platform developed as an individual university research project. 

The methodology strictly separates **three distinct operational domains**:
1. **Physical Gemmological Observations:** Raw empirical inputs recorded through standard optical and physical instruments (millimeter dimensions, electronic balance weight, 10× binocular microscope / loupe clarity observations, and color grading attributes).
2. **Algorithmic Scoring Engine:** Transparent, rule-based mathematical models that evaluate the four primary quality factors (**Color**, **Clarity**, **Cut**, and **Carat**) against calibrated gemmological standards, yielding reproducible component scores and a composite quality rating out of 100.
3. **Evidence-Based Market Pricing:** Wholesale B2B market benchmark modeling derived strictly from active, verified reference records. If verified market comparables are unavailable, the engine emits **"Insufficient verified market data for a reliable price estimate"** rather than interpolating or inventing speculative prices.

---

## 2. 4C Weighting Model (Research Calibration)

Unlike diamond grading (which employs the standardized GIA numerical scale for D–Z color and Flawless–I3 clarity), colored gemstones prioritize color above all other value factors. In colored corundum, color accounts for over 50% of commercial wholesale value in physical gem markets.

The Open 4Cs Research Model implements a deterministic weighting distribution calibrated for fine faceted corundum:

$$\text{Composite Score} = (0.35 \times \text{Color}) + (0.25 \times \text{Clarity}) + (0.20 \times \text{Cut}) + (0.20 \times \text{Carat})$$

| Component | Weight | Key Assessment Sub-Factors | Primary Standard |
| :--- | :---: | :--- | :--- |
| **Color** | **35%** | Hue purity (25%), Tone depth (20%), Saturation intensity (25%), Distribution uniformity (15%), Color zoning (15%) | GIA Colored Stone Grading & GRS Master Reference |
| **Clarity** | **25%** | Naked-eye visibility (45%), 10× loupe inclusion relief (35%), Spatial location & structural severity (20%) | GIA Type II Gemstone Clarity Scale |
| **Cut** | **20%** | Length-to-width ratio (25%), Depth percentage (35%), Optical symmetry (15%), Surface polish (15%), Windowing & extinction (10%) | Lapidary Proportion Tolerance Standards |
| **Carat** | **20%** | Absolute weight tier rarity (60%), Face-up spread to depth density consistency (40%) | Geometric Corundum Rarity Multipliers |

---

## 3. Primary Gemmological Research & Literature Register

The algorithmic rules implemented in `src/lib/evaluation/rules.ts` are synthesized from the following peer-reviewed and institutional references:

### 3.1 Gemological Institute of America (GIA)
* **Quality Factors & Buyer's Guide:** GIA Colored Stone Grading System (Munsell-based Color Coordinates: 31 Color Hues, Tone 1–9, Saturation 1–6).
* **Reference:** *GIA Gem Reference Guide*, Gemological Institute of America, Carlsbad, CA.
* **Corundum Classification:** Corundum is classified as a **GIA Type II** clarity gemstone (gemstones that are typically included in nature). Moderate microscopic silk is expected in natural, unheated corundum and does not severely penalize clarity unless it impedes optical transparency or light return.

### 3.2 GemResearch Swisslab (GRS)
* **Master Color Terminology Standards:**
  * **Royal Blue:** Blue sapphire exhibiting vivid saturation and medium-dark tone (Tone 6, Saturation 5–6) with minimal violetish or greenish secondary modifiers.
  * **Cornflower Blue:** Medium tone (Tone 4–5), bright, velvety saturation characteristic of fine Ceylon and Kashmir material.
  * **Pigeon's Blood:** Vivid red corundum with medium-dark tone and high fluorescence, balancing red purity without dark extinction.
  * **Padparadscha:** Delicate balance of pinkish-orange to orangey-pink hue; stones displaying single-color dominance (pure pink or pure orange) are categorized separately.
* **Reference:** *GRS Gemresearch Swisslab Color Grading Manual & Research Criteria*, Lucerne, Switzerland.

### 3.3 Lotus Gemology & Richard W. Hughes
* **Treatment & Inclusion Diagnostics:**
  * Thermal enhancement diagnostics (stable rutile silk vs. dissolved rutile needles with discoid stress fractures).
  * Impact of high-temperature flux and beryllium lattice diffusion on trade liquidity and consumer disclosures.
* **Reference:** Hughes, R. W., Manorotkul, W., & Hughes, E. B. (2017). *Ruby & Sapphire: A Gemologist's Guide*. RWH Publishing/Lotus Gemology, Bangkok.

### 3.4 National Gem and Jewellery Authority of Sri Lanka (NGJA)
* **Field Valuation Benchmarks:** Wholesale clearing price intervals derived from primary B2B auctions and dealer markets in Ratnapura, Beruwala, and Colombo.

---

## 4. Evaluation Engine Factor Breakdown

### 4.1 Color Scoring (`evaluateColor.ts`)
* **Tone Scale (1–9):** Medium tones 5 and 6 score 100 points. Extremes (very light Tone 1–2 or overly dark "inky" Tone 8–9) receive significant penalties (40–50 points) due to loss of brilliance.
* **Saturation Scale (1–6):** Vivid (6) scores 100 points, Strong (5) scores 90 points, whereas Greyish/Weak (1–2) scores 40 points.
* **Color Zoning & Distribution:** Even color distribution with no visible zoning scores 100 points. Severe angular growth zoning visible face-up penalizes the color sub-score by up to 50 points.

### 4.2 Clarity Scoring (`evaluateClarity.ts`)
* Corundum is graded according to **Type II standards**:
  * **Eye-Clean:** 100 points.
  * **Very Slight (10× Loupe only):** 90 points (typical of unheated fine silk needles).
  * **Slightly Included:** 75 points.
  * **Moderately Included:** 55 points.
  * **Heavily Included:** 35 points.
* **Location Weighting:** Inclusions located in the pavilion or under the crown facets receive lower penalties than central inclusions directly below the table facet.

### 4.3 Cut & Measurement Scoring (`evaluateCut.ts`)
* **Proportions:**
  * **Oval Mixed Cut Optimal Ratio:** Length-to-width of 1.15 to 1.35. Ratios exceeding 1.50 or below 1.05 receive shape distortion deductions.
  * **Depth Percentage:** Optimal depth ratio is calibrated between **55% and 68%**. Depth percentages under 50% indicate shallow stones with light leakage (**windowing**), while depth percentages over 75% indicate heavy pavilions (**swallowed weight** without face-up spread).
* **Optical Phenomena:**
  * **Windowing:** Light "falling through" the center of the stone due to critical angle violation. Deducts 10–25 points depending on severity.
  * **Extinction:** Black or darkened facets that reflect no light. Deducts 5–20 points.

### 4.4 Carat Weight & Spread Proportions (`evaluateCarat.ts`)
* **Per-Carat Geometric Multipliers:** Natural corundum crystals follow an exponential rarity curve in alluvial gravels. Significant per-carat price increments occur at the 1.00 ct, 2.00 ct, 3.00 ct, and 5.00 ct thresholds.
* **Size Consistency Index:** Volume index calculated via:
  $$\text{Spread Index} = \frac{\text{Length} \times \text{Width} \times \text{Depth}}{\text{Carat Weight}}$$
  Identifies whether the gemstone has a balanced cut, a shallow spread, or excess belly weight.

---

## 5. Market Pricing Engine & Comparables Algorithm

1. **Active Filter:** The pricing engine strictly selects verified market references:
   $$\{ \text{verificationStatus: "Verified"}, \text{status: "ACTIVE"}, \text{isActive: true} \}$$
2. **Similarity Scoring:** Compares user-submitted stone parameters against verified stones using Euclidean distance in 4C space:
   $$\text{Similarity} = 100 \times \left(1 - \sqrt{\sum w_i (x_i - y_i)^2}\right)$$
3. **Treatment & Origin Multipliers:**
   * **Unheated Premium:** Natural unheated stones with valid spectroscopic evidence receive an algorithmic premium (+15% to +25%).
   * **Standard Heated Modifier:** Baseline standard heat treatment applies a calibrated -4% modifier.
   * **Geographic Origin:** Verified Ceylon (Sri Lanka) corundum applies an origin premium capped at +5%.
4. **Data Sufficiency Rule:** If fewer than two verified market records match within tolerance, the engine displays:
   > *"Insufficient verified market data for a reliable price estimate."*

---

## 6. Auditability & System Governance

Every evaluation performed in Open 4Cs records:
* The exact deterministic rule version string (`v4.2`).
* An immutable audit log entry in MongoDB (`AuditLog` collection).
* Complete input parameters and intermediate scores.
* Verification status of supporting lab documentation.
