const mongoose = require("mongoose");

const FreeSearchesLeft = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "user",
  },
  freeSearchesLeft: {
    type: Number,
    require: true,
  },
});

module.exports = mongoose.model("freeSearchesLeft", FreeSearchesLeft);
