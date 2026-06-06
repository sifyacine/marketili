

const mongoose = require("mongoose");





















const notificationSchema = new mongoose.Schema(
  {
    
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      
      
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

    
    type: {
      type: String,
      required: true,
      enum: [
        
        "post_published",       
        "post_closed",          
        "post_reactivated",     

        
        "pitch_received",       
        "pitch_accepted",       
        "pitch_rejected",       

        
        "project_created",      
        "project_milestone",    
        "project_completed",    

        
        "contract_sent",        
        "contract_acknowledged", 
        "contract_signed",      

        
        "task_assigned",        
        "task_overdue",         
        "deadline_approaching", 

        
        "director_approval_needed", 

        
        "collaboration_request",          
        "collaboration_request_accepted", 
        "collaboration_request_declined", 

        
        "system",               
      ],
    },

    
    category: {
      type: String,
      required: true,
      enum: ["tasks", "projects", "contracts", "pitches", "deadlines", "admin", "messages"],
    },

    
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

    
    link: {
      type: String,
      trim: true,
      
    },

    
    isRead: {
      type: Boolean,
      default: false,
    },

    
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



notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

notificationSchema.index({ recipient: 1, recipientRole: 1 });



notificationSchema.statics.notify = async function(data) {
  try {
    const notification = await this.create(data);
    
    const { getIo } = require("../config/socket");
    const io = getIo();
    if (io && notification.recipient) {
      io.to(`user:${notification.recipient}`).emit("new_notification", { notification });
    }
    return notification;
  } catch (err) {
    
    console.error("Failed to create notification:", err.message);
  }
};


notificationSchema.statics.markAllRead = async function(recipientId) {
  return this.updateMany({ recipient: recipientId, isRead: false }, { isRead: true });
};

module.exports = mongoose.model("Notification", notificationSchema);