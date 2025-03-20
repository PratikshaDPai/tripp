const express = require("express");
const router = express.Router();
const Trip = require("../models/trip");
const Activity = require("../models/activity");
const Location = require("../models/location");

// Search Trips
router.get("/", async (req, res) => {
  const query = req.query.q || "";
  res.render("search", { results: [], query });
});

// Search results
router.get("/results", async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const trips = await Trip.find({
      "days.name": { $regex: searchQuery, $options: "i" },
    });

    const results = [];
    for (const trip of trips) {
      const matchingDays = trip.days.filter((day) =>
        day.name.match(new RegExp(searchQuery, "i"))
      );
      matchingDays.forEach((day) => results.push({ trip, day }));
    }

    res.render("search", { results });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error during search");
  }
});

// Search locations
router.get("/locations/:locationId", async (req, res) => {
  const locationId = req.params.locationId;
  const results = await Activity.find({ location: locationId });
  const location = await Location.findById(locationId);

  res.render("searchLocation", { results, location });
});

module.exports = router;
