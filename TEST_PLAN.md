# Open 4Cs Quality Assurance & Comprehensive Test Plan

**Document Version:** 2.0.0  
**Effective Date:** 2026-11-13  
**System:** Open 4Cs — Gemstone Evaluation and Price Suggestion System  
**Frameworks:** Node.js Native Test Runner (`node:test`, `node:assert/strict`), TypeScript (`tsx`), Puppeteer, jsQR, pdf-lib  

---

## 1. Test Strategy & Scope

The Open 4Cs testing framework is structured into five distinct verification levels:

1. **Deterministic Quality Scoring Engine Tests (`tests/evaluation-engine.test.ts`):**  
   Verifies mathematical correctness of weights, factor scoring (Color, Clarity, Cut, Carat), variety guardrails, composite calculation, missing parameter handling, and dated currency conversion.
2. **Integration & API Security Tests (`tests/integration-workflows.test.ts`):**  
   Verifies role-based access control, session validation, user account suspension, catalogue persistence, atomic specimen submission, immutable snapshot recording, SSRF protection, reference eligibility filtering, and report generation across Scenarios A, B, and C.
3. **PDF Generation & Embedded QR Verification (`scripts/test-pdf-qr-extraction.ts`):**  
   Extracts embedded raster image streams directly from generated PDF reports, decodes embedded QR codes using `jsQR`, and validates target verification URLs.
4. **End-to-End Headless Browser Journey (`scripts/real-browser-journey.ts`):**  
   Simulates a complete real user workflow in Chromium: login, variety selection, step-by-step 4C wizard completion, evaluation submission, dashboard review, and report download.
5. **Static Code Quality & Build Verification:**  
   Strict TypeScript typechecking (`tsc --noEmit`), ESLint compliance (`npm run lint`), and Next.js production build (`npm run build`).

---

## 2. Test Environment & Database Isolation

To prevent pollution of development or production databases:
- All automated tests run against an isolated MongoDB instance configured via `MONGODB_TEST_URI` or appending `_test` to `MONGODB_URI` (`mongodb://127.0.0.1:27017/gemstone_evaluation_test`).
- Test fixtures clean up transient test records (`t.after()`) upon completion.
- Session secrets default to secure ephemeral keys if unconfigured during testing.

---

## 3. Test Cases Inventory

### Suite 1: Evaluation Engine Tests (`tests/evaluation-engine.test.ts`)
| Test ID | Objective | Expected Outcome |
|:---|:---|:---|
| ENG-01 | Production 4C weights sum precisely to 1.00 | Sum of Color (0.35), Clarity (0.25), Cut (0.20), Carat (0.20) equals 1.00 |
| ENG-02 | Production Color factor weights sum to 1.00 | Hue (0.25) + Tone (0.20) + Saturation (0.25) + Distribution (0.15) + Zoning (0.15) = 1.00 |
| ENG-03 | Production Clarity factor weights sum to 1.00 | Naked Eye (0.40) + 10x Loupe (0.35) + Severity (0.25) = 1.00 |
| ENG-04 | Production Cut factor weights sum to 1.00 | Symmetry (0.25) + Polish (0.20) + Windowing (0.20) + Extinction (0.20) + Bulging (0.15) = 1.00 |
| ENG-05 | Royal Blue, Tone 6, Vivid Saturation scoring | Top tier score computed with high color index |
| ENG-06 | Cornflower Blue and all numeric tones (1-9) | Tone-specific deductions and optimal medium-deep tone scoring |
| ENG-07 | All saturation scales (Greyish to Vivid) | Monotonically increasing score with higher saturation purity |
| ENG-08 | Cut evaluation: Minimal extinction | Positive light return rewarded without extinction penalty |
| ENG-09 | Clarity evaluation: Eye-clean and 10x loupe | Type II corundum standard scoring verified |
| ENG-10 | Carat proportion and weight score | Absolute rarity scoring (60-100 pts) + proportion check (+/- 5 pts) |
| ENG-11 | Treatment adjustment factors | Untreated (1.00), Heated (0.90), Unknown (0.85) applied accurately |
| ENG-12 | Origin multipliers | Sri Lanka (1.15), Myanmar (1.25), Madagascar (1.00) applied accurately |
| ENG-13 | Price suggestion range (+/- 10%) | Price range bounded within +/- 10% of benchmark calculation |
| ENG-14 | End-to-end composite evaluation with UI inputs | Composite score matches exact weighted sum formula |
| ENG-15 | Supported varieties strictly guarded | Blue Sapphire, Padparadscha, Ruby accepted; others rejected |
| ENG-16 | Two-page PDF generator strictly enforces 2 pages | Output PDF has pageCount === 2 and contains mandatory disclaimer |
| ENG-17 | Color scoring for Padparadscha and Ruby | Distinct variety hue scales correctly scored |
| ENG-18 | Zero dimensions return PENDING | Cut and Carat status set to PENDING when dimensions missing |
| ENG-19 | Relative pricing eliminates double-counting | Candidate / Reference multiplier correctly isolates marginal delta |
| ENG-20 | Data sufficiency: minimum 3 verified references | Less than 3 verified references returns UNAVAILABLE |
| ENG-21 | Dated CBSL exchange rate conversion | Converts USD via official spot rate; falls back to LKR only |
| ENG-22 | Cross-variety hue rejection | Rejects invalid hues (e.g., Green in Blue Sapphire) |
| ENG-23 | Currency normalization and demo data rejection | USD prices normalized; demo records excluded from pricing |

### Suite 2: Integration & Security Workflows (`tests/integration-workflows.test.ts`)
| Test ID | Objective | Expected Outcome |
|:---|:---|:---|
| INT-01 | Role authorization | Normal user receives 401 on admin endpoint; CAGS_ADMIN permitted |
| INT-02 | Catalogue persistence | Variety modifications persist across sessions to MongoDB |
| INT-03 | Suspension enforcement | Suspended variety rejects new evaluation submissions |
| INT-04 | Reference eligibility filtering | Pending records strictly excluded from pricing engine |
| INT-05 | Reference verification workflow | Verified records become eligible for similarity comparison |
| INT-06 | End-to-end evaluation & PDF | Inputs, 4C scores, prices, and PDF output agree within rounding |
| INT-07 | Session invalidation | Logged-out or unauthenticated requests rejected with 401 |
| INT-08 | Specimen photo persistence | Photo URL stored in models and embedded in PDF report |
| INT-09 | Privacy & ownership boundary | User A cannot access User B's evaluation; CAGS_ADMIN permitted |
| INT-10 | Synthetic variety rejection | Direct API submission rejects synthetic and unsupported varieties |
| INT-11 | User account suspension | Suspended user receives 403 on protected routes even with valid JWT |
| INT-12 | PDF scenario reports | Generates Scenarios A, B, and C with full data integrity |
| INT-13 | Password hash exclusion & RBAC | `passwordHash` omitted from user APIs; self-suspension blocked |
| INT-14 | Atomic specimen submission | Omitting `gemstoneId` atomically provisions specimen and snapshot |
| INT-15 | Origin reliability normalization | "unverified" normalizes to "Unknown" and never "High" |
| INT-16 | Admin reference validation | Missing fields return 400 Bad Request without fabricated defaults |
| INT-17 | System settings persistence | Settings update persists to MongoDB and records an AuditLog |
| INT-18 | SSRF protection in PDF generator | Blocks loopback, RFC 1918, and cloud metadata URLs |
