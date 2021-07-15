const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hours: Number,
    active: { type: Boolean, default: true },
    role: {
      type: String,
      default: "basic",
      enum: ["basic", "deputy", "leader"],
    },
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
      validate: {
        validator: async function (name) {
          const grantExists = await this.model("Grant").findOne({ name });
          if (grantExists) {
            return false;
          } else return true;
        },
        message: (props) => `Grant: ${props.value} už existuje!`,
      },
    },
    idNumber: {
      type: String,
      trim: true,
      validate: {
        validator: async function (idNumber) {
          const idExists = await this.model("Grant").findOne({ idNumber });
          if (idExists) {
            return false;
          } else return true;
        },
        message: (props) => `ID: ${props.value} už existuje!`,
      },
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
