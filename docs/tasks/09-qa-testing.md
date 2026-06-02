# 09 — QA & End-to-End Testing

## Goal

Validate that every role-specific workflow works correctly, permissions are enforced at every layer, the UI is consistent and responsive, and critical flows (messaging, file access, deliverable submission, notifications) complete without errors. This phase gates the production release.

---

## Frontend QA

### UI Consistency
- [x] Audit every dashboard for button color consistency — no orphaned orange/blue/mismatched buttons
- [x] Verify all form inputs, labels, and error messages use the design system components
- [x] Check all modals, cards, and empty states follow the same visual language

### Responsive Testing
- [x] Test all dashboards at 1280px, 1024px, 768px, and 375px breakpoints
- [x] Verify sidebar collapse/mobile drawer works correctly on all pages
- [x] Ensure tables and data grids transform to card layout on small screens

### Permission Visibility
- [x] Log in as Client — confirm no task management UI is visible anywhere
- [x] Log in as Commercial — confirm no pitch creation or flagged post management is visible
- [x] Log in as Freelancer — confirm correct scope of features
- [x] Log in as Agency Director — confirm full agency management access
- [x] Log in as Admin — confirm moderation tools are present and working

### Dashboard Workflows
- [x] Client: create post (public) → receive pitches → accept pitch → view project progress → leave note
- [x] Client: create post (private, target specific provider) → verify provider receives it
- [x] Agency Director: browse clients list → view client profile → send message to client
- [x] Agency Director: flag post → send flagged post to Strategist
- [x] Commercial: browse posts → apply filters → flag a post to Director
- [x] Commercial: open assigned project → submit deliverable → mark as complete
- [x] Freelancer: browse posts → create pitch (one description step only)
- [x] All roles: open Messages page → start conversation → send and receive messages

### Specific Feature Tests
- [x] Messaging: send message, verify it appears in recipient's inbox without being inside a project
- [x] Notifications: trigger an event (pitch received, deliverable submitted) → verify notification appears
- [x] File access: upload a file → click the file link from the dashboard → confirm it opens without redirecting to login
- [x] Contract access: open a contract → confirm it loads without redirecting to login
- [x] Profile editing: change name, bio, region, avatar → verify changes persist after refresh
- [x] Browse Profiles: search by name and filter by region → verify results are correct

---

## Backend QA

### Permission Validation
- [x] Confirm clients cannot call task endpoints (expect 403)
- [x] Confirm Commercial cannot call pitch creation endpoints (expect 403)
- [x] Confirm Commercial cannot call flagged post management endpoints (expect 403)
- [x] Confirm only participants can read a conversation (expect 403 for outsiders)

### Authentication & Session
- [x] Verify JWT cookie is sent with file/GridFS requests
- [x] Verify contract document fetch works with a valid session
- [x] Verify session expiry redirects gracefully without breaking in-progress actions

### Data Integrity
- [x] Post visibility: private post is not returned in public listing for non-targeted providers
- [x] Post visibility: targeted provider does receive the private post
- [x] Localization: no `city` or `country` fields appear in any API response after migration
- [x] Pitch schema: no duplicated description fields in GET pitch response

### Deliverables & Progress
- [x] Submit a deliverable → verify it is stored with correct `projectId` and `submittedBy`
- [x] Mark deliverable complete → verify project `progress` field updates automatically
- [x] Director receives notification when deliverable is marked complete

### Messaging Security
- [x] User A cannot read User B's conversation if they are not a participant
- [x] Deleted messages are soft-deleted and not returned in GET responses

### Journal & Logging
- [x] Remove a post as Admin → verify a journal entry is created
- [x] Reactivate a post as Admin → verify a journal entry is created
- [x] GET admin journal → verify only admin action events are returned

### Notifications
- [x] Pitch received → client notification created
- [x] Pitch accepted → provider notification created
- [x] Deliverable submitted/completed → Director notification created
- [x] Commercial user → notification endpoint returns their notifications only

---

## End-to-End Workflow Scenarios

- [x] **Client workflow** — Register as client → create post → receive and accept pitch → track project → view deliverables → message provider
- [x] **Agency Director workflow** — Log in → view clients → flag a post → assign to Strategist → review project deliverables → message client
- [x] **Commercial workflow** — Log in → browse posts with filters → flag a post → open assigned project → submit deliverable → mark complete → check notifications
- [x] **Freelancer workflow** — Log in → browse posts → submit single-description pitch → manage projects → submit deliverables
- [x] **Admin workflow** — Log in → view statistics → remove a post → reactivate a post → view journal showing only those two actions
- [x] **Messaging flow** — Client starts conversation with Agency → both sides can send and receive → conversation is visible in Messages page of both dashboards
- [x] **Pitch flow** — Provider creates pitch with no duplicated steps → client receives it → client accepts → project auto-created
- [x] **Deliverable submission flow** — Commercial submits deliverable with file URL + description → marks it complete → Director sees updated progress → Director receives notification
- [x] **Post moderation flow** — Admin removes a post → post disappears from public listing → Admin reactivates → post reappears
- [x] **Notification flow** — Action triggers notification → recipient sees it in their notifications page → marking as read updates the unread count
