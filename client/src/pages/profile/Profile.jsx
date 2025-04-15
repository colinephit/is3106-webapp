import React, { useState, useEffect } from "react";
import { Button, Input } from "../../components";
import { BiLockAlt, BiPhone } from "react-icons/bi";
import { IoMailOutline } from "react-icons/io5";
import { AiOutlineUser } from "react-icons/ai";
import { profileBg } from "../../assets";
import { CircularProgress, Avatar as MuiAvatar } from "@mui/material";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import uploadImage from "../../common/uploadImage";
import { toast } from "react-toastify";
import {
  useUpdateUserMutation,
  useGetUserQuery,
} from "../../features/user/userApiSlice";
import useAuth from "../../hooks/useAuth";
import useTitle from "../../hooks/useTitle";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const user = useAuth();
  const { data, isSuccess } = useGetUserQuery(user?.userId);
  useTitle("RecipeShare - Profile");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formDetails, setFormDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    image: "",
    password: "",
    confirmPassword: "",
    oldPassword: "",
    contactNumber: "",
  });

  const [progress, setProgress] = useState(0);
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [showPasswordFields, setShowPasswordFields] = useState(false); // toggle section

  useEffect(() => {
    if (isSuccess && data) {
      setFormDetails({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        contactNumber: data.contactNumber || "",
        image: data.profileImage || "",
        password: "",
        confirmPassword: "",
        oldPassword: "",
      });
    }
  }, [isSuccess, data]);

  const handleChange = (e) => {
    if (e.target.id === "image") {
      uploadImage(e, setProgress, setFormDetails, formDetails);
    } else {
      setFormDetails({ ...formDetails, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showPasswordFields) {
      if (formDetails.password !== formDetails.confirmPassword) {
        toast.error("New password and confirm password do not match.");
        return;
      }

      if (!formDetails.oldPassword) {
        toast.error("Please enter your current password to change it.");
        return;
      }
    }

    try {
      const payload = {
        ...formDetails,
        userId: user?.userId,
      };

      if (!showPasswordFields || !formDetails.password) {
        delete payload.password;
        delete payload.confirmPassword;
        delete payload.oldPassword;
      }

      const updatedUser = await toast.promise(
        updateUser(payload).unwrap(),
        {
          pending: "Please wait...",
          success: "User updated successfully",
          error: "Unable to update user",
        }
      );

      setFormDetails({
        firstName: formDetails.firstName,
        lastName: formDetails.lastName,
        email: formDetails.email,
        contactNumber: formDetails.contactNumber,
        image: formDetails.image,
        password: "",
        confirmPassword: "",
        oldPassword: "",
      });

      dispatch(
        setCredentials({
          accessToken: updatedUser.accessToken,
          user: updatedUser.user,
        })
      );

      navigate("/profile");

    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error?.data || "Update failed. Please try again.");
    }
  };

  return (
    <section className="box md:max-w-5xl flex flex-col gap-12">
      {/* Profile heading */}
      <div className="flex flex-col items-center md:items-start">
        <h3 className="text-xl font-bold">Profile</h3>
        <p className="text-sm font-semibold text-gray-400">
          You can update your profile details here
        </p>
      </div>

      <div className="flex gap-6 justify-center md:justify-between items-center">
        {/* Profile form */}
        <form
          className="flex flex-col items-center md:items-stretch gap-4 md:basis-1/2"
          onSubmit={handleSubmit}
        >
          {/* Upload image */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:mb-4">
            {progress > 0 && progress < 100 ? (
              <CircularProgress color="warning" size={30} />
            ) : (
              <MuiAvatar
                alt={data?.firstName}
                src={formDetails.image || data?.profileImage}
                sx={{ width: 80, height: 80 }}
                className="border-2 border-primary"
              />
            )}

            <div className="flex flex-col">
              <label
                htmlFor="image"
                className="bg-primaryLight hover:bg-primary text-light py-2 px-4 shadow-lg font-semibold text-center rounded max-w-max text-sm cursor-pointer"
              >
                Change Profile Picture
              </label>
              <input
                type="file"
                onChange={handleChange}
                id="image"
                className="hidden"
              />
            </div>
          </div>

          <Input
            type="text"
            id="firstName"
            icon={<AiOutlineUser />}
            handleChange={handleChange}
            value={formDetails.firstName}
            label="First Name"
            placeholder={data?.firstName}
          />
          <Input
            type="text"
            id="lastName"
            icon={<AiOutlineUser />}
            handleChange={handleChange}
            value={formDetails.lastName}
            label="Last Name"
            placeholder={data?.lastName}
          />
          <Input
            type="email"
            id="email"
            icon={<IoMailOutline />}
            handleChange={handleChange}
            value={formDetails.email}
            label="Email"
            placeholder={data?.email}
          />
          <Input
            type="text"
            id="contactNumber"
            icon={<BiPhone />}
            handleChange={handleChange}
            value={formDetails.contactNumber}
            label="Contact Number"
            placeholder={data?.contactNumber}
          />

          {/* Change password section */}
          <div className="mt-4 w-full">
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-sm">Current Password</label>
              <button
                type="button"
                className="text-yellow-500 text-sm font-medium hover:underline"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                {showPasswordFields ? "Cancel" : "Change Password..."}
              </button>
            </div>

            {showPasswordFields ? (
              <Input
              type={showPasswordFields ? "password" : "text"}
              id={showPasswordFields ? "oldPassword" : "fakePassword"}
              icon={<BiLockAlt />}
              handleChange={showPasswordFields ? handleChange : () => {}}
              value={showPasswordFields ? formDetails.oldPassword : "******"}
              label=""
              placeholder={showPasswordFields ? "Enter current password" : ""}
              disabled={!showPasswordFields}
              required={showPasswordFields}
              customCss="adjust-icon-center"
            />
            
            ) : (
              <Input
                type="text"
                id="fakePassword"
                icon={<BiLockAlt />}
                value="******"
                label=""
                disabled
              />
            )}
          </div>
          
          {showPasswordFields && (
            <>
              <Input
                type="password"
                id="password"
                icon={<BiLockAlt />}
                handleChange={handleChange}
                value={formDetails.password}
                label="New Password"
                placeholder="At least 6 characters long"
                errorMessage="Password should be 6-15 characters long and must include at least 1 letter, 1 number and 1 special character!"
                pattern={`^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$`}
              />
              <Input
                type="password"
                id="confirmPassword"
                icon={<BiLockAlt />}
                handleChange={handleChange}
                value={formDetails.confirmPassword}
                label="Confirm New Password"
                placeholder="Re-enter new password"
              />
            </>
          )}

          <Button
            type="submit"
            content="Save changes"
            customCss="max-w-max rounded text-sm px-3"
            loading={isLoading}
          />
        </form>

        {/* Profile banner */}
        <div className="hidden md:block md:basis-1/3">
          <img src={profileBg} alt="profile page banner" />
        </div>
      </div>
    </section>
  );
};

export default Profile;
