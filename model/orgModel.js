const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

// Connecting to DB
const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT } = process.env;
const sequelize = new Sequelize(
	`postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
	{ logging: false }
);

const Organisation = sequelize.define(
	"Organisation",
	{
		orgId: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			unique: true,
			validate: {
				async isUnique(value) {
					const org = await Organisation.findOne({ where: { orgId: value } });
					if (org)
						throw new Error("orgId is not unique. Please try once more!");
				},
			},
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			set(firstName) {
				if (!firstName) throw new Error("name not valid");
				this.setDataValue("name", `${firstName.trim()}'s Organisation`);
			},
			validate: { notEmpty: true },
		},
		description: { type: DataTypes.TEXT, allowNull: false },
	},
	{ createdAt: false, timestamps: false, updatedAt: false }
);

module.exports = Organisation;
