const express = require("express");
const AppInfo = require("../models/AppInfo");
const appData = require("../config/applicationData");
const router = express.Router();

// Route: @POST about info of page
// no access given
// only admin
router.post("/pushData", (req, res) => {
  AppInfo.create({ ...appData })
    .then((response) => {
      console.log(response);
      res.status(200).json({ message: "App Info Created" });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Route: @GET about info of app
// public access
router.get("/appInfo", async (req, res) => {
  const applicationData = await AppInfo.findOne({}).exec();
  console.log(applicationData);
  if (applicationData) {
    res.status(200).json({ applicationData });
  }
});

module.exports = router;
