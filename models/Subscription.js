const mongoose = require("mongoose");

const SubscriptionModel = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("subscription", SubscriptionModel);
