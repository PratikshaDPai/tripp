const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
});

const Day = mongoose.model("Day", daySchema);
module.exports.Day = Day;
module.exports.daySchema = daySchema;
