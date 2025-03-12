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

const Plant = require("./models/plant.js");
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  res.render("index.ejs");
});
// GET /plants
app.get("/plants", async (req, res) => {
  const allPlants = await Plant.find();
  console.log(allPlants); // log the plants!
  res.render("plants/index.ejs", { plants: allPlants });
});

app.get("/plants/new", (req, res) => {
  res.render("plants/new.ejs");
});

app.get("/plants/:plantId/edit", async (req, res) => {
  const foundPlant = await Plant.findById(req.params.plantId);
  res.render("plants/edit.ejs", { plant: foundPlant });
});

app.get("/plants/:plantId", async (req, res) => {
  const foundPlant = await Plant.findById(req.params.plantId);
  res.render("plants/show.ejs", { plant: foundPlant });
});

app.put("/plants/:plantId", async (req, res) => {
  console.log(req.params.plantId, req.body);
  await Plant.findByIdAndUpdate(req.params.plantId, req.body);
  res.redirect(`/plants/${req.params.plantId}`);
});

app.delete("/plants/:plantId", async (req, res) => {
  await Plant.findByIdAndDelete(req.params.plantId);
  res.redirect("/plants");
});

app.post("/plants", async (req, res) => {
  await Plant.create(req.body);
  res.redirect("/plants");
});

app.listen(8000, () => {
  console.log("Listening on port 8000");
});
