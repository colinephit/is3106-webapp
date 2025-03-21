import React, { useEffect, useState } from "react";
import { Button, ComponentLoading } from "../../components";
import { photo } from "../../assets";
import { RxCross2 } from "react-icons/rx";
import uploadImage from "../../common/uploadImage";
import { LinearProgress } from "@mui/material";
import { toast } from "react-toastify";
import {
  useGetRecipeQuery,
  useUpdateRecipeMutation,
} from "../../features/recipe/recipeApiSlice";
import {
  useAddIngredientMutation,
  useGetIngredientsQuery,
} from "../../features/ingredient/ingredientApiSlice";
import { useGetCategoriesQuery } from "../../features/category/categoryApiSlice";
import { useParams } from "react-router-dom";

const EditRecipe = () => {
  const { id } = useParams();

  const { data, ...rest } = useGetRecipeQuery(id);
  const [updateRecipe, { isLoading }] = useUpdateRecipeMutation();

  const [formDetails, setFormDetails] = useState({
    title: data?.recipeName || "",
    image: data?.image || "",
    description: data?.description || "",
    difficultyLevel: data?.difficultyLevel || "",
    cookingTime: data?.cookingTime || "",
    ingredients: data?.ingredients || [],
    categories: data?.categories || [],
    instructions: data?.instructions || [],
  });

  const [progress, setProgress] = useState(0);
  const [ingredient, setIngredient] = useState("");
  const [category, setCategory] = useState("");
  const [instruction, setInstruction] = useState("");
  const [focused, setFocused] = useState({
    recipeName: "",
    difficultyLevel: "",
    cookingTime: "",
    ingredient: "",
    category: "",
  });

  const [ingredientQuery, setIngredientQuery] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [addIngredientToDB] = useAddIngredientMutation();
  const { data: ingredients, isLoading: isLoadingIngredients } =
      useGetIngredientsQuery(ingredientQuery, {
        skip: ingredientQuery.length < 2, // Don't fetch if the query length is less than 2
      });
  
    useEffect(() => {
      //console.log("Ingredients fetched:", ingredients);
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
      //console.log("Categories fetched:", categories);
      if (categoryQuery.length < 2) {
        setCategorySuggestions([]);
        return;
      }
  
      if (categories) {
        setCategorySuggestions(categories);
      }
    }, [categories, categoryQuery]);

    useEffect(() => {
      if (data) {
        setFormDetails({
          recipeName: data.recipeName || "",
          image: data.image || "",
          description: data.description || "",
          difficultyLevel: data.difficultyLevel || "",
          cookingTime: data.cookingTime || "",
          ingredients: data.ingredients.map(ing => ({
            _id: ing._id,
            ingredientName: ing.ingredientName,
          })) || [],
          categories: data.categories.map(cat => ({
            _id: cat._id,
            categoryName: cat.categoryName,
          })) || [],
          instructions: data.instructions || [],
        });
      }
    }, [data]); // Depend only on `data`

  const handleFocus = (e) => {
    setFocused({ ...focused, [e.target.id]: true });
  };

  const handleChange = (e) => {
    if (e.target.id === "image") {
      uploadImage(e, setProgress, setFormDetails, formDetails);
    } else if (id === "difficultyLevel") {
      let intValue = parseInt(value, 10); // Convert to integer
      if (isNaN(intValue) || intValue < 1) intValue = 1;
      if (intValue > 5) intValue = 5;

      setFormDetails({ ...formDetails, [id]: intValue });
    } else {
      setFormDetails({ ...formDetails, [e.target.id]: e.target.value });
    }
  };

  const handleAddIngredient = () => {
    if (!ingredient) {
      return toast.error("Ingredient cannot be empty");
    }
    const updatedFormDetails = { ...formDetails };
    updatedFormDetails.ingredients.push(ingredient);
    setFormDetails(updatedFormDetails);
    setIngredient("");
  };

  const handleAddIngredientClick = (ing) => {
    setFormDetails((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { _id: ing._id, ingredientName: ing.ingredientName }],
    }));
    setIngredientQuery("");
    //console.log("Form Details after ingredient add:", formDetails);
  };
  
  const handleAddCategoryClick = (cat) => {
    setFormDetails((prev) => ({
      ...prev,
      categories: [...prev.categories, { _id: cat._id, categoryName: cat.categoryName }],
    }));
    setCategoryQuery("");
    //console.log("Form Details after category add:", formDetails);
  };

  const addInstruction = () => {
    if (!instruction) {
      return toast.error("Instruction cannot be empty");
    }
    setFormDetails((prev) => ({
      ...prev,
      instructions: [...prev.instructions, instruction], // Create a new array
    }));
    setInstruction("");
  };

  const removeIngredient = (index) => {
    const updatedIngredients = [...formDetails.ingredients];
    updatedIngredients.splice(index, 1);
    setFormDetails({ ...formDetails, ingredients: updatedIngredients });
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
    //console.log("Form Details before submit:", formDetails);
    e.preventDefault();

    if (!formDetails.image) return toast.error("Upload recipe image");
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

    try {
      const recipe = await toast.promise(
        updateRecipe({ ...formDetails, recipeId: id }).unwrap(),
        {
          pending: "Please wait...",
          success: "Recipe updated successfully",
          error: "Unable to update recipe",
        }
      );
    } catch (error) {
      toast.error(error.data);
      console.error(error);
    }
  };

  return (
    <section className="box flex flex-col gap-6">
      <h2 className="font-bold text-xl">Edit Recipe</h2>
      <hr />
      {rest.isLoading ? (
        <ComponentLoading />
      ) : (
        <form
          className="flex flex-col-reverse md:flex-row gap-4 mt-10 justify-around"
          onSubmit={handleSubmit}
        >
          <div className="basis-1/2 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row justify-between">
              <label
                htmlFor="title"
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
                  aria-describedby="title-error"
                  placeholder="Enter recipe name"
                  className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary"
                />
                <span
                  id="title-error"
                  className="hidden text-red-500 pl-2 text-sm mt-1"
                >
                  Name should at least 3 characters long
                </span>
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
                htmlFor="categories"
                className="text-sm font-semibold mb-3 basis-1/2"
              >
                Add Category
                </label>
                <div className="flex flex-col basis-1/2">
                  <div className="relative flex flex-col gap-2">
                    {/* Input field for searching or adding categories */}
                    <div className="relative flex gap-1 justify-between">
                      <input
                        type="text"
                        onChange={(e) => setCategoryQuery(e.target.value)}
                        value={categoryQuery}
                        placeholder="Search or add a category"
                        className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary w-full"
                      />

                      {/* Category suggestions dropdown */}
                      {categorySuggestions.length > 0 && (
                        <ul className="absolute left-0 w-full bg-white border rounded shadow-md top-full max-h-40 overflow-auto z-50">
                          {categorySuggestions.map((cat) => (
                            <li
                              key={cat._id}
                              onClick={() => handleAddCategoryClick(cat)} // Handle category click
                              className="p-2 cursor-pointer hover:bg-gray-200"
                            >
                              {cat.categoryName}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Display existing categories */}
                    <ul className="flex flex-col gap-2">
                      {formDetails.categories.map((ele, index) => (
                        <li
                          className="flex justify-between items-center shadow hover:shadow-md rounded p-2 gap-2"
                          key={ele._id}
                        >
                          {ele.categoryName} {/* Display category name */}
                          <RxCross2
                            className="cursor-pointer"
                            onClick={() => removeCategory(index)} // Remove category functionality
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
                  focused={focused.difficultyLevel.toString()}
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
                Cooking time
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
                Add Ingredients
                </label>
                <div className="flex flex-col basis-1/2">
                  <div className="relative flex flex-col gap-2">
                    {/* Input field for searching or adding ingredients */}
                    <div className="relative flex gap-1 justify-between">
                      <input
                        type="text"
                        onChange={(e) => setIngredientQuery(e.target.value)} // Update ingredient query state
                        value={ingredientQuery}
                        placeholder="Search or add an ingredient"
                        className="p-1.5 border bg-gray-100 rounded focus:outline outline-primary w-full"
                      />

                      {/* Ingredient suggestions dropdown */}
                      {ingredientSuggestions.length > 0 && (
                        <ul className="absolute left-0 w-full bg-white border rounded shadow-md top-full max-h-40 overflow-auto z-50">
                          {ingredientSuggestions.map((ing) => (
                            <li
                              key={ing._id}
                              onClick={() => handleAddIngredientClick(ing)} // Add ingredient on click
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
                      handleClick={handleAddIngredient} // Handle adding ingredient when clicked
                    />
                  </div>

                  {/* Display added ingredients */}
                  <ul className="flex flex-col gap-2">
                    {formDetails.ingredients.map((ele, index) => (
                      <li
                        className="flex justify-between items-center shadow hover:shadow-md rounded p-2 gap-2"
                        key={ele._id} // Unique key for each ingredient
                      >
                        {ele.ingredientName} {/* Display ingredient name */}
                        <RxCross2
                          className="cursor-pointer"
                          onClick={() => removeIngredient(index)} // Remove ingredient on click
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
              content={"Save changes"}
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
      )}
    </section>
  );
};

export default EditRecipe;
