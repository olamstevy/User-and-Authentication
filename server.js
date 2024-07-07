require("dotenv").config();
const server = require("./app");
const { Sequelize } = require("sequelize");

// Connect to postgres db
const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT, PORT } =
	process.env;
const sequelize = new Sequelize(
	`postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
);

// Checking connection to postgres db
sequelize
	.authenticate()
	.then(() => console.log("Connection established sucessfully"))
	.catch((error) => console.error("Unable to connect to the database:", error));

server.listen(PORT, () => {
	console.log(`Listening at port: ${PORT}`);
});
