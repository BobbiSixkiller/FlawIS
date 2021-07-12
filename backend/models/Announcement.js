const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      SVGComponentTransferFunctionElement: true,
    },
    content: {
      type: String,
      trim: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    files: [
      {
        url: String,
        path: String,
        name: String,
      },
    ],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

announcementSchema.index({
  name: "text",
  content: "text",
});

announcementSchema.virtual("grants", {
  ref: "Grant",
  localField: "_id",
  foreignField: "announcements",
  justOne: false,
});

announcementSchema.pre("remove", function (next) {
  const announcement = this;
  announcement
    .model("Grant")
    .updateMany(
      { announcements: announcement._id },
      { $pull: { announcements: announcement._id } }
    );
  next();
});

module.exports = mongoose.model("Announcement", announcementSchema);
