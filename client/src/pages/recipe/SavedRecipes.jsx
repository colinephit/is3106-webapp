import React, { useState, useMemo } from "react";
import { AllCards, ComponentLoading } from "../../components";
import { useGetFavoriteRecipesQuery } from "../../features/recipe/recipeApiSlice";

const SavedRecipes = () => {
    const [filter, setFilter] = useState({
        search: "",
        difficultyLevel: {
            min: 1,
            max: 5,
        },
        cookingTime: {
            min: 1,
            max: 999,
        },
        sort: "1",
        ingredients: [],
        category: "",
        status: "Published",
    });

    const { data: allRecipes, isLoading } = useGetFavoriteRecipesQuery(filter);

    const handleFilterChange = (updatedFilter) => {
        setFilter(updatedFilter);
    };

    const filteredRecipes = useMemo(() => {
        if (!allRecipes) return [];
        return allRecipes.recipes;
    }, [allRecipes]);

    if (isLoading) return <ComponentLoading />;

    return (
        <div className="box py-10">
            <AllCards
                mainTitle={"Your Flavorful Collection"}
                tagline={
                    "Welcome to your personal culinary treasury - a haven for your favorite recipes!"
                }
                type={"recipe"}
                data={filteredRecipes}
                filter={filter}
                onFilterChange={handleFilterChange}
                showFilterMessage={false}
                count={allRecipes?.totalCount || 0}
            />
        </div>
    );
};

export default SavedRecipes;
