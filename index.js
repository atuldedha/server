require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./db");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const PORT = 8080;

const app = express();
connectDB();
app.use(express.json());
app.use(cors(corsOptions));
// function to connect to mongoDB atlas

// Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/search", require("./routes/searchHistory"));
app.use("/api/checkout", require("./routes/checkout"));

// once the app is connected to mongoDB start the server
mongoose.connection.once("open", () => {
  console.log("Connected to database");
  app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
  });
});
