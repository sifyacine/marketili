// backend/models/Subscription.js
//
// One subscription per billed account (client / agency / team / freelancer).
// Chargily Pay V2 has no native recurring billing, so the period is managed
// here: a 14-day trial on signup, then each paid Chargily checkout extends
// `currentPeriodEnd` by one interval.

const mongoose = require("mongoose");

const historyEntrySchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    event: String, // "trial_started" | "checkout_created" | "paid" | "canceled" | "expired"
    interval: String, // "month" | "year"
    amount: Number,
    checkoutId: String,
    periodEnd: Date,
    note: String,
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
    },
    userModel: {
      type: String,
      required: true,
      enum: ["Client", "Agency", "Team", "Freelancer"],
    },
    role: {
      type: String,
      required: true,
      enum: ["client", "agency", "team", "freelancer"],
    },
    email: { type: String, lowercase: true, trim: true },

    planCode: { type: String }, // matches config/plans.js code

    // Billing interval of the CURRENT paid period (null while only trialing).
    interval: { type: String, enum: ["month", "year", null], default: null },

    status: {
      type: String,
      enum: ["trialing", "active", "past_due", "canceled", "expired"],
      default: "trialing",
      index: true,
    },

    trialEndsAt: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },

    amount: { type: Number, default: 0 },
    currency: { type: String, default: "dzd" },

    cancelAtPeriodEnd: { type: Boolean, default: false },

    // Set while a checkout is pending so the webhook / verify step knows what
    // the user is paying for.
    pendingInterval: { type: String, enum: ["month", "year", null], default: null },
    pendingAmount: { type: Number, default: 0 },

    chargily: {
      customerId: { type: String, default: null },
      lastCheckoutId: { type: String, default: null },
      lastCheckoutUrl: { type: String, default: null },
      lastPaymentId: { type: String, default: null },
    },

    history: { type: [historyEntrySchema], default: [] },
  },
  { timestamps: true }
);

// One subscription per user.
subscriptionSchema.index({ user: 1, role: 1 }, { unique: true });
subscriptionSchema.index({ currentPeriodEnd: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);
