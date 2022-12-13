const express = require("express");
const loginRoute = express.Router();
const axios = require("axios");
require("dotenv").config();
const crypto = require("crypto");

// models
const login = require("../../models/login");
const twoFa = require("../../models/2fa");

loginRoute.post("/", async (req, res) => {
  const { pubKey, priKey, access, captcha } = req.body;

  //   validate
  const Joi = require("@hapi/joi");
  const schema = Joi.object({
    pubKey: Joi.string().required().min(10),
    priKey: Joi.string().required().min(10),
    access: Joi.string().required().min(10),
    // captcha: Joi.string(),
  });

  try {
    const validation = await schema.validateAsync({
      pubKey,
      priKey,
      access,
      // captcha,
    });
  } catch (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  // check captacha is valid
  // let secretKey = process.env.CAPTCHA_SECRET;
  // let captchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
  // axios
  //   .get(captchaUrl)
  //   .then((res) => {
  //     if (res.data.success !== true) {
  //       return res.status(400).json({ message: "error", code: "bad" });
  //     }
  //   })
  //   .catch((err) => {
  //     return res.status(500).json({ message: "error", code: "bad" });
  //   });

  // check from db for the creadentials
  const loginDetails = await login.findOne({ pub_key: pubKey });

  if (!loginDetails) {
    return res.status(400).json({ message: "error", code: "bad" });
  }

  if (
    loginDetails.pub_key === pubKey &&
    loginDetails.pri_key === priKey &&
    loginDetails.access === access
  ) {
    // create hash plus a time stamp
    const tempHash = crypto
      .createHash("sha256")
      .update(String(Math.random()), "utf-8")
      .digest("hex");
    // create code (hash)
    const code = crypto
      .createHash("sha256")
      .update(String(Math.random()), "utf-8")
      .digest("hex");

    // store it in the 2fa col
    const newTwoFa = new twoFa({
      temp_hash: tempHash,
      temp_code: code,
      time: new Date().getTime(),
      loginId: loginDetails._id,
    });

    try {
      await newTwoFa.save();
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "something wrong backend", code: "bad" });
    }
    // add hash to cookie client
    res.cookie("TWOFAHASH", tempHash, {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res
      .status(200)
      .json({ message: "good", payload: { tempHash: tempHash }, code: "ok" });
  }

  return res.status(400).json({ message: "something wrong", code: "bad" });
});

module.exports = loginRoute;
