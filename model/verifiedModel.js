const mongoose = require("mongoose");

const verifiedModel = mongoose.Schema(
	{
		userID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},

		token: {
			type: String,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("verifieds", verifiedModel);
