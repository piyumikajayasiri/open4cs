# Open 4Cs Market Data Provenance & Traceability Register

**Document Version:** 2.0.0  
**Effective Date:** 2026-11-12  
**System Classification:** Academic University Modeling & Pedagogical Prototype  
**Auditor / Reviewer:** Open 4Cs Academic Research Team  

---

## 1. Executive Summary & Data Integrity Notice

> [!IMPORTANT]
> **Data Integrity Disclosure:**
> The current reference records in the Open 4Cs database are **pedagogical demonstration benchmarks** modeled from market observations across Sri Lanka (Colombo Fort, Beruwala, Ratnapura) and regional wholesale trading centers. In accordance with strict academic and commercial integrity standards, these records are explicitly classified as **Demo Data (`dataClassification: "Demo"`)** and **Dealer Estimates (`transactionContext: "Dealer Estimate"`)**.
> 
> Under Open 4Cs pricing integrity rules:
> 1. Estimates derived from pedagogical demo benchmarks are labeled as **"Indicative Research Benchmark (Demonstration / Academic Data)"**, NEVER as certified or verified commercial clearing prices.
> 2. Real commercial price suggestions require at least three verified completed-sale market transactions (`dataClassification: "Real"` and `transactionContext: "Completed Sale"`).
> 3. Gemstone 4C quality evaluation (Color, Clarity, Cut, Carat, Overall 4C Score 0–100, and Commercial Grade) operates independently and remains 100% available even when commercial pricing is unavailable.

---

## 2. Complete Provenance Register of Reference Gemstones

The table below provides a field-by-field provenance audit of all ten reference records currently maintained in the system.

