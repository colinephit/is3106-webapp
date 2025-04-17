const Recipe = require("../models/recipeModel");
const Ingredient = require("../models/ingredientModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const getAllRecipes = async (req, res, next) => {
    let {
        search,
        cookingTime,
        difficultyLevel,
        ingredients,
        category,
        sort,
        status,
        skip,
        limit,
    } = req.body;

    const matchConditions = [];

    if (!status || status.toUpperCase() !== "ALL") {
        matchConditions.push({ status: status });
    }

    // Search by recipe name or description
    if (search) {
        matchConditions.push({
            $or: [
                { recipeName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ],
        });
    }

    if (
        difficultyLevel &&
        difficultyLevel.min !== undefined &&
        difficultyLevel.max !== undefined
    ) {
        matchConditions.push({
            difficultyLevel: {
                $gte: Math.max(1, Number(difficultyLevel.min)),
                $lte: Math.min(5, Number(difficultyLevel.max)),
            },
        });
    }

    if (Array.isArray(ingredients) && ingredients.length > 0) {
        matchConditions.push({
            ingredients: {
                $all: ingredients.map(
                    (ingredient) => new mongoose.Types.ObjectId(ingredient._id)
                ),
            },
        });
    }

    if (category) {
        matchConditions.push({
            categories: { $in: [new mongoose.Types.ObjectId(category)] },
        });
    }

    let sortField = { createdAt: -1 };
    switch (sort) {
        case "1":
            sortField = { createdAt: -1 };
            break;
        case "2":
            sortField = { createdAt: 1 };
            break;
        case "3":
            sortField = { avgRating: -1 };
            break;
        case "4":
            sortField = { avgRating: 1 };
            break;
    }

    const aggregationPipeline = [
        ...(matchConditions.length
            ? [{ $match: { $and: matchConditions } }]
            : []),
        {
            $addFields: {
                cookingTimeNum: { $toInt: "$cookingTime" },
                avgRating: {
                    $cond: {
                        if: { $gt: [{ $size: "$ratings" }, 0] },
                        then: { $avg: "$ratings.rating" },
                        else: 0,
                    },
                },
            },
        },
    ];

    if (
        cookingTime &&
        cookingTime.min !== undefined &&
        cookingTime.max !== undefined
    ) {
        aggregationPipeline.push({
            $match: {
                cookingTimeNum: {
                    $gte: Number(cookingTime.min),
                    $lte: Number(cookingTime.max),
                },
            },
        });
    }

    aggregationPipeline.push({ $sort: sortField });

    aggregationPipeline.push(
        {
            $facet: {
                data: [
                    { $skip: skip ?? 0 },
                    { $limit: limit ?? 10 },
                    {
                        $lookup: {
                            from: "users",
                            localField: "author",
                            foreignField: "_id",
                            as: "author",
                        },
                    },
                    { $unwind: "$author" },
                    {
                        $match: {
                            "author.isDisabled": false,
                        },
                    },
                    {
                        $unwind: {
                            path: "$comments",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "comments.user",
                            foreignField: "_id",
                            as: "comments.userDetails",
                        },
                    },
                    {
                        $unwind: {
                            path: "$comments.userDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $addFields: {
                            "comments.user._id": "$comments.userDetails._id",
                            "comments.user.firstName":
                                "$comments.userDetails.firstName",
                            "comments.user.lastName":
                                "$comments.userDetails.lastName",
                        },
                    },
                    {
                        $group: {
                            _id: "$_id",
                            recipeName: { $first: "$recipeName" },
                            description: { $first: "$description" },
                            cookingTime: { $first: "$cookingTime" },
                            difficultyLevel: { $first: "$difficultyLevel" },
                            ingredients: { $first: "$ingredients" },
                            categories: { $first: "$categories" },
                            avgRating: { $first: "$avgRating" },
                            createdAt: { $first: "$createdAt" },
                            author: { $first: "$author" },
                            ratings: { $first: "$ratings" },
                            image: { $first: "$image" },
                            status: { $first: "$status" },
                            comments: {
                                $push: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $ne: ["$comments", null] },
                                                {
                                                    $ne: [
                                                        "$comments.user",
                                                        null,
                                                    ],
                                                },
                                                {
                                                    $ne: [
                                                        "$comments.user._id",
                                                        null,
                                                    ],
                                                },
                                            ],
                                        },
                                        "$comments",
                                        "$$REMOVE",
                                    ],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            recipeName: 1,
                            description: 1,
                            cookingTime: 1,
                            difficultyLevel: 1,
                            ingredients: 1,
                            categories: 1,
                            avgRating: 1,
                            createdAt: 1,
                            author: { firstName: 1, _id: 1, lastName: 1 },
                            ratings: { rating: 1 },
                            image: 1,
                            status: 1,
                            comments: {
                                $map: {
                                    input: "$comments",
                                    as: "comment",
                                    in: {
                                        _id: "$$comment._id",
                                        comment: "$$comment.comment",
                                        date: "$$comment.date",
                                        user: "$$comment.user",
                                    },
                                },
                            },
                        },
                    },
                ],
                totalCount: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "author",
                            foreignField: "_id",
                            as: "author",
                        },
                    },
                    { $unwind: "$author" },
                    {
                        $match: {
                            "author.isDisabled": false,
                        },
                    },
                    {
                        $count: "count",
                    },
                ],
            },
        },
        {
            $project: {
                data: 1,
                totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
            },
        }
    );

    try {
        const recipes = await Recipe.aggregate(aggregationPipeline);
        res.status(200).send(recipes[0]);
    } catch (error) {
        next(error);
    }
};

