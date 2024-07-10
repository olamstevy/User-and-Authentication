const { User } = require("../model/user_orgModel.js");
const jwt = require("jsonwebtoken");

const generateAccessToken = function (userId) {
	try {
		return jwt.sign({ userId }, process.env.JWT_SECRET, {
			expiresIn: `${process.env.JWT_EXPIRES_IN_MINS}m`,
		});
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
};
module.exports.generateAccessToken = generateAccessToken;

module.exports.register = async function (req, res, next) {
	try {
		const user = await User.create({ ...req.body });
		user.password = null;

		const accessToken = generateAccessToken(user.userId);

		res.cookie("jwt", accessToken, {
			secure: true,
			httpOnly: true,
		});

		res.status(201).json({
			status: "success",
			message: "Registration successful",
			data: { accessToken, user },
		});
	} catch (err) {
		if (err.name === "SequelizeValidationError") {
			const errors = err.errors.map(({ path, message }) => ({
				field: path,
				message,
			}));
			if (errors.find((err) => (err.field = "email"))) {
				return res.status(422).json({
					status: "Bad request",
					message: "Registration unsuccessful",
					statusCode: 400,
					errors,
				});
			}
			return res.status(422).json({
				status: "Bad request",
				message: "Registration unsuccessful",
				statusCode: 400,
				errors,
			});
		}

		console.error(err);
		res.status(400).json({
			status: "Bad request",
			message: "Registration unsuccessful",
			statusCode: 400,
		});
	}
};

module.exports.login = async function (req, res, next) {
	try {
		const { email, password } = req.body;
		const user = await User.scope("withPassword").findOne({
			where: { email: email },
		});

		// Verify email and password
		if (!user) {
			return res.status(401).json({
				status: "Bad request",
				message: "Authentication failed",
				statusCode: 401,
			});
		}
		const passwordCorrect = await user.verifyPassword(password);
		user.password = undefined;

		if (!passwordCorrect) throw new Error();

		const accessToken = generateAccessToken(user.userId);

		res.cookie("jwt", accessToken, {
			secure: true,
			httpOnly: true,
		});

		res.status(200).json({
			status: "success",
			message: "Login successful",
			data: { accessToken, user },
		});
	} catch (error) {
		res.status(401).json({
			status: "Bad Request",
			message: "Authentication failed",
			statusCode: 401,
		});
	}
};

module.exports.protect = async function (req, res, next) {
	try {
		// Work around for authentications with httpie
		if (req.get("authorization"))
			req.cookies.jwt = req.get("authorization").replace("Bearer ", "");

		const accessToken = req?.cookies?.jwt;
		if (!accessToken)
			return res.status(403).json({
				status: "Forbidden Request",
				message: "Authentication failed! Login to access endpoint",
			});

		const { userId } = jwt.verify(accessToken, process.env.JWT_SECRET);

		const user = await User.findByPk(userId);
		if (!user)
			return res.status(403).json({
				status: "Forbidden Request",
				message: "Authentication failed! Login to access endpoint",
			});

		req.user = user;
		next();
	} catch (error) {
		console.error(error);
		res.status(403).json({
			status: "Forbidden Request",
			message: "Authentication failed! Login to access endpoint",
			errors: error,
		});
	}
};
