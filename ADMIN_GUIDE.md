# Open 4Cs Administrative & System Governance Guide

**Target Audience:** CAGS System Administrators (`CAGS_ADMIN` role)  
**Access Portal:** `/admin/dashboard`  
**Security Level:** Authenticated Administrative Privilege  

---

## 1. Overview of Administrative Controls

The Open 4Cs Administrative Portal provides real-time governance, reference market data curation, user lifecycle management, and transparent audit logging.

```
┌────────────────────────────────────────────────────────┐
│               CAGS Administration Portal               │
├─────────────────┬────────────────────┬─────────────────┤
│ System Metrics  │ Reference Database │ User Management │
│ Active Varieties│ Market Provenance  │ RBAC & Status   │
├─────────────────┴────────────────────┴─────────────────┤
│         System Settings & Audit Log Governance          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Platform Dashboard (`/admin/dashboard`)

The dashboard displays live metrics aggregated directly from MongoDB:
- **Verified Reference Gemstones:** Total active benchmarks eligible for similarity comparison.
- **Pending Review Benchmarks:** Reference submissions awaiting gemmological verification.
- **Active Varieties:** Supported corundum varieties.
- **System Users:** Total registered accounts.
- **Live Audit Trail:** Chronological record of administrative operations (logins, status changes, settings updates).

---

## 3. User Management & Access Control (`/admin/users`)

Administrators can inspect all registered user accounts:
- **Safe Projections:** User password hashes are never transmitted to the browser.
- **Status Toggles:** An account can be set to `ACTIVE` or `SUSPENDED`.
  - Suspending an account immediately revokes API access on protected endpoints.
- **Role Assignment:** Users can be promoted to `CAGS_ADMIN` or demoted to `USER`.
- **Anti-Lockout Safeguards:**
  - An administrator cannot suspend their own active account.
  - The system will block any action that would suspend or demote the last remaining active administrator.

---

## 4. Reference Gemstone Curation (`/admin/reference-gemstones`)

Maintaining high data integrity in wholesale price suggestions requires rigorous reference benchmark curation:
1. **Adding a New Reference:**
   - Click **"Add Reference Gemstone"**.
   - Enter Reference ID (e.g. `REF-2026-COL-01`), variety, carat weight, millimeter dimensions, and reference transaction price in LKR.
   - Enter source evidence notes (e.g. *"Colombo Fort dealer parcel lot clearing record #482"*).
   - Enter microscopic treatment and origin evidence.
2. **Elimination of Fabricated Defaults:**
   - Every physical characteristic and price must be explicitly entered. The system rejects incomplete submissions with `400 Bad Request`.
3. **Verification Workflow:**
   - Newly added references default to `Pending` status and `Demo` classification.
   - Once independently audited by an accredited gemmologist, the record can be promoted to `Verified` and `Real`.

---

## 5. System Governance & Settings (`/admin/settings`)

Administrators can configure global system metadata:
- **Organization Title:** e.g. *Ceylon Academy of Gemmological Science (CAGS)*.
- **Contact Email:** System administrative notification address.
- **Base Currency:** Primary regional pricing currency (defaults to *LKR — Sri Lankan Rupee*).
- **Rule Governance:** Displays the active deterministic scoring rule version (`v4.2`).
- **Audit Logging:** Every setting update generates an immutable `SETTINGS_UPDATED` entry in the `AuditLog` collection.
