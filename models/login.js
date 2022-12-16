const mongoose = require("mongoose");

const login = new mongoose.Schema({
  pub_key: {
    type: String,
    required: true,
    min: 4,
    max: 255,
  },
  pri_key: {
    type: String,
    required: true,
    min: 4,
    max: 255,
  },
  access: {
    type: String,
    required: true,
    min: 4,
    max: 255,
  },
});

module.exports = mongoose.model("login", login);
