const mongoose = require("mongoose");

const twoFa = new mongoose.Schema({
  temp_hash: {
    type: String,
    required: true,
    unique: true,
    min: 4,
    max: 255,
  },
  temp_code: {
    type: String,
    required: true,
    unique: true,
    min: 4,
    max: 255,
  },
  time: {
    type: Date,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("two_fa", twoFa);