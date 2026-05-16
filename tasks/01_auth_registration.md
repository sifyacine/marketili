# Task 01 — Authentication & Registration

## What's Already Done
- JWT in HTTP-only cookies (login / logout / /me)
- Role auto-detection login (searches all 7 models)
- Register: Client (person / company), Agency, Team, Freelancer
- Register: AgencyMember (created by director, force password change on first login)
- Middleware: protect, authorize, adminOnly, optionalAuth
- PrivateRoute by role on frontend
- Login page, Register page, Unauthorized page, ChangePasswordPage

---

## Goals
- Complete registration forms with all fields from the spec
- Agency registration must include specialty selection and filiale/parent logic
- Freelancer registration must include `num carte auto entrepreneur` field
- Registration UI must use dropdowns/selectors wherever possible (no free text for structured data)
- Frontend labels in French, internal code in English

---

## Backend Tasks

- ✅ **Add `carteAutoEntrepreneur` field to Freelancer model**
  - File: `backend/models/Freelancer.js`
  - Added: `carteAutoEntrepreneur: { type: String, trim: true }`

- ✅ **Add filiale/parent logic to Agency model**
  - File: `backend/models/Agency.js`
  - Added: `agencyType: { type: String, enum: ["main", "filiale"], default: "main" }`
  - Added: `parentAgency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", default: null }`
  - Added: `parentAgencyName: { type: String, trim: true }` — stores text name from registration form (admin links ObjectId later)

- ✅ **Add validation: min price must be <= max price on Post**
  - File: `backend/controllers/postController.js`
  - Added guard in `createPost`: rejects if `budget.min > budget.max`

- ✅ **Stricter backend validation on register**
  - File: `backend/controllers/authController.js`
  - Added `hasLetter()` helper — validates that name fields (firstName, lastName, agencyName, etc.) contain at least one letter
  - Regex: `/[a-zA-ZÀ-ÿ]/` (includes French accented characters)

---

## Frontend Tasks

- ✅ **Add agency specialties picker to Register form**
  - File: `frontend/src/pages/auth/Register.js`
  - Multi-select chip picker for: Events, 360 Marketing, ATL, BTL, Production, Brand Marketing, Digital, Influence & Réseaux sociaux, Relations presse, Brand Strategy
  - Selected count shown below chips
  - Sent as `specialties: []` array in payload

- ✅ **Add agency filiale toggle to Register form**
  - File: `frontend/src/pages/auth/Register.js`
  - Radio card group: `Agence principale` / `Filiale`
  - If filiale: shows `parentAgencyName` text input
  - Sends `agencyType` and `parentAgencyName` in payload

- ✅ **Add `Numéro carte auto-entrepreneur` field to Freelancer register form**
  - File: `frontend/src/pages/auth/Register.js`
  - Optional field shown for role = freelancer

- ✅ **Replace free-text fields with selectors wherever possible**
  - `industry` on Client company → dropdown (18 Algeria-relevant sectors)
  - `companySize` on Client company → dropdown with human-readable labels (TPE/PME/ETI/Grande/Très grande)
  - `region` on Client and Freelancer → Algerian wilayas dropdown (all 58 wilayas)
  - Region value is nested into `location.region` with `country: "Algérie"` before sending

## Additional UI Enhancements (beyond spec)

- ✅ **Password strength meter** — 4-segment color bar (Faible / Moyen / Fort / Très fort)
- ✅ **Show/hide password toggle** — "Afficher / Masquer" button inside password input
- ✅ **Password strength gate** — blocks submit if score < 2 (too weak)
- ✅ **Form subtitle per role** — shows "Compte agence", "Compte freelancer / influenceur", etc. in step 3 header
- ✅ **Field optional labeling** — optional fields clearly marked with `(optionnel)` hint
- ✅ **Emoji removed from role cards** — cleaner, more professional design
- ✅ **All 6 new CSS classes** added to `auth.css`: radio-group, radio-card, specialty-chips, specialty-chip, pw-input-wrap, pw-strength

---

## Commit

```
feat: complete task 01 — auth registration
```
