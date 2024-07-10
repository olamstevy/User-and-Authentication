const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoute");
const apiRouter = require("./routes/apiRoute");
// const morgan = require("morgan");

const app = express();

// app.use(morgan("common"));
app.use(cookieParser());
app.use(express.json());

// app.use((req, res, next) => {
// 	console.log({ body: req.body, params: req.params, url: req.url });
// 	console.log("\n\n\n\n ----------------");
// 	next();
// });
app.use(["/auth", "/api/auth"], authRouter);
app.use("/api", apiRouter);
app.use((req, res) => {
	res.status(404).json({ status: "Not Found" });
});

module.exports = app;
