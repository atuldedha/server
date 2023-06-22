const mongoose = require("mongoose");

const FreeSearchesPerUser = new mongoose.Schema({
  freeSearchesNum: {
    type: Number,
    require: true,
  },
});

module.exports = mongoose.model(
  "freeSearches",
  FreeSearchesPerUser,
  "freeSearches"
);
