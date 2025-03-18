const mongoose = require("mongoose");

// Define the schema for an activity
const activitySchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
});

// Create a model based on the schema
const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
