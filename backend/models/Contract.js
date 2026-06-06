

const mongoose = require("mongoose");





















const contractSchema = new mongoose.Schema(
  {
    
    
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    pitch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pitch",
    },

    
    contractType: {
      type: String,
      enum: ["service_agreement", "collaboration", "cdd", "cdi", "project"],
      default: "service_agreement",
    },

    
    
    partyAType: {
      type: String,
      enum: ["Agency", "Team", "Freelancer"],
      required: true,
    },
    partyAId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      
    },
    partyAName: { type: String, trim: true }, 

    
    partyBType: {
      type: String,
      enum: ["Client", "Freelancer", "AgencyMember"],
      required: true,
    },
    partyBId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    partyBName: { type: String, trim: true }, 

    
    
    title: { type: String, trim: true },

    
    objet: { type: String, trim: true },

    
    prestations: { type: String, trim: true },

    
    livrables: { type: String, trim: true },

    
    financialTerms: {
      amount:        { type: Number },
      currency:      { type: String, default: "DZD" },
      paymentMethod: { type: String, trim: true },    
      paymentSchedule: { type: String, trim: true },  
    },

    
    duration: {
      startDate: Date,
      endDate:   Date,
      notes:     { type: String, trim: true },
    },

    
    confidentialityClause: { type: Boolean, default: true },

    
    exclusivityClause: { type: Boolean, default: false },

    
    resiliationTerms: { type: String, trim: true },

    
    additionalClauses: { type: String, trim: true },

    
    sections: {
      preambule:  { type: String, trim: true },
      article1:   { type: String, trim: true },
      article2:   { type: String, trim: true },
      article3:   { type: String, trim: true },
      article4:   { type: String, trim: true },
      article5:   { type: String, trim: true },
      article6:   { type: String, trim: true },
      article7:   { type: String, trim: true },
      article8:   { type: String, trim: true },
      article9:   { type: String, trim: true },
      article10:  { type: String, trim: true },
      article11:  { type: String, trim: true },
      article12:  { type: String, trim: true },
      article13:  { type: String, trim: true },
      article14:  { type: String, trim: true },
      article15:  { type: String, trim: true },
    },

    
    status: {
      type: String,
      enum: ["draft", "sent", "acknowledged", "signed", "resiliation"],
      default: "draft",
    },

    
    
    contractPdf: {
      fileId:     String,
      filename:   String,
      url:        String,
      generatedAt: Date,
    },

    
    receipt: {
      fileId:     String,
      filename:   String,
      url:        String,
      uploadedAt: Date,
      uploadedBy: mongoose.Schema.Types.ObjectId,
    },

    
    bonDeCommande: {
      fileId:     String,
      filename:   String,
      url:        String,
      sentAt:     Date,
      sentBy:     mongoose.Schema.Types.ObjectId,
    },

    
    statusHistory: [
      {
        status:    String,
        changedAt: { type: Date, default: Date.now },
        changedBy: mongoose.Schema.Types.ObjectId,
        note:      String,
      },
    ],

    
    
    initiatedBy:   mongoose.Schema.Types.ObjectId,
    initiatedByRole: { type: String },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);


contractSchema.index({ project: 1 });
contractSchema.index({ partyAId: 1 });
contractSchema.index({ partyBId: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Contract", contractSchema);