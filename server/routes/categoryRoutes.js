const express = require("express");
const {
  getAllCategories,
  addCategory,
  editCategory,
  searchCategories,
  deleteCategory,
  getCategory,
} = require("../controllers/categoryController");
const verifyJwt = require("../middleware/verifyJwt");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/rolesList");

const router = express.Router();

// verified users can view or search for categories
router.get(
  "/search",
  [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)],
  searchCategories
);

// only admin can add new categories
router.post("/create", [verifyJwt, verifyRoles(ROLES_LIST.Admin)], addCategory);

// only admin can add edit categories
router.put(
  "/edit/:id",
  [verifyJwt, verifyRoles(ROLES_LIST.Admin)],
  editCategory
);

router
  .route("/:id")
  .get([verifyJwt, verifyRoles(ROLES_LIST.Admin)], getCategory)
  .delete([verifyJwt, verifyRoles(ROLES_LIST.Admin)], deleteCategory);
module.exports = router;
