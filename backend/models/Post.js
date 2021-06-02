const { text } = require("express");
const { Schema, model } = require("mongoose");

const postSchema = new Schema(
	{
		name: { type: String, trim: true },
		body: { type: String, trim: true },
		tags: [{ type: String, trim: true }],
		author: { type: String, trim: true },
		userId: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

postSchema.index({
	name: "text",
	body: "text",
	author: "text",
	tags: "text",
});

module.exports = model("Post", postSchema);
