import React, { useState } from "react";
import { useEffect } from "react";
import {
  Comment,
  Button,
  Input,
  ShareButton,
  NoData,
  ComponentLoading,
} from "../../components";
import { FaRegPaperPlane } from "react-icons/fa";
import { LuChefHat, LuBook } from "react-icons/lu";
import { BsStopwatch } from "react-icons/bs";
import { LiaWeightSolid } from "react-icons/lia";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineUser,
  AiOutlineFlag,
  AiFillFlag,
} from "react-icons/ai";
import {
  useGetRecipeQuery,
  useRateRecipeMutation,
  useCommentRecipeMutation,
  useDeleteCommentRecipeMutation,
  useToggleFavoriteMutation,
  useDeleteRecipeMutation,
  usePublishDraftRecipeMutation,
  useFlagRecipeMutation,
  useAddRecentlyViewedMutation,
} from "../../features/recipe/recipeApiSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Rating, IconButton, Menu, MenuItem } from "@mui/material";
import { toast } from "react-toastify";
import { setCredentials } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { MoreVert } from "@mui/icons-material";
import useAuth from "../../hooks/useAuth";
import useTitle from "../../hooks/useTitle";

const SingleRecipe = () => {
  useTitle("RecipeShare - Recipe");

  const user = useAuth();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const { data, ...rest } = useGetRecipeQuery(id);
  const [rateRecipe] = useRateRecipeMutation();
  const [flagRecipe] = useFlagRecipeMutation();
  const [commentRecipe, { isLoading }] = useCommentRecipeMutation();
  const [deleteComment] = useDeleteCommentRecipeMutation();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const [deleteRecipe] = useDeleteRecipeMutation();
  const [publishDraftRecipe, { isLoading: isPublishing }] =
    usePublishDraftRecipeMutation();
  const [addToRecentlyViewed] = useAddRecentlyViewedMutation();

  const [formDetails, setFormDetails] = useState({
    name: user?.firstName || "",
    email: user?.email || "",
    message: "",
  });
  console.log("form details: ", formDetails);

  const sumOfRatings = data?.ratings.reduce(
    (sum, item) => sum + item.rating,
    0
  );

  const [rating, setRating] = useState(
    data?.ratings?.find((d) => user && d.user == user.userId)?.rating || 0
  );

  const averageRating =
    sumOfRatings === 0 ? 0 : sumOfRatings / data?.ratings.length;

  const handleChange = (e) => {
    setFormDetails({ ...formDetails, [e.target.id]: e.target.value });
  };

  const handleRating = async (event, newValue) => {
    try {
      if (!user) {
        toast.error("You must sign in first");
        return navigate("/auth/signin");
      }
      setRating(newValue);
      await toast.promise(
        rateRecipe({ rating: newValue, recipeId: id }).unwrap(),
        {
          pending: "Please wait...",
          success: "Rating successfully updated",
          error: "Error rating recipe",
        }
      );
    } catch (error) {
      toast.error(error.data);
      console.error(error);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const handleOpenModal = () => {
    if (!user) {
      toast.error("You must sign in first");
      return navigate("/auth/signin");
    }
    setShowModal(true);
  };

  const handleFlagRecipe = async () => {
    try {
      await toast.promise(flagRecipe({ message, recipeId: id }).unwrap(), {
        pending: "Please wait...",
        success: "Recipe successfully flagged",
        error: "Error flagging recipe",
      });
      setShowModal(false);
      setMessage(""); // clear input after success
    } catch (error) {
      toast.error(error?.data || "Unknown error");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must sign in first");
      return navigate("/auth/signin");
    }
    try {
      await toast.promise(
        commentRecipe({ recipeId: id, comment: formDetails.message }).unwrap(),
        {
          pending: "Please wait...",
          success: "Comment added",
          error: "Could not add comment",
        }
      );
      setFormDetails({ ...formDetails, message: "" });
    } catch (error) {
      toast.error(error.data);
      console.error(error);
    }
  };

  const handleDeleteComment = async (_id) => {
    try {
      await toast.promise(
        deleteComment({ recipeId: id, commentId: _id }).unwrap(),
        {
          pending: "Please wait...",
          success: "Comment deleted",
          error: "Could not delete comment",
        }
      );
    } catch (error) {
      toast.error(error.data);
      console.error(error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (!user) {
        toast.error("You must sign in first");
        return navigate("/auth/signin");
      }

      const userData = await toast.promise(
        toggleFavorite({ recipeId: id }).unwrap(),
        {
          pending: "Please wait...",
          success: "Favorites updated",
          error: "Unable to update favorites",
        }
      );
      dispatch(setCredentials({ ...userData }));
    } catch (error) {
      toast.error(error.data);
      console.error(error);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuDelete = () => {
    if (window.confirm("Are you sure you want to delete?")) {
      deleteRecipe(data?._id);
      navigate("/recipe");
    }
    setAnchorEl(null);
  };

  const handlePublish = async () => {
    try {
      console.log("handlePublish function called!");
      await toast.promise(publishDraftRecipe({ recipeId: id }).unwrap(), {
        pending: "Please wait...",
        success: "Recipe published",
        error: "Could not publish recipe",
      });
      rest.refetch();
    } catch (error) {
      toast.error(error.data);
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.userId && data?._id) {
      const addRecipeToRecent = async () => {
        try {
          await addToRecentlyViewed(data._id).unwrap();
          console.log("Recipe added to recently viewed:", data._id);
        } catch (error) {
          console.error('Error adding to recently viewed:', error);
        }
      };

      addRecipeToRecent();
    }
  }, [data, id, addToRecentlyViewed, user?.userId]);

  const isUserLoggedIn = !!user?.userId;

  return (
    <>
      {rest?.isLoading ? (
        <ComponentLoading />
      ) : (
        <section className="box flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Recipe image */}
            <div className="basis-1/3">
              <img
                src={data?.image}
                alt={data?.recipeName}
                className="rounded w-full"
              />
            </div>
            {/* Recipe details */}
            <div className="basis-2/3 flex flex-col gap-2">
              {/* Title and Badge */}
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-xl md:text-3xl">
                  {data?.recipeName}
                </h2>
                {data?.status && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold max-sm:px-2 max-sm:py-1 max-sm:text-xs ${
                      data.status === "Published"
                        ? "bg-green-200 text-green-800"
                        : data.status === "Draft"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-gray-200 text-gray-800" // Default color
                    }`}
                  >
                    {data.status}
                  </span>
                )}
                {data?.author?._id === user?.userId && (
                  <div className="flex items-center gap-2">
                    {" "}
                    {/* New div to group button and menu */}
                    {console.log("data?.author?._id:", data?.author?._id)}
                    {console.log("user?.userId:", user?.userId)}
                    {console.log("data?.status:", data?.status)}
                    {data?.status === "Draft" && (
                      <Button
                        content={"Publish Recipe"}
                        handleClick={handlePublish}
                        loading={isPublishing}
                        customCss={
                          "rounded-lg gap-3 max-w-max max-sm:gap-2 max-sm:text-sm max-sm:px-2 max-sm:py-1 max-lg:ml-4"
                        }
                      />
                    )}
                    <IconButton
                      aria-label="more"
                      id="long-button"
                      aria-controls={open ? "long-menu" : undefined}
                      aria-expanded={open ? "true" : undefined}
                      aria-haspopup="true"
                      size="small"
                      onClick={handleMenu}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      id="long-menu"
                      MenuListProps={{
                        "aria-labelledby": "long-button",
                      }}
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleMenuClose}
                    >
                      <MenuItem>
                        <Link to={`/recipe/edit/${id}`}>Edit</Link>
                      </MenuItem>
                      <MenuItem onClick={handleMenuDelete}>Delete</MenuItem>
                    </Menu>
                  </div>
                )}
              </div>

              {/* Author Name and Favorites/Share Buttons */}
              <div className="flex justify-between items-center">
                {/* Author Name */}
                <p className="flex gap-2 items-center font-semibold">
                  <LuChefHat className="text-primary" />
                  {data?.author?.firstName && data?.author?.lastName
                    ? `${data.author.firstName}, ${data.author.lastName}`
                    : "Author name not available"}
                </p>

                {/* Favorites and Share Buttons */}
                <div className="flex gap-2 p-2 bg-light rounded-l-lg">
                  {isUserLoggedIn ? (
                    user?.favorites?.some((ele) => ele === id) ? (
                      <AiFillHeart
                        className="text-2xl text-red-500 cursor-pointer"
                        onClick={handleToggleFavorite}
                      />
                    ) : (
                      <AiOutlineHeart
                        className="text-2xl text-red-500 cursor-pointer"
                        onClick={handleToggleFavorite}
                      />
                    )
                  ) : (
                    <AiOutlineHeart className="text-2xl text-gray-400 cursor-not-allowed" />
                  )}
                  <ShareButton
                    url={`<span class="math-inline">\{import\.meta\.env\.VITE\_BASE\_URL\}/recipe/</span>{data?._id}`}
                  />
                  {isUserLoggedIn ? (
                    data?.flags?.some((ele) => ele.user === user?.userId) ? (
                      <AiFillFlag className="text-2xl text-red-500 cursor-pointer" />
                    ) : (
                      <AiOutlineFlag
                        className="text-2xl text-red-500 cursor-pointer"
                        onClick={handleOpenModal}
                      />
                    )
                  ) : (
                    <AiOutlineFlag className="text-2xl text-gray-400 cursor-not-allowed" />
                  )}

                  {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">
                          Flag this recipe
                        </h2>
                        <textarea
                          className="w-full border rounded-md p-2 mb-4"
                          placeholder="Enter your reason..."
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-md"
                            onClick={() => setShowModal(false)}
                          >
                            Cancel
                          </button>
                          <button
                            className={`py-2 px-4 rounded-md ${
                              !message.trim() || !isUserLoggedIn
                                ? "bg-gray-400 text-gray-500 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                            }`}
                            onClick={handleFlagRecipe}
                            disabled={!message.trim() || !isUserLoggedIn}
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="flex gap-2 items-center font-semibold">
                <LuBook className="text-primary" />
                {data?.categories?.map((cat, i) => (
                  <span
                    key={i}
                    className="ml-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-full"
                  >
                    {cat.categoryName}
                  </span>
                ))}
              </p>
              {/* Recipe rating */}
              <Rating value={averageRating} size={"medium"} readOnly />
              <p className="my-4">{data?.description}</p>

              {/* Recipe time & cals */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between w-2/3 mx-auto">
                <div className="flex flex-col gap-1 items-center">
                  <BsStopwatch className="text-5xl text-gray-800" />
                  <h3 className="font-bold text-xl text-primary">
                    Cooking Time
                  </h3>
                  <p>{data?.cookingTime} minutes</p>
                </div>
                <div className="flex flex-col gap-1 items-center text-gray-800">
                  <LiaWeightSolid className="text-5xl" />
                  <h3 className="font-bold text-xl text-primary">
                    Difficulty Level
                  </h3>
                  <p>{data?.difficultyLevel} / 5</p>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="basis-1/3 flex flex-col gap-4 border-b-2 md:border-b-0 pb-4 md:pb-0 md:border-r-2 border-gray-200 items-center">
              <h3 className="font-bold text-2xl">Ingredients</h3>
              {console.log("Ingredients Data:", data?.ingredients)}{" "}
              {/* Log ingredients */}
              <ol className="flex flex-col gap-2 list-decimal ml-5">
                {data?.ingredients?.map((ingredient, i) => (
                  <li key={`ingredient-${i + 1}`}>
                    {ingredient.ingredientName}
                  </li>
                ))}
              </ol>
            </div>
            {/* Recipe Instructions */}
            <div className="basis-2/3 flex flex-col gap-4">
              <h3 className="font-bold text-2xl">Instructions</h3>
              <ul className="ml-2 flex flex-col gap-4">
                {data?.instructions?.map((instruction, i) => (
                  <li key={`instruction-${i + 1}`}>
                    <h4 className="font-bold text-xl">Step {i + 1}</h4>
                    <p className="ml-2">{instruction}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <hr />
          {/* Rate recipe */}
          <div className="my-6 w-full sm:w-2/3 md:w-1/2 mx-auto flex justify-between gap-6 items-center">
            <h3 className="font-bold text-2xl">Rate the recipe</h3>
            <Rating
              size={"large"}
              precision={0.25}
              value={rating}
              onChange={isUserLoggedIn ? handleRating : null}
              readOnly={!isUserLoggedIn}
              sx={!isUserLoggedIn ? {
                "& .MuiRating-iconEmpty": {
                  color: "grey",
                },
                "& .MuiRating-iconFilled": {
                  color: "grey",
                },
              } : {}}
            />
            {!isUserLoggedIn && (
              <p className="text-sm text-gray-500 mt-1">Log in to leave a rating</p>
            )}
          </div>
          <hr />
          {/* Recipe comment form */}
          <div className="my-10 w-full sm:w-2/3 md:w-1/2 mx-auto flex flex-col gap-6">
            <h3 className="font-bold text-2xl">Leave a Comment</h3>
            <form className="flex flex-col gap-4" onSubmit={isUserLoggedIn ? handleSubmit : (e) => e.preventDefault()}>
              <div className="flex flex-col relative ">
                <label htmlFor="message" className="text-sm font-semibold mb-3">
                  Comment
                </label>
                <textarea
                  onChange={handleChange}
                  value={formDetails.message}
                  id="message"
                  rows={4}
                  required={isUserLoggedIn}
                  aria-required={isUserLoggedIn ? "true" : "false"}
                  placeholder={isUserLoggedIn ? "Leave a comment..." : "Log in to leave a comment"}
                  className={`py-2 px-4 border bg-gray-100 rounded-lg focus:outline outline-primary ${!isUserLoggedIn ? 'cursor-not-allowed' : ''}`}
                  disabled={!isUserLoggedIn}
                />
              </div>
              <Button
                content={"Post comment"}
                icon={<FaRegPaperPlane />}
                type={"submit"}
                customCss={`rounded-lg gap-3 max-w-max ${!isUserLoggedIn ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                loading={isLoading}
                disabled={isLoading || !isUserLoggedIn}
              />
            </form>
          </div>
          <hr />
          {/* Recipe comments */}
          <div className="w-full sm:w-4/5 mx-auto flex flex-col gap-6">
            <h3 className="font-bold text-2xl">Comments</h3>
            {data?.comments?.length ? (
              <div className="flex flex-col gap-6">
                {data?.comments?.map((comment) => (
                  <Comment
                    key={comment?._id}
                    comment={comment}
                    user={comment?.user}
                    userId={user?.userId}
                    handleDeleteComment={isUserLoggedIn ? handleDeleteComment : null}
                    isDeletable={isUserLoggedIn && comment?.user?._id === user?.userId}
                  />
                ))}
              </div>
            ) : (
              <NoData text={"Comments"} />
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default SingleRecipe;