require("dotenv").config();
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../controller/authController.js");
const { JWT_SECRET, JWT_EXPIRES_IN_MINS } = process.env;

test("Ensure token contains correct user details and token expires at correct time", () => {
	const userId = "2c292ff2-0d7c-4122-bebb-671387e70c98";
	const accessToken = generateAccessToken(userId);
	const tokenExpInMs = Number(JWT_EXPIRES_IN_MINS) * 60; // min * 60s

	const verifiedToken = jwt.verify(accessToken, JWT_SECRET, {
		complete: true,
	}).payload;

	expect(verifiedToken.userId).toBe(userId);
	expect(verifiedToken.exp - verifiedToken.iat).toBe(tokenExpInMs);
});
