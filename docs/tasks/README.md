# Marketili — Project Finalization Tasks

## Project Goal

Complete the Marketili platform end-to-end so that every user role (Client, Agency Director, Commercial, Freelancer, Admin) can operate independently with correct permissions, consistent UI, and reliable data flow. The platform should be stable enough for a production release.

---

## Completion Checklist by Area

| Area | File | Status |
|------|------|--------|
| General Platform Improvements | [01-general-improvements.md](./01-general-improvements.md) | 🟡 In progress |
| Messaging System Refactor | [02-messaging-system.md](./02-messaging-system.md) | 🟢 Done |
| Client Dashboard | [03-client-dashboard.md](./03-client-dashboard.md) | 🟢 Done |
| Agency Director Dashboard | [04-agency-director.md](./04-agency-director.md) | 🟢 Done |
| Agency Team & Members | [05-agency-members.md](./05-agency-members.md) | 🟢 Done |
| Commercial Dashboard | [06-commercial-dashboard.md](./06-commercial-dashboard.md) | 🟢 Done |
| Pitch System | [07-pitch-system.md](./07-pitch-system.md) | 🟢 Done |
| Admin Dashboard | [08-admin-dashboard.md](./08-admin-dashboard.md) | 🟢 Done |
| QA & End-to-End Testing | [09-qa-testing.md](./09-qa-testing.md) | 🟢 Done |

**Status legend:** 🔴 Not started · 🟡 In progress · 🟢 Done

---

## High-Level Release Goals

1. **Role isolation** — Every role sees only what it is allowed to see. No client sees internal tasks. No commercial accesses pitch management.
2. **Messaging decoupled from projects** — Direct messages between platform participants exist independently of any project entity.
3. **Consistent UI** — One design system across all dashboards. No orphaned blue buttons, no duplicated form steps, no inconsistent layouts.
4. **Reliable file & contract access** — No redirects to login when opening uploaded files or contracts.
5. **Algeria-only localization** — Region only; city and country fields removed.
6. **Commercial role fully operational** — Browse, filter, flag, submit deliverables, track progress, notifications, notes, profile.
7. **Admin can moderate fully** — Reactivate posts, view audit log of admin actions only.
8. **All dashboards pass QA** — Responsive, permission-safe, workflow-complete.
