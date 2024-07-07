const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { Sequelize, DataTypes } = require("sequelize");
const User = require("./userModel.js");
const Organisation = require("./orgModel.js");

// Connecting to DB
const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT } = process.env;
const sequelize = new Sequelize(
	`postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {logging: false}
);

const UserOrganisation = sequelize.define(
	"UserOrganisation",
	{},
	{ createdAt: false, timestamps: false, updatedAt: false }
);

User.belongsToMany(Organisation, { through: UserOrganisation });
Organisation.belongsToMany(User, { through: UserOrganisation });

module.exports = { User, Organisation };
