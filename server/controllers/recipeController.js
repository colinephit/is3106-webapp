const Recipe = require("../models/recipeModel");
const Ingredient = require("../models/ingredientModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const getAllRecipes = async (req, res, next) => {
    const filter = {};
    if (!req.body.status || req.body.status.toUpperCase() !== "ALL") {
        filter.status = req.body.status;
    }
    try {
        const recipes = await Recipe.find(filter)
            .sort({ createdAt: -1 })
            .populate("author", "firstName lastName")
            .populate("ratings", "rating");
        res.status(200).send(recipes);
    } catch (error) {
        next(error);
    }
};

const getOwnRecipes = async (req, res, next) => {
    try {
        const recipes = await Recipe.find({ author: req.user })
            .sort({ createdAt: -1 })
            .populate("author", "firstName lastName")
            .populate("ratings", "rating");
        res.status(200).send(recipes);
    } catch (error) {
        next(error);
    }
};

// get top 10 recipes
const getTopRecipes = async (req, res, next) => {
    try {
        const topRecipes = await Recipe.aggregate([
            {
                $addFields: {
                    averageRating: { $avg: "$ratings.rating" },
                },
            },
            {
                $sort: { averageRating: -1 },
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorDetails",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categories",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $project: {
                    recipeName: 1,
                    author: { $arrayElemAt: ["$authorDetails.name", 0] },
                    averageRating: 1,
                    description: 1,
                    image: 1,
                    cookingTime: 1,
                    difficultyLevel: 1,
                    categoryDetails: 1,
                },
            },
        ]);

        return res.status(200).send(topRecipes);
    } catch (error) {
        next(error);
    }
};

