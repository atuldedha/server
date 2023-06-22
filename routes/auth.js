const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// router in express
const router = express.Router();

// getting the middleware
const fetchUser = require("../middleware/fetchUser");
const FreeSearchesPerUser = require("../models/FreeSearchesPerUser");
const FreeSeachesLeft = require("../models/FreeSeachesLeft");
// create user POST: api/auth/signup
// does not require auth
router.post(
  "/signup",
  [
    body(
      "firstName",
      "First name field must be more than 3 character's"
    ).isLength({ min: 3 }),
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password must be more than 5 character's").isLength({
      min: 5,
    }),
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
        return res
          .status(400)
          .json({ message: "Email already exists, please login" });
      }

      // generating sal
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(password, salt);

      const freeSearchesPerUser = await FreeSearchesPerUser.findById(
        "649206bea2c4247b2a8ff0e7"
      ).exec();

      User.create({
        username,
        firstName,
        lastName,
        email,
        password: securePassword,
      })
        .then(async (user) => {
          const data = {
            user: {
              id: user.id,
            },
          };

          await FreeSeachesLeft.create({
            userid: user.id,
            freeSearchesLeft: freeSearchesPerUser?.freeSearchesNum,
          });

          const authToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);

          //   creating secure cookie with refresh token
          res.cookie("jwtToken", authToken, {
            httpOnly: true, // only accessbile by browser
            secure: true, //https
            sameSite: "none", //cross-browser
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days validity of a refresh token. 1000ms=1s 1s*60= 1min, 1min*60=1hr, 1hr*24=1d, 1*7=7d
          });

          res.status(200).json({ authToken });
        })
        .catch((err) => res.status(401).json({ error: err?.message }));
    } catch (err) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "The issue is from our side, please try again in some time",
      });
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
    body("password", "Password must be more than 5 character's").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()?.[0]?.msg });
    }
    const { email, password } = req.body;

    try {
      const foundUser = await User.findOne({ email }).exec();
      if (!foundUser) {
        return res
          .status(400)
          .json({ message: "This email is not registered with us" });
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
      res.cookie("jwtToken", authToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days validity of a refresh token. 1000ms=1s 1s*60= 1min, 1min*60=1hr, 1hr*24=1d, 1*7=7d
      });

      res.status(200).json({ authToken });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Internal Server Error",
        message: "The issue is from our side, please try again in some time",
      });
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
    res.status(500).json({
      error: "Internal Server Error",
      message: "The issue is from our side, please try again in some time",
    });
  }
});

// get user details using cookies
// refresh user
router.get("/refresh", async (req, res) => {
  const { jwtToken } = req.cookies;

  if (!jwtToken) {
    return res.status(401).json({ message: "Please login again" });
  }

  try {
    const decodedToken = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET);

    const { id } = decodedToken.user;

    const foundUser = await User.findById(id).select("-password");
    if (!foundUser) {
      return res.status(401).json({ message: "User Not Found" });
    }

    res.status(200).json({ user: { foundUser, authToken: jwtToken } });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "The issue is from our side, please try again in some time",
    });
  }
});

module.exports = router;
