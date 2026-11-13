# Open 4Cs Academic Demonstration & User Journey Walkthrough

**Document Version:** 2.0.0  
**Purpose:** Evaluator & University Project Supervisor Demonstration Script  
**Coverage:** Scenarios A through G illustrating core capabilities, guardrails, and transparency  

---

## Scenario Overview

| Scenario | Objective | Variety | Key Gemmological Factors | Market Data Status | Expected System Output |
|:---:|:---|:---|:---|:---:|:---|
| **A** | Prime Ceylon Blue Sapphire with Market Evidence | Blue Sapphire | 2.45 ct, Royal Blue, Eye-Clean, Oval, Untreated, Sri Lanka | Available ($\ge 3$ verified records) | Composite Score: **94.94/100**, Price Suggestion: **LKR 2,090,610 – 2,555,190**, Full 2-page PDF with embedded photo & QR |
| **B** | Rare Padparadscha with Insufficient Market Evidence | Padparadscha | 1.95 ct, Pinkish Orange, Eye-Clean, Untreated, Sri Lanka | Unavailable ($<3$ verified commercial records) | Composite Score: **91.46/100**, Price: *"Market Price Suggestion: Unavailable"*, No fabricated price or charts |
| **C** | Unverified Ruby Specimen with Missing Photo | Ruby | 1.50 ct, Pigeon Blood Red, Clean, Unknown Treatment & Origin | Unavailable (Unverified provenance) | Composite Score: **91.84/100**, Vector emblem fallback, Advisory: *"Request treatment assessment from laboratory"* |
| **D** | Unsupported Variety Guardrail | Star Sapphire / Yellow Sapphire | Asterism / Canary yellow hue | Blocked | User informed automated scoring is restricted to Blue Sapphire, Padparadscha, and Ruby |
| **E** | Direct API Security & Access Boundary | Blue Sapphire | User A accessing User B's evaluation | N/A | Server responds with `404 Not Found` / `403 Forbidden` |
| **F** | Administrative Governance & Live Metrics | Platform Config | CAGS Admin inspecting live system status | N/A | `/admin/dashboard` displays real MongoDB counts, live AuditLog trail, and research rule proposals |
| **G** | PDF Embedded QR Code Traceability | Any Report | Scanning QR code on printed or rendered PDF | N/A | Direct resolution to live evaluation record (`http://localhost:3000/evaluations/[id]`) |

---

## Detailed Step-by-Step Demonstration Walkthrough

### 1. Step-by-Step Walkthrough: Scenario A (High-Grade Ceylon Blue Sapphire)
1. **Navigate to Evaluate Wizard:** Click **"Start New Assessment"** or navigate to `/evaluate/gemstone`.
2. **Step 1 — Gemstone Selection:** Choose **Blue Sapphire** (*Natural Corundum*).
3. **Step 2 — Color Assessment:**
   - Primary Hue: `Royal Blue`
   - Tone: `6` (Medium Deep)
   - Saturation: `Vivid` (Grade 6)
   - Distribution: `Even`
   - Observe live color subscore in the right-hand sidebar updating instantly to `94.0`.
4. **Step 3 — Clarity Assessment:**
   - Naked-eye inspection: `Eye-clean`
   - 10× Loupe Magnification: `Very Slight` inclusions (Silk needles off-table)
   - Observe clarity subscore updating to `93.5`.
5. **Step 4 — Cut & Proportions:**
   - Shape: `Oval`
   - Dimensions: `8.2 mm` length, `6.8 mm` width, `4.9 mm` depth
   - Symmetry: `Very Good`, Polish: `Excellent`, Windowing: `None`, Extinction: `None`
   - Observe cut subscore updating to `94.0`.
6. **Step 5 — Carat Weight:**
   - Carat: `2.45 ct`
   - Proportions: Consistent with expected ellipsoid volume.
   - Carat subscore: `97.5`.
7. **Step 6 — Origin & Treatment:**
   - Treatment: `Untreated` (Laboratory Certified)
   - Origin: `Sri Lanka` (Laboratory Verified)
8. **Step 7 — Review & Submit:**
   - Click **"Finalize Assessment"**.
   - Notice that the evaluation and specimen are atomically saved to MongoDB.
9. **Dashboard & Report Generation:**
   - Composite Score: **94.94 / 100** (Grade: Commercial Gem).
   - Market Range: `LKR 2.09M – 2.55M` (USD ~$6.8K–$8.4K via CBSL rate).
   - Click **"Download Official PDF Report"**: An exact 2-page A4 PDF renders with user photo, scores, benchmark comparison, and embedded QR code.

---

### 2. Step-by-Step Walkthrough: Scenario B (Data Sufficiency & Absence of Speculation)
1. Enter a high-grade **Padparadscha** (1.95 ct, Pinkish Orange, Untreated).
2. Complete all 4C steps.
3. Upon finalizing:
   - 4C Quality Engine computes a score of **91.46 / 100**.
   - Pricing section displays: **"Market Price Suggestion: Unavailable — Insufficient verified commercial market data"**.
   - Notice that historical charts and speculative bars are cleanly suppressed.
   - Downloaded PDF report prominently indicates: *"Pricing unavailable: At least 3 verified completed-sale commercial transaction records are required"*.

---

### 3. Step-by-Step Walkthrough: Scenario C (Missing Photo & Unverified Provenance)
1. Enter a **Ruby** (1.50 ct, Pigeon Blood Red) with no photograph URL, unverified treatment, and unverified origin.
2. Complete wizard and finalize.
3. Observe:
   - 4C Quality Engine calculates score of **91.84 / 100**.
   - PDF renders with elegant vector gemstone emblem instead of a broken image box.
   - Advisory section provides defensible recommendations:
     - *"Treatment status unverified: Request treatment assessment from a qualified gemmological laboratory."*
     - *"Origin unverified: Geographical provenance should not be declared without laboratory spectroscopic confirmation."*

---

### 4. Step-by-Step Walkthrough: Scenario F (Administrative Governance)
1. Log in as an administrator (`role: "CAGS_ADMIN"`).
2. Open `/admin/dashboard`.
3. View real MongoDB aggregation cards:
   - Verified Reference Gemstones
   - Active Corundum Varieties
   - Registered System Users
   - Recorded Audit Log Events
4. Inspect the **Live Audit Trail** showing all recent administrative operations with user timestamps.
5. Navigate to `/admin/settings` and update the base organization details: changes persist directly to the database.
