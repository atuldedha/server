const allowedOrigins = require("./allowedOrigins");

// options for cors so that only valid requests from valid sources proceeds
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // callback takes two arguments 1.error 2.is valid or not
      callback(null, true);
    } else {
      callback(new Error("Not Allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
