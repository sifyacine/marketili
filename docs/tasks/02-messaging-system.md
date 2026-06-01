# 02 — Messaging System Refactor

## Goal

Extract direct messaging out of project entities and give it a first-class home in every dashboard. Users should be able to message each other directly (Client ↔ Agency, Client ↔ Freelancer, Client ↔ Service Provider) without being inside a project. Project notes remain inside projects and are not the same thing as messages.

---

## Frontend Tasks

- [x] Create a dedicated **Messages** page/section in the Client dashboard
- [x] Create a dedicated **Messages** page/section in the Agency dashboard
- [x] Create a dedicated **Messages** page/section in the Freelancer dashboard
- [x] Create a dedicated **Messages** page/section in the Team dashboard
- [x] Create a dedicated **Messages** page/section in the Commercial dashboard
- [x] Messages page must support conversations between:
  - Client ↔ Agency
  - Client ↔ Freelancer
  - Client ↔ Service Provider (Commercial/Team)
- [x] Remove message thread UI from inside project views — keep only project notes there
- [x] Messages UI shows conversation list + thread view (inbox-style layout)
- [x] Add "Send Message" action on provider profile pages to start a new conversation

---

## Backend Tasks

- [x] Refactored `Conversation` schema to support project-independent direct messages
  - `isDirect: Boolean` flag
  - `users: [ObjectId]` — participant user IDs for query lookup
  - `participantInfo` — denormalized name/role snapshot for display
  - `lastMessageAt` + `lastMessagePreview` for inbox listing
  - `project` field made optional (no longer required/unique)
- [x] `GET /api/chat/conversations` — list direct conversations for the current user
- [x] `POST /api/chat/conversations/direct` — start or find direct conversation between two users
- [x] `GET /api/chat/:conversationId/messages` — get messages (existing, unchanged)
- [x] `POST /api/chat/:conversationId/messages` — send message (now also enforces participant check for direct conversations)
- [x] `PATCH /api/chat/:conversationId/read` — mark read (existing, unchanged)
- [x] `DELETE /api/chat/:conversationId/messages/:messageId` — soft-delete (sender only, `isDeleted` flag)
- [x] `getUnreadCount` now includes both direct conversations and legacy project conversations
- [x] Participant-only access enforced on `sendMessage` for direct conversations
- [x] Full participant-only guard on `getMessages` — verifies user is in `users[]` for direct convs, or matches project parties for project convs
