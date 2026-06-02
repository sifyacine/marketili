const mongoose = require("mongoose");

const personalNoteSchema = new mongoose.Schema(
  {
    owner:        { type: mongoose.Schema.Types.ObjectId, required: true },
    ownerRole:    { type: String, required: true },
    text:         { type: String, required: true, trim: true },
    isPinned:     { type: Boolean, default: false },
    isReminder:   { type: Boolean, default: false },
    reminderDate: { type: Date },
    isDone:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PersonalNote", personalNoteSchema);
