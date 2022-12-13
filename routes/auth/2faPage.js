const express = require("express");
const twoFaPageRoute = express.Router();

// models
const twoFa = require("../../models/2fa");

twoFaPageRoute.post("/", async (req, res) => {
  const { hash } = req.body;

  //   validate
  const Joi = require("@hapi/joi");
  const schema = Joi.object({
    hash: Joi.string().required().min(10),
  });

  try {
    const validation = await schema.validateAsync({
      hash,
    });
  } catch (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  // check if hash match cookie
  if (req.cookies.TWOFAHASH !== hash) {
    return res.status(400).json({ message: "need to login", code: "bad" });
  }
  // check if hash found in db
  const hashFound = await twoFa.findOne({ temp_hash: hash });
  if (!hashFound) {
    return res.status(400).json({ message: "need to login", code: "bad" });
  }
  // check if time of the found match is still not expired
  const isExpired = () => {
    const is = new Date().getTime() - hashFound.time;
    if (is / 1000 > 5000) {
      return true;
    } else {
      return false;
    }
  };
  if (isExpired()) {
    return res
      .status(400)
      .json({ message: "need to login hash expired", code: "bad" });
  }
  // send a ok message back
  return res.status(200).json({ message: "good", code: "ok" });
});

module.exports = twoFaPageRoute;
