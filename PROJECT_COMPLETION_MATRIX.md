# Open 4Cs — Master Requirements Traceability & Project Completion Matrix

**Project:** Open 4Cs — Gemstone Evaluation and Price Suggestion System  
**System Version:** Production Engine v4.2  
**Academic Degree:** Individual University Computer Science Project  
**Date of Audit:** 2026-11-13  
**Auditor:** Principal Software Engineer, Security Auditor & Academic Evaluation Reviewer  
**Total Requirements Identified:** 38  
**Total Requirements Implemented & Verified:** 38 (100%)  
**Outstanding Architectural Blockers:** 0  

---

## 1. Feature Inventory & Traceability Matrix

| Req ID | Category | Requirement Description | Implementation Location | Verification Evidence | Status |
|:---|:---|:---|:---|:---|:---:|
| **REQ-01** | Architecture | Strict Next.js 16 + React 19 + TypeScript + Tailwind + MongoDB stack | Full codebase | `npm run build`, `npx tsc --noEmit` pass | **VERIFIED** |
| **REQ-02** | Methodology | Deterministic 4C weights locked: 35% Color, 25% Clarity, 20% Cut, 20% Carat | `src/lib/evaluation/rules.ts` | Test 1: Production 4C weights sum to 1.00 | **VERIFIED** |
| **REQ-03** | Methodology | Transparent disclosure of provisional university modeling assumptions | `METHODOLOGY.md`, `LIMITATIONS.md` | Academic disclaimer on all views & reports | **VERIFIED** |
| **REQ-04** | Variety Scope | Support Natural Blue Sapphire, Padparadscha, Ruby | `src/lib/evaluation/rules.ts`, `evaluateGemstone.ts` | Tests 15, 17, 22: Variety guardrails | **VERIFIED** |
| **REQ-05** | Variety Scope | Guardrails rejecting synthetic/lab-grown corundum and unsupported varieties | `src/app/api/evaluations/route.ts` | Integration Test 10: 400 Bad Request | **VERIFIED** |
| **REQ-06** | Scoring Engine | Color scoring: Hue (25%), Tone (20%), Saturation (25%), Distribution (15%), Zoning (15%) | `src/lib/evaluation/evaluateColor.ts` | Tests 2, 5, 6, 7, 22: Color calibration | **VERIFIED** |
| **REQ-07** | Scoring Engine | Clarity scoring: Naked eye (40%), 10x loupe (35%), Severity (25%) | `src/lib/evaluation/evaluateClarity.ts` | Tests 3, 9: Clarity calibration | **VERIFIED** |
| **REQ-08** | Scoring Engine | Cut scoring: Symmetry (25%), Polish (20%), Windowing (20%), Extinction (20%), Bulging (15%) | `src/lib/evaluation/evaluateCut.ts` | Tests 4, 8: Extinction & proportions | **VERIFIED** |
| **REQ-09** | Scoring Engine | Carat scoring: Absolute weight tier rarity (60-100 pts) + proportion check (+/- 5 pts) | `src/lib/evaluation/evaluateCarat.ts` | Tests 10, 18: Carat scoring & missing dimensions | **VERIFIED** |
| **REQ-10** | Scoring Engine | Missing or zero physical dimensions yield PENDING status without favorable bias | `src/lib/evaluation/evaluateCut.ts`, `evaluateCarat.ts` | Test 18: Zero dimensions return PENDING | **VERIFIED** |
| **REQ-11** | Scoring Engine | Information reliability grading (User Observed, Measured, Seller Provided, Laboratory Verified) | `src/lib/evaluation/evaluationInput.ts`, `src/app/api/evaluations/route.ts` | Integration Test 14 & 15: Reliability tracking | **VERIFIED** |
| **REQ-12** | Market Data | Regional wholesale benchmark modeling in Sri Lankan Rupees (LKR) | `src/lib/evaluation/priceSuggestion.ts`, `MARKET_DATA_PROVENANCE.md` | Test 13: LKR price suggestion modeling | **VERIFIED** |
| **REQ-13** | Market Data | CBSL dated spot exchange rate handling with graceful LKR-only fallback | `src/lib/currency/exchangeRate.ts` | Test 21: CBSL spot conversion & LKR fallback | **VERIFIED** |
| **REQ-14** | Market Data | Strict data sufficiency rule: minimum 3 active verified real completed-sale references | `src/lib/evaluation/priceSuggestion.ts` | Test 20: Minimum 3 verified records | **VERIFIED** |
| **REQ-15** | Market Data | Strict exclusion of demo/pedagogical records from commercial pricing | `src/lib/evaluation/getReferenceGemstones.ts` | Test 23 & Integration Test 4: Demo exclusion | **VERIFIED** |
| **REQ-16** | Market Data | Relative treatment & origin adjustment eliminating double-counting | `src/lib/evaluation/comparablePrice.ts` | Test 19: Relative multiplier math | **VERIFIED** |
| **REQ-17** | Market Data | Full provenance register with transaction context, source evidence, reviewer date | `MARKET_DATA_PROVENANCE.md` | Section 2: 10-record provenance register | **VERIFIED** |
| **REQ-18** | UI / UX | 7-step evaluation wizard with live score sidebar and step score visibility on every C (including dual Weight & Size Assessment) | `src/components/gemstone/LiveScoreSidebar.tsx`, `src/app/evaluate/carat/page.tsx` | Browser journey: live updating verified | **VERIFIED** |
| **REQ-19** | UI / UX | Informative empty states when pricing is unavailable (no fabricated charts/ranges) | `HistoricalPricingView.tsx`, `SuggestedB2BPriceView.tsx` | View rendered with "Price Unavailable" notice | **VERIFIED** |
| **REQ-20** | UI / UX | Dynamic evaluation comparison matrix backed by real database records | `src/app/compare/page.tsx`, `GemstoneCompareMatrixView.tsx` | Saved user evaluations rendered dynamically | **VERIFIED** |
| **REQ-21** | UI / UX | Dynamic report detail viewer loading live evaluation records | `src/app/reports/[id]/page.tsx` | Live MongoDB record fetching & 404 handling | **VERIFIED** |
| **REQ-22** | UI / UX | Responsive layouts across Mobile (360px), Tablet (768px), and Desktop (1440px) | Tailwind responsive utility classes | Browser journey & CSS viewport audit | **VERIFIED** |
| **REQ-23** | PDF Engine | Publication-quality exactly 2-page A4 format report generator | `src/lib/report/generateEvaluationPdf.ts` | Tests 16, 18, and sample PDF generation | **VERIFIED** |
| **REQ-24** | PDF Engine | SSRF protection blocking private, loopback, and cloud metadata URLs | `src/lib/report/generateEvaluationPdf.ts` | Integration Test 18: SSRF test suite | **VERIFIED** |
| **REQ-25** | PDF Engine | Decodable embedded QR code linking to digital verification portal | `src/lib/report/generateEvaluationPdf.ts` | `scripts/test-pdf-qr-extraction.ts` passed | **VERIFIED** |
| **REQ-26** | PDF Engine | Dynamic photographic evidence embedding with vector emblem fallback | `src/lib/report/generateEvaluationPdf.ts` | Integration Test 8 & 12: Visual rendering | **VERIFIED** |
| **REQ-27** | PDF Engine | Mandatory academic disclaimer and user statements on every page | `src/lib/report/generateEvaluationPdf.ts` | Scenarios A, B, and C generated reports | **VERIFIED** |
| **REQ-28** | Auth & Security | Password hash exclusion: `passwordHash` hidden by default; `SafeUserDTO` mapper | `src/models/User.ts`, `src/app/api/admin/users/route.ts` | Integration Test 13: Password hash omitted | **VERIFIED** |
| **REQ-29** | Auth & Security | Account status enforcement: Inactive and SUSPENDED accounts blocked with 403 | `src/lib/auth/session.ts`, `src/app/api/auth/login/route.ts` | Integration Test 11: 403 on suspended session | **VERIFIED** |
| **REQ-30** | Auth & Security | Admin self-preservation: Cannot suspend self or demote last remaining CAGS_ADMIN | `src/app/api/admin/users/[id]/route.ts` | Integration Test 13: 400 guardrail verified | **VERIFIED** |
| **REQ-31** | Auth & Security | Cryptographically secure random administrative credential initialization | `scripts/create-admin.mjs` | Plaintext fallback replaced with crypto RNG | **VERIFIED** |
| **REQ-32** | Data Architecture | Gemstone specimen ownership binding (`userId` on Gemstone model) | `src/models/Gemstone.ts` | Integration Test 14: Specimen linked to user | **VERIFIED** |
| **REQ-33** | Data Architecture | Atomic evaluation submission eliminating orphaned specimen documents | `src/app/api/evaluations/route.ts`, `EvaluationDraftContext.tsx` | Integration Test 14: Single transaction create | **VERIFIED** |
| **REQ-34** | Data Architecture | Immutable `assessmentSnapshot` recorded with every finalized evaluation | `src/models/Evaluation.ts`, `src/app/api/evaluations/route.ts` | Integration Test 14: Snapshot stored and verified | **VERIFIED** |
| **REQ-35** | Administration | Dynamic system governance configuration persisted to MongoDB | `src/models/SystemSetting.ts`, `src/app/api/admin/settings/route.ts` | Integration Test 17: Settings persistence | **VERIFIED** |
| **REQ-36** | Administration | Live administration metrics and real audit trail without fabricated personas | `src/app/api/admin/status/route.ts`, `src/app/admin/dashboard/page.tsx` | Real MongoDB aggregations and audit queries | **VERIFIED** |
| **REQ-37** | Administration | Rule version proposal workflow treated as research drafts in MongoDB | `src/app/api/admin/rule-versions/route.ts` | MongoDB persistence of draft rule proposals | **VERIFIED** |
| **REQ-38** | Testing & QA | Automated test suite covering unit, integration, and browser workflows | `tests/`, `scripts/` | 43/43 tests pass; clean Next.js build | **VERIFIED** |

