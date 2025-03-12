const dotenv = require("dotenv"); // require package
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");
const app = express();

// Connect to MongoDB using the connection string in the .env file
mongoose.connect(process.env.MONGODB_URI);
// log connection status to terminal on start
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

const Trip = require("./models/trip.js");
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

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
  res.render("trips/show.ejs", { trip: foundTrip });
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

app.listen(8000, () => {
  console.log("Listening on port 8000");
});
