const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * CLIENT MODEL
 *
 * A client can be either a person (personne) or a company (entreprise).
 * The accountType field drives which fields are required/shown.
 *
 * accountType: "person"  → firstName + lastName are used
 * accountType: "company" → companyName + companySize are used
 *
 * Both share email, phone, password, and their activity history.
 */
const clientSchema = new mongoose.Schema(
  {
    // ── Account type (personne ou entreprise in French UI) ──
    accountType: {
      type: String,
      enum: ["person", "company"],
      required: true,
    },

    // ── Person fields (used when accountType === "person") ──
    firstName: { type: String, trim: true },
    lastName:  { type: String, trim: true },

    // ── Company fields (used when accountType === "company") ──
    companyName: { type: String, trim: true },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    industry:    { type: String, trim: true, maxlength: 100 },
    fieldOfWork: { type: String, trim: true, maxlength: 200 },

    // ── Shared fields ──
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone:    { type: String, trim: true },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
      // select: false means this field is EXCLUDED from queries by default.
      // You must explicitly do .select("+password") to get it.
      // This prevents accidentally sending passwords in API responses.
    },

    // ── Profile ──
    avatar:   { type: String, default: null },
    bio:          { type: String, trim: true, maxlength: 500 },
    achievements: [{ type: String, trim: true, maxlength: 200 }],
    location: { region: String },

    // ── Activity references ──
    // We store only IDs here. Mongoose "populate" fills in the full objects when needed.
    createdPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    // ── Role — always "client" for this model ──
    role: { type: String, default: "client", immutable: true },

    // ── Account status ──
    isVerified:   { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// ── Pre-save hook: hash password before saving ──
// This runs automatically every time a client document is saved.
// We only re-hash if the password field was actually changed.
// NOTE: no "next" parameter — not needed in async hooks in Mongoose 6+
clientSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  // isModified("password") returns true only if the password field changed

  const salt = await bcrypt.genSalt(12);
  // genSalt(12) — 12 rounds of hashing. Higher = more secure but slower.
  // 12 is the industry standard for production.
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method: compare passwords at login ──
// "this" refers to the specific client document being checked.
clientSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
  // bcrypt.compare() hashes the candidate and compares — never stores plaintext
};

// ── Virtual: display name (computed, not stored in DB) ──
clientSchema.virtual("displayName").get(function () {
  if (this.accountType === "company") return this.companyName;
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Client", clientSchema);