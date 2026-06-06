const mongoose = require("mongoose");















const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    
    assignedTo: [
      {
        memberType: {
          type: String,
          enum: ["AgencyMember", "TeamMember", "Freelancer"],
        },
        memberId: mongoose.Schema.Types.ObjectId,
        
        memberName: String,
      },
    ],

    status: {
      type: String,
      enum: ["todo", "in_progress", "in_review", "done"],
      default: "todo",
    },

    
    
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    dueDate:   Date,
    startDate: Date,

    
    deliverables: [
      {
        fileUrl:     String,
        fileName:    String,
        submittedBy: mongoose.Schema.Types.ObjectId,
        submittedAt: { type: Date, default: Date.now },
        note:        String,
      },
    ],

    
    comments: [
      {
        authorId:   mongoose.Schema.Types.ObjectId,
        authorName: String,
        authorRole: String,
        text:       String,
        createdAt:  { type: Date, default: Date.now },
      },
    ],

    
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


const projectSchema = new mongoose.Schema(
  {
    
    post:  { type: mongoose.Schema.Types.ObjectId, ref: "Post",  required: true },
    pitch: { type: mongoose.Schema.Types.ObjectId, ref: "Pitch", required: true },

    
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },

    
    providerAgency:     { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    providerTeam:       { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    providerFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" },

    providerType: {
      type: String,
      enum: ["Agency", "Team", "Freelancer"],
      required: true,
    },

    
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    
    startDate:  { type: Date },
    deadline:   { type: Date, required: true },
    completedAt: Date,

    
    progress: {
  type: Number,
  default: 0
 },
    projectStatus: {
      type: String,
      enum: ["pending", "pending_contract", "active", "in_review", "completed", "cancelled"],
      default: "pending",
    },

    
    assignedMembers: [
      {
        memberType: {
          type: String,
          enum: ["AgencyMember", "TeamMember", "Freelancer"],
        },
        memberId:   mongoose.Schema.Types.ObjectId,
        memberName: String,    
        role:       String,    
        assignedAt: { type: Date, default: Date.now },
      },
    ],

    
    
    tasks: [taskSchema],

    
    
    deliverables: [
      {
        fileUrl:     String,
        fileName:    String,
        description: String,
        submittedBy: mongoose.Schema.Types.ObjectId,
        submittedAt: { type: Date, default: Date.now },
        isComplete:  { type: Boolean, default: false },
      },
    ],

    
    agreedPrice: {
      amount:   Number,
      currency: { type: String, default: "DZD" },
    },

    
    contractType: {
      type: String,
      enum: ["cdd", "cdi", "project"],
      default: "project",
    },

    
    
    
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },

    
    notes: [
      {
        authorId:   { type: mongoose.Schema.Types.ObjectId },
        authorName: String,
        authorRole: String,
        text:       { type: String, trim: true },
        createdAt:  { type: Date, default: Date.now },
      },
    ],

    
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


projectSchema.index({ client: 1 });
projectSchema.index({ providerAgency: 1 });
projectSchema.index({ providerTeam: 1 });
projectSchema.index({ providerFreelancer: 1 });
projectSchema.index({ projectStatus: 1 });
projectSchema.index({ deadline: 1 });

module.exports = mongoose.model("Project", projectSchema);