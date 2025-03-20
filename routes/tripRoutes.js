const express = require("express");
const router = express.Router();
const Trip = require("../models/trip");

// Middleware for authentication
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth");
  }
  next();
};

// GET all trips
router.get("/", authMiddleware, async (req, res) => {
  const trips = await Trip.find();
  res.render("trips/index", { trips });
});

// GET new trip form
router.get("/new", (req, res) => {
  res.render("trips/new");
});

// GET edit trip form
router.get("/:tripId/edit", async (req, res) => {
  const trip = await Trip.findById(req.params.tripId);
  res.render("trips/edit", { trip });
});

// GET a specific trip
router.get("/:tripId", async (req, res) => {
  const trip = await Trip.findById(req.params.tripId);
  res.render("days/index", { trip, days: trip.days });
});

// PUT update a trip
router.put("/:tripId", async (req, res) => {
  await Trip.findByIdAndUpdate(req.params.tripId, req.body);
  res.redirect(`/trips/${req.params.tripId}`);
});

// DELETE a trip
router.delete("/:tripId", async (req, res) => {
  await Trip.findByIdAndDelete(req.params.tripId);
  res.redirect("/trips");
});

// POST create a new trip
router.post("/", async (req, res) => {
  await Trip.create(req.body);
  res.redirect("/trips");
});

module.exports = router;
