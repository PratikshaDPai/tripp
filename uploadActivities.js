const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Activity = require("./models/activity");
const Location = require("./models/location");

const port = process.env.PORT || "3000";

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Path to CSV
const csvFilePath = "./activities.csv";

// Upload Activities
const uploadActivities = async () => {
  const activities = [];
  const locationLookups = []; // Store location lookup promises

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      // Create lookup promise but don't await it inside the loop
      const lookupPromise = Location.findOne({ name: row.location }).then(
        (location) => ({
          location: location ? location._id : null,
          imageUrl: row.imageUrl,
          title: row.title,
          cost: parseFloat(row.cost),
        })
      );
      locationLookups.push(lookupPromise);
    })
    .on("end", async () => {
      try {
        const resolvedActivities = await Promise.all(locationLookups); // Wait for all lookups to complete
        await Activity.insertMany(resolvedActivities);
        console.log("Activities uploaded successfully");
      } catch (err) {
        console.error("Error inserting activities:", err);
      } finally {
        mongoose.connection.close(); // Close DB connection
      }
    });
};

// Start Upload
uploadActivities();
