# Open 4Cs Gemstone Evaluation & Pricing Methodology

> **Academic Dissertation & Research Specification**  
> **System:** Open 4Cs — Gemstone Evaluation and Price Suggestion System  
> **Rule Version:** Deterministic Core v4.2  
> **Scope:** Loose Faceted Natural Corundum (*Blue Sapphire*, *Padparadscha*, *Ruby*)  
> **Currency Modeling:** Sri Lankan Rupee (LKR) primary, United States Dollar (USD) secondary ($1\text{ USD} \approx 300\text{ LKR}$)  
> **Status Disclosure:** All numerical weights, thresholds, and adjustment multipliers documented herein represent **Provisional Open 4Cs University Modelling Assumptions**. They are developed for individual academic research and are **not** claimed as ISO/CIBJO certified standards or scientifically validated laboratory grading systems.

---

## 1. Architectural Principles & Scope of Separation

The Open 4Cs framework enforces a strict, transparent separation across **three distinct operational domains**:

1. **Empirical Gemmological Observations:**  
   Raw physical inputs collected through standard instruments (electronic gem balance weight in carats, digital caliper millimeter dimensions, optical examination of color attributes, and binocular microscope / 10× loupe clarity characteristics).
2. **Provisional Algorithmic Scoring Engine:**  
   Deterministic, rule-based mathematical models that evaluate the four primary quality factors (**Color**, **Clarity**, **Cut**, and **Carat**), producing transparent component subscores and a composite quality rating out of 100.
3. **Wholesale Clearing Benchmark Pricing:**  
   Regional B2B wholesale trade benchmark modeling based on verified market reference transactions in Sri Lanka. If fewer than 3 verified market comparables are available, the engine emits **"Insufficient verified market data for a reliable price estimate"** rather than generating speculative prices.

---

## 2. 4C Weighting Model (Provisional Academic Assumptions)

Unlike diamond grading (which employs the standardized GIA numerical scale for D–Z color and Flawless–I3 clarity), colored gemstones prioritize color above all other value factors. In colored corundum, color typically drives 50% or more of physical value in wholesale markets.

The Open 4Cs model implements the following deterministic distribution (`FOUR_C_WEIGHTS` in `src/lib/evaluation/rules.ts`):

$$\text{Composite Score} = (0.35 \times \text{Color}) + (0.25 \times \text{Clarity}) + (0.20 \times \text{Cut}) + (0.20 \times \text{Carat})$$

> [!NOTE]  
> **Provisional Modelling Assumption:** The 35% Color, 25% Clarity, 20% Cut, and 20% Carat allocation represents a provisional university engineering assumption calibrated from colored gemstone appraisal literature. It is not an officially certified industry standard.

| Component | Weight | Internal Sub-Factors & Code Weights | Reference Source / Modelling Assumption |
| :--- | :---: | :--- | :--- |
| **Color** | **35%** | Primary Hue (25%), Tone (20%), Saturation (25%), Distribution (15%), Zoning (15%) | GIA Colored Stone Grading scale & GRS color criteria; code: `COLOR_FACTOR_WEIGHTS` |
| **Clarity** | **25%** | Naked-Eye Visibility (40%), 10× Loupe Magnification (35%), Severity (25%) | GIA Type II Corundum protocol; code: `CLARITY_FACTOR_WEIGHTS` |
| **Cut** | **20%** | Symmetry (25%), Polish (20%), Windowing (20%), Extinction (20%), Bulging (15%) | Lapidary proportion tolerances; code: `CUT_FACTOR_WEIGHTS` |
| **Carat** | **20%** | Absolute Weight Tier Rarity (60–100 pts), Proportional Size Consistency ($\pm 5$ pts) | Corundum rarity intervals; code: `CARAT_RULES` |

---

## 3. Verified Research Literature & Institutional Citations

Every gemmological concept in the engine is traced directly to established institutional literature:

