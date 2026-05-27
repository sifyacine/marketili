const mongoose = require("mongoose");

/**
 * PROJECT MODEL
 *
 * Created automatically when a client accepts a pitch.
 * Same document is referenced by both client and provider
 * but the API returns different views (fields) based on who's asking.
 *
 * Status flow:
 *   pending → active → in_review → completed | cancelled
 */

// ── Task sub-schema ──
// Tasks live inside a project. They can be assigned to members
// and represent the actual work items.
const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Who is responsible
    assignedTo: [
      {
        memberType: {
          type: String,
          enum: ["AgencyMember", "TeamMember", "Freelancer"],
        },
        memberId: mongoose.Schema.Types.ObjectId,
        // Denormalized name for display without populate
        memberName: String,
      },
    ],

    status: {
      type: String,
      enum: ["todo", "in_progress", "in_review", "done"],
      default: "todo",
    },

    // Priority affects calendar color:
    // low=green, medium=yellow, high=orange, urgent=red
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    dueDate:   Date,
    startDate: Date,

    // Files submitted as deliverables for this task
    deliverables: [
      {
        fileUrl:     String,
        fileName:    String,
        submittedBy: mongoose.Schema.Types.ObjectId,
        submittedAt: { type: Date, default: Date.now },
        note:        String,
      },
    ],

    // Notes / comments on the task
    comments: [
      {
        authorId:   mongoose.Schema.Types.ObjectId,
        authorName: String,
        authorRole: String,
        text:       String,
        createdAt:  { type: Date, default: Date.now },
      },
    ],

    // Handover trail — populated when assignedTo changes
    previousAssignees: [
      {
        memberId:   mongoose.Schema.Types.ObjectId,
        memberName: String,
        memberType: String,
        removedAt:  { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ── Main project schema ──
const projectSchema = new mongoose.Schema(
  {
    // ── Origin ──
    post:  { type: mongoose.Schema.Types.ObjectId, ref: "Post",  required: true },
    pitch: { type: mongoose.Schema.Types.ObjectId, ref: "Pitch", required: true },

    // ── Parties ──
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },

    // Only one provider type will be set
    providerAgency:     { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    providerTeam:       { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    providerFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" },

    providerType: {
      type: String,
      enum: ["Agency", "Team", "Freelancer"],
      required: true,
    },

    // ── Project info ──
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // ── Timeline ──
    startDate:  { type: Date },
    deadline:   { type: Date, required: true },
    completedAt: Date,

    // ── Status ──
    progress: {
  type: Number,
  default: 0
 },
    projectStatus: {
      type: String,
      enum: ["pending", "pending_contract", "active", "in_review", "completed", "cancelled"],
      default: "pending",
    },

    // ── Members assigned to this project (agency/team only) ──
    assignedMembers: [
      {
        memberType: {
          type: String,
          enum: ["AgencyMember", "TeamMember", "Freelancer"],
        },
        memberId:   mongoose.Schema.Types.ObjectId,
        memberName: String,    // denormalized for display
        role:       String,    // their role on this project
        assignedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Tasks ──
    // Embedded for performance — tasks are always loaded with their project
    tasks: [taskSchema],

    // ── Deliverables at project level ──
    // Overall project files/deliverables (not task-level)
    deliverables: [
      {
        fileUrl:     String,
        fileName:    String,
        description: String,
        submittedBy: mongoose.Schema.Types.ObjectId,
        submittedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Financial ──
    agreedPrice: {
      amount:   Number,
      currency: { type: String, default: "DZD" },
    },

    // ── Contract type (for freelancer projects) ──
    contractType: {
      type: String,
      enum: ["cdd", "cdi", "project"],
      default: "project",
    },

    // ── Communication ──
    // Messages are stored in a separate Message model (Phase 7)
    // but we keep a reference here
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },

    // ── Status history for audit trail ──
    statusHistory: [
      {
        status:    String,
        changedAt: { type: Date, default: Date.now },
        changedBy: mongoose.Schema.Types.ObjectId,
        note:      String,
      },
    ],
  },
  { timestamps: true }
);

// ── Indexes ──
projectSchema.index({ client: 1 });
projectSchema.index({ providerAgency: 1 });
projectSchema.index({ providerTeam: 1 });
projectSchema.index({ providerFreelancer: 1 });
projectSchema.index({ projectStatus: 1 });
projectSchema.index({ deadline: 1 });

module.exports = mongoose.model("Project", projectSchema);