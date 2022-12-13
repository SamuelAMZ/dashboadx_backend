const express = require("express");
const verifyTwoFaRoute = express.Router();
require("dotenv").config();

// models
const twoFa = require("../../models/2fa");

verifyTwoFaRoute.post("/", async (req, res) => {
  // get code from req
  const { code } = req.body;
  // validate
  const Joi = require("@hapi/joi");
  const schema = Joi.object({
    code: Joi.string().required().min(10),
  });

  try {
    const validation = await schema.validateAsync({
      code,
    });
  } catch (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  // search for the code in the db
  const foundedCode = await twoFa.findOne({ temp_code: code });

  if (!foundedCode) {
    return res.status(400).json({ message: "code not valid", code: "bad" });
  }

  // see if code is not expired
  const isExpired = () => {
    const is = new Date().getTime() - foundedCode.time;
    if (is / 1000 > 5000) {
      return true;
    } else {
      return false;
    }
  };
  if (isExpired()) {
    return res.status(400).json({ message: "code not valid", code: "bad" });
  }
  // success
  return res.status(200).json({ message: "good", code: "ok" });
});

module.exports = verifyTwoFaRoute;
