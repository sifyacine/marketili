// backend/models/Notification.js

const mongoose = require("mongoose");

/**
 * NOTIFICATION MODEL
 *
 * A notification is created whenever a meaningful event happens
 * that a user needs to know about. Examples:
 *   - A provider sends a pitch on a client's post
 *   - A client accepts / rejects a pitch
 *   - A project milestone is reached
 *   - A new message arrives (Phase 8)
 *
 * recipient     — the user who receives this notification
 * recipientRole — their role, used to query efficiently by role
 * recipientModel— which model collection to look in ("Client", "Agency", etc.)
 * type          — machine-readable event type (used to render the right icon/message)
 * title         — short human-readable title (e.g. "Nouvelle offre reçue")
 * body          — longer description
 * link          — frontend route to navigate to when clicked
 * isRead        — false until the user opens/dismisses it
 * metadata      — flexible extra data (postId, pitchId, etc.)
 */
const notificationSchema = new mongoose.Schema(
  {
    // ── Who receives this notification ──
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // We use a manual ref approach because recipients can be any role model
      // (Client, Agency, Team, Freelancer, AgencyMember, TeamMember)
    },
    recipientRole: {
      type: String,
      required: true,
      enum: ["client", "agency", "agency_member", "team", "team_member", "freelancer"],
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["Client", "Agency", "AgencyMember", "Team", "TeamMember", "Freelancer"],
    },

    // ── Event type ──
    type: {
      type: String,
      required: true,
      enum: [
        // Post events
        "post_published",       // client published a post
        "post_closed",          // client closed a post
        "post_reactivated",     // client reactivated a post

        // Pitch events
        "pitch_received",       // client received a new pitch
        "pitch_accepted",       // provider's pitch was accepted
        "pitch_rejected",       // provider's pitch was rejected

        // Project events
        "project_created",      // project created after pitch acceptance
        "project_milestone",    // milestone reached on a project
        "project_completed",    // project marked as completed

        // Contract events
        "contract_sent",        // agency sent contract to client
        "contract_acknowledged", // client uploaded receipt
        "contract_signed",      // bon de commande sent, contract finalized

        // Deadline / task events
        "task_assigned",        // a task was assigned to a member
        "task_overdue",         // a task has passed its due date
        "deadline_approaching", // project/task deadline within 3 days

        // Internal workflow
        "director_approval_needed", // pitch moved to chef or director for review

        // Collaboration requests
        "collaboration_request",          // incoming collab request
        "collaboration_request_accepted", // request was accepted
        "collaboration_request_declined", // request was declined

        // System
        "system",               // general platform announcement
      ],
    },

    // ── Category for filtering ──
    category: {
      type: String,
      required: true,
      enum: ["tasks", "projects", "contracts", "pitches", "deadlines", "admin", "messages"],
    },

    // ── Content ──
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    body: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // ── Navigation ──
    link: {
      type: String,
      trim: true,
      // e.g. "/dashboard/client/pitches" or "/dashboard/agency/projects/123"
    },

    // ── Status ──
    isRead: {
      type: Boolean,
      default: false,
    },

    // ── Flexible metadata for any linked resources ──
    metadata: {
      postId:      { type: mongoose.Schema.Types.ObjectId, ref: "Post"     },
      pitchId:     { type: mongoose.Schema.Types.ObjectId, ref: "Pitch"    },
      projectId:   { type: mongoose.Schema.Types.ObjectId, ref: "Project"  },
      contractId:  { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
      requestId:   mongoose.Schema.Types.ObjectId,
      senderId:    mongoose.Schema.Types.ObjectId,
      senderName:  String,
    },
  },
  { timestamps: true }
);

// ── Indexes ──
// Most common query: "get all unread notifications for user X"
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
// For bulk-marking as read by role
notificationSchema.index({ recipient: 1, recipientRole: 1 });

// ── Static helper: create a notification ──
// Usage: await Notification.notify({ recipient, recipientRole, recipientModel, type, title, body, link, metadata })
notificationSchema.statics.notify = async function(data) {
  try {
    return await this.create(data);
  } catch (err) {
    // Notifications should never crash the main flow
    console.error("Failed to create notification:", err.message);
  }
};

// ── Static helper: mark all as read for a user ──
notificationSchema.statics.markAllRead = async function(recipientId) {
  return this.updateMany({ recipient: recipientId, isRead: false }, { isRead: true });
};

module.exports = mongoose.model("Notification", notificationSchema);