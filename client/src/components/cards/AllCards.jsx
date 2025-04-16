import React, { useEffect, useState } from "react";
import { NoData, SingleCard } from "..";
import { useGetIngredientsQuery } from "../../features/ingredient/ingredientApiSlice";
import { useGetAllCategoriesQuery } from "../../features/category/categoryApiSlice";
import Slider from '@mui/material/Slider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Index = ({ mainTitle, tagline, type, data, onFilterChange }) => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    difficultyLevel: {
      min: 1,
      max: 5
    },
    cookingTime: {
      min: 1,
      max: 600
    },
    sort: "1",
    ingredients: [],
    category: "",
    status: "Published"
  });

  const [filterUsed, setFilterUsed] = useState(false);

  const sortOptions = [
    { value: "1", label: "Newest" },
    { value: "2", label: "Oldest" },
    { value: "3", label: "Highest Rated" },
    { value: "4", label: "Lowest Rated" },
  ];

  const { data: ing } =
    useGetIngredientsQuery(currentIngredient, {
      skip: currentIngredient.length < 2,
    });

  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();

  useEffect(() => {
    if (!categoriesLoading && categoriesData) {
      setCategoryList(categoriesData);
    }
  }, [categoriesLoading, categoriesData]);

  useEffect(() => {
    onFilterChange(filter);
    const hasUsedFilter =
      filter.search.trim() !== "" ||
      filter.ingredients.length > 0 ||
      filter.category !== "" ||
      filter.cookingTime.min !== 1 ||
      filter.cookingTime.max !== 600 ||
      filter.difficultyLevel.min !== 1 ||
      filter.difficultyLevel.max !== 5;

    setFilterUsed(hasUsedFilter);
  }, [filter, onFilterChange]);

  useEffect(() => {
    if (currentIngredient.length < 2) {
      setIngredientSuggestions([]);
      return;
    }

    if (ing) {
      setIngredientSuggestions(ing);
    }
  }, [ing, currentIngredient]);

  const handleAddIngredientClick = (ing) => {
    setFilter({ ...filter, "ingredients": [...filter.ingredients, ing] });
    setCurrentIngredient("");
  };

  const removeIngredient = (index) => {
    const newIngredients = [...filter.ingredients];
    newIngredients.splice(index, 1);
    setFilter({ ...filter, "ingredients": newIngredients });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleRangeChange = (name, value) => {
    setFilter((prev) => ({
      ...prev,
      [name]: { "min": Number(value[0]), "max": Number(value[1]) },
    }));
  };

  const timeValueText = (value) => `${value} min`;
  const difficultyValueText = (value) => `${value}`;

  const displayData = ingredients.length === 0 ? data : [];

  return (
    <section className="box flex flex-col items-center">
      <div className="flex flex-col items-center gap-5 w-full mb-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center md:text-start">
          {mainTitle}
        </h2>
        <p className="text-center">{tagline}</p>
        <div className="flex gap-3 items-start">
          {/* Search */}
          <input
            type="text"
            name="search"
            value={filter.search}
            onChange={handleInputChange}
            placeholder="Search recipes..."
            className="w-full p-2 border rounded mb-3"
          />

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography component="span">Filters</Typography>
            </AccordionSummary>
            <AccordionDetails className="text-center">
              
              {/* cooking time */}
                <div>
                  <label className="block font-medium mt-3">Cooking Time (in mins)</label>

                  {/* Inputs */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <input
                      type="number"
                      min={1}
                      max={600}
                      value={filter.cookingTime.min}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          cookingTime: {
                            ...prev.cookingTime,
                            min: Math.min(Number(e.target.value), prev.cookingTime.max),
                          },
                        }))
                      }
                      className="w-20 px-2 py-1 border rounded text-sm text-center"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      min={filter.cookingTime.min}
                      max={600}
                      value={filter.cookingTime.max}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          cookingTime: {
                            ...prev.cookingTime,
                            max: Math.max(Number(e.target.value), prev.cookingTime.min),
                          },
                        }))
                      }
                      className="w-20 px-2 py-1 border rounded text-sm text-center"
                    />
                  </div>

                  {/* Slider */}
                  <Slider
                  sx={{
                    width: 150,
                    color: '#FACC15',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#FACC15',
                      '&:hover, &.Mui-focusVisible, &.Mui-active': {
                        boxShadow: 'none',
                        outline: 'none',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#FACC15',
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#FEF9C3',
                    },
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: '#FACC15',
                      color: '#000',
                      borderRadius: '4px',
                    },
                    '& .MuiSlider-thumb:before': {
                      boxShadow: 'none',
                    },
                  }}                  
                  
                    getAriaLabel={() => "Cooking Time range"}
                    value={[filter.cookingTime.min, filter.cookingTime.max]}
                    onChange={(e, newValue) => handleRangeChange("cookingTime", newValue)}
                    min={1}
                    max={600}
                    valueLabelDisplay="auto"
                    getAriaValueText={timeValueText}
                  />
                </div>

                {/* difficulty level */}
                <div>
                  <label className="block font-medium mt-3">Difficulty Level (1-5)</label>
                  <Slider
                  sx={{
                    width: 150,
                    color: '#FACC15',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#FACC15',
                      '&:hover, &.Mui-focusVisible, &.Mui-active': {
                        boxShadow: 'none',
                        outline: 'none',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#FACC15',
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#FEF9C3',
                    },
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: '#FACC15',
                      color: '#000',
                      borderRadius: '4px',
                    },
                    '& .MuiSlider-thumb:before': {
                      boxShadow: 'none',
                    },
                  }}                  
                  
                    getAriaLabel={() => 'Difficulty level'}
                    value={[filter.difficultyLevel.min, filter.difficultyLevel.max]}
                    onChange={(e, newValue) => handleRangeChange("difficultyLevel", newValue)}
                    min={1}
                    max={5}
                    valueLabelDisplay="auto"
                    getAriaValueText={difficultyValueText}
                  />
                </div>


              {/* ingredient */}
              <label className="block font-medium mt-3">Ingredients</label>
              <input
                type="text"
                name="ingredients"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                className="border-gray-200 border-2 p-2 rounded-lg w-[250px]"
                placeholder="What do you want to cook?"
              />
              {ingredientSuggestions.length > 0 && (
                <ul className="relative left-0 w-full bg-white border rounded shadow-md top-full max-h-40 overflow-auto z-50">
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
              {/* Display added ingredients to search for */}
              {filter.ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filter.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 p-2 rounded-lg flex items-center gap-1"
                    >
                      {ingredient.ingredientName}
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

              {/* category */}
              <label className="block font-medium mt-3">Category</label>
              {categoriesLoading ? (
                <p>Loading categories...</p>
                ) : (
                  <select
                    name="category"
                    value={filter.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All</option>
                    {categoryList.length > 0 ? (
                      categoryList.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.categoryName}
                        </option>
                      ))
                    ) : (
                      <option>No categories available</option>
                    )}
                  </select>
                )
              }

              {/* sorting */}
              <label className="block font-medium mt-3">Sort By</label>
              <select
                name="sort"
                value={filter.sort}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </AccordionDetails>
          </Accordion>

          </div>
      </div>
      <div className="flex flex-col gap-8 w-full">
        {filterUsed && (
          <div className="w-full text-center mt-6">
            <p className="text-black font-bold text-2xl">
              {displayData?.length > 0
                ? `You can make ${displayData.length} recipe${displayData.length > 1 ? "s" : ""}!`
                : "No matching recipes found."}
            </p>
          </div>
        )}

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

export default Index;
