const express = require("express");
const router = express.Router();
const Trip = require("../models/trip");
const { Day } = require("../models/day");
const User = require("../models/user");

// Middleware for authentication
const authMiddleware = async (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth");
  }

  res.locals.trips = await Trip.find({ users: req.session.user });
  next();
};

router.use(authMiddleware);

// GET all trips
router.get("/", async (req, res) => {
  res.render("trips/index");
});

// GET new trip form
router.get("/new", (req, res) => {
  res.render("trips/new");
});

router.param("tripId", async (req, res, next) => {
  const userId = req.session.user;
  const tripId = req.params.tripId;
  const tripExists = await Trip.exists({ _id: tripId, users: userId });
  if (tripExists) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
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

router.get("/:tripId/share", async (req, res) => {
  const trip = await Trip.findById(req.params.tripId);
  const usersNotInTrip = await User.find({ _id: { $nin: trip.users } });
  res.render("trips/share", { usersNotInTrip, trip });
});

router.post("/:tripId/share", async (req, res) => {
  const { tripId } = req.params;
  const { users } = req.body;

  if (!users || users.length === 0) {
    return res.status(400).send("No users selected.");
  }

  const userIds = Array.isArray(users) ? users : [users];

  await Trip.findByIdAndUpdate(
    tripId,
    { $addToSet: { users: { $each: userIds } } } // avoid duplicates
  );

  res.redirect(`/trips/${tripId}`);
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
  const userId = req.session.user;
  await Trip.create({ users: [userId], ...req.body });
  res.redirect("/trips");
});

router.get("/:tripId/days/new", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  res.render("days/new.ejs", { trip: foundTrip });
});

router.get("/:tripId/days/:dayId/edit", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  const foundDay = foundTrip.days.id(req.params.dayId);
  res.render("days/edit.ejs", { day: foundDay, trip: foundTrip });
});

router.get("/:tripId/days/:dayId", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId).populate(
    "days.location"
  );
  const foundDay = foundTrip.days.id(req.params.dayId);
  res.render("days/show.ejs", {
    day: foundDay,
    trip: foundTrip,
    location: foundDay.location,
  });
});

router.put("/:tripId/days/:dayId", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  const foundDay = foundTrip.days.id(req.params.dayId);
  foundDay.set(req.body);
  await foundTrip.save();
  res.redirect(`/trips/${req.params.tripId}/days/${req.params.dayId}`);
});

router.delete("/:tripId/days/:dayId", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  const foundDay = foundTrip.days.id(req.params.dayId);
  foundTrip.days.remove(foundDay);
  await foundTrip.save();
  res.redirect(`/trips/${req.params.tripId}`);
});

router.post("/:tripId/days", async (req, res) => {
  const day = await Day.create(req.body);
  const trip = await Trip.findById(req.params.tripId);
  trip.days.push(day);
  await trip.save();
  res.redirect(`/trips/${req.params.tripId}`);
});

module.exports = router;
