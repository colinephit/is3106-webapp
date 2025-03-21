const express = require("express");
const {
    getAllRecipes,
    getRecipe,
    addRecipe,
    updateRecipe,
    publishRecipe,
    rateRecipe,
    deleteRecipe,
    addComment,
    deleteComment,
    toggleFavoriteRecipe,
    getTopRecipes,
    searchRecipesByIngredients,
    getOwnRecipes,
} = require("../controllers/recipeController");
const { createReport } = require("../controllers/reportController");
const ROLES_LIST = require("../config/rolesList");
const verifyJwt = require("../middleware/verifyJwt");
const verifyRoles = require("../middleware/verifyRoles");

const router = express.Router();

// router.route("/list").get(getAllRecipes);

router.route("/list").post(getAllRecipes);

// to search for recipes using selected ingredients
router.route("/search").get(searchRecipesByIngredients);

router
    .route("/ownList")
    .get(
        [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)],
        getOwnRecipes
    );

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
    .patch( 
        [verifyJwt, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.BasicUser)],
        publishRecipe 
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

// router.route("/comment/:recipeId/:commentId").delete(deleteComment);

router
    .route("/favorite/:id")
    .put(
        [verifyJwt, verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin)],
        toggleFavoriteRecipe
    );

// route to create a new report for a specific recipe
router.post(
    "/:recipeId/report",
    verifyJwt,
    verifyRoles(ROLES_LIST.BasicUser, ROLES_LIST.Admin),
    createReport
);

module.exports = router;
