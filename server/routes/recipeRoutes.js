const express = require("express");
const {
    getAllRecipes,
    getRecipe,
    addRecipe,
    updateRecipe,
    rateRecipe,
    deleteRecipe,
    addComment,
    deleteComment,
    toggleFavoriteRecipe,
    getTopRecipes,
    searchRecipesByIngredients,
} = require("../controllers/recipeController");
const { createReport } = require("../controllers/reportController");
const ROLES_LIST = require("../config/rolesList");
const verifyJwt = require("../middleware/verifyJwt");
const verifyRoles = require("../middleware/verifyRoles");

const router = express.Router();

router.route("/list").post(getAllRecipes);

router.route("/top").get(getTopRecipes);

router.route("/create").post([verifyJwt], addRecipe);

router
    .route("/rate/:id")
    .put(
        [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)],
        rateRecipe
    );

router
    .route("/:id")
    .get((req, res) => {
        console.log("Recipe ID received:", req.params.id);
        getRecipe(req, res);
    })
    .put(
        [verifyJwt, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.BasicUser)],
        updateRecipe
    )
    .delete(
        [verifyJwt, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.BasicUser)],
        deleteRecipe
    );

router
    .route("/comment/:id")
    .put(
        [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)],
        addComment
    );

router
    .route("/comment/:recipeId/:commentId")
    .delete(
        [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)],
        deleteComment
    );

router
    .route("/favorite/:id")
    .put(
        [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)],
        toggleFavoriteRecipe
    );

// to search for recipes using selected ingredients
router.post("/search", [verifyJwt], searchRecipesByIngredients);

// route to create a new report for a specific recipe
router.post(
    "/:recipeId/report",
    verifyJwt,
    verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin),
    createReport
);

module.exports = router;
