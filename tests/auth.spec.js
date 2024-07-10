const request = require("supertest");
const app = require("../app");
const { User } = require("../model/user_orgModel.js");

const generateUser = () => ({
	firstName: "John",
	lastName: "Aderele",
	email: `user${Math.floor(Math.random() * 100000 + 1)}@gmail.com`,
	password: "pass1234",
	phone: "+2348022222222",
});

const firstUser = generateUser();
const secondUser = generateUser();
const thirdUser = generateUser();
const fourthUser = generateUser();
const fifthUser = generateUser();

// It Should Register User successfully with Default Organisation: Ensure a user is registered successfully when no organisation details are provided.
test("register user successfully with default organisation", async () => {
	const regResponse = await request(app)
		.post("/auth/register")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ ...firstUser })
		.expect(201);

	expect(regResponse.body.data.user).toBeTruthy();
}, 30000);

// Verify the default organisation name is correctly generated (e.g., "John's Organisation" for a user with the first name "John"
test("verify default organisation name is correctly generated", async () => {
	const user = await User.findOne({ where: { email: firstUser.email } });
	const userOrg = (await user.getOrganisations())[0];
	expect(userOrg.name).toBe(`${firstUser.firstName}'s Organisation`);
});

// Check that the response contains the expected user details and access token
test("check that the response contains the expected user details and access token", async () => {
	const { body } = await request(app)
		.post("/auth/register")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ ...secondUser })
		.expect(201);

	const user = body.data.user;

	expect(user.firstName).toBe(secondUser.firstName);
	expect(user.lastName).toBe(secondUser.lastName);
	expect(user.email).toBe(secondUser.email);
	expect(user.phone).toBe(secondUser.phone);
	expect(body.data.accessToken).toBeTruthy();
});

// It Should Log the user in successfully:Ensure a user is logged in successfully when a valid credential is provided and fails otherwise.
test("ensure user is logged in successfully when a valid credential is provided and fail otherwise", async () => {
	const loginResponseSuccess = await request(app)
		.post("/auth/login")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ email: firstUser.email, password: firstUser.password })
		.expect(200);

	const loginResponseFail = await request(app)
		.post("/auth/login")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ email: firstUser.email, password: "232" })
		.expect(401);

	expect(loginResponseFail.body.statusCode).toEqual(401);
});

// Check that the response contains the expected user details and access token
test("check that the response contains the expected user details and access token", async () => {
	const loginResponse = await request(app)
		.post("/auth/login")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ email: firstUser.email, password: firstUser.password })
		.expect(200);

	const user = loginResponse.body.data.user;
	expect(user.firstName).toBe(firstUser.firstName);
	expect(user.lastName).toBe(firstUser.lastName);
	expect(user.email).toBe(firstUser.email);
	expect(user.phone).toBe(firstUser.phone);
	expect(loginResponse.body.data.accessToken).toBeTruthy();
});

// It Should Fail If Required Fields Are Missing:Test cases for each required field (firstName, lastName, email, password) missing.
test("should fail if required fields are missing", async () => {
	const userData = { ...thirdUser };
	const requiredFields = ["firstName", "lastName", "email", "password"];
	requiredFields.forEach(async (field) => {
		userData[field] = undefined;
		const userResponse = await request(app)
			.post("/auth/register")
			.set("Accept", "application/json")
			.expect("Content-Type", "application/json; charset=utf-8")
			.send({ ...secondUser });

		expect(userResponse.status).toBeGreaterThan(299);
	});
});

// Verify the response contains a status code of 422 and appropriate error messages
test("verify the response contains a status code of 422 and appropriate error messages", async () => {
	const userData = { ...thirdUser };
	const requiredFields = ["firstName", "lastName", "email", "password"];
	requiredFields.forEach(async (field, index) => {
		userData[requiredFields[index]] = undefined;
		const userResponse = await request(app)
			.post("/auth/register")
			.set("Accept", "application/json")
			.expect("Content-Type", "application/json; charset=utf-8")
			.send({ ...secondUser })
			.expect(422);
		expect(userResponse.body.message.toLowerCase()).toBe(
			"registration unsuccessful"
		);
	});
});

// It Should Fail if there’s Duplicate Email or UserID:Attempt to register two users with the same email.
test("should fail if there’s duplicate email or userId", async () => {
	const user1Data = { ...thirdUser };
	const user2Data = { ...fourthUser };

	const user1Response = await request(app)
		.post("/auth/register")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ ...user1Data })
		.expect(201);

	user2Data.userId = user1Response.body.data.user.userId;

	const user2FirstResponse = await request(app)
		.post("/auth/register")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ ...user2Data });

	expect(user2FirstResponse.status).toBeGreaterThan(299);

	user2Data.userId = undefined;
	user2Data.email = user1Response.body.data.user.email;

	const user2SecondResponse = await request(app)
		.post("/auth/register")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ ...user2Data });
	expect(user2SecondResponse.status).toBeGreaterThan(299);
});

// Verify the response contains a status code of 422 and appropriate error messages
test("verify the response contains a status code of 422 and appropriate error messages", async () => {
	const user1Data = { ...fourthUser };
	const user2Data = { ...fifthUser };

	const user1Response = await request(app)
		.post("/auth/register")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ ...user1Data })
		.expect(201);

	user2Data.userId = user1Response.body.data.user.userId;

	const user2FirstResponse = await request(app)
		.post("/auth/register")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ ...user2Data });

	expect(user2FirstResponse.status).toEqual(422);
	expect(user2FirstResponse.body.message.toLowerCase()).toBe(
		"registration unsuccessful"
	);

	user2Data.userId = undefined;
	user2Data.email = user1Response.body.data.user.email;

	const user2SecondResponse = await request(app)
		.post("/auth/register")
		.set("Accept", "application/json")
		.expect("Content-Type", "application/json; charset=utf-8")
		.send({ ...user2Data });
	expect(user2SecondResponse.status).toEqual(422);
	expect(user2SecondResponse.body.message.toLowerCase()).toBe(
		"registration unsuccessful"
	);
});
