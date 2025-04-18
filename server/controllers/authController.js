const User = require("../models/userModel");
const Role = require("../models/roleModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const foundUser = await User.findOne({
      email,
      isDisabled: false,
    }).populate("roleId", "roleName");

    if (!foundUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!foundUser.roleId && !foundUser.roleId.roleName) {
      return res.status(401).json({ message: "Role not found" });
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          userId: foundUser._id.toString(),
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          email: foundUser.email,
          profileImage: foundUser.profileImage,
          roleId: foundUser.roleId,
          roles: [foundUser.roleId.roleName],
          contactNumber: foundUser.contactNumber,
          favorites: foundUser.favorites,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: foundUser._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "2d" }
    );

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).populate(
    "roleId",
    "roleName"
  );

  if (!foundUser) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!foundUser.roleId && !foundUser.roleId.roleName) {
    return res.status(401).json({ message: "Role not found" });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err || foundUser._id.toString() !== decoded.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            userId: foundUser._id.toString(),
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            email: foundUser.email,
            profileImage: foundUser.profileImage,
            roleId: foundUser.roleId,
            roles: [foundUser.roleId.roleName],
            contactNumber: foundUser.contactNumber,
            favorites: foundUser.favorites,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );
      res.json({ accessToken });
    }
  );
};

const logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken });

  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  }

  foundUser.refreshToken = "";
  await foundUser.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email is not a registered account" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.tokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetURL = `http://localhost:5173/auth/reset-password/${resetToken}`;
    const message = `Reset your password using the following link: ${resetURL}`;

    await sendEmail(user.email, "Reset Password", message);
    res.status(200).json({ message: "Reset email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    try {
      const user = await User.findOne({
        resetToken: token,
        tokenExpiry: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetToken = null;
      user.tokenExpiry = null;
  
      await user.save();
  
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ message: "Failed to reset password" });
    }
  };  

module.exports = { login, refreshToken, logout, forgotPassword, resetPassword };
