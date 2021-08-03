const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: { type: String, trim: true },
    active: { type: Boolean, default: true },
    role: {
      type: String,
      default: "basic",
      enum: ["basic", "deputy", "leader"],
    },
    hours: Number,
  },
  { timestamps: true }
);

const budgetSchema = new mongoose.Schema(
  {
    year: Date,
    travel: Number,
    material: Number,
    services: Number,
    indirect: Number,
    salaries: Number,
    members: [memberSchema],
  },
  { timestamps: true }
);

const grantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    idNumber: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["APVV", "VEGA", "KEGA"],
    },
    start: Date,
    end: Date,
    budget: [budgetSchema],
    announcements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
      },
    ],
  },
  {
    timestamps: true,
  }
);

grantSchema.index({ name: "text", idNumber: "text" });

module.exports = mongoose.model("Grant", grantSchema);
