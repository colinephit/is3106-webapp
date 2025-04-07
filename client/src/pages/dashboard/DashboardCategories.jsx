import React, { useEffect, useState, useRef } from "react";
import { ComponentLoading, Table } from "../../components";
import { setCategories } from "../../features/category/categorySlice";
import { useDispatch } from "react-redux";
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useGetAllCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  
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
  const [deleteCategory] = useDeleteCategoryMutation();
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [updateCategory] = useUpdateCategoryMutation();
  const inputRef = useRef(null); // Create a ref

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return alert("Category name cannot be empty!");

    try {
      await addCategory({ categoryName: newCategory }).unwrap();
      setNewCategory(""); // Reset input field
      refetch(); // Fetch updated category list
    } catch (error) {
      console.error("Error adding category:", error);
      alert(error.data.message);
    }
  };

  const handleDelete = (_id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      deleteCategory(_id);
      refetch();
    }
  };

  const handleEdit = (_id, categoryName) => {
    setEditId(_id);
    setEditValue(categoryName);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleSave = async (_id) => {
    try {
      await updateCategory({
        categoryId: _id,
        categoryName: editValue,
      }).unwrap();
      setEditId(null);
      refetch();
    } catch (error) {
      console.error("Error updating category:", error);
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
          <p>{row.categoryName}</p>
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
                onClick={() => handleEdit(row._id, row.categoryName)}
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
