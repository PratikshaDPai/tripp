const dotenv = require("dotenv"); // require package
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");
const app = express();
const session = require("express-session");
// Initialize models
const User = require("./models/user.js");

const authController = require("./controllers/auth");

const port = process.env.PORT ? process.env.PORT : "8000";

// Connect to MongoDB using the connection string in the .env file
mongoose.connect(process.env.MONGODB_URI);
// log connection status to terminal on start
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

const Trip = require("./models/trip.js");
const { Day } = require("./models/day.js");
const Activity = require("./models/activity.js");
app.set("view engine", "ejs");
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

const authMiddleware = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/auth/sign-up"); // Redirect to sign-in page
  }
  next(); // User is authenticated, proceed to the next middleware
};

app.get("/unauthorized", (req, res) => {
  res.render("unauthorized.ejs");
});

const isSignedIn = require("./middleware/isSignedin.js");
const passUserToView = require("./middleware/passUserToView.js");

app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

app.use(isSignedIn);
app.use(passUserToView);

app.get("/search", (req, res) => {
  const query = req.params.q ?? "";
  res.render("searchLocation", { results: [], query }); // Initial empty search results
});

app.get("/search/results", async (req, res) => {
  const searchQuery = req.query.q; // Get the search query
  try {
    // Search for trips that contain days matching the search query
    const trips = await Trip.find({
      "days.name": { $regex: searchQuery, $options: "i" }, // search within days.name (can add more fields)
    }).exec();

    // Now we need to filter out days that match the search query
    const results = [];
    for (const trip of trips) {
      const matchingDays = trip.days.filter(
        (day) => day.name.match(new RegExp(searchQuery, "i")) // filter days based on the name match
      );
      matchingDays.forEach((day) => results.push({ trip, day }));
    }

    // Render the results on the search page
    res.render("search", { results });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error during search");
  }
});

app.get("/search/locations", async (req, res) => {
  const searchQuery = req.query.q; // Get the search query from the URL parameterconst searchQuery = "paris"; // Example search string

  const results = await Activity.aggregate([
    {
      $match: {
        location: { $regex: searchQuery, $options: "i" }, // Match location containing the search query (case-insensitive)
      },
    },
    {
      $group: {
        _id: "$location", // Group by the location field
        activities: {
          $push: {
            title: "$title",
            imageUrl: "$imageUrl",
            cost: "$cost",
          },
        },
      },
    },
    {
      $project: {
        _id: 0, // Remove the _id field
        location: "$_id", // Rename _id to location
        activities: 1, // Keep the activities array
      },
    },
  ]);

  console.log(results);

  res.render("searchLocation", { results, query: searchQuery });
});

// GET /trips
app.get("/trips", authMiddleware, async (req, res) => {
  const allTrips = await Trip.find(); // TODO: find trips for a particular user
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

app.listen(port, () => {
  console.log("Listening on port 8000");
});
