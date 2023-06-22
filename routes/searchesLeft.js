const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const FreeSeachesLeft = require("../models/FreeSeachesLeft");

const router = express.Router();

// if user has not subscribed then sub. free searches num
// access private
router.put("/set-free-searches", fetchUser, async (req, res) => {
  const userid = req.user.id;
  if (!userid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // user has made a search so decrease.
  // free searches left by 1 each time he makes a search
  const userToUpdate = await FreeSeachesLeft?.findOne({ userid }).exec();
  if (userToUpdate.freeSearchesLeft - 1 >= 0) {
    userToUpdate.freeSearchesLeft = userToUpdate.freeSearchesLeft - 1;
    await userToUpdate.save();
  }

  res.status(200).json({ freeSearchesLeft: userToUpdate.freeSearchesLeft });
});

// if user has not subscribed then sub. free searches num
// access private
router.get("/get-free-searches", fetchUser, async (req, res) => {
  const userid = req.user.id;
  if (!userid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // user has made a search so decrease.
  // free searches left by 1 each time he makes a search
  const userToUpdate = await FreeSeachesLeft?.findOne({ userid }).exec();
  res.status(200).json({ freeSearchesLeft: userToUpdate.freeSearchesLeft });
});

module.exports = router;
