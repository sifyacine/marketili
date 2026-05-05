const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const agencySchema = new mongoose.Schema(
  {
    agencyName: { type: String, required: [true, "Agency name is required"], trim: true },
    directorFirstName: { type: String, required: [true, "Director first name is required"], trim: true },
    directorLastName:  { type: String, required: [true, "Director last name is required"], trim: true },
    businessNumber: { type: String, trim: true },
    address: {
      street: String, city: String, region: String, country: String, postalCode: String,
    },
    email: {
      type: String, required: [true, "Email is required"], unique: true,
      lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone:   { type: String, trim: true },
    website: { type: String, trim: true },
    password: {
      type: String, required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"], select: false,
    },
    logo:        { type: String, default: null },
    bio:         { type: String, trim: true, maxlength: 1000 },
    specialties: [{ type: String }],
    portfolioItems: [{
      title: String, description: String, imageUrl: String,
      link: String, createdAt: { type: Date, default: Date.now },
    }],
    members:    [{ type: mongoose.Schema.Types.ObjectId, ref: "AgencyMember" }],
    pitchesSent:[{ type: mongoose.Schema.Types.ObjectId, ref: "Pitch" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    // ✅ NEW: posts flagged by commercial members for the director to review
    flaggedPosts: [
      {
        post:       { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        flaggedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "AgencyMember", required: true },
        flaggedByName: String,   // denormalized for display
        flaggedAt:  { type: Date, default: Date.now },
        note:       String,      // optional comment from commercial
        pitched:    { type: Boolean, default: false }, // true once director pitches on it
      },
    ],

    role:       { type: String, default: "agency", immutable: true },
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

agencySchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

agencySchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Agency", agencySchema);