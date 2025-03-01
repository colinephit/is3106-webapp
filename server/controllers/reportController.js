const Report = require('../models/reportModel');
const Recipe = require('../models/recipeModel');

// to create a new report for a specific recipe
const createReport = async (req, res) => {
    try {
        const { reportSubject, reportComment } = req.body;
        const { recipeId } = req.params;
        const userId = req.user._id; // assuming user ID is available in req.user

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const newReport = new Report({
            reportSubject,
            reportComment,
            user: userId,
            recipe: recipeId,
        });

        await newReport.save();

        res.status(201).json({ message: 'Report submitted successfully', report: newReport });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createReport,
};

//no reportRoutes: createReport will be used in recipeRoutes instead, as the report is found through specific recipe