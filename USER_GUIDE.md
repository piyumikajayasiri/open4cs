# Open 4Cs End-User Guide & Evaluation Manual

**Audience:** Gemmology Students, Appraisers, Gem Traders, and Lapidary Specialists  
**Scope:** Account Registration, 7-Step Evaluation Journey, Dynamic Comparisons, and Official PDF Reports  

---

## 1. Getting Started

1. **Accessing the Portal:** Open `http://localhost:3000` in any modern web browser.
2. **Registration & Login:**
   - Click **"Sign Up"** (`/register`) to create an account. Choose your professional category (*Gemologist*, *Student*, *Trader*, or *Enthusiast*).
   - Enter your email and password. Upon logging in, you will be redirected to your personal dashboard.

---

## 2. Navigating the 7-Step Gemstone Assessment Wizard

Click **"Start Assessment"** to begin evaluating a loose faceted corundum specimen.

### Step 1: Gemstone Selection
- Select from supported natural corundum varieties: **Blue Sapphire**, **Padparadscha**, or **Ruby**.
- *Note: Synthetic gems or unsupported varieties (e.g. Star Sapphire) are clearly marked and blocked from automated scoring.*

### Step 2: Color Evaluation (35% Weight)
- Select the **Primary Hue** (e.g. *Royal Blue*, *Cornflower Blue*, *Pigeon Blood Red*).
- Select **Tone** (1 to 9 scale) and **Saturation** (1 Greyish to 6 Vivid).
- Declare **Distribution** (*Even* vs *Uneven*) and **Color Zoning** (*None* vs *Pronounced*).
- *Observe:* The right-hand sidebar updates your **Live Color Score** and provides instant feedback on tone and saturation quality.

### Step 3: Clarity Evaluation (25% Weight)
- Examine under normal daylight for **Naked-Eye Visibility** (*Clean*, *Eye-clean*, *Slightly Included*, *Prominent*).
- Inspect under 10× binocular loupe magnification for inclusions (*Very Slight*, *Minor Silk*, *Feathers*, *Cavities*).
- Specify the inclusion severity (*Minor*, *Moderate*, *Significant*).

### Step 4: Cut & Lapidary Proportions (20% Weight)
- Enter caliper measurements in millimeters: **Length**, **Width**, and **Depth**.
- Select lapidary finish attributes: **Symmetry**, **Polish**, **Windowing**, **Extinction**, and **Bulging**.
- *Note: Missing dimensions return a PENDING status; full numeric inputs are required for an evidence-based cut score.*

### Step 5: Carat Weight (20% Weight)
- Enter the measured weight from an electronic carat balance (e.g. `2.45 ct`).
- The system evaluates weight tier rarity (e.g., crossing the 1.00 ct, 2.00 ct, or 5.00 ct market rarity thresholds) and verifies proportional size.

### Step 6: Treatment & Origin Provenance
- Indicate thermal treatment status (*Untreated*, *Heated*, *Unknown*).
- Declare geographical origin (*Sri Lanka / Ceylon*, *Myanmar / Burma*, *Madagascar*, *Other*).
- Assign an **Information Reliability Level** (*Measured*, *User Observed*, *Seller Provided*, *Laboratory Verified*).

### Step 7: Review & Final Submission
- Review all entered factors and live composite quality score.
- Click **"Finalize Assessment"**. Your evaluation, specimen record, and immutable snapshot are atomically persisted to your account.

---

## 3. Reviewing Results, Comparisons & PDF Reports

- **Results Dashboard:** Displays composite quality score (0–100), commercial grade badge, factor radar chart, and indicative wholesale market range in LKR (with CBSL USD equivalent).
- **Evaluating Market Evidence:** When fewer than 3 verified commercial market transactions exist for the variety/grade, the price range is cleanly labeled as *"Unavailable"* to prevent misleading speculative estimates.
- **Compare Matrix (`/compare`):** Select multiple saved evaluations to view a side-by-side comparison of 4C scores, carat weights, and treatments.
- **Official 2-Page PDF Report:** Click **"Download PDF"** to obtain an official A4 document featuring embedded specimen photography, 4C breakdown, and a readable QR verification code.
