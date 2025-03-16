import React, { useEffect, useState } from "react";
import { ComponentLoading, Table } from "../../components";
import { setIngredients } from "../../features/ingredient/ingredientSlice";
import { useDispatch } from "react-redux";
import {
  useGetIngredientsQuery,
  useAddIngredientMutation,
  useDeleteIngredientMutation,
  useGetAllIngredientsQuery,
} from "../../features/ingredient/ingredientApiSlice";
import { Avatar as MuiAvatar } from "@mui/material";
import dateFormat from "../../common/dateFormat";

const DashboardIngredients = () => {
  const { data, isLoading, refetch } = useGetAllIngredientsQuery();
  const dispatch = useDispatch();
  const updatedData = data?.map((item, index) => ({
    ...item,
    id: index + 1,
  }));
  const [deleteIngredient] = useDeleteIngredientMutation();
  const [addIngredient] = useAddIngredientMutation();
  const [newIngredient, setNewIngredient] = useState("");

  const handleDelete = (_id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      deleteIngredient(_id);
      refetch();
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.trim()) return alert("Ingredient name cannot be empty!");

    try {
      await addIngredient({ ingredientName: newIngredient }).unwrap();
      setNewIngredient(""); // Reset input field
      refetch(); // Fetch updated ingredients list
    } catch (error) {
      console.error("Error adding ingredient:", error);
      alert(error.data.message);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      dispatch(setIngredients(data));
      console.log(data);
    }
  }, [isLoading]);

  const cols = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "ingredientName",
      headerName: "Name",
      width: 350,
      headerAlign: "center",
      align: "left",
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
      headerName: "Actions",
      headerAlign: "center",
      align: "center",
      minWidth: 250,
      renderCell: ({ row: { _id } }) => {
        return (
          <div
            className="rounded shadow-md w-[40%] text-center cursor-pointer  bg-primaryLight
            hover:bg-primary text-light py-2"
            onClick={() => handleDelete(_id)}
          >
            Delete
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
        {isLoading ? (
          <ComponentLoading />
        ) : (
          <Table rows={updatedData} cols={cols} />
        )}
      </div>
    </section>
  );
};

export default DashboardIngredients;
