require("dotenv").config();
const jwt = require("jsonwebtoken");

const secret = process.env.SECRET_KEY;
console.log(`secret key: ${secret}`)
const authMiddleware = (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1]; // extract the token from the Authorization header
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized User" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // add the decoded user info to the request object
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
