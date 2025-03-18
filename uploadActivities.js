const dotenv = require("dotenv"); // require package
dotenv.config();
const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Activity = require("./models/activity"); // Import your Activity model

const port = process.env.PORT ? process.env.PORT : "3000";
// Connect to MongoDB using the connection string in the .env file
mongoose.connect(process.env.MONGODB_URI);
// log connection status to terminal on start
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
// Path to your CSV file
const csvFilePath = "./activities.csv"; // Adjust the path accordingly

// Parse the CSV file and upload activities to the database
const uploadActivities = () => {
  const activities = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      // Assuming the CSV has columns: location,imageUrl, title, and cost
      const activity = {
        location: row.location,
        imageUrl: row.imageUrl, // Adjust the column names based on your CSV file
        title: row.title,
        cost: parseFloat(row.cost), // Convert the cost to a number
      };
      activities.push(activity);
    })
    .on("end", async () => {
      try {
        // Insert the activities into the database
        await Activity.insertMany(activities);
        console.log("Activities uploaded successfully");
      } catch (err) {
        console.log("Error inserting activities:", err);
      }
      mongoose.connection.close(); // Close the DB connection after the insert
    });
};

// Start uploading the activities
uploadActivities();
