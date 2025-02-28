const Category = require("../models/categoryModel");

// to get all categories (with alphabetical order & search)
exports.getAllCategories = async (req, res) => {
    try {
        const searchQuery = req.query.search || "";
        const regex = new RegExp(searchQuery, "i"); // Case-insensitive search

        const categories = await Category.find({ categoryName: regex })
            .sort({ categoryName: 1 });

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

// to add a new category (only for admin!)
exports.addCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        if (!categoryName) {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Check if the category already exists
        const existingCategory = await Category.findOne({ categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") } });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const newCategory = new Category({ categoryName });
        await newCategory.save();

        res.status(201).json({ message: "Category added successfully", category: newCategory });
    } catch (error) {
        res.status(500).json({ message: "Error adding category", error: error.message });
    }
};
