import React, { useEffect, useState } from "react";
import { ComponentLoading, Table } from "../../components";
import { setRecipes } from "../../features/recipe/recipeSlice";
import { useDispatch } from "react-redux";
import {
  useGetRecipesQuery,
  useDeleteRecipeMutation,
  useDeleteCommentRecipeMutation,
} from "../../features/recipe/recipeApiSlice";
import { Avatar as MuiAvatar, Rating } from "@mui/material";
import { Modal, Button } from "@mui/material";
import "./ModalStyles.css";

const DashboardRecipes = () => {
  const { data, isLoading } = useGetRecipesQuery();
  console.log(data);
  const dispatch = useDispatch();
  const updatedData = data?.map((item, index) => ({
    ...item,
    id: index + 1,
  }));
  const [deleteRecipe] = useDeleteRecipeMutation();
  const [deleteComment] = useDeleteCommentRecipeMutation();

  const handleDelete = (_id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      deleteRecipe(_id);
    }
  };

  const handleDeleteComment = async (_id, commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const response = await deleteComment({ _id, commentId }).unwrap();
        alert("Comment deleted successfully");
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("Failed to delete comment.");
      }
    }
  };

  useEffect(() => {
    if (!isLoading) {
      dispatch(setRecipes(data));
    }
  }, [isLoading]);

  const cols = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "title",
      headerName: "Title",
      width: 280,
      headerAlign: "center",
      align: "left",
      renderCell: ({ row: { recipeName } }) => {
        return <div className="flex gap-2 items-center">{recipeName}</div>;
      },
    },
    {
      field: "image",
      headerName: "Image",
      width: 100,
      headerAlign: "center",
      align: "left",
      renderCell: ({ row: { image } }) => {
        return (
          <div className="flex gap-2 items-center">
            {
              <img
                alt={image}
                src={image}
                sx={{ width: 36, height: 36 }}
                className="border-2 border-primary"
              />
            }
          </div>
        );
      },
    },
    {
      field: "author",
      headerName: "Author",
      headerAlign: "center",
      align: "left",
      minWidth: 200,
      renderCell: ({ row: { author } }) => {
        return (
          <div className="flex gap-2 items-center">
            <MuiAvatar
              alt={author?.firstName}
              src={author?.profilePicture}
              sx={{ width: 36, height: 36 }}
              className="border-2 border-primary"
            />
            {author.firstName + " " + author.lastName}
          </div>
        );
      },
    },
    {
      field: "ratings",
      headerName: "Rating",
      width: 250,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { ratings } }) => {
        const sumOfRatings = ratings.reduce(
          (sum, item) => sum + item.rating,
          0
        );
        const averageRating =
          sumOfRatings === 0 ? 0 : sumOfRatings / ratings.length;
        return <Rating value={averageRating} readOnly={true} size={"medium"} />;
      },
    },

    {
      field: "comments",
      headerName: "Comments",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { comments, _id } }) => {
        const [openModal, setOpenModal] = useState(false);

        const handleOpen = () => setOpenModal(true);
        const handleClose = () => setOpenModal(false);

        return (
          <div className="flex gap-2 items-center">
            <Button onClick={handleOpen}>View</Button>

            {/* Modal to show comments */}
            <Modal open={openModal} onClose={handleClose}>
              <div className="modal-content">
                <h3 className="font-bold text-center">Comments</h3>
                {comments.map((comment, index) => (
                  <div
                    key={index}
                    className="comment-item flex justify-between items-center py-2"
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-semibold">
                        {comment?.user?.firstName +
                          " " +
                          comment?.user?.lastName}
                      </span>
                      <p>{comment.comment}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.date).toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="rounded shadow-md w-[40%] text-center cursor-pointer  bg-primaryLight
            hover:bg-primary text-light py-2 ml-4"
                      onClick={() => handleDeleteComment(_id, comment._id)}
                    >
                      Delete
                    </div>
                    <hr />
                  </div>
                ))}
                <Button onClick={handleClose}>Close</Button>
              </div>
            </Modal>
          </div>
        );
      },
    },
    {
      headerName: "Actions",
      headerAlign: "center",
      align: "center",
      minWidth: 200,
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
    <section className="mx-auto px-6 flex justify-center items-center h-[100vh]">
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

export default DashboardRecipes;
