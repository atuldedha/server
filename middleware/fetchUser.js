// decoding auth token middleware
const jwt = require("jsonwebtoken");

const fetchUser = (req, res, next) => {
  // get user from token
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).json({ error: "Error", message: "Please login again" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decodedToken.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Interval Server Error" });
  }
};

module.exports = fetchUser;
