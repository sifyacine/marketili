const mongoose = require("mongoose");

const optionsListSchema = new mongoose.Schema(
  {
    key:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    values: [{ type: String, trim: true }],
    label:  { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OptionsList", optionsListSchema);