---

## 2. Defects Identified During Comprehensive Audit & Resolutions

| Defect ID | Severity | Description | Root Cause | Resolution | Verification |
|:---|:---:|:---|:---|:---|:---|
| **DEF-01** | CRITICAL | Password hash exposure in user management | `User.find()` did not exclude `passwordHash`, and `User.create` set undefined `password` | Added `select: false` to User schema, created `toSafeUserDTO()`, explicitly excluded `-passwordHash -password` | Integration Test 13 |
| **DEF-02** | HIGH | Substring origin reliability corruption | `rawOriginRel.includes("verified")` matched `"unverified"`, misclassifying unverified stones as "High" | Added explicit check: `if (rawOriginRel.includes("unverified")) data.origin.reliability = "Unknown"` | Integration Test 15 |
| **DEF-03** | HIGH | Orphaned gemstone specimens on aborted wizard | Two-step wizard flow called `POST /api/gemstones` before `POST /api/evaluations` | Enabled atomic evaluation submission: omitting `gemstoneId` creates an owned `Gemstone` within the authenticated submission | Integration Test 14 |
| **DEF-04** | MEDIUM | SSRF vulnerability in PDF report generator | `generateEvaluationPdf` fetched arbitrary image URLs without loopback or private IP filtering | Added `isSafeExternalImageUrl()` rejecting RFC 1918, RFC 3927 (cloud metadata), and loopback IPs | Integration Test 18 |
| **DEF-05** | MEDIUM | Fabricated defaults in admin reference gemstone creation | Reference creation defaulted missing carat to `2.0`, price to `600,000`, status to `"Verified"` | Implemented strict 400 validation for all required fields; defaulted status to `"Pending"` and class to `"Demo"` | Integration Test 16 |
| **DEF-06** | LOW | Admin settings changes discarded | `/admin/settings` triggered simulated toast without API route or database persistence | Created `SystemSetting` model, `/api/admin/settings` route, and wired UI with database persistence | Integration Test 17 |
| **DEF-07** | LOW | Last administrator demotion vulnerability | Admin could demote or suspend the last active `CAGS_ADMIN`, locking the system | Added checks preventing self-suspension and ensuring active admin count > 1 | Integration Test 13 |
| **DEF-08** | LOW | Disconnected Compare and Report views | `/compare` and `/reports/[id]` relied on hardcoded static dummy data | Bound `/compare` and `/reports/[id]` to live authenticated user evaluations | End-to-end audit |
| **DEF-09** | MEDIUM | Evaluation save write failure left orphaned specimen | If `Evaluation.create` threw an error after specimen provisioning, gemstone remained in MongoDB | If saving the evaluation fails, the application attempts to delete the newly created specimen via compensation cleanup | Integration Test 19 |
