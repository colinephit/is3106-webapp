const Category = require("../models/categoryModel");

// to search all ingredients (supports search query and sorting alphabetically)
exports.searchCategories = async (req, res) => {
  try {
    const searchQuery = req.query.search || ""; // to get search term from query parameter
    const regex = new RegExp(searchQuery, "i"); // for case-insensitive regex

    // to find ingredients that match the search term (or return all if no search term)
    const categories = await Category.find({ categoryName: regex }).sort({
      categoryName: 1,
    }); // to sort ingredients alphabetically

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching categories",
      error: error.message,
    });
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
    const existingCategory = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({ categoryName });
    await newCategory.save();

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding category",
      error: error.message,
    });
  }
};

// to edit category (only for admin!)
exports.editCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const { id } = req.params; // Extract id from params

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Find the category by ID
    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if a category with the new name already exists (excluding the current category)
    const duplicateCategory = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
      _id: { $ne: id }, // Exclude the current category
    });

    if (duplicateCategory) {
      return res.status(409).json({ message: "Category already exists" });
    }

    // Update the category name
    existingCategory.categoryName = categoryName;
    await existingCategory.save();

    res.status(200).json({
      // Changed status code to 200 for successful update
      message: "Category edited successfully",
      category: existingCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error editing category",
      error: error.message,
    });
  }
};

// to delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully",
      deletedCategory: category,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching category",
      error: error.message,
    });
  }
};
