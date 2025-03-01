const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        reportSubject: {
            type: String,
            required: true,
            trim: true,
        },
        reportComment: {
            type: String,
            required: true,
            trim: true,
        },
        user: { //reference to the User model, specifying the user who reported the recipe
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipe: { //reference to the Recipe model, specifying the reported recipe
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;