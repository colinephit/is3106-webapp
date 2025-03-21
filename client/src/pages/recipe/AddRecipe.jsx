import React, { useState, useEffect } from "react";
import { Button } from "../../components";
import { photo } from "../../assets";
import { RxCross2 } from "react-icons/rx";
import uploadImage from "../../common/uploadImage";
import { LinearProgress } from "@mui/material";
import { toast } from "react-toastify";
import { useAddRecipeMutation } from "../../features/recipe/recipeApiSlice";
import { useGetUserQuery } from "../../features/user/userApiSlice";
import {
  useAddIngredientMutation,
  useGetIngredientsQuery,
} from "../../features/ingredient/ingredientApiSlice";
import { useGetCategoriesQuery } from "../../features/category/categoryApiSlice";
import useTitle from "../../hooks/useTitle";
import useAuth from "../../hooks/useAuth";

const AddRecipe = () => {
  useTitle("Recipen - Add Recipe");
  const user = useAuth();
  const { data, ...rest } = useGetUserQuery(user?.userId);

  const [formDetails, setFormDetails] = useState({
    recipeName: "",
    image: "",
    description: "",
    difficultyLevel: "",
    cookingTime: "",
    ingredients: [],
    instructions: [],
    categories: [],
    author: user?.userId,
    status: "Published",
  });
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [instruction, setInstruction] = useState("");
  const [focused, setFocused] = useState({
    recipeName: "",
    difficultyLevel: "",
    cookingTime: "",
    ingredients: "",
    categories: "",
  });
  const [addRecipe, { isLoading }] = useAddRecipeMutation();
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [addIngredientToDB] = useAddIngredientMutation();

  const { data: ingredients, isLoading: isLoadingIngredients } =
    useGetIngredientsQuery(ingredientQuery, {
      skip: ingredientQuery.length < 2, // Don't fetch if the query length is less than 2
    });

  useEffect(() => {
    console.log("Ingredients fetched:", ingredients);
    if (ingredientQuery.length < 2) {
      setIngredientSuggestions([]);
      return;
    }

    if (ingredients) {
      setIngredientSuggestions(ingredients);
    }
  }, [ingredients, ingredientQuery]);

  const [categoryQuery, setCategoryQuery] = useState("");
  const [categorySuggestions, setCategorySuggestions] = useState([]);

  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoriesQuery(categoryQuery, {
      skip: categoryQuery.length < 2, // Don't fetch if the query length is less than 2
    });

  useEffect(() => {
    console.log("Categories fetched:", categories);
    if (categoryQuery.length < 2) {
      setCategorySuggestions([]);
      return;
    }

    if (categories) {
      setCategorySuggestions(categories);
    }
  }, [categories, categoryQuery]);

  const handleFocus = (e) => {
    setFocused({ ...focused, [e.target.id]: true });
  };

  const handleChange = (e) => {
    if (e.target.id === "image") {
      uploadImage(e, setProgress, setFormDetails, formDetails);
    } else if (e.target.id === "difficultyLevel") {
      let intValue = parseInt(e.target.value, 10); // Convert to integer
      if (isNaN(intValue) || intValue < 1) intValue = 1;
      if (intValue > 5) intValue = 5;

      setFormDetails({ ...formDetails, [e.target.id]: intValue });
    } else {
      setFormDetails({ ...formDetails, [e.target.id]: e.target.value });
    }
  };

  const handleAddIngredient = async () => {
    if (!ingredientQuery) return toast.error("Ingredient cannot be empty");

    // Check if the ingredient exists in suggestions
    const existingIngredient = ingredientSuggestions.find(
      (ing) => ing.ingredientName === ingredientQuery
    );

    if (existingIngredient) {
      //logging
      console.log("Existing ingredient:", existingIngredient);
      // If exists, add only the ID
      setFormDetails((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, { _id: existingIngredient._id, name: existingIngredient.ingredientName }], // Store ID only
      }));
    } else {
      // If doesn't exist, add to DB first
      try {
        const newIngredient = await addIngredientToDB({
          ingredientName: ingredientQuery,
        }).unwrap();
        //logging
        console.log("New ingredient:", newIngredient);
        setFormDetails((prev) => ({
          ...prev,
          ingredients: [...prev.ingredients, { _id: newIngredient.ingredient._id, name: newIngredient.ingredient.ingredientName }], // Store new ID
        }));
        //logging
        console.log("Form details:", formDetails);

        toast.success("Ingredient added successfully");
      } catch (error) {
        toast.error("Failed to add ingredient");
      }
    }

    setIngredientQuery(""); // Reset input field
  };

