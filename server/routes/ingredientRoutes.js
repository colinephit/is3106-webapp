const express = require("express");
const { getAllIngredients,
    addIngredient,
    deleteIngredient
} = require("../controllers/ingredientController");
const verifyJwt = require("../middleware/verifyJwt");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/rolesList");

const router = express.Router();

// for all verified Users: get all ingredients (supports search & alphabetical sorting)
router.get("/list", [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)], getAllIngredients);

// for all verified Users: add a new ingredient
router.post("/create", [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)], addIngredient);

// for admin ONLY: Delete an ingredient by ID
router.delete("/:id", [verifyJwt, verifyRoles(ROLES_LIST.Admin)], deleteIngredient);

module.exports = router;