| Reference ID | Variety | Carat Weight | Reference Price | Currency | Market Context | Transaction Type | Data Class | Verification Status | Observation Date | Source & Documentation Evidence | Treatment Evidence | Origin Evidence | Reviewer & Review Date |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **REF-1207** | Blue Sapphire | 2.61 ct | LKR 2,322,900 | LKR | Wholesale | Dealer Estimate | **Demo** | Verified | 2026-10-18 | Modeled after loose unheated Ceylon Blue Sapphire dealer lots in Colombo Fort | Microscopic observation: unaltered intersecting rutile silk needle arrays without discoidal thermal tension haloes | Classic Ratnapura alluvial corundum suite: rutile silk, liquid feathers, rounded zircon crystals | Open 4Cs Academic Evaluator (2026-10-24) |
| **REF-1182** | Blue Sapphire | 2.52 ct | LKR 1,612,800 | LKR | Wholesale | Dealer Estimate | **Demo** | Verified | 2026-10-15 | Modeled after traditional thermally treated Ceylon Blue Sapphire trade parcel clearing observations (Beruwala) | Partially resorbed rutile silk and discoidal thermal stress fractures surrounding mineral inclusions | Mineralogical suite consistent with Sri Lankan highland corundum | Open 4Cs Academic Evaluator (2026-10-19) |
| **REF-0934** | Blue Sapphire | 2.38 ct | LKR 1,456,560 | LKR | Wholesale | Dealer Estimate | **Demo** | Verified | 2026-10-10 | Modeled after medium-tone heated Ceylon sapphire trade parcel lots (Ratnapura Gem Exchange) | Thermal alteration confirmed by internal reflective stress haloes | Seller declared Ceylon origin; diagnostic inclusions support Sri Lankan geological provenance | Open 4Cs Academic Evaluator (2026-10-12) |
| **REF-1099** | Blue Sapphire | 2.74 ct | LKR 1,638,520 | LKR | Wholesale | Asking Price | **Demo** | **Pending** | 2026-10-29 | Trader submission record pending independent gemmological audit | Visual inspection notes indicate heating; formal FTIR/microscopy pending | Seller declared Sri Lanka; unverified | Pending Reviewer (2026-10-29) |
| **HIST-Q2-31** | Padparadscha | 1.75 ct | LKR 1,925,000 | LKR | Wholesale | Dealer Estimate | **Demo** | Verified | 2026-09-25 | Modeled after untreated Ceylon Padparadscha auction specimens exhibiting balanced pink-orange color | Intact silk needles and natural color distribution without beryllium lattice diffusion | Classic Sri Lankan alluvial corundum inclusion suite | Open 4Cs Academic Evaluator (2026-09-30) |
| **REF-PAD-02** | Padparadscha | 2.15 ct | LKR 1,827,500 | LKR | Wholesale | Dealer Estimate | **Demo** | Verified | 2026-08-10 | Modeled after heated Ceylon Padparadscha corundum trade samples (Beruwala) | Thermal alteration evident in partially dissolved rutile needles | Inclusion profile confirms Sri Lankan geological source | Open 4Cs Academic Evaluator (2026-08-15) |
| **REF-PAD-03** | Padparadscha | 1.95 ct | LKR 2,145,000 | LKR | Wholesale | Dealer Estimate | **Demo** | Verified | 2026-10-28 | Modeled after untreated Ratnapura dealer parcel observations | Unaltered silk needles and prismatic apatite crystals without heat-induced halos | Documented provenance from Ratnapura alluvial gravel pit lot | Open 4Cs Academic Evaluator (2026-11-02) |
| **REF-RUBY-01** | Ruby | 1.60 ct | LKR 1,440,000 | LKR | Wholesale | Dealer Estimate | **Demo** | Verified | 2026-07-01 | Modeled after natural untreated Mogok/Burma red corundum trade parcel observations | Dense short rutile silk needles undisturbed by high-temperature heat treatment | Calcite and swirl growth zoning diagnostic of marble-hosted Mogok ruby | Open 4Cs Academic Evaluator (2026-07-10) |
| **REF-RUBY-02** | Ruby | 2.10 ct | LKR 1,512,000 | LKR | Wholesale | Dealer Estimate | **Demo** | Verified | 2026-06-20 | Modeled after thermally treated Burma ruby trade parcel clearing observations | Thermal alteration in silk needles and melted calcite edges | Inclusion suite diagnostic of Burmese marble origin | Open 4Cs Academic Evaluator (2026-06-28) |
| **REF-RUBY-03** | Ruby | 1.85 ct | LKR 1,980,000 | LKR | Wholesale | Dealer Estimate | **Demo** | Verified | 2026-10-30 | Modeled after unheated Pigeon Blood ruby trade parcel clearing observations | Unaltered rutile silk, unexpanded negative crystals, absence of glass residue or flux | High chromium fluorescence and marble-hosted inclusion morphology typical of Mogok | Open 4Cs Academic Evaluator (2026-11-04) |

---

## 3. Treatment and Origin Adjustment Factor Policies

### 3.1 Relative Adjustment Principle (Eliminating Double-Counting)
When comparing candidate gemstones with reference benchmarks:
$$\text{Relative Multiplier} = \frac{\text{Candidate Factor}}{\text{Reference Factor}}$$

- **Matching Treatments:** If candidate is heated and reference is heated, the relative multiplier is $\frac{0.90}{0.90} = 1.00$. No adjustment factor is applied.
- **Untreated Candidate vs. Heated Reference:** Relative multiplier is $\frac{1.00}{0.90} \approx 1.111$ (reflecting unheated trade premium).
- **Provisional Modeling Disclosure:** All treatment multipliers are explicitly flagged as provisional university modeling assumptions. Gemmological market literature indicates thermal premiums vary significantly by rough rarity, crystal clarity, and saturation depth.

---

## 4. Currency and Exchange Rate Provenance

1. **Primary Regional Currency:** All Sri Lankan gem market references are recorded natively in **Sri Lankan Rupees (LKR)**.
2. **Exchange Rate Integrity:**
   - **No Silent Conversions:** Hard-coded currency conversions have been removed.
   - **Dated Benchmark Source:** Where USD secondary equivalents are provided, they are converted using the **Central Bank of Sri Lanka (CBSL) Daily Indicative Spot Exchange Rate** (`304.25 LKR / USD` as of 2026-11-12, published at `https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates`).
   - **Fallback Policy:** If the exchange rate is unavailable or disabled, the application displays **LKR only**, with no estimated USD values displayed.
