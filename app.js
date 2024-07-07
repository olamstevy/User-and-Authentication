const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoute");
const apiRouter = require("./routes/apiRoute");

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/api", apiRouter);

module.exports = app;
