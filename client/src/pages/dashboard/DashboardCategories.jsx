import React, { useEffect, useState } from "react";
import { ComponentLoading, Table } from "../../components";
import { setCategories } from "../../features/category/categorySlice";
import { useDispatch } from "react-redux";
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useGetAllCategoriesQuery,
} from "../../features/category/categoryApiSlice";
import { Avatar as MuiAvatar } from "@mui/material";
import dateFormat from "../../common/dateFormat";

const DashboardCategories = () => {
  const { data, isLoading, refetch } = useGetAllCategoriesQuery();
  const dispatch = useDispatch();
  const updatedData = data?.map((item, index) => ({
    ...item,
    id: index + 1,
  }));

  const [addCategory] = useAddCategoryMutation();
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return alert("Category name cannot be empty!");

    try {
      await addCategory({ categoryName: newCategory }).unwrap();
      setNewCategory(""); // Reset input field
      refetch(); // Fetch updated category list
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      dispatch(setCategories(data));
      console.log(data);
    }
  }, [isLoading]);

  const cols = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "categoryName",
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
    // {
    //   headerName: "Actions",
    //   headerAlign: "center",
    //   align: "center",
    //   minWidth: 250,
    //   renderCell: ({ row: { _id } }) => {
    //     return (
    //       <div
    //         className="rounded shadow-md w-[40%] text-center cursor-pointer  bg-primaryLight
    //         hover:bg-primary text-light py-2"
    //         onClick={() => handleDelete(_id)}
    //       >
    //         Delete
    //       </div>
    //     );
    //   },
    // },
  ];

  return (
    <section className="mx-auto px-6 flex flex-col justify-center items-center h-[100vh]">
      {/* Add Ingredient Form */}
      <div className="mb-4 p-4 bg-gray-100 shadow-md rounded-lg w-[50%] mt-20">
        <h2 className="text-xl font-bold mb-2">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category"
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

export default DashboardCategories;
