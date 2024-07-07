const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const Organisation = require("./orgModel");

// Connecting to DB
const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT } = process.env;
const sequelize = new Sequelize(
	`postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {logging: false}
);

const User = sequelize.define(
	"User",
	{
		userId: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			unique: true,
			validate: {
				async isUnique(value) {
					const user = await User.findOne({ where: { userId: value } });
					if (user) throw new Error("UserId is not unique. Please try again!");
				},
			},
			primaryKey: true,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: { isAlpha: true, notEmpty: true },
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: { isAlpha: true, notEmpty: true },
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
				async isUnique(value) {
					const user = await User.findOne({ where: { email: value } });
					if (user) throw new Error("Email must be unique!");
				},
			},
		},
		password: { type: DataTypes.STRING, allowNull: false },
		phone: { type: DataTypes.STRING },
	},
	{
		createdAt: false,
		timestamps: false,
		updatedAt: false,
		hooks: {
			beforeCreate: async (user) => {
				user.password = await bcrypt.hash(
					user.password,
					+process.env.PS_SALT_ROUNDS
				);
			},
			afterCreate: async (user) => {
				const organisation = await Organisation.create({
					name: user.firstName,
					description: `The organisation of ${user.firstName}`,
				});
				await organisation.addUser(user);
			},
		},
		defaultScope: {
			attributes: { exclude: ["password"] },
		},
		scopes: { withPassword: { attributes: { include: ["password"] } } },
	}
);

User.prototype.verifyPassword = async function (raw_password) {
	const hash = this.password;
	const isValid = await bcrypt.compare(raw_password, hash);
	return isValid;
};

module.exports = User;
