require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");

const app = express();
const port = process.env.PORT || 8000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
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

// Middleware to pass user and trips globally to all views
const Trip = require("./models/trip.js");
app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  try {
    res.locals.trips = await Trip.find().populate("days");
  } catch (error) {
    res.locals.trips = [];
  }
  next();
});

// Import route handlers
const authRoutes = require("./controllers/auth");
const tripRoutes = require("./routes/tripRoutes");
const searchRoutes = require("./routes/searchRoutes");
const sidebarMiddleware = require("./middleware/sidebar");

// Use routes
app.use("/auth", authRoutes);
app.use("/trips", tripRoutes);
app.use("/search", searchRoutes);
app.use(sidebarMiddleware);

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
const { resourceLimits } = require("worker_threads");

app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

app.use(isSignedIn);
app.use(passUserToView);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
