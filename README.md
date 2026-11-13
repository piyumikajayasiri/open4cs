# Open 4Cs — Gemstone Evaluation and Price Suggestion System

[![Quality Assurance Tests](https://img.shields.io/badge/Tests-42%20Passed-brightgreen)](TEST_RESULTS.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black)](package.json)
[![React](https://img.shields.io/badge/React-19.0-61dafb)](package.json)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green)](DATABASE_SCHEMA.md)
[![Academic Status](https://img.shields.io/badge/Status-Individual%20University%20Project-purple)](METHODOLOGY.md)

Open 4Cs is a web-based decision-support and wholesale price suggestion system designed for the colored gemstone trade in the Sri Lankan region. Calibrated specifically for loose faceted natural corundum (**Blue Sapphire**, **Padparadscha**, and **Ruby**), the platform provides an evidence-based, transparent alternative to opaque traditional trade valuation.

---

## 🌟 Core System Capabilities

1. **Deterministic 4C Scoring Engine (Production v4.2):**
   - Implements locked weights calibrated from gemmological literature: **Color 35%**, **Clarity 25%**, **Cut 20%**, and **Carat 20%**.
   - Transparent component subscoring without hidden multipliers or favorable bias for unanswered observations.
2. **Instant Live Scoring Feedback:**
   - Evaluates observations in real-time across the 7-step wizard (`LiveScoreSidebar.tsx`), showing factor points, deductions, and missing field alerts.
3. **Traceable Wholesale Market Benchmarking:**
   - Models regional B2B wholesale prices in Sri Lankan Rupees (LKR) with secondary USD equivalent via official Central Bank of Sri Lanka (CBSL) spot rates.
   - Enforces strict data sufficiency ($\ge 3$ active verified real market transactions). Pedagogical demo benchmarks are explicitly excluded from commercial valuations.
4. **Publication-Quality 2-Page Assessment Reports:**
   - Generates exact 2-page A4 PDF documents via `pdf-lib` featuring embedded specimen photography, 4C factor radar charts, market comparables, and decodable QR verification codes.
5. **Robust Security & Identity Governance:**
   - Role-Based Access Control (`USER` and `CAGS_ADMIN`), BCrypt password hashing with default Mongoose exclusion (`select: false`), SSRF protection against loopback/cloud metadata fetching, and immutable audit trails.

---

## 🏗️ System Architecture & Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Frontend:** React 19, Tailwind CSS v4, Lucide Icons
- **Language:** TypeScript 5 (Strict Mode)
- **Database:** MongoDB 7.0+ with Mongoose ODM
- **Document Engine:** `pdf-lib`, `qrcode`, `jsqr`, `pngjs`
- **Testing:** Node.js Native Test Runner (`tsx --test`), Puppeteer

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 20.x or 22.x LTS
- Local or cloud MongoDB instance (MongoDB 7.0+)

### 2. Installation & Environment
```bash
# Clone the repository and install dependencies
git clone https://github.com/open4cs/open4cs.git
cd open4cs
npm install

# Configure environment variables
cp .env.example .env.local
```

Ensure `.env.local` contains:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/gemstone_evaluation
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/gemstone_evaluation_test
SESSION_SECRET=your-secure-session-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Seeding & Administrator Provisioning
```bash
# Seed standard varieties and pedagogical reference benchmarks
npx tsx scripts/seed-varieties.mjs
npx tsx scripts/seed-references.mjs

# Initialize administrator account (admin@cags.lk)
node scripts/create-admin.mjs
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🧪 Comprehensive Verification & Testing

The system includes a 42-test automated suite covering scoring mathematics, currency conversions, role-based security, atomic creation, and PDF verification:

```bash
# Execute full automated test suite (42 passed)
npm test

# Static TypeScript typecheck (0 errors)
npx tsc --noEmit

# Static ESLint code audit (0 errors)
npm run lint

# Next.js production build (63 routes compiled)
npm run build

# Verify PDF embedded image and QR code extraction
npx tsx scripts/test-pdf-qr-extraction.ts

# Generate deliverable sample PDF reports
npx tsx scripts/generate-sample-pdfs.ts
```

---

## 📚 Academic & Technical Documentation Suite

| Document | Purpose & Description |
|:---|:---|
| [PROJECT_COMPLETION_MATRIX.md](PROJECT_COMPLETION_MATRIX.md) | Feature inventory, requirements traceability (38/38 verified), and defect resolutions |
| [METHODOLOGY.md](METHODOLOGY.md) | Gemmological 4C scoring formulas, factor weights, citations, and university modeling assumptions |
| [MARKET_DATA_PROVENANCE.md](MARKET_DATA_PROVENANCE.md) | Colombo wholesale market references, data classification, and eligibility rules |
| [LIMITATIONS.md](LIMITATIONS.md) | Transparent academic boundaries, unsupported varieties, and laboratory prerequisites |
| [TEST_PLAN.md](TEST_PLAN.md) | Formal QA strategy across engine, integration, browser, and security suites |
| [TEST_RESULTS.md](TEST_RESULTS.md) | Execution results and evidence for all 42 automated tests and Next.js production build |
| [SECURITY_REVIEW.md](SECURITY_REVIEW.md) | Security audit: password hashing, DTO sanitization, RBAC, session revocation, SSRF |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment, environment variables, Nginx configuration, and operations |
| [PROJECT_DEMONSTRATION_GUIDE.md](PROJECT_DEMONSTRATION_GUIDE.md) | Walkthrough of demonstration Scenarios A through G for university evaluators |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture diagram, hexagonal layer responsibilities, and data flows |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Mongoose collection schemas, compound indexes, and immutable snapshots |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | REST API endpoint specifications, payloads, responses, and status codes |
| [USER_GUIDE.md](USER_GUIDE.md) | End-user assessment manual, 7-step wizard walkthrough, and report exports |
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | CAGS administrator portal, user management, reference curation, and audit logging |
| [EXPERT_REVIEW_CASES.md](EXPERT_REVIEW_CASES.md) | Corundum evaluation test cases and benchmark comparison scenarios |
| [FINAL_VERIFICATION_AND_ACCEPTANCE_REPORT.md](FINAL_VERIFICATION_AND_ACCEPTANCE_REPORT.md) | Formal acceptance document certifying academic readiness |
| [SETUP.md](SETUP.md) | Developer onboarding, local environment setup, and script inventory |

---

## ⚖️ Academic Integrity & Disclaimer Notice

This software is developed as an **Individual University Computer Science Project**. All scoring weights, thresholds, and market multipliers represent **provisional university modeling assumptions**. Output scores and price ranges are intended solely for academic decision-support and do not constitute certified gemmological laboratory certificates, legal customs declarations, or financial appraisals.
