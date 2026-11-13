# Open 4Cs Production Deployment & Operations Guide

**System:** Open 4Cs — Gemstone Evaluation and Price Suggestion System  
**Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, MongoDB 7.0+  
**Operating Environment:** Node.js 20+ LTS / Windows Server or Linux (Ubuntu 22.04+)  

---

## 1. Environment Configuration

Create or update `.env.local` (or configure your hosting provider's secrets manager) with the following mandatory environment variables:

```bash
# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/gemstone_evaluation
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/gemstone_evaluation_test

# Authentication & Session Security
# Generate via: openssl rand -base64 32
SESSION_SECRET=e4f9b2d8c7a109845ef209841ad09845e2a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5
NEXTAUTH_SECRET=e4f9b2d8c7a109845ef209841ad09845e2a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5

# Public Application URL (Used for decodable QR codes embedded in PDF reports)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional Initial Admin Provisioning (Used by scripts/create-admin.mjs)
ADMIN_EMAIL=admin@cags.lk
ADMIN_PASSWORD=SuperSecureAdminPassword2026!
```

---

## 2. Installation & Database Initialization

### Step 1: Install Production Dependencies
```bash
npm install
```

### Step 2: Seed Non-Destructive Initial Catalogues & Benchmarks
```bash
# Seeds gemstone varieties (Blue Sapphire, Padparadscha, Ruby)
npx tsx scripts/seed-varieties.mjs

# Seeds pedagogical reference records (marked as Demo data)
npx tsx scripts/seed-references.mjs
```

### Step 3: Initialize Root Administrator Account
```bash
node scripts/create-admin.mjs
```
*Note: If `ADMIN_PASSWORD` is omitted from the environment, the script will generate a secure random password and display it once in the terminal.*

---

## 3. Production Build & Execution

### Step 1: Build the Optimized Next.js Bundle
```bash
npm run build
```
*Verify that the build exits cleanly with code 0 and all 63 routes are generated without errors.*

### Step 2: Start the Production Server
```bash
npm start
```
By default, the server listens on port `3000`. To bind to another port or interface:
```bash
PORT=8080 npm start
```

---

## 4. Quality Verification Run

Before opening the instance to users or evaluators, run the complete verification suite:

```bash
# 1. Automated Unit & Integration Tests (42 tests)
npm test

# 2. TypeScript Static Typecheck
npx tsc --noEmit

# 3. Static ESLint Audit
npm run lint

# 4. Embedded PDF QR Code Extraction & Verification
npx tsx scripts/test-pdf-qr-extraction.ts

# 5. Generate Standard Scenario PDFs (A, B, C)
npx tsx scripts/generate-sample-pdfs.ts
```

---

## 5. Reverse Proxy Configuration (Nginx Example)

```nginx
server {
    listen 80;
    server_name open4cs.cags.lk;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
