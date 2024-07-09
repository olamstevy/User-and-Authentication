const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoute");
const apiRouter = require("./routes/apiRoute");
const morgan = require("morgan");

const app = express();

app.use(morgan("common"));
app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
	console.log({ body: req.body, params: req.params, url: req.url });
	next();
});
app.use("/auth", authRouter);
app.use("/api", apiRouter);

module.exports = app;
