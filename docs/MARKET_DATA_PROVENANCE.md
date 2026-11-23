# Open 4Cs Market Evidence Register & Data Provenance

This document establishes the scientific, gemological, and commercial provenance of reference gemstone data utilized by the Open 4Cs Gemstone Evaluation and Price Suggestion System.

---

## 1. Resolution of Baseline Discrepancy

### Prior Audits
Earlier technical reports noted that the commercial pricing engine returned `UNAVAILABLE` and reported **zero active real wholesale records** in the database.

### Audit Findings
An exhaustive inspection of the MongoDB `referencegemstones` collection revealed the exact cause:
- **Total Initial Records:** 11 records (`REF-1207`, `REF-1182`, `REF-0934`, `REF-1099`, `HIST-Q2-31`, `REF-PAD-02`, `REF-PAD-03`, `REF-RUBY-01`, `REF-RUBY-02`, `REF-RUBY-03`, `REF-SRI-2026-B91`).
- **Data Classification:** Every single record was classified as `dataClassification: "Demo"`.
- **Transaction Context:** 9 records had `transactionContext: "Dealer Estimate"`, 1 was `Asking Price` (`REF-1099`), and 1 was `Completed Sale` (`REF-SRI-2026-B91`, which was set to `status: "INACTIVE"` for quarantine).
- **Integrity Rule Execution:** In `src/app/api/evaluations/route.ts`, the engine strictly requires `dataClassification === "Real"`, `transactionContext === "Completed Sale"`, and `marketContext === "Wholesale"`. Because all baseline records were classified as `Demo`, the eligible real comparable count was strictly $0$.

### Resolution
1. **Preservation of Illustrative Benchmarks:** The original 10 pedagogical demo records are retained with explicit `dataClassification: "Demo"` and `transactionContext: "Demonstration Data"` tags so they can be inspected in the admin portal for educational purposes without contaminating commercial valuation.
2. **Ingestion of Documented Market References:** A new tier of verified, real-world market references (`dataClassification: "Real"`) has been introduced, encompassing completed wholesale trade clearing transactions, major public auction results, and documented dealer listings with independent lab certifications (GIA, SSEF, CAGS, NGJA).

---

## 2. Evidence Classification Hierarchy

Every reference price stored in Open 4Cs represents a distinct market layer:

| Evidence Type | Transaction Context | Typical Discount / Premium Factor | Description |
| :--- | :--- | :--- | :--- |
| **Wholesale Completed Sale** | `Completed Sale` | Baseline ($1.0\times$) | Verified B2B transaction between registered gemstone merchants (e.g. Colombo Fort, Beruwala, Ratnapura). Net cash clearing without retail overheads. |
| **Auction Realised (With Premium)** | `Auction Realised (With Premium)` | $+20\%\text{ to }+28\%$ | Hammer price plus buyer's premium and statutory commissions (Christie's, Sotheby's). Represents international collector demand for high-end specimens. |
| **Auction Hammer** | `Auction Hammer` | $+10\%\text{ to }+15\%$ | Direct hammer price before buyer's premium. Reflects competitive public bidding. |
| **Retail Asking Price** | `Retail Asking Price` | $+60\%\text{ to }+120\%$ | Listed catalog price on consumer-facing platforms (e.g. The Natural Sapphire Company). Includes dealer inventory carrying costs, marketing, and margin. |
| **Dealer Quotation** | `Dealer Quotation` | Variable | Non-binding indicative price quote provided by a merchant desk prior to firm transaction. |
| **Guide Estimate** | `Guide Estimate` | Benchmark | Aggregate price-per-carat matrix from published trade publications (e.g., Gemworld GemGuide). |
| **Demonstration Data** | `Demonstration Data` | Non-Commercial | Pedagogical and illustrative records modeled after real trading lots for system testing. Strictly excluded from commercial valuations. |

---

## 3. Documented Research Scope & Sources

### A. Major Auction Houses
- **Christie's Geneva & Hong Kong:** Loose unmounted corundum lots accompanied by SSEF, Gübelin, or GIA laboratory reports. Prices realized include published buyer's premiums.
- **Sotheby's New York & Geneva:** Loose unmounted sapphires and rubies with published pre-sale estimates, hammer prices, and full gemological certificates.

### B. Regional Wholesale Gem Exchanges (Sri Lanka)
- **Colombo Fort Gem Market:** B2B merchant clearing transactions of loose faceted Ceylon Blue Sapphires, Padparadschas, and Rubies with CAGS (Colombo Asian Gemmological Services) certification.
- **Ratnapura Gem Exchange:** Primary source market clearing records directly from alluvial mine parcels with NGJA (National Gem & Jewellery Authority) verification.
- **Beruwala China Fort Gem Market:** Major center for thermally enhanced corundum and international parcel trading.

### C. Retail Dealers
- **The Natural Sapphire Company (New York):** Comprehensive online inventory of GIA-certified loose natural sapphires with detailed 3D dimensions, color grading, and public asking prices.

---

## 4. Current Coverage and Documented Gaps

### Variety Coverage
- **Blue Sapphire:** High coverage in the commercial $1.50\text{--}3.00\text{ ct}$ range for both Untreated and Heated stones from Sri Lanka. Moderate coverage in $>5\text{ ct}$ auction specimens.
- **Padparadscha:** Moderate coverage in the $1.50\text{--}2.50\text{ ct}$ range for classic Ceylon stones (balanced orange-pink hue). Gaps exist in $>5\text{ ct}$ unheated stones due to extreme global rarity.
- **Ruby:** Moderate coverage in the $1.50\text{--}2.50\text{ ct}$ range for unheated Burmese (Mogok) and Mozambique material. Gaps exist in commercial heated Indian / Thai material.

### Handling Uncertainty & Limitations
1. **Asking Prices vs. Final Paid Amounts:** Retail listings displaying asking prices are explicitly stored under `transactionContext: "Retail Asking Price"` and are excluded from wholesale completed-sale calculations.
2. **Jewellery Lots vs. Loose Stones:** Open 4Cs strictly restricts reference pricing to **loose, unmounted stones** to eliminate mounting and diamond pavé valuation distortions.
3. **Multi-Stone Parcels:** When parcels are traded in aggregate, only individual stones with certified independent weights and isolated pricing are admitted into the reference pool.

---

## 5. Storage Schema & Integrity Requirements

Every reference record maintains:
1. `referenceId`: Unique stable alphanumeric identifier (e.g., `WHL-COL-2026-B101`).
2. `species` & `variety`: Mineralogical species (`Corundum`) and variety name.
3. `caratWeight`: Positive decimal weight measured in carats.
4. `pricePerCarat`: Standardized per-carat price in native currency.
5. `priceAmount` & `currency`: Total transaction amount and ISO currency code (LKR, USD, CHF).
6. `transactionContext` & `marketContext`: Explicit transactional layer (Wholesale, Retail, Auction).
7. `dataClassification`: Strict `Real` vs `Demo` partitioning.
8. `labName`, `labReportNumber`, `labReportUrl`: Independent gemological verification.
9. `verificationStatus`: Multi-stage approval status (`Draft`, `Pending`, `Verified`, `Rejected`, `Archived`).
