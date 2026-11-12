# System Limitations & Academic Integrity Disclosure

> **Open 4Cs Gemstone Evaluation & Price Suggestion System**  
> **Author:** Individual University Degree Candidate  
> **Rule Version:** Deterministic Core v4.2  
> **Academic Integrity Statement:**  
> This project represents an individual academic software engineering dissertation. In accordance with university ethics guidelines, all algorithmic models, test suites, and database persistence layers are truthfully reported without exaggerated completion statistics or misrepresentative claims of certified appraisal authority.

---

## 1. System Capabilities

1. **Deterministic 4C Quality Scoring:**  
   Computes reproducible component and composite scores (0–100) across 4 primary gemmological factors (35% Color, 25% Clarity, 20% Cut, 20% Carat) for supported corundum varieties.
2. **Instant Live Scoring Feedback:**  
   Displays component score updates, positive factor breakdowns, deductions, and missing field checklists on each step of the 7-step wizard via `LiveScoreSidebar.tsx` using the production engine.
3. **Wholesale Clearing Benchmark Pricing (Sri Lanka Region):**  
   Models indicative wholesale B2B clearing benchmark prices in Sri Lankan Rupees (LKR) with secondary USD equivalent via official Central Bank of Sri Lanka (CBSL) Indicative Spot Rates (`304.25 LKR / USD` as of 2026-11-12) using relative adjustment factors that eliminate double-counting. If FX data is omitted or unavailable, the system strictly falls back to LKR only.
4. **Strict Data Sufficiency & Demo Data Exclusion ($\ge 3$ Verified Real References):**  
   Requires a minimum of 3 active, verified, commercial completed-sale market references. Seed reference benchmarks are transparently classified as pedagogical demonstration records (`dataClassification: "Demo"`, `transactionContext: "Dealer Estimate"`); when commercial sales data is not populated, the engine outputs *"Market Price Suggestion: Unavailable"* while keeping the 4C quality evaluation engine 100% operational.
5. **Publication-Quality 2-Page Assessment Report Generation:**  
   Generates a formal 2-page PDF report incorporating physical measurements, reported characteristics, embedded user specimen photographs, 4C scores, market comparables, and digital verification signatures.
6. **Role-Based Access Control & Immutable Governance Trail:**  
   Protects administrative endpoints with `CAGS_ADMIN` server-side session checks, logs all mutations to MongoDB `AuditLog`, and isolates test runs in a dedicated test database (`gemstone_evaluation_test`).

---

## 2. Gemmological & Operational Limitations

1. **Spectroscopic Identification:**  
   The software cannot replace physical spectrometry (FTIR, UV-Vis-NIR, Raman spectroscopy, or LA-ICP-MS). It cannot independently verify whether a specimen has undergone high-temperature heat treatment, beryllium lattice diffusion, lead-glass fracture filling, or synthetic crystal growth (Verneuil / Flux).
2. **Microscopic Inclusion Verification:**  
   Smartphone photos and user observations cannot substitute for trained gemmologist microscopic examination under darkfield or polarized illumination.
3. **Legally Binding Financial Appraisals:**  
   Reports generated are educational valuation guides and do not constitute certified insurance appraisals, bank collateral certificates, or legal customs declarations.
4. **Wholesale vs. Retail Scope:**  
   The pricing algorithm models B2B dealer wholesale clearing benchmarks in Sri Lankan trading centers (Ratnapura, Beruwala, Colombo) and does not model high-street retail jewelry markup (which typically adds 100% to 300% for metalwork, designer brand equity, and retail overhead).
5. **No Official NGJA Price Tables:**  
   While the National Gem and Jewellery Authority of Sri Lanka (NGJA) regulates trade and export valuations (`https://ngja.gov.lk/`), it does not publish public wholesale clearing price index tables. Reference data represents research sample benchmarks collected from dealer markets for academic modeling.

---

## 3. Scope of Gemstone Variety Coverage

* **Actively Calibrated & Supported for Automated Evaluation:**
  * **Blue Sapphire** (*Natural Corundum*)
  * **Padparadscha** (*Natural Corundum*)
  * **Ruby** (*Natural Corundum*)
* **Varieties in Research & Development (Evaluation Blocked in UI & API):**
  * **Yellow Sapphire** (*Canary & Golden hue bands under calibration*)
  * **Pink Sapphire** (*Saturation boundary models under review*)
  * **White / Colourless Sapphire** (*Cut-weighted leucosapphire rules in development*)
  * **Star Sapphire** (*Phenomenal asterism 6-ray chatoyancy scoring under research*)

---

## 4. Areas Requiring Ongoing Professional Board Review

1. **Padparadscha Color Boundary Consensus:**  
   The exact color boundary separating pure fancy pink, pure orange, and true Padparadscha remains subject to international consensus between GIA, GRS, SSEF, and Gübelin.
2. **Thermal Treatment Modifiers:**  
   Wholesale clearing benchmarks vary with the type of heating (low-temperature traditional heating vs. high-temperature flux healing).
3. **Origin Premium Volatility:**  
   Ceylon corundum premiums vary depending on fine color saturation; exceptional unheated specimens command exponential auction premiums not captured by linear scaling.
