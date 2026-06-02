# 07 — Pitch System Improvements

## Goal

Simplify and clean up pitch creation so that providers fill in each piece of information exactly once. Remove the duplicated description step that currently appears twice in the pitch form, and apply the same fix to the Freelancer flow. Also fix visual inconsistencies in the Freelancer pitch/profile area.

---

## Frontend Tasks

- [x] Identify and remove the duplicated description step in the Agency pitch creation flow
- [x] Keep only one description step in the pitch form (step 1 or whichever is canonical)
- [x] Apply the same deduplication fix to the Freelancer pitch creation flow
- [x] Fix Freelancer profile/pitch button colors — currently orange/inconsistent, should use the design system accent
- [x] Review the full pitch form flow end-to-end and confirm no other fields are duplicated

---

## Backend Tasks

- [x] Review the Pitch schema for any duplicated description/summary fields
- [x] Remove or merge duplicated fields from the schema and update validation accordingly
- [x] Update pitch creation and update endpoints to reflect the simplified field structure
- [x] Ensure existing pitch records are not broken by the schema change (add migration if needed)
