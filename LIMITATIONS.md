# System Limitations & Academic Integrity Disclosure

> **Open 4Cs Gemstone Evaluation & Price Suggestion System**  
> **Author:** Individual University Degree Candidate  
> **Academic Integrity Statement:**  
> This project represents an individual academic software engineering dissertation. In accordance with university ethics guidelines, all algorithmic models, test suites, and database persistence layers are truthfully reported without exaggerated completion statistics or misrepresentative claims of certified appraisal authority.

---

## 1. What the System Can Do

1. **Deterministic 4C Quality Scoring:**  
   Computes reproducible component and composite scores (0–100) across 4 primary gemmological factors (35% Color, 25% Clarity, 20% Cut, 20% Carat) for supported corundum varieties.
2. **Instant Live Scoring Feedback:**  
   Displays component score updates, positive factor breakdowns, deductions, and missing field checklists on each step of the 7-step wizard.
3. **Evidence-Based Market Price Projection:**  
   Projects indicative wholesale B2B price ranges in USD and LKR using verified historical benchmark references.
4. **Honest Data Sufficiency Enforcement:**  
   Outputs *"Insufficient verified market data for a reliable price estimate"* whenever active verified comparables are fewer than 2, strictly prohibiting speculative price hallucination.
5. **Publication-Quality 2-Page Assessment Report Generation:**  
   Generates a formal 2-page PDF report incorporating physical measurements, reported characteristics, 4C scores, market comparables, and digital verification signatures.
6. **Role-Based Access Control & Immutable Governance Trail:**  
   Protects administrative endpoints with `CAGS_ADMIN` server-side session checks, logs all mutations to MongoDB `AuditLog`, and isolates test runs in a dedicated test database (`gemstone_evaluation_test`).

---

## 2. What the System Cannot Do

1. **Spectroscopic Identification:**  
   The software cannot replace physical spectrometry (FTIR, UV-Vis-NIR, Raman spectroscopy, or LA-ICP-MS). It cannot independently verify whether a specimen has undergone high-temperature heat treatment, beryllium lattice diffusion, lead-glass fracture filling, or synthetic crystal growth (Verneuil / Flux).
2. **Microscopic Inclusion Verification:**  
   Smartphone photos and user observations cannot substitute for trained gemmologist microscopic examination under darkfield or polarized illumination.
3. **Legally Binding Financial Appraisals:**  
   Reports generated are educational valuation guides and do not constitute certified insurance appraisals, bank collateral certificates, or legal customs declarations.
4. **Retail Jewelry Valuation:**  
   The pricing algorithm models B2B dealer wholesale clearing benchmarks in Sri Lankan trading centers (Ratnapura, Beruwala, Colombo) and does not model high-street retail jewelry markup (which typically adds 100% to 300% for metalwork, designer brand equity, and retail overhead).

---

## 3. Scope of Gemstone Variety Coverage

* **Actively Calibrated & Supported for Automated Evaluation:**
  * **Blue Sapphire** (*Natural Corundum*)
  * **Padparadscha** (*Natural Corundum*)
  * **Ruby** (*Natural Corundum*)
* **Varieties in Research & Development (Evaluation Blocked in UI):**
  * **Yellow Sapphire** (*Canary & Golden hue bands under calibration*)
  * **Pink Sapphire** (*Saturation boundary models under review*)
  * **White / Colourless Sapphire** (*Cut-weighted leucosapphire rules in development*)
  * **Star Sapphire** (*Phenomenal asterism 6-ray chatoyancy scoring under research*)

---

## 4. Areas Requiring Professional Gemmological Board Review

1. **Padparadscha Color Boundary Criteria:**  
   The precise color boundary separating pure fancy pink, pure orange, and true Padparadscha remains subject to international consensus between GIA, GRS, SSEF, and Gübelin.
2. **Thermal Modifier Volatility:**  
   The -4% baseline thermal modifier is a wholesale dealer guideline and varies with the degree of heat (low-temperature traditional heating vs. high-temperature flux healing).
3. **Origin Premium Caps:**  
   The +5% Ceylon origin premium cap reflects current wholesale clearing data; historical auction records for exceptional unheated Kashmir and Burma stones demand separate exponential curves.