const getFavouriteRecipes = async (req, res, next) => {
    let {
        search,
        cookingTime,
        difficultyLevel,
        ingredients,
        category,
        sort,
        status,
    } = req.body;

    const user = await User.findOne({ _id: req.user, isDisabled: false });
    const recipeIds = user.favorites;

    const matchConditions = [];

    if (Array.isArray(recipeIds) && recipeIds.length > 0) {
        matchConditions.push({
            _id: {
                $in: recipeIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
        });
    } else {
        res.status(200).send([]);
    }

    if (!status || status.toUpperCase() !== "ALL") {
        matchConditions.push({ status: status });
    }

    // Search by recipe name or description
    if (search) {
        matchConditions.push({
            $or: [
                { recipeName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ],
        });
    }

    if (
        difficultyLevel &&
        difficultyLevel.min !== undefined &&
        difficultyLevel.max !== undefined
    ) {
        matchConditions.push({
            difficultyLevel: {
                $gte: Math.max(1, Number(difficultyLevel.min)),
                $lte: Math.min(5, Number(difficultyLevel.max)),
            },
        });
    }

    if (Array.isArray(ingredients) && ingredients.length > 0) {
        matchConditions.push({
            ingredients: {
                $all: ingredients.map(
                    (ingredient) => new mongoose.Types.ObjectId(ingredient._id)
                ),
            },
        });
    }

    if (category) {
        matchConditions.push({
            categories: { $in: [new mongoose.Types.ObjectId(category)] },
        });
    }

    let sortField = { createdAt: -1 };
    switch (sort) {
        case "1":
            sortField = { createdAt: -1 };
            break;
        case "2":
            sortField = { createdAt: 1 };
            break;
        case "3":
            sortField = { avgRating: -1 };
            break;
        case "4":
            sortField = { avgRating: 1 };
            break;
    }

    const aggregationPipeline = [
        ...(matchConditions.length
            ? [{ $match: { $and: matchConditions } }]
            : []),
        {
            $addFields: {
                cookingTimeNum: { $toInt: "$cookingTime" },
                avgRating: {
                    $cond: {
                        if: { $gt: [{ $size: "$ratings" }, 0] },
                        then: { $avg: "$ratings.rating" },
                        else: 0,
                    },
                },
            },
        },
    ];

    if (
        cookingTime &&
        cookingTime.min !== undefined &&
        cookingTime.max !== undefined
    ) {
        aggregationPipeline.push({
            $match: {
                cookingTimeNum: {
                    $gte: Number(cookingTime.min),
                    $lte: Number(cookingTime.max),
                },
            },
        });
    }

    aggregationPipeline.push({ $sort: sortField });

    aggregationPipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
            },
        },
        { $unwind: "$author" },
        {
            $project: {
                recipeName: 1,
                description: 1,
                cookingTime: 1,
                difficultyLevel: 1,
                ingredients: 1,
                categories: 1,
                avgRating: 1,
                createdAt: 1,
                author: { firstName: 1, _id: 1, lastName: 1 },
                ratings: { rating: 1 },
                image: 1,
            },
        }
    );

    try {
        const recipes = await Recipe.aggregate(aggregationPipeline);
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
            .populate("comments.user", "firstName lastName profileImage")
            .populate("ingredients")
            .populate("categories")
            .populate("ratings", "rating")
            .lean();

        if (!recipe)
            return res.status(404).json({ message: "Recipe not found" });

        res.status(200).send(recipe);
    } catch (error) {
        console.error("Error fetching recipe:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// to search for recipes based on user's selected ingredients in recipe page
const searchRecipesByIngredients = async (req, res, next) => {
    try {
        let { ingredients } = req.query;

        if (typeof ingredients === "string") {
            ingredients = ingredients.split(",");
        }

        if (
            !ingredients ||
            !Array.isArray(ingredients) ||
            ingredients.length === 0
        ) {
            const allRecipes = await Recipe.find({ status: "Published" })
                .populate("ingredients")
                .populate("categories")
                .populate("author");
            return res.status(200).json(allRecipes);
        }

        const recipes = await Recipe.aggregate([
            {
                $lookup: {
                    from: "ingredients",
                    localField: "ingredients",
                    foreignField: "_id",
                    as: "ingredientDetails",
                },
            },
            {
                $match: {
                    "ingredientDetails.ingredientName": {
                        $in: ingredients.map(
                            (ingredient) => new RegExp(ingredient, "i")
                        ),
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    recipeName: 1,
                    matchIngredients: 1,
                    description: 1,
                    image: 1,
                },
            },
        ]);

        console.log("Recipes found:", recipes);
        res.status(200).json(recipes);
    } catch (error) {
        next(error);
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
        const validCategory = await Category.findById(categories[0]);
        if (!validCategory) {
            return res.status(400).json({ message: "Invalid category" });
        }

        //  to create recipe with all verified ingredient IDs and category ID
        const recipe = new Recipe({
            ...req.body,
            ingredients: validIngredients.map((ingredi) => ingredi._id),
            categories: [validCategory._id],
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

        //console.log("Request Body:", req.body);

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

        //console.log("foundRecipe", foundRecipe);

        if (!foundRecipe)
            return res.status(404).json({ message: "Recipe not found" });

        // commented out because admin can edit the status of the recipe
        // if (foundRecipe.author !== req.user)
        //   return res.status(401).json({ message: "Unauthorized" });

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
        console.error("Error in updateRecipe:", error);
        next(error);
    }
};

const publishRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Update the recipe's status to "Published"
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            { status: "Published" },
            { new: true }
        );

        if (!updatedRecipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.status(200).json(updatedRecipe);
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
        const existingRating = recipe.ratings.find(
            (rate) => rate.user.equals(req.user) // Check if the user has rated this recipe
        );

        // If the user has already rated, update the rating
        if (existingRating) {
            existingRating.rating = rating;
            await recipe.save();
            return res
                .status(200)
                .json({ message: "Rating updated successfully." });
        }

        // If user had not previously rated, add the new rating
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

        if (!foundRecipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }
        // commented out because admin should be able to delete a recipe
        // if (foundRecipe.author.toString() !== req.user.toString()) {
        //   return res.status(401).json({ message: "Unauthorized" });
        // }

        await Recipe.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Recipe deleted" });
    } catch (error) {
        console.error("Error deleting recipe:", error);
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

const flagRecipe = async (req, res, next) => {
    try {
        const { message } = req.body;

        // Validate userId and commentText
        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found." });
        }

        // Add the new comment
        recipe.flags.push({ user: req.user, message });
        await recipe.save();

        res.status(201).json({ message: "Recipe flagged successfully." });
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
        console.error("Error deleting comment:", error);
        next(error);
    }
};

const deleteFlag = async (req, res, next) => {
    try {
        const { recipeId, flagId } = req.params;

        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found." });
        }

        const flagIndex = recipe.flags.findIndex((flag) =>
            flag._id.equals(flagId)
        );

        if (flagIndex === -1) {
            return res.status(404).json({ message: "Flag not found." });
        }

        recipe.flags.splice(flagIndex, 1);
        await recipe.save();

        res.status(200).json({ message: "Flag deleted successfully." });
    } catch (error) {
        console.error("Error deleting comment:", error);
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

const addRecentlyViewed = async (req, res, next) => {
    try {
        const userId = req.user; 
        const { recipeId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: 'Invalid recipe ID' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const recipeObjectId = new mongoose.Types.ObjectId(recipeId);

        if (!user.recentlyViewed.some(id => id.equals(recipeObjectId))) {
            user.recentlyViewed.push(recipeObjectId);
            if (user.recentlyViewed.length > 4) {
                user.recentlyViewed.shift();
            }
            await user.save();
        }

        res.status(200).json({ message: 'Recipe added to recently viewed' });

    } catch (error) {
        console.error('Error adding to recently viewed:', error);
        next(error);
    }
};

const getRecentlyViewed = async (req, res, next) => {
    try {
        const userId = req.user;

        const user = await User.findById(userId).populate('recentlyViewed');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).send(user.recentlyViewed);

    } catch (error) {
        console.error('Error fetching recently viewed:', error);
        next(error);
    }
};

const clearRecentlyViewed = async (req, res, next) => {
    try {
        const userId = req.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.recentlyViewed = [];
        await user.save();

        res.status(200).json({ message: 'Recently viewed history cleared' });

    } catch (error) {
        console.error('Error clearing recently viewed:', error);
        next(error);
    }
};

module.exports = {
    getAllRecipes,
    getRecipe,
    searchRecipesByIngredients,
    addRecipe,
    updateRecipe,
    publishRecipe,
    rateRecipe,
    deleteRecipe,
    addComment,
    deleteComment,
    flagRecipe,
    toggleFavoriteRecipe,
    getTopRecipes,
    getOwnRecipes,
    getFavouriteRecipes,
    deleteFlag,
    getRecentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed,
};
