# Open 4Cs - Setup, Architecture & Evaluation Guide

Open 4Cs is an open-access gemstone evaluation and B2B price estimation platform designed for the Sri Lankan gem market, supporting students, dealers, and CAGS (Ceylon Academy of Gemmological Science) administrators.

> **CRITICAL TERMINOLOGY NOTICE:**  
> Open 4Cs produces an **Educational Gemstone Evaluation and Price Suggestion Report** (or Gemstone Evaluation Statement). It is **not** an accredited gemological laboratory certificate, authenticity certification, or guaranteed valuation.

---

## 1. System Requirements

- **Node.js**: v20.x or higher (Tested on Node v22.17.0)
- **Database**: MongoDB v6.0+ (Local instance `mongodb://127.0.0.1:27017/gemstone_evaluation` or MongoDB Atlas URI)
- **Package Manager**: npm v10+

---

## 2. Quickstart Installation

### Step 1: Clone or Extract Repository
```bash
git clone https://github.com/piyumikajayasiri/open4cs.git
cd open4cs
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the `.env.example` template to `.env.local`:
```bash
cp .env.example .env.local
```

Verify your `.env.local` contains:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/gemstone_evaluation
SESSION_SECRET=cags-open4cs-dev-session-key-32chars-min
NEXTAUTH_SECRET=cags-open4cs-dev-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Database Seeding

Populate the database with benchmark gemstone varieties, origins, treatments, reference stones for pricing, and an administrator account:

```bash
# Seed Varieties, Origins, Treatment Options, and Colombo Reference Gemstones
npm run seed

# Seed initial CAGS Administrator Account
npm run seed:admin
```

**Default Admin Credentials:**
- **Email:** `admin@open4cs.local`
- **Password:** `ChangeMe123!`
- **Role:** `CAGS_ADMIN`
- **Category:** `Professional`

---

## 4. Running Production Engine Tests

Run the test suite using `tsx --test` to directly execute unit tests against the **actual production evaluation engine** functions (`evaluateGemstone`, `evaluateColor`, `evaluateCut`, `evaluateClarity`, `evaluateCarat`, `evaluateTreatment`, `evaluateOrigin`, and `calculatePriceSuggestion`):

```bash
npm test
```

Expected output:
```
TAP version 13
# Subtest: 1. Production 4C weights sum precisely to 1.00 (100%)
ok 1 - 1. Production 4C weights sum precisely to 1.00 (100%)
# Subtest: 2. Production Color factor weights sum precisely to 1.00 (100%)
ok 2 - 2. Production Color factor weights sum precisely to 1.00 (100%)
# Subtest: 3. Production Clarity factor weights sum precisely to 1.00 (100%)
ok 3 - 3. Production Clarity factor weights sum precisely to 1.00 (100%)
# Subtest: 4. Production Cut factor weights sum precisely to 1.00 (100%)
ok 4 - 4. Production Cut factor weights sum precisely to 1.00 (100%)
# Subtest: 5. evaluateColor calculates score using production engine
ok 5 - 5. evaluateColor calculates score using production engine
# Subtest: 6. evaluateCut calculates score and ratios using production engine
ok 6 - 6. evaluateCut calculates score and ratios using production engine
# Subtest: 7. evaluateClarity handles eye-clean and 10x loupe observation using production engine
ok 7 - 7. evaluateClarity handles eye-clean and 10x loupe observation using production engine
# Subtest: 8. evaluateCarat calculates proportions and weight score using production engine
ok 8 - 8. evaluateCarat calculates proportions and weight score using production engine
# Subtest: 9. evaluateTreatment applies production adjustment factors
ok 9 - 9. evaluateTreatment applies production adjustment factors
# Subtest: 10. evaluateOrigin applies production origin multipliers
ok 10 - 10. evaluateOrigin applies production origin multipliers
# Subtest: 11. calculatePriceSuggestion applies treatment & origin factors with +/- 10% range
ok 11 - 11. calculatePriceSuggestion applies treatment & origin factors with +/- 10% range
# Subtest: 12. evaluateGemstone runs full end-to-end composite evaluation on production engine
ok 12 - 12. evaluateGemstone runs full end-to-end composite evaluation on production engine
# Subtest: 13. Engine supported varieties are strictly guarded
ok 13 - 13. Engine supported varieties are strictly guarded
1..13
# tests 13
# pass 13
# fail 0
```

---

## 5. Development & Production

```bash
# Start Next.js development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Navigate to [http://localhost:3000](http://localhost:3000).

---

## 6. Architecture & Folder Structure

```
open4cs/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication views (login, register)
│   │   ├── admin/                    # CAGS Admin Portal views
│   │   │   ├── dashboard/            # Metrics, pending reviews, rule proposals
│   │   │   ├── gemstones/            # Gemstone catalogue management
│   │   │   ├── evaluation-rules/     # 4C rules & scoring matrix
│   │   │   ├── pricing/              # Benchmark pricing bands
│   │   │   ├── reference-gemstones/  # Reference stone library & CSV import
│   │   │   ├── rule-versions/        # Rule governance & diff viewer
│   │   │   ├── audit/                # Audit trail
│   │   │   └── users/                # User administration
│   │   ├── api/                      # REST API Endpoints
│   │   │   ├── admin/                # Admin CRUD endpoints
│   │   │   ├── auth/                 # Session & registration
│   │   │   ├── evaluations/          # Evaluation submission & PDF report
│   │   │   └── reference-gemstones/  # Comparison lookup
│   │   ├── evaluate/                 # 8-step Gemstone Evaluation Wizard
│   │   ├── history/                  # Evaluation History
│   │   ├── compare/                  # Side-by-side gemstone comparator
│   │   ├── catalogue/                # Public gemstone catalogue
│   │   ├── learn/                    # 4Cs guide & masterclass topic explainer
│   │   └── settings/                 # User preferences & profile
│   ├── components/                   # UI components (Header, Sidebar, Modals, Forms)
│   ├── context/                      # State context (EvaluationDraftContext)
│   ├── lib/
│   │   ├── evaluation/               # Core 4C scoring mathematical engines
│   │   ├── report/                   # PDF generation engine (pdf-lib)
│   │   └── mongodb.ts                # MongoDB Mongoose connection caching
│   └── models/                       # Mongoose database schemas
├── scripts/                          # Seeding & admin initialization scripts
├── tests/                            # Real production engine unit tests
├── .env.example                      # Documented environment template
└── package.json                      # Scripts & dependencies
```

---

## 7. CAGS Validation & Pricing Rule Status

1. **Rule Versioning**: Scoring rules are tagged with version `prototype-v1`.
2. **Prototype Baseline**:
   - Color tone, saturation, and zoning multipliers are calibrated prototype baselines derived from Colombo gem trade references and gemological literature.
   - Price bands (e.g. heated discount -10%, Ceylon origin multiplier 1.0, unheated premium +18%) provide realistic market estimation for testing.
   - **Board Sign-Off**: The `/admin/rule-versions` and `/admin/dashboard` interfaces allow CAGS (Ceylon Academy of Gemmological Science) reviewers and board members to examine proposals and ratify updates into official versions before live deployment.
