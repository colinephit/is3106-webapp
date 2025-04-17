import React, { useState } from "react";
import {
    Hero,
    HomeCategories,
    Subscribe,
    RecentlyViewedRecipes,
} from "../../components";
import { useGetRecipesQuery } from "../../features/recipe/recipeApiSlice";
import useAuth from "../../hooks/useAuth";

const Home = () => {
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
        limit: 4,
        skip: 0,
    });

    const [filterUsed, setFilterUsed] = useState(false);

    const user = useAuth();
    const { data, isLoading } = useGetRecipesQuery(filter);

    const handleFilterChange = (updatedFilter) => {
        setFilter(updatedFilter);

        const hasUsedFilter =
            updatedFilter.search.trim() !== "" ||
            updatedFilter.ingredients.length > 0 ||
            updatedFilter.category !== "" ||
            updatedFilter.cookingTime.min !== 1 ||
            updatedFilter.cookingTime.max !== 999 ||
            updatedFilter.difficultyLevel.min !== 1 ||
            updatedFilter.difficultyLevel.max !== 5;

        setFilterUsed(hasUsedFilter);
    };

    return (
        <>
            <Hero />
            <HomeCategories
                title={"recipe"}
                data={data?.data}
                isLoading={isLoading}
                filterUsed={filterUsed}
                showFilterMessage={filterUsed}
            />
            {!user?.roles?.some(
                (role) => role === "BasicUser" || role === "Admin"
            )}
            <RecentlyViewedRecipes />
        </>
    );
};

export default Home;
