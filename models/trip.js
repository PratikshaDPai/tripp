const mongoose = require("mongoose");
const { daySchema } = require("./day.js");

const tripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  days: [daySchema],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
});

const Trip = mongoose.model("Trip", tripSchema);
module.exports = Trip;
