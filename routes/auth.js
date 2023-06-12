const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// router in express
const router = express.Router();

// getting the middleware
const fetchUser = require("../middleware/fetchUser");
// create user POST: api/auth/signup
// does not require auth
router.post(
  "/signup",
  [
    body("firstName", "Please enter a valid name").isLength({ min: 3 }),
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Please enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }
    try {
      const { username, firstName, lastName, email, password } = req.body;
      const foundUser = await User.findOne({ email }).exec();
      if (foundUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // generating sal
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(password, salt);

      User.create({
        username,
        firstName,
        lastName,
        email,
        password: securePassword,
      })
        .then((user) => {
          const data = {
            user: {
              id: user.id,
            },
          };
          const authToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);

          //   creating secure cookie with refresh token
          res.cookie("jwt", authToken, {
            httpOnly: true, // only accessbile by browser
            secure: true, //https
            sameSite: "None", //cross-browser
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days validity of a refresh token. 1000ms=1s 1s*60= 1min, 1min*60=1hr, 1hr*24=1d, 1*7=7d
          });

          console.log(
            res.cookie("jwt", authToken, {
              httpOnly: true, // only accessbile by browser
              secure: true, //https
              sameSite: "None", //cross-browser
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days validity of a refresh token. 1000ms=1s 1s*60= 1min, 1min*60=1hr, 1hr*24=1d, 1*7=7d
            }),
            "hello"
          );

          res.status(200).json({ authToken });
        })
        .catch((err) => res.status(401).json({ error: err?.message }));
    } catch (err) {
      res.status(503).json({ message: "Interval Server Error" });
      console.log(err);
    }
  }
);

// login user POST: api/auth/login
// does not require auth
router.post(
  "/login",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Please enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }
    const { email, password } = req.body;

    try {
      const foundUser = await User.findOne({ email }).exec();
      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const match = await bcrypt.compare(password, foundUser.password);

      if (!match) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const data = {
        user: {
          id: foundUser.id,
        },
      };
      const authToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);

      //   creating secure cookie with refresh token
      res.cookie("jwt", authToken, {
        httpOnly: true, // only accessbile by browser
        secure: true, //https
        sameSite: "None", //cross-browser
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days validity of a refresh token. 1000ms=1s 1s*60= 1min, 1min*60=1hr, 1hr*24=1d, 1*7=7d
      });

      res.status(200).json({ authToken });
    } catch (err) {
      console.log(err);
      res.status(503).json({ message: "Interval Server Error" });
    }
  }
);

// login user details POST: api/auth/getuser
// login required
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const foundUser = await User.findById(userId).select("-password");
    if (!foundUser) {
      return res.status(401).json({ message: "User Not Found" });
    }

    res.status(200).json({ user: foundUser });
  } catch (err) {
    console.log(err);
    res.status(503).json({ message: "Interval Server Error" });
  }
});

module.exports = router;
