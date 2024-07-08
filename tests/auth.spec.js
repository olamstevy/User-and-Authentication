const request = require("supertest");
const app = require("../app");
const { User, Organisation } = require("../model/user_orgModel.js");

const createRandomUser = () => ({
	firstName: "John",
	lastName: "Doe",
	email: `john.doe${Date.now()}@example.com`,
	password: "password123",
});

describe("End-to-End Tests for Auth API", () => {
	it("should register user successfully with default organisation", async () => {
		const userData = createRandomUser();
		const response = await request(app)
			.post("/auth/register")
			.send(userData)
			.expect(201);

		const { accessToken, user } = response.body.data;

		expect(user.email).toBe(userData.email);
		expect(accessToken).toBeDefined();
	}, 20000);

	it("should log the user in successfully", async () => {
		const userData = createRandomUser();
		await request(app).post("/auth/register").send(userData);

		const response = await request(app)
			.post("/auth/login")
			.send({ email: userData.email, password: userData.password })
			.expect(200);

		const { accessToken, user } = response.body.data;

		expect(user.email).toBe(userData.email);
		expect(accessToken).toBeDefined();
	}, 20000);

	it("should fail if required fields are missing", async () => {
		const fields = ["firstName", "lastName", "email", "password"];

		for (const field of fields) {
			const userData = createRandomUser();
			delete userData[field];

			const response = await request(app)
				.post("/auth/register")
				.send(userData)
				.expect(422);

			expect(response.body.status).toBe("Bad request");
			expect(response.body.message).toBe("Registration unsuccessful");
		}
	}, 20000);

	it("should fail if there’s duplicate email", async () => {
		const userData = createRandomUser();

		await request(app).post("/auth/register").send(userData);

		const response = await request(app)
			.post("/auth/register")
			.send(userData)
			.expect(422);

		expect(response.body.status).toBe("Bad request");
		expect(response.body.message).toBe("Registration unsuccessful");
	}, 20000);
});
