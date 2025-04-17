import React, { useState } from "react";
import { SingleCard, NoData, Button } from "..";
import { useGetRecentlyViewedQuery, useClearRecentlyViewedMutation } from "../../features/recipe/recipeApiSlice"; 

const RecentlyViewedRecipes = () => {
  const { data: recentRecipes, isLoading, isError } = useGetRecentlyViewedQuery(); 
  const [clearRecentlyViewedApi, { isLoading: isClearing, isSuccess: isCleared, isError: clearError }] = useClearRecentlyViewedMutation();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearHistory = async () => {
    setShowConfirm(false);
    try {
      await clearRecentlyViewedApi(); 
    } catch (error) {
      console.error("Error clearing recently viewed:", error);
    }
  };

  if (isLoading) {
    return <div>Loading recently viewed recipes...</div>;
  }

  if (isError) {
    return <div>Error loading recently viewed recipes.</div>;
  }

  return (
    <section className="box mt-28 flex flex-col items-center gap-6">
      <div className="w-full flex justify-between items-center">
        <h2 className="text-3xl font-bold capitalize">Recently Viewed Recipes</h2>
        {recentRecipes?.length > 0 && (
          <Button
            content={"Clear History"}
            handleClick={() => setShowConfirm(true)}
            customCss="rounded-lg text-sm px-4 py-2"
            disabled={isClearing}
          />
        )}
      </div>

      <hr className="w-full" />

      {recentRecipes?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10" style={{ width: "100%" }}>
          {recentRecipes.slice(0, 4).map((recipe) => (
            <SingleCard key={recipe._id} singleData={recipe} type="recipe" />
          ))}
        </div>
      ) : (
        <NoData text="Recently Viewed" />
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Clear Recently Viewed Recipes?
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              This action cannot be undone. Are you sure?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                disabled={isClearing}
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RecentlyViewedRecipes;