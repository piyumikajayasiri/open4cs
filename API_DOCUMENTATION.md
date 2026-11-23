# Open 4Cs REST API Documentation

**Base URL:** `http://localhost:3000`  
**Authentication:** HTTP-only Signed Session Cookie (`session`) or Bearer JWT Header  
**Data Format:** JSON (`application/json`)  

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account.
- **Body:** `{ name, email, password, category }`
- **Response 201:** `{ success: true, user: SafeUserDTO }`
- **Response 400:** `{ error: string }`

### `POST /api/auth/login`
Authenticates a user and sets the HTTP-only session cookie.
- **Body:** `{ email, password }`
- **Response 200:** `{ success: true, user: SafeUserDTO, token: string }`
- **Response 401:** `{ error: "Invalid credentials." }`
- **Response 403:** `{ error: "Account is inactive or suspended." }`

### `POST /api/auth/logout`
Clears the session cookie.
- **Response 200:** `{ success: true, message: "Logged out successfully." }`

### `GET /api/auth/me`
Retrieves profile for currently authenticated session.
- **Response 200:** `{ success: true, user: SafeUserDTO }`
- **Response 401:** `{ error: "Not authenticated" }`

---

## 2. Evaluation Endpoints

### `POST /api/evaluations`
Performs composite 4C evaluation, calculates wholesale pricing, creates specimen atomically (if `gemstoneId` omitted), and records an immutable assessment snapshot.
- **Auth:** Active user session required.
- **Body:**
  ```json
  {
    "gemstoneId": "optional_object_id",
    "variety": "Blue Sapphire",
    "caratWeight": 2.45,
    "color": {
      "hue": "Royal Blue",
      "tone": "6",
      "saturation": "Vivid",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Eye-clean",
      "loupe10x": "Very Slight",
      "severity": "Minor"
    },
    "cut": {
      "length": 8.2,
      "width": 6.8,
      "depth": 4.9,
      "symmetry": "Very Good",
      "polish": "Excellent",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": { "status": "Untreated" },
    "origin": { "value": "Sri Lanka", "reliability": "Laboratory Verified" },
    "informationReliability": {
      "measurements": "Measured",
      "treatment": "Laboratory Verified",
      "origin": "Laboratory Verified"
    },
    "photoUrl": "https://example.com/gemstone.jpg"
  }
  ```
- **Response 200:**
  ```json
  {
    "success": true,
    "evaluationId": "6732f...",
    "status": "COMPLETED",
    "ruleVersion": "v4.2-deterministic",
    "compositeScore": 94.94,
    "priceSuggestion": {
      "available": true,
      "priceRangeLkr": { "minimum": 2090610, "maximum": 2555190 },
      "exchangeRate": { "rate": 304.25, "source": "Central Bank of Sri Lanka (CBSL)" }
    }
  }
  ```
- **Response 400:** Validation failure (e.g. unsupported variety, missing parameters).

### `GET /api/evaluations`
Lists evaluations owned by the authenticated user.
- **Response 200:** `{ evaluations: EvaluationRecord[] }`

### `GET /api/evaluations/[id]`
Retrieves full evaluation details, including immutable assessment snapshot.
- **Auth:** Owner or `CAGS_ADMIN` access required.
- **Response 200:** `{ evaluation: EvaluationRecord }`
- **Response 404:** Evaluation not found or access denied.

### `GET /api/evaluations/[id]/report`
Streams generated 2-page publication-quality A4 PDF with embedded photograph and readable QR code.
- **Response 200:** `Content-Type: application/pdf`

---

## 3. Administration Endpoints (`CAGS_ADMIN` Only)

### `GET /api/admin/status`
Returns real platform metrics, active varieties, pending reference count, and recent audit logs.
- **Response 200:** `{ success: true, metrics: {...}, recentAuditLogs: [...] }`

### `GET /api/admin/users`
Lists all system users using `SafeUserDTO` projections (`passwordHash` excluded).
- **Response 200:** `{ success: true, users: SafeUserDTO[] }`

### `PATCH /api/admin/users/[id]`
Updates user status (`ACTIVE`, `SUSPENDED`) or role (`USER`, `CAGS_ADMIN`).
- **Guards:** Prevents self-suspension and preventing demoting the last active `CAGS_ADMIN`.
- **Response 200:** `{ success: true, user: SafeUserDTO }`
- **Response 400:** `{ success: false, message: string }`

### `POST /api/admin/reference-gemstones`
Creates a new market reference record with strict validation (eliminating fabricated defaults).
- **Response 201:** `{ success: true, reference: ReferenceRecord }`
- **Response 400:** `{ success: false, message: "Carat weight is required..." }`

### `GET /api/admin/settings` & `POST /api/admin/settings`
Retrieves and updates system governance settings in MongoDB with audit logging.
- **Response 200:** `{ success: true, settings: SystemSettingRecord }`
