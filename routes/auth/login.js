const express = require("express");
const loginRoute = express.Router();
const axios = require("axios");
require("dotenv").config();

loginRoute.post("/", async (req, res) => {
  const { captcha } = req.body;

  //   validate
  const Joi = require("@hapi/joi");
  const schema = Joi.object({
    captcha: Joi.string(),
  });

  try {
    const validation = await schema.validateAsync({
      captcha,
    });
  } catch (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  console.log(req.body);

  // check captacha is valid
  let secretKey = process.env.CAPTCHA_SECRET;
  let captchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
  axios
    .get(captchaUrl)
    .then((res) => {
      if (res.data.success !== true) {
        return res.status(400).json({ message: "erreur" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: "erreur" });
    });

  return res.status(200).json({ message: "good" });
});

module.exports = loginRoute;