const getRecipe = async (req, res, next) => {
    try {
        const recipe = await Recipe.findOne({ _id: req.params.id })
            .populate("author", "firstName lastName")
            .populate("comments.user", ["name", "profileImage"])
            .populate("ingredients")
            .populate("categories")
            .populate("ratings", "rating");

        if (!recipe)
            return res.status(404).json({ message: "Recipe not found" });

        res.status(200).send(recipe);
    } catch (error) {
        console.error("Error fetching recipe:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const addRecipe = async (req, res, next) => {
    try {
        const {
            recipeName,
            image,
            description,
            difficultyLevel,
            cookingTime,
            ingredients,
            categories,
            instructions,
            status,
            // additionalInformation,
        } = req.body;
        if (
            !recipeName ||
            !image ||
            !description ||
            !difficultyLevel ||
            !cookingTime ||
            !ingredients.length ||
            !categories.length ||
            !instructions.length ||
            !status
            // !additionalInformation
        ) {
            return res.status(422).json({ message: "Insufficient data" });
        }
        // to validate that all ingredient IDs exist
        const validIngredients = await Ingredient.find({
            _id: { $in: ingredients },
        });

        if (validIngredients.length !== ingredients.length) {
            return res
                .status(400)
                .json({ message: "One or more ingredients are invalid" });
        }

        // to validate category ID
        const validCategory = await Category.findById(category);
        if (!validCategory) {
            return res.status(400).json({ message: "Invalid category" });
        }

        //  to create recipe with all verified ingredient IDs and category ID
        const recipe = new Recipe({
            ...req.body,
            ingredients: validIngredients.map((ingredi) => ingredi._id),
            category: validCategory._id,
            author: req.user,
        });
        await recipe.save();
        res.status(201).json({ success: "Recipe added successfully" });
    } catch (error) {
        next(error);
    }
};

const updateRecipe = async (req, res, next) => {
    try {
        const {
            recipeName,
            image,
            description,
            difficultyLevel,
            cookingTime,
            ingredients,
            categories,
            instructions,
            additionalInformation,
            status,
        } = req.body;
        if (
            !recipeName ||
            !image ||
            !description ||
            !difficultyLevel ||
            !cookingTime ||
            !ingredients.length ||
            !categories.length ||
            !instructions.length ||
            !status
        ) {
            return res.status(422).json({ message: "Insufficient data" });
        }

        const foundRecipe = await Recipe.findById(req.params.id);
        if (!foundRecipe)
            return res.status(404).json({ message: "Recipe not found" });

        if (foundRecipe.author !== req.user)
            return res.status(401).json({ message: "Unauthorized" });

        foundRecipe.recipeName = recipeName;
        foundRecipe.description = description;
        foundRecipe.image = image;
        foundRecipe.difficultyLevel = difficultyLevel;
        foundRecipe.ingredients = ingredients;
        foundRecipe.cookingTime = cookingTime;
        foundRecipe.instructions = instructions;
        foundRecipe.categories = categories;
        foundRecipe.additionalInformation = additionalInformation;
        foundRecipe.status = status;

        const updatedRecipe = await foundRecipe.save();
        res.status(201).json(updatedRecipe);
    } catch (error) {
        next(error);
    }
};

const rateRecipe = async (req, res, next) => {
    try {
        const { rating } = req.body;

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found." });
        }

        // Check if the user has already rated this recipe
        const existingRating = recipe.ratings.find((rate) =>
            rate.user.equals(req.user)
        );
        if (existingRating) {
            return res
                .status(400)
                .json({ message: "User has already rated this recipe" });
        }

        // Add the new rating
        recipe.ratings.push({ user: req.user, rating: rating });
        await recipe.save();

        res.status(201).json({ message: "Rating added successfully." });
    } catch (error) {
        next(error);
    }
};

const deleteRecipe = async (req, res, next) => {
    try {
        const foundRecipe = await Recipe.findById(req.params.id);
        if (!foundRecipe)
            return res.status(404).json({ message: "Recipe not found" });

        if (foundRecipe.author !== req.user)
            return res.status(401).json({ message: "Unauthorized" });

        await foundRecipe.deleteOne({ _id: req.params.id });
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

const addComment = async (req, res, next) => {
    try {
        const { comment } = req.body;

        // Validate userId and commentText
        if (!comment) {
            return res.status(400).json({ message: "Comment is required." });
        }

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found." });
        }

        // Add the new comment
        recipe.comments.push({ user: req.user, comment });
        await recipe.save();

        res.status(201).json({ message: "Comment added successfully." });
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const { recipeId, commentId } = req.params;

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found." });
        }

        const commentIndex = recipe.comments.findIndex((comment) =>
            comment._id.equals(commentId)
        );
        if (commentIndex === -1) {
            return res.status(404).json({ message: "Comment not found." });
        }

        recipe.comments.splice(commentIndex, 1);
        await recipe.save();

        res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
        next(error);
    }
};

const toggleFavoriteRecipe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user).populate(
            "roleId",
            "roleName"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const recipeIndex = user.favorites.indexOf(req.params.id);
        if (recipeIndex === -1) {
            // Recipe not present, add it to favorites
            user.favorites.push(req.params.id);
        } else {
            // Recipe already present, remove it from favorites
            user.favorites.splice(recipeIndex, 1);
        }

        await user.save();

        // const roles = Object.values(user.roles);

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    userId: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    contactNumber: user.contactNumber,
                    profileImage: user.profileImage,
                    roleId: user.roleId,
                    roles: [user.roleId.roleName],
                    favorites: user.favorites,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );
        return res.status(201).json({ accessToken });
    } catch (error) {
        next(error);
    }
};

// to search for recipes based on user's selected ingredients in home page
const searchRecipesByIngredients = async (req, res) => {
    try {
        let { ingredients } = req.body; // expects an array of ingredient IDs that user selected

        if (
            !ingredients ||
            !Array.isArray(ingredients) ||
            ingredients.length === 0
        ) {
            return res
                .status(400)
                .json({ message: "Please select at least one ingredient" });
        }

        // find all recipes that contain at least some of the selected ingredients
        const recipes = await Recipe.find({ ingredients: { $in: ingredients } })
            .populate("ingredients")
            .populate("author", "firstName lastName")
            .populate("ratings", "rating")
            .sort({ createdAt: -1 });

        // filter recipes based on missing ingredient count
        const filteredRecipes = recipes.filter((recipe) => {
            const recipeIngredientIds = recipe.ingredients.map((thing) =>
                thing._id.toString()
            );
            const missingCount = ingredients.filter(
                (thingId) => !recipeIngredientIds.includes(thingId)
            ).length;
            return missingCount <= 5; // we should allow up to 5 missing ingredients, else cant be made?
        });

        if (filteredRecipes.length === 0) {
            return res.status(400).json({
                message:
                    "Too many missing ingredients. Try removing some ingredients from your search.",
            });
        }

        res.status(200).json(filteredRecipes);
    } catch (error) {
        res.status(500).json({
            message: "Error searching recipes",
            error: error.message,
        });
    }
};

module.exports = {
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
    getOwnRecipes,
};
