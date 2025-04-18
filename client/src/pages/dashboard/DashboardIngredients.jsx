import React, { useEffect, useState, useRef } from "react";
import { ComponentLoading, Table } from "../../components";
import { setIngredients } from "../../features/ingredient/ingredientSlice";
import { useDispatch } from "react-redux";
import {
  useGetIngredientsQuery,
  useAddIngredientMutation,
  useDeleteIngredientMutation,
  useGetAllIngredientsQuery,
  useUpdateIngredientMutation,
} from "../../features/ingredient/ingredientApiSlice";
import { useGetAllRecipesQuery } from "../../features/recipe/recipeApiSlice"; // Import useGetAllRecipesQuery
import { Avatar as MuiAvatar } from "@mui/material";
import dateFormat from "../../common/dateFormat";

const DashboardIngredients = () => {
  const {
    data: ingredientsData,
    isLoading: ingredientsLoading,
    refetch,
  } = useGetAllIngredientsQuery();
  const { data: recipesData, isLoading: recipesLoading } =
    useGetAllRecipesQuery(); // Fetch recipes
  const dispatch = useDispatch();

  const [deleteIngredient] = useDeleteIngredientMutation();
  const [addIngredient] = useAddIngredientMutation();
  const [newIngredient, setNewIngredient] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [updateIngredient] = useUpdateIngredientMutation();
  const inputRef = useRef(null); // Create a ref

  const [ingredientRecipeCounts, setIngredientRecipeCounts] = useState({});

  useEffect(() => {
    if (ingredientsData && recipesData) {
      const counts = {};
      ingredientsData.forEach((ingredient) => {
        counts[ingredient._id.toString()] = 0; // Convert ObjectId to string
      });

      console.log(recipesData);
      recipesData.data.forEach((recipe) => {
        if (recipe.ingredients) {
          recipe.ingredients.forEach((ingredientId) => {
            counts[ingredientId]++;
          });
        }
      });
      setIngredientRecipeCounts(counts);
    }
  }, [ingredientsData, recipesData]);

  const updatedData = ingredientsData?.map((item, index) => ({
    ...item,
    id: index + 1,
  }));

  const handleDelete = (_id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      deleteIngredient(_id);
      refetch();
    }
  };

  const handleEdit = (_id, ingredientName) => {
    setEditId(_id);
    setEditValue(ingredientName);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleSave = async (_id) => {
    try {
      await updateIngredient({
        ingredientId: _id,
        ingredientName: editValue,
      }).unwrap();
      setEditId(null);
      refetch();
    } catch (error) {
      console.error("Error updating ingredient:", error);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.trim()) return alert("Ingredient name cannot be empty!");

    try {
      await addIngredient({ ingredientName: newIngredient }).unwrap();
      setNewIngredient("");
      refetch();
    } catch (error) {
      console.error("Error adding ingredient:", error);
      alert(error.data.message);
    }
  };

  useEffect(() => {
    if (!ingredientsLoading) {
      dispatch(setIngredients(ingredientsData));
    }
  }, [ingredientsLoading, ingredientsData, dispatch]);

  const cols = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "ingredientName",
      headerName: "Name",
      width: 200,
      headerAlign: "center",
      align: "left",
      renderCell: ({ row }) => {
        return editId === row._id ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="p-1 border rounded w-full"
          />
        ) : (
          <p>{row.ingredientName}</p>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Date Created",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { createdAt } }) => {
        const formattedDate = dateFormat(createdAt);
        return <p>{formattedDate}</p>;
      },
    },
    {
      field: "recipeCount",
      headerName: "Recipe Count",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { _id } }) => {
        return <div>{ingredientRecipeCounts[_id] || 0}</div>;
      },
    },
    {
      headerName: "Actions",
      headerAlign: "center",
      align: "center",
      minWidth: 250,
      renderCell: ({ row }) => {
        return (
          <div className="flex justify-center w-full gap-4">
            {editId === row._id ? (
              <div
                className="rounded shadow-md w-24 text-center cursor-pointer bg-green-500
                hover:bg-green-700 text-light py-2"
                onClick={() => handleSave(row._id)}
              >
                Save
              </div>
            ) : (
              <div
                className="rounded shadow-md w-24 text-center cursor-pointer bg-primaryLight
                hover:bg-primary text-light py-2"
                onClick={() => handleEdit(row._id, row.ingredientName)}
              >
                Edit
              </div>
            )}
            <div
              className="rounded shadow-md w-24 text-center cursor-pointer bg-red-500
              hover:bg-red-700 text-light py-2"
              onClick={() => handleDelete(row._id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <section className="mx-auto px-6 flex flex-col justify-center items-center h-[100vh]">
      {/* Add Ingredient Form */}
      <div className="mb-4 p-4 bg-gray-100 shadow-md rounded-lg w-[50%] mt-20">
        <h2 className="text-xl font-bold mb-2">Add New Ingredient</h2>
        <form onSubmit={handleAddIngredient} className="flex gap-4">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="Enter ingredient name"
            className="p-2 border rounded w-full"
          />
          <button
            type="submit"
            className="bg-primary text-light px-4 py-2 rounded"
          >
            Add
          </button>
        </form>
      </div>
      <div className="w-full h-[90%] flex justify-center items-center">
        {ingredientsLoading || recipesLoading ? (
          <ComponentLoading />
        ) : (
          <Table rows={updatedData} cols={cols} />
        )}
      </div>
    </section>
  );
};

export default DashboardIngredients;
