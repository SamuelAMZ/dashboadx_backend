const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// routes
const loginRoute = require("./routes/auth/login");
const twoFaPage = require("./routes/auth/2faPage");
const verifyTwoFaRoute = require("./routes/auth/verifyFa");
const verifyPagesRoute = require("./routes/auth/verifyPages");

// body parsing
app.use(express.json());

// cookies
app.use(cookieParser());

// cors
app.use(
  cors({
    origin: process.env.DOMAIN,
    credentials: true,
    optionSuccessStatus: 200,
  })
);

// set headers globally
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": process.env.DOMAIN,
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Origin, Content-Type, Accept",
  });
  next();
});

// connect mongoose
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URI, {}, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to db");
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Server up");
});

// login
app.use("/api/login", loginRoute);
// 2fa page check
app.use("/api/twofapage", twoFaPage);
// verify 2fa code
app.use("/api/twofacode", verifyTwoFaRoute);
// verify pages
app.use("/api/verifypages", verifyPagesRoute);

app.listen(process.env.PORT, () =>
  console.log(`app listen on port ${process.env.PORT}`)
);
