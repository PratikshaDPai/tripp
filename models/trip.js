const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
});

const tripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  days: [daySchema],
});

const Trip = mongoose.model("Trip", tripSchema);
module.exports = Trip;
