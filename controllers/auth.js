const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
// NOTE: there are no routes here yet

router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});
// the router object is similar to the app object in server js
// however, it only has router functionality

router.post("/sign-up", async (req, res) => {
  // check if the user exists - NO DUPLICATE USERNAMES
  const userInDatabase = await User.findOne({ username: req.body.username });
  if (userInDatabase) {
    return res.send("Username already taken");
  }

  // check if the password and confirm password are a match
  if (req.body.password !== req.body.confirmPassword) {
    return res.send("Password and Confirm password do not match!");
  }

  // create encrypted version of plain-text password (hashed and salted)
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.body.password = hashedPassword;

  const user = await User.create(req.body);
  res.send(`Thanks for signing up ${user.username}`);
});

// GET /sign-in: send a page that has a login form
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

// POST /sign-in - route that will be used when login form
// is submitted
router.post("/sign-in", async (req, res) => {
  const userInDatabase = await User.findOne({
    username: req.body.username,
  });

  if (!userInDatabase) {
    return res.send("Login Failed. Please try again!");
  }
  // bycrypt's comparison function
  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  );

  if (!validPassword) {
    return res.send("Login Failed. Please try again!");
  }

  // at this point, we've made it past verification
  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id,
  };

  console.log(req.session);

  res.redirect("/");
});

router.get("/sign-out", (req, res) => {
  req.session.destroy();
  // destroying the session object "ends" the login session
  res.redirect("/"); // return home after logout
});

module.exports = router;
