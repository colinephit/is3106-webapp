import React, { useState, useMemo } from "react";
import { AllCards, ComponentLoading } from "../../components";
import { useGetRecipesQuery } from "../../features/recipe/recipeApiSlice";
import useAuth from "../../hooks/useAuth";

const SavedRecipes = () => {
  const { data: allRecipes, isLoading } = useGetRecipesQuery();
  const user = useAuth();

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

  const favorites = user?.favorites || [];

  const favoriteSet = useMemo(() => new Set(favorites.map((id) => id.toString())), [favorites]);

  const filteredRecipes = useMemo(() => {
    if (!allRecipes) return [];

    return allRecipes
      .filter((recipe) => favoriteSet.has(recipe._id.toString()))
      .filter((recipe) => {
        const { search, difficultyLevel, cookingTime, ingredients, category } = filter;

        const matchesSearch = recipe.title
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesDifficulty =
          recipe.difficulty >= difficultyLevel.min &&
          recipe.difficulty <= difficultyLevel.max;

        const matchesCookingTime =
          recipe.cookingTime >= cookingTime.min &&
          recipe.cookingTime <= cookingTime.max;

        const matchesIngredients =
          ingredients.length === 0 ||
          ingredients.every((ing) =>
            recipe.ingredients.includes(ing.toLowerCase())
          );

        const matchesCategory =
          !category || recipe.category.toLowerCase() === category.toLowerCase();

        return (
          matchesSearch &&
          matchesDifficulty &&
          matchesCookingTime &&
          matchesIngredients &&
          matchesCategory
        );
      });
  }, [allRecipes, favoriteSet, filter]);

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
      />
    </div>
  );
};

export default SavedRecipes;
