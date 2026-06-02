# 05 — Agency Team & Members

## Goal

Make it easier to build and manage an agency team. Freelancers should be discoverable by name (not just email), the Add Member form should be visually consistent with the rest of the agency design, and all button colors should match the design system.

---

## Frontend Tasks

- [x] Change the "Add Freelancer" flow to search by **name** instead of email address
- [x] Show search results as a list/dropdown when typing a freelancer name
- [x] Ensure the Add Member form uses the same design system as all other agency forms
- [x] Fix inconsistent blue buttons in the members section — align to the accent color system
- [x] Display member role/title clearly in the member list
- [x] Add confirmation step before removing a member

---

## Backend Tasks

- [x] Add freelancer search-by-name endpoint:
  - `GET /api/users/search?role=freelancer&name=...`
  - Returns id, display name, avatar, and specialty for matching freelancers
- [x] Ensure the search is case-insensitive and supports partial matches
- [x] Improve member lookup to return full profile data (not just IDs) in agency member list responses
