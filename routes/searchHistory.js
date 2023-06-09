const express = require("express");
const Search = require("../models/HistoricalSeacrh");

const router = express.Router();

const fetchUser = require("../middleware/fetchUser");
const User = require("../models/User");

// add to search history @Post: add-search
router.post("/add-search", fetchUser, async (req, res) => {
  try {
    const userid = req.user.id;
    const { searchTerm } = req.body;
    if (!userid) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const foundUser = await Search.findOne({ userid }).exec();

    // if users search history is already in db
    if (foundUser) {
      const searchItems = foundUser?.searchItem;

      const duplicate = searchItems.find(
        (item) => item?.searchTerm === searchTerm
      );

      if (userid !== foundUser?.userid?.toString()) {
        return res
          .status(401)
          .json({ error: "Unauthorized", message: "Unauthorized" });
      }

      if (duplicate) {
        return res.status(202).json({ message: "Already Present" });
      }
      // creating new search obj with term and category
      searchItems.push(searchTerm);

      foundUser.searchItem = searchItems;

      await foundUser.save();

      return res.status(201).json({
        message: `Search term: ${searchTerm} has been added`,
      });
    }
    // else create users search history in db
    Search.create({
      userid: userid,
      searchItem: [searchTerm],
    })
      .then((response) => {
        return res
          .status(201)
          .json({ userSearchInfo: response, message: "Search Item Saved" });
      })
      .catch((err) => {
        return res.status(401).json({ error: "", message: err?.message });
      });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error", message: "Internal Server Error" });
  }
});

// user search history @Get: search-history
// Private Route
router.get("/get-search-history", fetchUser, async (req, res) => {
  const userid = req.user.id;
  const foundUser = await Search.findOne({ userid }).lean().exec();

  if (!userid) {
    return res.status(400).json({ error: "", message: "User not logged in" });
  }

  if (!foundUser) {
    return res.status(204).json({ message: "No Search History for the user" });
  }

  if (userid !== foundUser?.userid?.toString()) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Unauthorized" });
  }

  return res.status(200).json({ userInfo: foundUser });
});

module.exports = router;
