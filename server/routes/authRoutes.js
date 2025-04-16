const express = require("express");
const {
  login,
  refreshToken,
  logout,
  forgotPassword,
} = require("../controllers/authController");

const loginLimit = require("../middleware/loginLimit");

const router = express.Router();

router.route("/login").post(loginLimit, login);
router.route("/refresh").get(refreshToken);
router.route("/logout").post(logout);
router.route("/forgot-password").post(forgotPassword);

module.exports = router;
