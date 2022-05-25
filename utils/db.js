const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.URLONLINE).then(() => {
	console.log("Database now connected");
});

module.exports = mongoose;
