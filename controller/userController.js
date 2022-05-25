const userModel = require("../model/userModel");
const verifiedModel = require("../model/verifiedModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const crypto = require("crypto");

const transport = nodemailer.createTransport({
	service: process.env.SERVICE,
	auth: {
		user: process.env.USER,
		pass: process.env.PASS,
	},
});

const getAllUsers = async (req, res) => {
	try {
		const user = await userModel.find();
		res.status(200).json({
			message: "success",
			data: user,
		});
	} catch (err) {
		res.status(404).json({
			message: err.message,
		});
	}
};

const getSingleUser = async (req, res) => {
	try {
		const user = await userModel.findById(req.params.id);
		res.status(200).json({
			message: "success",
			data: user,
		});
	} catch (err) {
		res.status(404).json({
			message: err.message,
		});
	}
};

const deleteSingleUser = async (req, res) => {
	try {
		const user = await userModel.findByIdAndDelete(req.params.id);
		res.status(200).json({
			message: "success",
			data: user,
		});
	} catch (err) {
		res.status(404).json({
			message: err.message,
		});
	}
};

const createUser = async (req, res) => {
	try {
		const { email, userName, password } = req.body;

		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(password, salt);

		const image = await cloudinary.uploader.upload(req.file.path);
		const dataToken = crypto.randomBytes(7).toString("hex");
		console.log(dataToken);
		const token = jwt.sign({ dataToken }, process.env.SECRET, {
			expiresIn: process.env.MINUTE,
		});

		const user = await userModel.create({
			email,
			userName,
			password: hashed,
			avatar: image.secure_url,
			avatarID: image.public_id,
			verifiedToken: token,
		});

		await verifiedModel.create({
			userID: user._id,
			token: token,
			_id: user._id,
		});

		const mailOptions = {
			from: "no-reply@gmail.com",
			to: email,
			subject: "Account Verification",
			html: `
                <h3>
                    This is to verify your account, please click the <a
                    href="http://localhost:2222/api/user/${user._id}/${token}"
                    >Link</a> to continue, this link expires in 20mins
                </h3>
            `,
		};

		transport.sendMail(mailOptions, (err, info) => {
			if (err) {
				console.log(err.message);
			} else {
				console.log("Message has been sent", info.response);
			}
		});

		res.status(201).json({
			message: "Please check your inbox for confirmation!!!",
		});
	} catch (err) {
		res.status(404).json({
			message: err.message,
		});
	}
};

const verifyUser = async (req, res) => {
	try {
		const user = await userModel.findById(req.params.id);
		if (user) {
			if (user.verifiedToken !== "") {
				await userModel.findByIdAndUpdate(
					user._id,
					{
						verified: true,
						verifiedToken: "",
					},
					{ new: true }
				);

				await verifiedModel.findByIdAndUpdate(
					user._id,
					{
						userID: user._id,
						token: "",
					},
					{ new: true }
				);

				res.status(200).json({
					message: "e don work... oya sign-💕in👌",
				});
			} else {
				res.status(404).json({
					message: "you're not a verified user yet",
				});
			}
		} else {
			res.status(404).json({
				message: "There is no User yet",
			});
		}
	} catch (err) {
		res.status(404).json({
			message: err.message,
		});
	}
};

const signinUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await userModel.findOne({ email });
		if (user) {
			const checkPassword = await bcrypt.compare(password, user.password);
			if (checkPassword) {
				if (user.verified && user.verifiedToken === "") {
					const myToken = jwt.sign(
						{
							_id: user._id,
							verified: user.verified,
						},
						process.env.SECRET,
						{ expiresIn: "2d" }
					);

					const { password, ...info } = user._doc;

					res.status(200).json({
						message: "Welcome back",
						data: { myToken, ...info },
					});
				} else {
					const mailOptions = {
						from: "no-reply@gmail.com",
						to: email,
						subject: "Account Verification",
						html: `
                <h3>
                    This is to verify your account, please click the <a
                    href="http://localhost:2222/api/user/${user._id}/${user.token}"
                    >Link</a> to continue, this link expires in 20mins
                </h3>
            `,
					};

					transport.sendMail(mailOptions, (err, info) => {
						if (err) {
							console.log(err.message);
						} else {
							console.log("Message has been sent", info.response);
						}
					});

					res.status(201).json({
						message:
							"Please Verify your account before loggin in, check your inbox fro verification!!!",
					});
				}
			} else {
				res.status(404).json({
					message: "your password is incorrect",
				});
			}
		} else {
			res.status(404).json({
				message: "user not found",
			});
		}
	} catch (err) {
		res.status(404).json({
			message: err.message,
		});
	}
};

// const getAllUsers = async (req, res) => {
// 	try {
// 	} catch (err) {
// 		res.status(404).json({
// 			message: err.message,
// 		});
// 	}
// };

module.exports = {
	getAllUsers,
	getSingleUser,
	deleteSingleUser,
	createUser,
	verifyUser,
	signinUser,
};
