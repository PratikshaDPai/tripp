const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
  ],
  description: { type: String, required: true },
  image: String,
});

const Day = mongoose.model("Day", daySchema);
module.exports.Day = Day;
module.exports.daySchema = daySchema;
