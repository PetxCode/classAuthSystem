const express = require("express");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT;

require("./utils/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.status(200).json({ message: "This is the Main API" });
});

app.use("/api/user", require("./router/userRouter"));

app.listen(port, () => {
	console.log("server is now running...!");
});
