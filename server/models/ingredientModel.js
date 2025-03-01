const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
    {
        ingredientName: {
            type: String,
            required: [true, "Ingredient name is required"],
            unique: true,
            immutable: true, // this keeps the name permanent after creation
            trim: true,
            validate: {
                validator: function (value) {
                    const nameRegex = /^[A-Za-z\s-]+$/;
                    return nameRegex.test(value);
                },
                message: "Ingredient name must contain only letters, spaces, or hyphens.",
            },
        },
    },
    { timestamps: true } // this uto-generates dateCreatedAt & dateUpdatedAt fields
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
module.exports = Ingredient;
