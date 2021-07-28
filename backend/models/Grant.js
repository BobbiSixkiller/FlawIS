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
    year: { type: Date, default: new Date().getFullYear() },
    travel: { type: Number, default: 0 },
    material: { type: Number, default: 0 },
    services: { type: Number, default: 0 },
    indirect: { type: Number, default: 0 },
    salaries: { type: Number, default: 0 },
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
    start: {
      type: Date,
      default: Date.now,
    },
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
