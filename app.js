const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoute");
const apiRouter = require("./routes/apiRoute");
// const morgan = require("morgan");

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(["/auth", "/api/auth"], authRouter);
app.use("/api", apiRouter);
app.use((req, res) => {
	res.status(404).json({ status: "Not Found" });
});

module.exports = app;
