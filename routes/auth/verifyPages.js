const express = require("express");
const verifyPagesRoute = express.Router();
require("dotenv").config();

// jwt
const jwt = require("jsonwebtoken");

// models
const login = require("../../models/login");

verifyPagesRoute.get("/", async (req, res) => {
  // get the cookies
  const uToken = req.cookies.uToken;
  // check if cookie uToken is present or send rerror
  if (!uToken) {
    return res.status(400).json({ message: "not login", code: "bad" });
  }
  // decode the jwt
  jwt.verify(uToken, process.env.JWT_U_SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(400).json({ message: "not login", code: "bad" });
    }
    // see if login is found in db
    const foundedUser = await login.findById(decodedToken.id);

    if (!foundedUser) {
      return res.status(400).json({ message: "not login", code: "bad" });
    }
    // send success
    return res.status(200).json({ message: "user login", code: "ok" });
  });
});

module.exports = verifyPagesRoute;
