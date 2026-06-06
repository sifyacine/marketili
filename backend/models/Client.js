const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");












const clientSchema = new mongoose.Schema(
  {
    
    accountType: {
      type: String,
      enum: ["person", "company"],
      required: true,
    },

    
    firstName: { type: String, trim: true },
    lastName:  { type: String, trim: true },

    
    companyName: { type: String, trim: true },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    industry:    { type: String, trim: true, maxlength: 100 },
    fieldOfWork: { type: String, trim: true, maxlength: 200 },

    
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone:    {
      type: String, trim: true,
      validate: {
        validator: (v) => !v || /^(?:\+213|0)[567]\d{8}$/.test(String(v).replace(/[\s.\-()]/g, "")),
        message: "Numéro de téléphone invalide (format algérien attendu)",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
      
      
      
    },

    
    avatar:   { type: String, default: null },
    bio:          { type: String, trim: true, maxlength: 500 },
    achievements: [{ type: String, trim: true, maxlength: 200 }],
    location: { region: String },

    
    
    createdPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    
    role: { type: String, default: "client", immutable: true },

    
    isVerified:   { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);





clientSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  

  const salt = await bcrypt.genSalt(12);
  
  
  this.password = await bcrypt.hash(this.password, salt);
});



clientSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
  
};


clientSchema.virtual("displayName").get(function () {
  if (this.accountType === "company") return this.companyName;
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Client", clientSchema);