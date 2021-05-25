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

module.exports = model("Post", postSchema);
