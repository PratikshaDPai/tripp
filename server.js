require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const Location = require("./models/location");

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

app.get("/search-location", async (req, res) => {
  const query = req.query.q;

  try {
    const results = await Location.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { city: { $regex: query, $options: "i" } },
            { country: { $regex: query, $options: "i" } },
            { continent: { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $addFields: {
          score: {
            $cond: {
              if: {
                $regexMatch: { input: "$name", regex: query, options: "i" },
              },
              then: 4, // Highest weight for name
              else: {
                $cond: {
                  if: {
                    $regexMatch: { input: "$city", regex: query, options: "i" },
                  },
                  then: 3,
                  else: {
                    $cond: {
                      if: {
                        $regexMatch: {
                          input: "$country",
                          regex: query,
                          options: "i",
                        },
                      },
                      then: 2,
                      else: 1, // Lowest weight for continent
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $sort: { score: -1 } }, // Sort by relevance score
      { $limit: 10 }, // Get top 10 matches
    ]);
    res.json(results);
  } catch (error) {
    console.error("Error in location search:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
