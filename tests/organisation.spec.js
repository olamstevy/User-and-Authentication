const { usersData, orgsData } = require("../testData.js");
const { User, Organisation } = require("../model/user_orgModel.js");
const { getOrg } = require("../controller/apiController.js");

test("Ensure users can’t see data from organisations they don’t have access to", async () => {
	const user0 = await User.create(usersData[0]);
	const user1 = await User.create(usersData[1]);
	const org = await Organisation.create(orgsData[0]);

	await org.addUser(user0);

	const res1 = { json: jest.fn(), status: jest.fn().mockReturnThis() };
	const res2 = { json: jest.fn(), status: jest.fn().mockReturnThis() };

	await getOrg({ user: user0.dataValues, params: { orgId: org.orgId } }, res1);
	await getOrg({ user: user1.dataValues, params: { orgId: org.orgId } }, res2);

	expect(res1.status).toHaveBeenCalledWith(200); // User0 should have access
	expect(res2.status).toHaveBeenCalledWith(403); // User1 should not have access
});