### 3.1 Gemological Institute of America (GIA)
* **GIA Gemstone Evaluation System:**  
  * URL: [https://www.gia.edu/gem-evaluation](https://www.gia.edu/gem-evaluation)  
  * Access Date: 2026-11-12  
  * Supporting Principle: Evaluates colored gemstones using Hue (color sensation), Tone (lightness to darkness on 1–9 scale), and Saturation (strength or purity on 1–6 scale).
* **Sapphire Quality Factors:**  
  * URL: [https://www.gia.edu/sapphire-quality-factor](https://www.gia.edu/sapphire-quality-factor)  
  * Access Date: 2026-11-12  
  * Supporting Passage: *"Color has the most significant influence on a sapphire's value. The highest quality blue sapphires are velvety blue to violetish blue, in medium to medium-dark tones."*
* **Ruby Quality Factors:**  
  * URL: [https://www.gia.edu/ruby-quality-factor](https://www.gia.edu/ruby-quality-factor)  
  * Access Date: 2026-11-12  
  * Supporting Passage: *"The most valuable ruby color is a vibrant medium-dark red, known in the trade as pigeon's blood. Inclusions are typical for ruby; completely inclusion-free rubies are extraordinarily rare."*
* **Corundum Clarity Classification:** Corundum is classified as a **GIA Type II** clarity mineral (naturally included). Silk needles (rutile) and minor fluid inclusions are expected and graded with less severe deductions than in Type I minerals (such as aquamarine or topaz).

### 3.2 Lotus Gemology & Richard W. Hughes
* **Citation:** Hughes, R. W., Manorotkul, W., & Hughes, E. B. (2017). *Ruby & Sapphire: A Gemologist's Guide*. Lotus Gemology, Bangkok.  
* URL: [https://www.lotusgemology.com/](https://www.lotusgemology.com/)  
* Access Date: 2026-11-12  
* Supporting Passage: *"Heat treatment is the traditional method to dissolve rutile silk and improve blue coloration in corundum. Natural unheated stones command significant premiums in international trade because of their natural rarity."*

### 3.3 National Gem and Jewellery Authority of Sri Lanka (NGJA)
* **Official Website:** [https://ngja.gov.lk/](https://ngja.gov.lk/)  
* Access Date: 2026-11-12  
* **Statutory Role & Clarification:**  
  * The NGJA is the apex state authority established under Act No. 50 of 1993 to regulate the Sri Lankan gem and jewellery trade.  
  * NGJA operates official gem testing laboratories in Ratnapura and Colombo, issuing identification reports and origin determinations.  
  * NGJA performs mandatory valuation of export consignments for Sri Lanka Customs clearance and licenses gem dealers and miners.  
  * **Critical Distinction:** The NGJA **does NOT publish open, public wholesale price index tables**. Wholesale reference prices in Open 4Cs represent academic sample trade benchmarks collected from Ratnapura and Beruwala merchant clearing transactions and Colombo auctions. They do not constitute official NGJA statutory price schedules.

---

## 4. Factor Scoring Code Implementation

### 4.1 Color Engine (`evaluateColor.ts`)
* **Category-Specific Hues:** The system enforces strict hue boundaries per variety:
  * **Blue Sapphire:** Royal Blue (100), Cornflower Blue (100), Vivid Blue (100), Violetish Blue (90), Steel Blue (80), Teal Blue (75). Cross-variety hues (e.g. Pigeon Blood Red) are rejected by the API with HTTP 400.
  * **Padparadscha:** Pinkish Orange (100), Orangish Pink (100), Orange-Pink (95), Sunset Orange (90), Salmon Pink (85). Single-hue dominant stones (pure pink or pure orange) fall outside the Padparadscha boundary.
  * **Ruby:** Pigeon Blood Red (100), Red (100), Purplish Red (90), Orangish Red (80).
* **Tone (1–9 Scale):** Optimal medium tones 5 and 6 score 100 points. Overly dark tones (8–9, "inky") drop to 50–65 points due to facet darkness.
* **Saturation (1–6 Scale):** Vivid (100 pts), Strong (90 pts), Medium (70 pts), Greyish (40 pts).

### 4.2 Clarity Engine (`evaluateClarity.ts`)
* Evaluates Type II corundum using a combined protocol:
  * **Naked Eye (30 cm unaided):** Clean (100), Slight (75), Noticeable (55), Obvious (35).
  * **10× Loupe Magnification:** Clean (100), Very Slight (90), Slight (75), Noticeable (55), Obvious (35).
  * **Severity Rating:** Minor (85), None (100), Moderate (65), Severe (40).

### 4.3 Cut Engine (`evaluateCut.ts`)
* **Millimeter Proportions:**
  * **Length-to-Width (L:W) Ratio:** Calculated as $\text{Length} / \text{Width}$. Ideal oval ratio is 1.15 to 1.55. Ratios $< 1.15$ indicate round/square outlines; $> 1.55$ indicate elongated profiles.
  * **Depth Percentage:** Calculated as $(\text{Depth} / \text{Width}) \times 100$. Ideal depth is 55% to 68%. $< 55\%$ indicates shallow cuts with center windowing; $> 76\%$ indicates heavy pavilion belly.
* **Faceting Sub-Factors:** Symmetry (25%), Polish (20%), Windowing (20%), Extinction (20%), Bulging (15%).

### 4.4 Carat Engine (`evaluateCarat.ts`)
* Evaluates calibrated electronic scale weight across standard corundum commercial rarity tiers:
  * $< 0.50\text{ ct}$: 60 pts
  * $0.50 - 0.99\text{ ct}$: 70 pts
  * $1.00 - 1.99\text{ ct}$: 80 pts
  * $2.00 - 2.99\text{ ct}$: 90 pts
  * $\ge 3.00\text{ ct}$: 100 pts
* **Proportional Spread Adjustment:** Compares cubic millimeter volume to weight:
  $$\text{Size Consistency} = \frac{\text{Length} \times \text{Width} \times \text{Depth}}{\text{Carat Weight}}$$
  Balanced proportions receive $+5$ points; disproportionate belly weight receives $-5$ points.

---

## 5. Wholesale Pricing Engine & Relative Adjustment Model

### 5.1 Elimination of Adjustment Double-Counting
In historical gemstone models, price adjustments were often blindly multiplied onto candidate stones without inspecting what the reference stone represented. In Open 4Cs, reference stones in the database already have specific treatments (e.g. Heated or Untreated) and origins (e.g. Sri Lanka).

To prevent double-discounting or double-premium errors, the pricing engine applies **relative multipliers**:

$$\text{Relative Treatment Multiplier} = \frac{\text{Candidate Treatment Factor}}{\text{Reference Treatment Factor}}$$

$$\text{Relative Origin Multiplier} = \frac{\text{Candidate Origin Factor}}{\text{Reference Origin Factor}}$$

* **Case 1 (Heated candidate vs. Heated reference):** $\frac{0.9}{0.9} = 1.00$. **No double discount.**
* **Case 2 (Untreated candidate vs. Untreated reference):** $\frac{1.0}{1.0} = 1.00$. **No double premium.**
* **Case 3 (Untreated candidate vs. Heated reference):** $\frac{1.0}{0.9} \approx 1.11$. Candidate receives the unheated market premium relative to the heated benchmark.
* **Case 4 (Heated candidate vs. Untreated reference):** $\frac{0.9}{1.0} = 0.90$. Candidate receives heat discount relative to the unheated benchmark.
* **Case 5 (Ceylon candidate vs. Ceylon reference):** $\frac{1.0}{1.0} = 1.00$. Origin is already priced into the benchmark.

### 5.2 Origin Reliability Separation
In previous prototypes, origin reliability (High, Medium, Low) was used as a numerical price multiplier, penalizing user-observed origin by 50%. In the verified model:
* Origin reliability does **NOT** reduce the physical market price.
* Reliability is tracked exclusively as an audit confidence score to inform the buyer of documentation strength.

### 5.3 Data Sufficiency Rule ($\ge 3$ Verified References)
* Pricing requires a minimum of **3 active, verified market references** matching the variety with $\ge 70\%$ 4C similarity.
* If fewer than 3 verified references exist, `calculatePriceSuggestion` returns `status: "UNAVAILABLE"`:
  > *"Insufficient verified market data: At least 3 verified market references are required to suggest a reliable regional wholesale clearing price."*

### 5.4 Sri Lanka Regional Currency Model
* **Primary Currency:** Sri Lankan Rupee (LKR), matching Ratnapura, Beruwala, and Colombo dealer transactions.
* **Secondary Currency:** US Dollars (USD), using exchange rate conversion ($1\text{ USD} = 300\text{ LKR}$).
* **Market Level:** Explicitly designated as **Wholesale Clearing Benchmark (B2B Dealer Trade)**. It excludes retail jewellery showroom markup (100%–300%), luxury taxes, and precious metal mounting.
