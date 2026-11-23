# Open 4Cs Security Hardening & Penetration Defense Review

**Document Version:** 2.0.0  
**Effective Date:** 2026-11-13  
**Auditor:** Principal Security Engineer & Academic Software Systems Reviewer  
**Scope:** Authentication, Authorization (RBAC), Session Handling, Injection Defenses, Data Protection, SSRF Prevention  

---

## 1. Authentication & Identity Protection

### 1.1 Password Hashing & Schema Protection
- **BCrypt Implementation:** All user passwords are salted and hashed using `bcryptjs` with standard work factor ($10$ rounds).
- **Default Exclusion from Mongoose:** In `src/models/User.ts`, the `passwordHash` field is defined with `select: false`. Standard database queries (`User.find()`, `User.findById()`) will never inadvertently load the password hash into memory or serialize it to JSON.
- **Explicit Password Stripping & DTO Mapping:**
  ```typescript
  export function toSafeUserDTO(user: Partial<IUser> & { _id?: unknown; id?: unknown }): SafeUserDTO {
    return {
      id: String(user._id || user.id || ""),
      name: user.name || "",
      email: user.email || "",
      category: user.category || "General Enthusiast",
      role: (user.role as "USER" | "CAGS_ADMIN") || "USER",
      status: (user.status as "ACTIVE" | "SUSPENDED") || "ACTIVE",
      isActive: user.isActive !== false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  ```
- **Cryptographic Admin Initialization:** The `scripts/create-admin.mjs` setup script accepts environment overrides (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and uses `crypto.randomBytes(16)` as a secure fallback. Hardcoded default passwords have been eradicated.

---

## 2. Authorization & Role-Based Access Control (RBAC)

### 2.1 Dual-Level Administrative Route Guardrails
1. **Cryptographic JWT Signature Verification:** Session tokens (`session` HTTP-only cookie) are signed with HMAC-SHA256 using `SESSION_SECRET`.
2. **Real-Time Database Account State Verification:**
   Before executing administrative actions or evaluation submissions, routes query MongoDB for the calling user's live status:
   ```typescript
   const activeUser = await User.findById(session.userId).select("status isActive role");
   if (!activeUser || activeUser.isActive === false || activeUser.status === "SUSPENDED") {
     return NextResponse.json({ error: "Account is inactive or suspended." }, { status: 403 });
   }
   ```
   If a user is suspended by an administrator, active JWT tokens are immediately neutralized across all endpoints without waiting for cookie expiration.

### 2.2 Administrative Self-Preservation & Anti-Lockout Controls
- In `src/app/api/admin/users/[id]/route.ts`:
  - **Self-Suspension Guard:** Administrators cannot suspend their own active account (`admin.id === id`).
  - **Last Admin Demotion Guard:** The system dynamically counts active administrators. Demoting or suspending the last remaining `CAGS_ADMIN` is strictly rejected with status 400.

---

## 3. Server-Side Request Forgery (SSRF) Defense

### 3.1 PDF Image Embedding Security
The PDF generation engine accepts user-supplied photograph URLs to display the physical gemstone specimen. To prevent SSRF attacks against internal network infrastructure or cloud provider metadata services (e.g. AWS `169.254.169.254`), `src/lib/report/generateEvaluationPdf.ts` implements strict pre-fetch validation:

```typescript
export function isSafeExternalImageUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const hostname = parsed.hostname.toLowerCase();

    // Disallow private/internal loopback addresses and cloud metadata endpoints
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "0.0.0.0" ||
      hostname === "169.254.169.254" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("172.17.") ||
      hostname.startsWith("172.18.") ||
      hostname.startsWith("172.19.") ||
      hostname.startsWith("172.2") ||
      hostname.startsWith("172.30.") ||
      hostname.startsWith("172.31.") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".local")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
```

Additional safeguards:
- **AbortController Timeout:** External fetches time out strictly after 3000 ms.
- **Size Capping:** Image payloads exceeding 5 MB are rejected.
- **Graceful Vector Fallback:** Unsafe or unreachable URLs trigger an automatic fallback to the built-in SVG/vector gemstone emblem without throwing runtime errors or disrupting report generation.

---

## 4. Data Ownership & Tenant Isolation

- **Gemstone Ownership:** Every gemstone specimen created in `Gemstone` includes a mandatory `userId` reference with a compound index `{ userId: 1, createdAt: -1 }`.
- **Private Evaluation Access:** `GET /api/evaluations/[id]` enforces that the requesting session matches `evaluation.userId`. Cross-account evaluation probing returns `404 Not Found` (or `403 Forbidden`) unless the requester is an active `CAGS_ADMIN`.
- **Atomic Creation:** `POST /api/evaluations` allows specimens to be created atomically in the same authenticated request as the evaluation, guaranteeing that orphaned gemstone documents cannot be created by abandoned wizard steps.

---

## 5. Audit Logging & Governance Trail

All critical administrative actions are immutably written to the `AuditLog` collection:
- `USER_STATUS_CHANGED`: Logs administrator, target user, and status/role changes.
- `SETTINGS_UPDATED`: Logs modifications to system governance rules.
- `RULE_PROPOSAL_CREATED`: Logs new experimental algorithm drafts.
- `REFERENCE_GEMSTONE_CREATED`: Logs newly introduced reference records.
