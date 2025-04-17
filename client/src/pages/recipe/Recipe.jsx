import React, { useEffect, useState } from "react";
import { AllCards, ComponentLoading } from "../../components";
import { useDispatch } from "react-redux";
import { setRecipes } from "../../features/recipe/recipeSlice";
import { useGetRecipesQuery } from "../../features/recipe/recipeApiSlice";
import useTitle from "../../hooks/useTitle";

const Recipe = () => {
    const [filter, setFilter] = useState({
        search: "",
        difficultyLevel: {
            min: 1,
            max: 5,
        },
        cookingTime: {
            min: 1,
            max: 30,
        },
        sort: "1",
        ingredients: [],
        category: "",
        status: "Published",
        limit: 6,
        skip: 0,
        currentPage: 1,
    });

    const { data, isLoading } = useGetRecipesQuery(filter);
    const dispatch = useDispatch();
    useTitle("RecipeShare - All Recipes");

    useEffect(() => {
        if (!isLoading && data) {
            dispatch(setRecipes(data));
        }
    }, [isLoading]);

    const handleFilterChange = (filter) => {
        console.log("Applied Filters:", filter);
        setFilter(filter);

        dispatch(setRecipes(data));
    };

    return (
        <>
            {isLoading ? (
                <ComponentLoading />
            ) : (
                <AllCards
                    mainTitle={"Discover Flavorful Creations"}
                    tagline={
                        "Delight in a diverse collection of mouthwatering recipes, curated and shared by passionate food enthusiasts."
                    }
                    type={"recipe"}
                    data={data?.data}
                    count={data?.totalCount}
                    onFilterChange={handleFilterChange}
                />
            )}
        </>
    );
};

export default Recipe;
