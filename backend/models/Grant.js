const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
	{
		member: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		hours: { type: Number, required: true },
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
		year: { type: Date, required: true },
		travel: { type: Number, required: true, trim: true },
		material: { type: Number, required: true, trim: true },
		services: { type: Number, required: true, trim: true },
		indirect: { type: Number, trim: true },
		salaries: { type: Number, trim: true },
		members: [memberSchema],
	},
	{ timestamps: true }
);

const grantSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			max: 500,
			unique: true,
		},
		idNumber: {
			type: String,
			required: true,
			trim: true,
			max: 50,
			unique: true,
		},
		type: {
			type: String,
			enum: ["APVV", "VEGA", "KEGA"],
			trim: true,
			required: true,
		},
		start: {
			type: Date,
			default: Date.now,
		},
		end: {
			type: Date,
			required: true,
		},
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
		toObject: { virtuals: true },
		toJSON: { virtuals: true },
	}
);

grantSchema.index({ name: "text", idNumber: "text" });

grantSchema.virtual("url").get(function () {
	return "/grants/" + this._id;
});

module.exports = mongoose.model("Grant", grantSchema);
