const mongoose = require("mongoose");

const SearchSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "user",
  },
  searchItem: {
    type: Array,
    require: true,
  },
});

module.exports = mongoose.model("search", SearchSchema);
