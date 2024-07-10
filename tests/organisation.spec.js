const { User, Organisation } = require("../model/user_orgModel.js");
const { getOrg } = require("../controller/apiController.js");

test("ensure users can’t see data from organisations they don’t have access to", async () => {
	const user0 = await User.create({
		firstName: "john",
		lastName: "osigi",
		email: `johno${Date.now()}@gmail.com`,
		password: "pass123",
		phone: "2348000000000",
	});

	const user1 = await User.create({
		firstName: "remi",
		lastName: "Ade",
		email: `rema${Date.now()}@gmail.com`,
		password: "pass1234",
		phone: "2348011111111",
	});
	const org = await Organisation.create({
		name: "Bolu",
		description: "This is bolu organisation",
	});

	await org.addUser(user0);

	const res1 = { json: jest.fn(), status: jest.fn().mockReturnThis() };
	const res2 = { json: jest.fn(), status: jest.fn().mockReturnThis() };

	await getOrg({ user: user0.dataValues, params: { orgId: org.orgId } }, res1);
	await getOrg({ user: user1.dataValues, params: { orgId: org.orgId } }, res2);

	expect(res1.status).toHaveBeenCalledWith(200);
	expect(res2.status).toHaveBeenCalledWith(403);
}, 30000);
