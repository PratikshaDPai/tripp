const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  res.render("auth/auth");
});
// the router object is similar to the app object in server js
// however, it only has router functionality

router.post("/sign-up", async (req, res) => {
  try {
    console.log("Received sign-up data:", req.body); // Debugging

    const { username, password, confirmPassword } = req.body;

    // Check if username is taken
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.render("auth/auth", {
        loginError: { message: "Username already taken" },
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render("auth/auth", {
        loginError: { message: "Password and Confirm password do not match!" },
      });
    }

    // Hash the password asynchronously
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: "regular-user", // Default role
    });

    console.log("User created successfully:", newUser);

    // Authenticate the user immediately after sign-up (same as sign-in)
    req.session.user = {
      username: newUser.username,
      _id: newUser._id,
    };

    console.log("User signed in automatically:", req.session);

    // Redirect to homepage (or dashboard) after successful signup
    res.redirect("/");
  } catch (error) {
    console.error("Signup error:", error);
    res.send("Error during signup. Please try again.");
  }
});

// POST /sign-in - route that will be used when login form
// is submitted
router.post("/sign-in", async (req, res) => {
  const userInDatabase = await User.findOne({
    username: req.body.username,
  });

  if (!userInDatabase) {
    return res.render("auth/auth", {
      loginError: {
        message: "Invalid username or password",
        field: "username", // or 'password', or both
      },
    });
  }
  // bycrypt's comparison function
  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  );

  if (!validPassword) {
    return res.render("auth/auth", {
      loginError: {
        message: "Invalid username or password",
        field: "username", // or 'password', or both
      },
    });
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
