const mongoose = require("mongoose");















const postSchema = new mongoose.Schema(
  {
    
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
      trim: true,
    },
    objectives: { type: String, trim: true, maxlength: 500 },
    
    pictures: [
      {
        type: String,
      },
    ],

    
    budget: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "DZD" },
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },

    
    location: {
      city:    String,
      region:  String,
      country: String,
    },

    
    categories: [String],
    

    
    requiredSkills: [String],

    marketingType: {
      type: String,
      enum: ["Events", "360 Marketing", "ATL", "BTL", "Production", "Brand Marketing"],
    },

    collaborationType: {
      type: String,
      enum: ["service", "partnership", "sponsorship", "exposure"],
    },

    
    compensationType: {
      type: String,
      enum: ["monetary", "benefits", "mixed"],
      default: "monetary",
    },

    
    benefits: { type: String, trim: true },

    
    media: [
      {
        fileId:   String, 
        filename: String,
        mimeType: String, 
        size:     Number, 
        url:      String, 
      },
    ],

    
    
    targetProviders: {
      type: [String],
      enum: ["agency", "team", "freelancer", "all"],
      default: ["all"],
    },

    
    status: {
      type: String,
      enum: ["open", "in_progress", "closed", "reactivated"],
      default: "open",
    },
    adminNote: { type: String, trim: true },

    
    
    
    pitches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pitch",
      },
    ],

    
    acceptedPitches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pitch",
      },
    ],

    
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    
    
    
    sentTo: [
      {
        providerType: {
          type: String,
          enum: ["Agency", "Team", "Freelancer"],
        },
        providerId: mongoose.Schema.Types.ObjectId,
        sentAt: { type: Date, default: Date.now },
      },
    ],

    
    savedBy: [
      {
        providerType: {
          type: String,
          enum: ["Agency", "Team", "Freelancer"],
        },
        providerId: mongoose.Schema.Types.ObjectId,
      },
    ],

    
    isPublic: { type: Boolean, default: true },

    
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    
    targetProvider: {
      providerType: { type: String, enum: ["Agency", "Team", "Freelancer"] },
      providerId:   { type: mongoose.Schema.Types.ObjectId },
    },

    
    initiatedBy: {
      initiatorType: { type: String, enum: ["Agency", "Team", "Freelancer"] },
      initiatorId:   { type: mongoose.Schema.Types.ObjectId },
    },

    
    statusHistory: [
      {
        status:    String,
        changedAt: { type: Date, default: Date.now },
        reason:    String,
      },
    ],
  },
  { timestamps: true }
);


postSchema.index({ status: 1 });
postSchema.index({ deadline: 1 });
postSchema.index({ "location.region": 1 });
postSchema.index({ categories: 1 });
postSchema.index({ createdAt: -1 });

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ marketingType: 1 });
postSchema.index({ collaborationType: 1 });

module.exports = mongoose.model("Post", postSchema);