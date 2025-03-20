const Trip = require("../models/trip");

module.exports = async (req, res, next) => {
  try {
    res.locals.trips = await Trip.find().populate("days");
  } catch (error) {
    console.error("Error fetching trips(sidebar):", error);
    res.locals.trips = [];
  }
  next();
};
