const dotenv = require("dotenv"); // require package
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");
const app = express();
const session = require("express-session");
const authController = require("./controllers/auth");

// Connect to MongoDB using the connection string in the .env file
mongoose.connect(process.env.MONGODB_URI);
// log connection status to terminal on start
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

const Trip = require("./models/trip.js");
const { Day } = require("./models/day.js");
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/auth", authController);

app.get("/", async (req, res) => {
  res.render("index.ejs");
});
// GET /trips
app.get("/trips", async (req, res) => {
  const allTrips = await Trip.find();
  console.log(allTrips); // log the trips!
  res.render("trips/index.ejs", { trips: allTrips });
});

app.get("/trips/new", (req, res) => {
  res.render("trips/new.ejs");
});

app.get("/trips/:tripId/edit", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  res.render("trips/edit.ejs", { trip: foundTrip });
});

app.get("/trips/:tripId", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  res.render("days/index.ejs", { days: foundTrip.days, trip: foundTrip });
});

app.put("/trips/:tripId", async (req, res) => {
  console.log(req.params.tripId, req.body);
  await Trip.findByIdAndUpdate(req.params.tripId, req.body);
  res.redirect(`/trips/${req.params.tripId}`);
});

app.delete("/trips/:tripId", async (req, res) => {
  await Trip.findByIdAndDelete(req.params.tripId);
  res.redirect("/trips");
});

app.post("/trips", async (req, res) => {
  await Trip.create(req.body);
  res.redirect("/trips");
});

app.get("/trips/:tripId/new", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  res.render("days/new.ejs", { trip: foundTrip });
});

app.get("/trips/:tripId/:dayId/edit", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  const foundDay = foundTrip.days.id(req.params.dayId);
  res.render("days/edit.ejs", { day: foundDay, trip: foundTrip });
});

app.get("/trips/:tripId/:dayId", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  const foundDay = foundTrip.days.id(req.params.dayId);
  res.render("days/show.ejs", { day: foundDay, trip: foundTrip });
});

app.put("/trips/:tripId/:dayId", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  const foundDay = foundTrip.days.id(req.params.dayId);
  foundDay.set(req.body);
  await foundTrip.save();
  res.redirect(`/trips/${req.params.tripId}/${req.params.dayId}`);
});

app.delete("/trips/:tripId/:dayId", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);
  const foundDay = foundTrip.days.id(req.params.dayId);
  foundTrip.days.remove(foundDay);
  await foundTrip.save();
  res.redirect(`/trips/${req.params.tripId}`);
});

app.post("/trips/:tripId", async (req, res) => {
  const day = await Day.create(req.body);
  const trip = await Trip.findById(req.params.tripId);
  trip.days.push(day);
  await trip.save();
  res.redirect(`/trips/${req.params.tripId}`);
});

app.listen(8000, () => {
  console.log("Listening on port 8000");
});
