import React, { useState } from "react";
import { Hero, HomeCategories, Subscribe } from "../../components";
import { useGetRecipesQuery } from "../../features/recipe/recipeApiSlice";
// import { useGetBlogsQuery } from "../../features/blog/blogApiSlice";
import useAuth from "../../hooks/useAuth";

const Home = () => {
  const [filter] = useState({
    search: "",
    difficultyLevel: {
      min: 1,
      max: 5
    },
    cookingTime: {
      min: 1,
      max: 999
    },
    sort: "1",
    ingredients: [],
    category: "",
    status: "Published"
  });
  const user = useAuth();
  const recipes = useGetRecipesQuery(filter);
  // const blogs = useGetBlogsQuery();

  return (
    <>
      <Hero />
      <HomeCategories
        title={"recipe"}
        data={recipes?.data}
        isLoading={recipes?.isLoading}
      />
      {!user?.roles?.some(
        (role) => role === "BasicUser" || role === "Admin"
      ) && <Subscribe />}
      {/* <HomeCategories
        title={"blog"}
        data={blogs?.data}
        isLoading={blogs?.isLoading}
      /> */}
    </>
  );
};

export default Home;
