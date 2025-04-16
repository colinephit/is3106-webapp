import { lazy } from "react";

const Home = lazy(() => import("./home/Home"));
const Contact = lazy(() => import("./contact/Contact"));
const Profile = lazy(() => import("./profile/Profile"));

const Error = lazy(() => import("./message/Error"));
const CheckoutSuccess = lazy(() => import("./message/CheckoutSuccess"));
const CheckoutFailure = lazy(() => import("./message/CheckoutFailure"));

const Recipe = lazy(() => import("./recipe/Recipe"));
const SingleRecipe = lazy(() => import("./recipe/SingleRecipe"));
const SavedRecipes = lazy(() => import("./recipe/SavedRecipes"));
const AddRecipe = lazy(() => import("./recipe/AddRecipe"));
const MyRecipes = lazy(() => import("./recipe/MyRecipes"));
const EditRecipe = lazy(() => import("./recipe/EditRecipe"));

const Blogs = lazy(() => import("./blogs/Blogs"));
const AddBlog = lazy(() => import("./blogs/AddBlog"));
const SingleBlog = lazy(() => import("./blogs/SingleBlog"));
const MyBlogs = lazy(() => import("./blogs/MyBlogs"));
const EditBlog = lazy(() => import("./blogs/EditBlog"));

const Users = lazy(() => import("./dashboard/Users"));
const DashboardRecipes = lazy(() => import("./dashboard/DashboardRecipes"));
const DashboardBlogs = lazy(() => import("./dashboard/DashboardBlogs"));
const DashboardIngredients = lazy(() =>
  import("./dashboard/DashboardIngredients")
);
const DashboardCategories = lazy(() =>
  import("./dashboard/DashboardCategories")
);

const SignIn = lazy(() => import("./auth/SignIn"));
const SignUp = lazy(() => import("./auth/SignUp"));
const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));

export {
  Home,
  Contact,
  Profile,
  Recipe,
  SingleRecipe,
  SavedRecipes,
  AddRecipe,
  MyRecipes,
  EditRecipe,
  Blogs,
  AddBlog,
  SingleBlog,
  MyBlogs,
  EditBlog,
  Users,
  DashboardRecipes,
  DashboardBlogs,
  DashboardIngredients,
  DashboardCategories,
  Error,
  CheckoutSuccess,
  CheckoutFailure,
  SignIn,
  SignUp,
  ForgotPassword
};
