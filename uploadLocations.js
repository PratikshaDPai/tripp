const dotenv = require("dotenv"); // require package
dotenv.config();
const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Location = require("./models/location");

// MongoDB connection
const port = process.env.PORT ? process.env.PORT : "3000";
// Connect to MongoDB using the connection string in the .env file
mongoose.connect(process.env.MONGODB_URI);
// log connection status to terminal on start
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
// Path to your CSV file
const csvFilePath = "./locations.csv";

const uploadLocations = () => {
  const locations = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      const name = row.name ? row.name.trim() : null;
      const lat = row.lat ? parseFloat(row.lat) : null;
      const lng = row.lng ? parseFloat(row.lng) : null;

      const location = { name };

      // Only include coordinates if both lat & lng are valid numbers
      if (!isNaN(lat) && !isNaN(lng)) {
        location.coordinates = { lat, lng };
      }

      // Handle other optional fields safely
      if (row.type) location.type = row.type.trim();
      if (row.city) location.city = row.city.trim();
      if (row.country) location.country = row.country.trim();
      if (row.continent) location.continent = row.continent.trim();

      locations.push(location);
    })
    .on("end", async () => {
      try {
        for (const loc of locations) {
          if (!loc.name) {
            console.warn("Skipping entry with missing name:", loc);
            continue; // Skip invalid entries
          }

          const existingLocation = await Location.findOne({ name: loc.name });

          if (!existingLocation) {
            await Location.create(loc);
            console.log(`Added location: ${loc.name}`);
          } else {
            console.log(`Location already exists: ${loc.name}`);
          }
        }
        console.log("Locations uploaded successfully");
      } catch (err) {
        console.log("Error inserting locations:", err);
      }
      mongoose.connection.close(); // Close the DB connection after the insert
    });
};

// Start Uploading Locations
uploadLocations();
