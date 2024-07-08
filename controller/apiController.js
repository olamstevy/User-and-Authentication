require("dotenv").config();
const { User, Organisation } = require("../model/user_orgModel.js");

module.exports.getUser = async function (req, res) {
	try {
		const userId = req.params.id.replaceAll(`"`, "").replaceAll(`'`, "");

		if (userId !== req.user.userId) {
			const loggedInUser = await User.findByPk(req.user.userId);
			const loggedInUserOrgs = await loggedInUser.getOrganisations();
			const loggedInUserOrgId = loggedInUserOrgs.map((org) => org.orgId);

			const user = await User.findByPk(userId);
			const userOrgs = await user.getOrganisations(); // - [org, org]

			const usersPromise = userOrgs.map(async ({ orgId }) => {
				const org = await Organisation.findByPk(orgId);
				const users = await org.getUsers();
				return users;
			}); // [[user, user], [user, user]]
			const users = (await Promise.all(usersPromise)).flat();

			const foundUser = users.find(
				(user) =>
					user.userId === userId &&
					loggedInUserOrgId.includes(user.UserOrganisation.OrganisationOrgId)
			);
			if (foundUser) {
				return res.status(200).json({
					status: "success",
					message: "You can successfully view your data",
					data: foundUser,
				});
			}

			return res.status(403).json({
				status: "Forbidden Request",
				message: "You are not allowed to view this data",
				data: foundUser,
			});
		}

		res.status(200).json({
			status: "success",
			message: "You can successfully view your data",
			data: req.user,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err });
	}
};

module.exports.getAllOrg = async function (req, res) {
	try {
		const user = await User.findByPk(req.user.userId);
		const organisations = await user.getOrganisations();

		res.status(200).json({
			status: "success",
			message: "Here are all your organisations",
			data: {
				organisations: organisations.map(({ orgId, name, description }) => ({
					orgId,
					name,
					description,
				})),
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: "Fetch Failed",
			message: "Internal Server Error",
		});
	}
};

module.exports.getOrg = async function (req, res) {
	try {
		const { orgId } = req.params;

		if (!orgId)
			return res.status(400).json({
				status: "Bad Request",
				message: "orgId is missing in params",
			});

		const user = await User.findByPk(req.user.userId);
		const org = (await user.getOrganisations()).find(
			(organisation) => organisation.orgId === orgId
		);

		if (!org)
			return res.status(403).json({
				status: "Not Found",
				message: "The organisation you searched for is not available to you",
			});

		return res.status(200).json({
			status: "success",
			message: "Here is the organisation record",
			data: {
				orgId: org.orgId,
				name: org.name,
				description: org.description,
			},
		});
	} catch (error) {
		console.error(error);
		return res.status(403).json({
			status: "Fetch Failed",
			message: "Internal Server Error",
			error,
		});
	}
};

module.exports.createOrg = async function (req, res) {
	try {
		const { name, description } = req.body;
		const org = await Organisation.create({ name, description });
		const user = await User.findByPk(req.user.userId);
		await org.addUser(user);

		return res.status(201).json({
			status: "success",
			message: "Organisation created successfully",
			data: { orgId: org.orgId, name: org.name, description: org.description },
		});
	} catch (error) {
		if (error.name === "SequelizeValidationError") {
			const errors = error.errors.map(({ path, message }) => ({
				field: path,
				message,
			}));
			console.error(error);
			return res.status(422).json({
				status: "Bad request",
				message: " unsuccessful",
				errors,
			});
		}
		res.status(400).json({
			status: "Bad Request",
			message: error.message,
			statusCode: 400,
		});
	}
};

module.exports.addOrgUser = async function (req, res) {
	try {
		const { orgId } = req.params;
		const { userId } = req.body;
		const org = await Organisation.findByPk(orgId);

		const loggedInUser = await User.findByPk(req.user.userId);
		const ownedOrganisations = await loggedInUser.getOrganisations();

		if (!ownedOrganisations.find((ownedOrg) => orgId === ownedOrg.orgId)) {
			return res.status(403).json({
				status: "Forbidden Request",
				message: `You are not allowed to access ${org.name}`,
				statusCode: 403,
			});
		}

		const user = await User.findByPk(userId);
		org.addUser(user);

		res.status(200).json({
			status: "success",
			message: "User added to organisation successfully",
		});
	} catch (error) {
		res.status(400).json({
			status: "Bad Request",
			message: error.message,
			statusCode: 400,
		});
	}
};
