const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.roles) return res.status(401).json({ message: "Unauthorized" });

    // Convert ObjectId roles to strings
    const userRoles = req.roles.map((role) => role.toString());

    const result = userRoles.some((role) => allowedRoles.includes(role));

    if (!result) return res.status(401).json({ message: "Unauthorized" });

    next();
  };
};

module.exports = verifyRoles;
