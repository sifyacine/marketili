# Task 02 — Posts (Briefs)

## What's Already Done
- Create, browse, filter (status, region, city, country, category, targetProvider, search)
- Post status: open, in_progress, closed, reactivated + status history
- Close (auto-rejects pitches), reactivate, update, delete (if no pitches)
- Send post directly to a specific provider
- Client dashboard: PostsDataGrid with actions, CreatePostModal
- Browse posts page in agency dashboard

---

## Goals
- Post model must support all fields from the spec: skills, marketingType, collaborationType, benefits/non-monetary compensation
- Posts can be public or directly targeted
- Browse page must have full filter UI (not just the hook)
- All lists ordered by closest deadline first
- Deadline urgency colors: grey / green / yellow / orange / red
- Client dashboard must have a working browse/discover page (not just "my posts")

---

## Backend Tasks

- [x] **Add missing fields to Post model**
  - File: `backend/models/Post.js`
  - Add: `requiredSkills: [String]`
  - Add: `marketingType: { type: String, enum: ["Events", "360 Marketing", "ATL", "BTL", "Production", "Brand Marketing"] }`
  - Add: `collaborationType: { type: String, enum: ["service", "partnership", "sponsorship", "exposure"] }`
  - Add: `compensationType: { type: String, enum: ["monetary", "benefits", "mixed"], default: "monetary" }`
  - Add: `benefits: { type: String, trim: true }` (free text if compensationType !== monetary)
  - Make `budget.min` and `budget.max` optional (not required when compensationType = benefits)

- [x] **Add server-side deadline sorting**
  - File: `backend/controllers/postController.js`
  - Default sort: `deadline: 1` (ascending = closest first) when no sort param provided

- [x] **Validate min <= max price**
  - File: `backend/controllers/postController.js` in `createPost` and `updatePost`
  - Return 400 if `budget.min` and `budget.max` both provided and `min > max`

---

## Frontend Tasks

- [x] **Add missing fields to CreatePostModal**
  - File: `frontend/src/components/posts/CreatePostModal.js`
  - Add: `Compétences requises` — tag-style multi-input or comma-separated
  - Add: `Type de marketing` — dropdown (Events, 360 Marketing, ATL, BTL, Production, Brand Marketing)
  - Add: `Type de collaboration` — radio (Service, Partenariat, Sponsoring, Exposition)
  - Add: `Type de compensation` — radio (Monétaire / Avantages / Mixte)
  - Show budget fields only when compensationType = monetary or mixed
  - Show `Avantages proposés` textarea when compensationType = benefits or mixed

- [x] **Build filter bar UI on browse posts page (client dashboard)**
  - File: `frontend/src/pages/dashboard/ClientDashboard.js` (or a new `ClientBrowse.js`)
  - Filters: status, region (wilaya dropdown), marketingType, collaborationType, targetProvider
  - Search input
  - Wire to `usePosts` hook's `applyFilters()`

- [x] **Add deadline urgency color utility**
  - File: `frontend/src/utils/deadlineColor.js` (new file)
  - Function: `getDeadlineColor(deadline)` returns a color string:
    - No deadline → grey
    - > 14 days → green
    - 7–14 days → yellow
    - 3–7 days → orange
    - < 3 days or past → red
  - Apply to post cards and post grid rows

- [x] **Add "Browse posts" section to client dashboard**
  - Client spec says: `my posts + create post` AND `browse posts (other clients posts or providers posts)`
  - Add a second nav item "Explorer" in ClientDashboard sidebar
  - Reuse the agency's BrowsePosts component or build a ClientBrowse component

- [x] **Sort post lists by closest deadline**
  - In all post lists (my posts, browse) sort by `deadline` ascending on the frontend
  - Completed/closed posts shown at bottom (or greyed out)
