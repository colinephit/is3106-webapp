const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: [true, "Category name is required"],
            unique: true,
            trim: true,
        },
    },
    { timestamps: true } // automatically adds dateCreatedAt and dateUpdatedAt fields
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;