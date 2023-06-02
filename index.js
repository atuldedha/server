require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./db");
const PORT = 8080;

const app = express();
app.use(express.json());
// function to connect to mongoDB atlas
connectDB();

// Available Routes
app.use("/api/auth", require("./routes/auth"));

// once the app is connected to mongoDB start the server
mongoose.connection.once("open", () => {
  console.log("Connected to database");
  app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
  });
});
