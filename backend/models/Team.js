const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },

    leadFirstName: { type: String, required: true, trim: true },
    leadLastName:  { type: String, required: true, trim: true },

    address: {
      region: String,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String, trim: true,
      validate: {
        validator: (v) => !v || /^(?:\+213|0)[567]\d{8}$/.test(String(v).replace(/[\s.\-()]/g, "")),
        message: "Numéro de téléphone invalide (format algérien attendu)",
      },
    },
    website: { type: String, trim: true },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    avatar: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 1000 },

    specialties: [String],

    portfolioItems: [
      {
        title: String,
        description: String,
        imageUrl: String,
        link: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" }],

    pitchesSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pitch" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    role: { type: String, default: "team", immutable: true },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);


teamSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

teamSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("Team", teamSchema);