import React from "react";
import { BsArrowUpRight } from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { Rating } from "@mui/material";
import dateFormat from "../../common/dateFormat";
import { toast } from "react-toastify";
import { useToggleFavoriteMutation } from "../../features/recipe/recipeApiSlice";
import { setCredentials } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";
import ShareButton from "../shareButton/ShareButton";
import useAuth from "../../hooks/useAuth";

const SingleCard = ({ singleData, type }) => {
  const user = useAuth();

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [toggleFavorite] = useToggleFavoriteMutation();

  const formattedDate = dateFormat(singleData?.createdAt);
  console.log(singleData);
  console.log("Description:", singleData?.description);
  let averageRating = 0; // Default to 0

  if (Array.isArray(singleData?.ratings) && singleData.ratings.length > 0) {
    const sumOfRatings = singleData.ratings.reduce(
      (sum, item) => sum + item.rating,
      0
    );
    averageRating = sumOfRatings / singleData.ratings.length;
  }

  const handleToggleFavorite = async () => {
    try {
      if (!user) {
        toast.error("You must sign in first");
        return navigate("/auth/signin");
      }
      const userData = await toast.promise(
        toggleFavorite({ recipeId: singleData._id }).unwrap(),
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

  return (
    <div className="flex flex-col gap-1 justify-between shadow hover:shadow-lg rounded h-full">
      {/* Card Top */}
      <div className="flex flex-col justify-between h-full">
        <div className="relative h-full w-full">
          {/* Only for singleData */}
          {/* Favorite & share button */}
          {type === "recipe" && (
            <div className="absolute top-2 right-0 flex flex-col gap-2 p-2 bg-light rounded-l-lg z-10">
              {user?.favorites?.some((ele) => ele === singleData._id) ? (
                <AiFillHeart
                  className="text-2xl text-red-500 cursor-pointer"
                  onClick={handleToggleFavorite}
                />
              ) : (
                <AiOutlineHeart
                  className="text-2xl text-red-500 cursor-pointer"
                  onClick={handleToggleFavorite}
                />
              )}
              <ShareButton
                url={`${import.meta.env.VITE_BASE_URL}/recipe/${singleData?._id
                  }`}
              />
            </div>
          )}
          {/* Card image container */}
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t">
            <img
              src={singleData?.image}
              alt={singleData?.recipeName}
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
              }}
            />
          </div>
          {/* Overlay */}
          <div className="absolute bottom-0 left-0 w-full backdrop-blur-sm bg-[#fffcf5d3] p-4 flex justify-between">
            {/* Author */}
            <h4 className="font-bold">By: {singleData?.author?.firstName}</h4>
            {/* Status Badge */}
            {singleData?.status && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${singleData.status === "Published"
                  ? "bg-green-200 text-green-800"
                  : singleData.status === "Draft"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-gray-200 text-gray-800" // Default color
                  }`}
              >
                {singleData.status}
              </span>
            )}
          </div>
        </div>
        {/* Card Bottom details */}
        <div className="flex flex-col gap-3 p-4">
          {/* Card heading */}
          <Link to={`/${type}/${singleData?._id}`} className="font-bold text-lg hover:text-primary">
            {singleData?.recipeName}
          </Link>
          {/* Card description */}
          <p className="text-sm">
            {singleData?.description
              ? singleData.description.substring(0, 100) + "..."
              : "No description available"}
          </p>
          {/* Card rating */}
          {type === "recipe" && (
            <div className="flex flex-col">
              <span className="font-semibold">Average Rating:</span>
              <Rating value={averageRating} readOnly size={"medium"} className="mt-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleCard;
