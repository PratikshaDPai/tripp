const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
});

const Trip = mongoose.model("Trip", tripSchema);
module.exports = Trip;
