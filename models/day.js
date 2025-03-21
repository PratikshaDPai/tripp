const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
  ],
  cost: Number,
  description: { type: String, required: true },
  image: String,
  notes: String,
});

const Day = mongoose.model("Day", daySchema);
module.exports.Day = Day;
module.exports.daySchema = daySchema;
