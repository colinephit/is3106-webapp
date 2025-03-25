import React, { useEffect, useState } from "react";
import { NoData, SingleCard } from "..";
import { useGetIngredientsQuery } from "../../features/ingredient/ingredientApiSlice";

const index = ({ mainTitle, tagline, type, data }) => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);

  const { data: ing, isLoading: isLoadingIngredients } =
    useGetIngredientsQuery(currentIngredient, {
      skip: currentIngredient.length < 2, // Don't fetch if the query length is less than 2
    });

  useEffect(() => {
    console.log("Ingredients fetched:", ing);
    if (currentIngredient.length < 2) {
      setIngredientSuggestions([]);
      return;
    }

    if (ing) {
      console.log("set")
      setIngredientSuggestions(ing);
    }
  }, [ing, currentIngredient]);

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const handleAddIngredientClick = (ing) => {
    setIngredients([...ingredients, ing.ingredientName]);
    setCurrentIngredient("");
  };

  const removeIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  // Use the data prop for rendering when no ingredients are selected
  const displayData = ingredients.length === 0 ? data : [];

  return (
    <section className="box flex flex-col items-center">
      <div className="flex flex-col items-center gap-5 w-full mb-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center md:text-start">
          {mainTitle}
        </h2>
        <p className="text-center">{tagline}</p>
        <div className="flex gap-2">
          <div className="relative flex gap-1 justify-between">
            <input
              type="text"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              className="border-gray-200 border-2 p-2 rounded-lg"
              placeholder="Enter ingredient to search"
            />
            {ingredientSuggestions.length > 0 && (
              <ul className="absolute left-0 w-full bg-white border rounded shadow-md top-full max-h-40 overflow-auto z-50">
                {ingredientSuggestions.map((ing) => (
                  <li
                    key={ing._id}
                    onClick={() => handleAddIngredientClick(ing)}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                  >
                    {ing.ingredientName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={addIngredient}
            className="bg-primary text-white p-2 rounded-lg"
          >
            Add
          </button>
        </div>

        {/* Display added ingredients to search for */}
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="bg-gray-200 p-2 rounded-lg flex items-center gap-1"
              >
                {ingredient}
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-red-500"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-8 w-full">
        <h3 className="font-bold text-xl w-full">Recent {type}s</h3>
        {displayData?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {displayData?.map((singleData) => (
              <SingleCard
                key={singleData._id}
                singleData={singleData}
                type={type}
              />
            ))}
          </div>
        ) : (
          <NoData text={"Data"} />
        )}
      </div>
    </section>
  );
};

export default index;