import React from "react";
import { AllCards, ComponentLoading } from "../../components";
import { useGetMyRecipesQuery } from "../../features/recipe/recipeApiSlice";
import useAuth from "../../hooks/useAuth";
import useTitle from "../../hooks/useTitle";

const index = () => {
  const { data, isLoading } = useGetMyRecipesQuery();
  const user = useAuth();
  useTitle("Recipen - My Recipes");
  
  const updatedData = data?.filter((obj) => {
    console.log("obj.author._id type:", typeof obj.author._id);
    console.log("user?.userId type:", typeof user?.userId);
    console.log("obj.author._id:", obj.author._id);
    console.log("user?.userId:", user?.userId);
    return String(obj.author._id.toString()) === String(user?.userId.toString());
  });

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
          data={updatedData}
        />
      )}
    </>
  );
};

export default index;
