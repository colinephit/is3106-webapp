const User = require("../models/userModel");
const Role = require("../models/roleModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select(["-password", "-refreshToken", "-favorites"])
      .populate("roleId", "roleName");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne(
      { _id: req.params.id, isDisabled: false },
      "firstName lastName email profileImage roleId contactNumber"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  console.log("Received request to create user");
  try {
    const { email } = req.body;
    const foundUser = await User.findOne({ email, isDisabled: false });

    if (foundUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const userRole = await Role.findOne({ roleName: "BasicUser" });

    console.log(userRole._id);

    if (!userRole) {
      return res.status(500).json({
        message:
          "Default role 'BasicUser' not found. Please seed the database with roles.",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await User({
      ...req.body,
      password: hashedPassword,
      roleId: userRole._id,
    });

    await newUser
      .save()
      .then((savedUser) => {
        res.status(201).json({ msg: "New user created successfully" });
      })
      .catch((error) => {
        if (
          error.code === 11000 &&
          error.keyPattern &&
          error.keyPattern.email
        ) {
          res.status(500).json({ msg: "Email already in use" });
        } else {
          res.status(500).json({
            msg: error,
          });
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Unable to create a new user" });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      contactNumber,
      email,
      password,
      confirmPassword,
      oldPassword,
      image,
    } = req.body;

    const foundUser = await User.findOne({
      _id: req.params.id,
      isDisabled: false,
    }).populate("roleId", "roleName");

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const foundEmail = await User.findOne({ email, isDisabled: false });

    if (foundEmail && foundEmail._id.toString() !== req.user) {
      return res.status(409).json({ message: "Email already in use" });
    }

    if (password || oldPassword || confirmPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const isPasswordCorrect = await bcrypt.compare(oldPassword, foundUser.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }

      foundUser.password = await bcrypt.hash(password, 10);
    }

    foundUser.firstName = firstName;
    foundUser.lastName = lastName;
    foundUser.contactNumber = contactNumber;
    foundUser.email = email;
    foundUser.profileImage = image || foundUser.profileImage;

    await foundUser.save();

    const accessToken = jwt.sign(
      {
        UserInfo: {
          userId: req.params.id,
          firstName: firstName,
          lastName: lastName,
          contactNumber: contactNumber,
          email: email,
          profileImage: foundUser.profileImage,
          roleId: foundUser.roleId,
          roles: [foundUser.roleId.roleName],
          favorites: foundUser.favorites,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    return res.status(201).json({
      accessToken,
      user: {
        userId: req.params.id,
        firstName,
        lastName,
        contactNumber,
        email,
        profileImage: foundUser.profileImage,
        roleId: foundUser.roleId,
        roles: [foundUser.roleId.roleName],
        favorites: foundUser.favorites,
      },
    });
  } catch (error) {
    console.error("error updating user: ", error);
    next(error);
  }
};

const disableUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      { isDisabled: !user.isDisabled }, // Toggle isDisabled
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedUser); // Send the updated user
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUser, disableUser, createUser, getUser };
