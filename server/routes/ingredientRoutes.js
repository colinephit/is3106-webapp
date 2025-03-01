const express = require("express");
const {
    addIngredient,
    deleteIngredient,
    searchIngredients
} = require("../controllers/ingredientController");
const verifyJwt = require("../middleware/verifyJwt");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/rolesList");

const router = express.Router();

// for all verified Users: get all ingredients (supports search & alphabetical sorting) used for recipe creation
router.get("/list", [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)], searchIngredients);

// for all verified Users: add a new ingredient
router.post("/create", [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)], addIngredient);

// for admin ONLY: Delete an ingredient by ID
router.delete("/:id", [verifyJwt, verifyRoles(ROLES_LIST.Admin)], deleteIngredient);

// to search ingredients dynamically as all user types, used for searching for recipes
router.get("/search", [verifyJwt], searchIngredients);

module.exports = router;




