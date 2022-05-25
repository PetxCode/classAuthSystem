const upload = require("../utils/multer");
const express = require("express");
const router = express.Router();
const {
	getAllUsers,
	getSingleUser,
	deleteSingleUser,
	createUser,
	verifyUser,
	signinUser,
} = require("../controller/userController");

router.route("/").get(getAllUsers);
router.route("/:id").get(getSingleUser).delete(deleteSingleUser);

router.route("/register").post(upload, createUser);
router.route("/signin").post(signinUser);
router.route("/:id/:token").get(verifyUser);

module.exports = router;
