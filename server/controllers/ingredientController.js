const Ingredient = require("../models/ingredientModel");

// placeholder ingredients list
const defaultIngredients = [
    { ingredientName: "Salt" },
    { ingredientName: "Sugar" },
    { ingredientName: "Black Pepper" },
    { ingredientName: "White Pepper" },
    { ingredientName: "Flour" },
    { ingredientName: "Eggs" },
    { ingredientName: "Milk" },
    { ingredientName: "Butter" },
    { ingredientName: "Garlic" },
    { ingredientName: "Onion" },
    { ingredientName: "Tomato" },
    { ingredientName: "Brococli" },
    { ingredientName: "Cabbage" },
    { ingredientName: "Chinese Cabbage" },
    { ingredientName: "Chicken" },
    { ingredientName: "Beef" },
    { ingredientName: "Pork" },
    { ingredientName: "Mutton" },
    { ingredientName: "Salmon" },
    { ingredientName: "Unagi" },
    { ingredientName: "Oyster Sauce" },
    { ingredientName: "Fish Sauce" },
];

// to search all ingredients (supports search query and sorting alphabetically)
exports.searchIngredients = async (req, res) => {
    try {
        const searchQuery = req.query.search || ""; // to get search term from query parameter
        const regex = new RegExp(searchQuery, "i"); // for case-insensitive regex

        // to find ingredients that match the search term (or return all if no search term)
        const ingredients = await Ingredient.find({
            ingredientName: regex,
        }).sort({
            ingredientName: 1,
        }); // to sort ingredients alphabetically

        res.status(200).json(ingredients);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching ingredients",
            error: error.message,
        });
    }
};

// to add a new ingredient (only if not already present)
exports.addIngredient = async (req, res) => {
    try {
        const { ingredientName } = req.body;
        if (!ingredientName) {
            return res
                .status(400)
                .json({ message: "Ingredient name is required" });
        }

        // Check if ingredient already exists (case insensitive)
        const existingIngredient = await Ingredient.findOne({
            ingredientName: { $regex: new RegExp(`^${ingredientName}$`, "i") },
        });
        if (existingIngredient) {
            return res
                .status(400)
                .json({ message: "Ingredient already exists" });
        }

        const newIngredient = new Ingredient({ ingredientName });
        await newIngredient.save();

        res.status(201).json({
            message: "Ingredient added successfully",
            ingredient: newIngredient,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding ingredient",
            error: error.message,
        });
    }
};

// to edit an ingredient (only if not already present)
exports.editIngredient = async (req, res) => {
    try {
        const { ingredientName } = req.body;
        if (!ingredientName) {
            return res
                .status(400)
                .json({ message: "Ingredient name is required" });
        }

        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found" });
        }

        // Check if ingredient already exists (case insensitive)
        let duplicateIngredient = await Ingredient.findOne({
            ingredientName: { $regex: new RegExp(`^${ingredientName}$`, "i") },
        });

        if (
            duplicateIngredient &&
            duplicateIngredient._id.toString() !== req.params.id
        ) {
            return res
                .status(400)
                .json({ message: "Ingredient already exists" });
        }

        ingredient.ingredientName = ingredientName;
        await ingredient.save();

        res.status(201).json({
            message: "Ingredient edited successfully",
            ingredient: ingredient,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error editing ingredient",
            error: error.message,
        });
    }
};

// to delete an ingredient by ID
exports.deleteIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        const ingredient = await Ingredient.findByIdAndDelete(id);

        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found" });
        }

        res.status(200).json({
            message: "Ingredient deleted successfully",
            deletedIngredient: ingredient,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting ingredient",
            error: error.message,
        });
    }
};

// to initialise default ingredients (call this manually or on startup)
exports.initializeDefaultIngredients = async () => {
    try {
        const existingIngredients = await Ingredient.find();

        if (existingIngredients.length === 0) {
            await Ingredient.insertMany(defaultIngredients);
            console.log("Default ingredients initialized");
        } else {
            console.log(
                "Default ingredients already exist. No need to initialize."
            );
        }
    } catch (error) {
        console.error("Error initializing default ingredients:", error.message);
    }
};
