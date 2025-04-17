import React, { useState } from "react";
import { AllCards, ComponentLoading } from "../../components";
import { useGetMyRecipesQuery } from "../../features/recipe/recipeApiSlice";
import useTitle from "../../hooks/useTitle";

const MyRecipes = () => {
  const { data, isLoading } = useGetMyRecipesQuery();
  useTitle("RecipeShare - My Recipes");

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

  const handleFilterChange = (updatedFilter) => {
    setFilter(updatedFilter);
  };

  return (
    <>
      {isLoading ? (
        <ComponentLoading />
      ) : (
        <AllCards
          mainTitle={"Your Original Creations"}
          tagline={
            "Welcome to your dedicated space where your imagination takes the lead."
          }
          type={"recipe"}
          data={data?.recipes || []}
          filter={filter}
          onFilterChange={handleFilterChange}
          showFilterMessage={false}
          count={data?.totalCount || 0}
        />
      )}
    </>
  );
};

export default MyRecipes;
