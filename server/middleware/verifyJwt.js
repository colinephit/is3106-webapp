const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    console.log("decoded is", decoded);
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid Token" });
    }
    req.user = decoded.UserInfo.userId;
    req.roles = decoded.UserInfo.roles; // Ensure roles are being set
    console.log("Decoded user:", req.user); // Debugging
    next();
  });
};

module.exports = verifyJwt;
