const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  coordinates: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  type: { type: String, required: false, trim: true },
  city: { type: String, required: false, trim: true },
  country: { type: String, required: false, trim: true },
  continent: { type: String, required: false, trim: true },
});

const Location = mongoose.model("Location", locationSchema);
module.exports = Location;