const handleAddIngredientClick = (ing) => {
  setFormDetails((prev) => ({
    ...prev,
    ingredients: [...prev.ingredients, { _id: ing._id, name: ing.ingredientName }],
  }));
  setIngredientQuery("");
};

const handleAddCategoryClick = (cat) => {
  setFormDetails((prev) => ({
    ...prev,
    categories: [...prev.categories, { _id: cat._id, name: cat.categoryName }],
  }));
  setCategoryQuery("");
};

  const addInstruction = () => {
    if (!instruction) {
      return toast.error("Instruction cannot be empty");
    }
    const updatedFormDetails = { ...formDetails };
    updatedFormDetails.instructions.push(instruction);
    setFormDetails(updatedFormDetails);
    setInstruction("");
  };

  const removeIngredient = (index) => {
    setFormDetails((prev) => {
      const updatedIngredients = [...prev.ingredients];
      updatedIngredients.splice(index, 1);
      return { ...prev, ingredients: updatedIngredients };
    });
  };

  const removeCategory = (index) => {
    const updatedCategories = [...formDetails.categories];
    updatedCategories.splice(index, 1);
    setFormDetails({ ...formDetails, categories: updatedCategories });
  };

  const removeInstruction = (index) => {
    const updatedInstructions = [...formDetails.instructions];
    updatedInstructions.splice(index, 1);
    setFormDetails({ ...formDetails, instructions: updatedInstructions });
  };

  const handleSubmit = async (e) => {
    console.log("submit button clicked");
    e.preventDefault();

    console.log(formDetails);

    //if (!formDetails.image) return toast.error("Upload recipe image");
    if (!formDetails.ingredients.length)
      return toast.error("Ingredients cannot be empty");
    if (!formDetails.instructions.length)
      return toast.error("Instructions cannot be empty");
    if (
      !formDetails.difficultyLevel ||
      formDetails.difficultyLevel < 1 ||
      formDetails.difficultyLevel > 5
    ) {
      return toast.error("Difficulty level must be between 1 and 5");
    }

    console.log("Submitting data:", formDetails); // Debugging

    try {
      const recipe = await toast.promise(
        addRecipe({ ...formDetails }).unwrap(),
        {
          pending: "Please wait...",
          success: "Recipe added successfully",
          error: "Unable to add recipe",
        }
      );
      setFormDetails({
        recipeName: "",
        image: "",
        description: "",
        difficultyLevel: "",
        cookingTime: "",
        ingredients: [],
        instructions: [],
        categories: [],
      });
      setFocused({
        recipeName: "",
        difficultyLevel: "",
        cookingTime: "",
        ingredient: "",
        category: "",
      });
    } catch (error) {
      toast.error(error.data);
      console.error(error);
    }
  };

  return (
    <section className="box flex flex-col gap-6">
      <h2 className="font-bold text-xl">Add New Recipe</h2>
      <hr />
      <form
        className="flex flex-col-reverse md:flex-row gap-4 mt-10 justify-around"
        onSubmit={handleSubmit}
      >
        <div className="basis-1/2 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between">
            <label
              htmlFor="recipeName"
              className="text-sm font-semibold mb-3 basis-1/2"
            >
              Recipe name
            </label>
            <div className="flex flex-col basis-1/2">
              <input
                type="text"
                onChange={handleChange}
                value={formDetails.recipeName}
                id="recipeName"
                name="recipeName"
                onBlur={handleFocus}
                focused={focused.recipeName.toString()}
                pattern={"^.{3,}$"}
                required
                aria-required="true"
                aria-describedby="recipeName-error"
                placeholder="Enter recipe name"
                className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary"
              />
              <span
                id="recipeName-error"
                className="hidden text-red-500 pl-2 text-sm mt-1"
              >
                Name should at least 3 characters long
              </span>
            </div>
          </div>
          <hr />
          <div className="flex flex-col sm:flex-row justify-between">
            <label
              htmlFor="categories"
              className="text-sm font-semibold mb-3 basis-1/2"
            >
              Add category
            </label>
            <div className="flex flex-col basis-1/2">
                <div className="relative flex flex-col gap-2">
                    <div className="relative flex gap-1 justify-between">
                        <input
                            type="text"
                            onChange={(e) => setCategoryQuery(e.target.value)}
                            value={categoryQuery}
                            placeholder="Search or add a category"
                            className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary w-full"
                        />

                        {categorySuggestions.length > 0 && (
                            <ul className="absolute left-0 w-full bg-white border rounded shadow-md top-full max-h-40 overflow-auto z-50">
                                {categorySuggestions.map((cat) => (
                                    <li
                                        key={cat._id}
                                        onClick={() => handleAddCategoryClick(cat)}
                                        className="p-2 cursor-pointer hover:bg-gray-200"
                                    >
                                        {cat.categoryName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <ul className="flex flex-col gap-2">
                        {formDetails.categories.map((ele, index) => (
                            <li
                                className="flex justify-between items-center shadow hover:shadow-md rounded p-2 gap-2"
                                key={ele._id}
                            >
                                {ele.name}
                                <RxCross2
                                    className="cursor-pointer"
                                    onClick={() => removeCategory(index)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
          <hr />
          <div className="flex flex-col sm:flex-row justify-between">
            <label
              htmlFor="description"
              className="text-sm font-semibold mb-3 basis-1/2"
            >
              Recipe description
            </label>
            <div className="flex flex-col basis-1/2">
              <textarea
                type="text"
                onChange={handleChange}
                value={formDetails.description}
                id="description"
                required
                name="description"
                rows="5"
                aria-required="true"
                placeholder="Enter your description here..."
                className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary w-full resize-none"
              ></textarea>
            </div>
          </div>
          <hr />
          <div className="flex flex-col sm:flex-row justify-between">
            <label
              htmlFor="difficultyLevel"
              className="text-sm font-semibold mb-3 basis-1/2"
            >
              Difficulty Level
            </label>
            <div className="flex flex-col basis-1/2">
              <input
                type="number"
                onChange={handleChange}
                value={formDetails.difficultyLevel}
                id="difficultyLevel"
                required
                name="difficultyLevel"
                min="1"
                max="5"
                onBlur={handleFocus}
                aria-required="true"
                aria-describedby="difficultyLevel-error"
                placeholder="Enter difficulty level (1-5)"
                className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary"
              />
              <span
                id="difficultyLevel-error"
                className="hidden text-red-500 pl-2 text-sm mt-1"
              >
                Should not include letters or special characters
              </span>
            </div>
          </div>
          <hr />
          <div className="flex flex-col sm:flex-row justify-between">
            <label
              htmlFor="cookingTime"
              className="text-sm font-semibold mb-3 basis-1/2"
            >
              Cooking time (in minutes)
            </label>
            <div className="flex flex-col basis-1/2">
              <input
                type="number"
                onChange={handleChange}
                value={formDetails.cookingTime}
                id="cookingTime"
                required
                name="cookingTime"
                onBlur={handleFocus}
                focused={focused.cookingTime.toString()}
                aria-required="true"
                aria-describedby="cookingTime-error"
                placeholder="Total cooking time in mins."
                className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary"
              />
              <span
                id="cookingTime-error"
                className="hidden text-red-500 pl-2 text-sm mt-1"
              >
                Must only include numbers
              </span>
            </div>
          </div>
          <hr />
          <div className="flex flex-col sm:flex-row justify-between">
            <label
              htmlFor="ingredient"
              className="text-sm font-semibold mb-3 basis-1/2"
            >
              Add ingredients
            </label>
            <div className="flex flex-col basis-1/2">
              <div className="relative flex items-center gap-2">
                <div className="relative flex gap-1 justify-between">
                  <input
                    type="text"
                    onChange={(e) => setIngredientQuery(e.target.value)}
                    value={ingredientQuery}
                    placeholder="Search or add an ingredient"
                    className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary w-full"
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
                {/* Add button for ingredients not yet in database */}
                <Button
                  content={"Add"}
                  customCss={"rounded text-sm px-4 py-1"}
                  handleClick={handleAddIngredient}
                />
              </div>
              <ul className="flex flex-col gap-2">
                {formDetails.ingredients.map((ele, index) => (
                  <li
                    className="flex justify-between items-center shadow hover:shadow-md rounded p-2 gap-2"
                    key={ele}
                  >
                    {ele.name}
                    <RxCross2
                      className="cursor-pointer"
                      onClick={() => removeIngredient(index)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <hr />
          <div className="flex flex-col gap-4 justify-between">
            <div className="flex gap-1 justify-between items-center">
              <label
                htmlFor="instruction"
                className="text-sm font-semibold mb-3 basis-1/2"
              >
                Add Steps
              </label>
              <Button
                content={"Add"}
                customCss={"rounded text-sm px-4 py-1"}
                handleClick={addInstruction}
              />
            </div>
            <div className="flex flex-col basis-1/2 gap-2">
              <textarea
                type="text"
                onChange={(e) => setInstruction(e.target.value)}
                value={instruction}
                id="instruction"
                name="instruction"
                rows="7"
                aria-required="true"
                placeholder="Write your steps here..."
                className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary w-full resize-none"
              ></textarea>
              {/* All added instructions */}
              <ul className="flex flex-col gap-2">
                {formDetails.instructions.map((ele, i) => (
                  <li
                    className="flex justify-between items-start gap-4 shadow hover:shadow-md rounded p-2"
                    key={`step-${i}`}
                  >
                    <div className="flex flex-col">
                      <h3 className="font-bold">Step {i + 1}</h3>
                      <p className="text-sm text-gray-700">{ele}</p>
                    </div>
                    <div>
                      <RxCross2
                        className="cursor-pointer"
                        size={20}
                        onClick={() => removeInstruction(i)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button
            content={"Add recipe"}
            type={"submit"}
            customCss={"rounded px-4 py-1 max-w-max"}
            loading={isLoading}
          />
        </div>
        <hr className="block md:hidden mt-6" />
        {/* Upload recipe image */}
        <div className="basis-1/3 rounded-xl shadow-md hover:shadow-primary hover:shadow flex justify-center items-center w-full p-8 max-h-[300px]">
          <label
            htmlFor="image"
            className="font-bold cursor-pointer flex flex-col justify-center items-center w-full"
          >
            <div
              className={formDetails.image ? "w-[65%] mb-2" : "w-[30%] mb-6"}
            >
              {progress > 0 && progress < 100 ? (
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  color="warning"
                />
              ) : (
                <img
                  src={formDetails.image || photo}
                  alt="upload photo"
                  className="w-full "
                />
              )}
            </div>
            <p className="text-center">
              Drag your image here, or
              <span className="text-primary"> browse</span>
            </p>
          </label>
          <input
            type="file"
            id="image"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      </form>
    </section>
  );
};

export default AddRecipe;
