import React, { useState } from "react";
import { Button, Input, Logo } from "../../components";
import { IoMailOutline } from "react-icons/io5";
import { useForgotPasswordMutation } from "../../features/auth/authApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(forgotPassword({ email }).unwrap(), {
        pending: "Sending reset link...",
        success: "Reset link sent to your email",
        error: "Failed to send reset link",
      });
      setEmail("");
    } catch (err) {
      console.error(err);
      if (err?.data?.message) {
        toast.error(err.data.message);
      } else {
        toast.error("Failed to send reset link");
      }
    }
  };

  const handleCancel = () => {
    navigate('/auth/signin');
  };

  return (
    <section className="flex w-full h-screen">
      <div className="basis-1/4 m-auto flex flex-col">
        <Logo customCss={"mx-auto md:mx-0"} />
        <h2 className="text-2xl font-bold my-6">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            id="email"
            icon={<IoMailOutline />}
            handleChange={(e) => setEmail(e.target.value)}
            value={email}
            label="Email"
            placeholder="Your registered email"
          />
          <Button
            content="Send Reset Link"
            type="submit"
            loading={isLoading}
            customCss="rounded-lg"
          />
        </form>
        <Button
          content="Cancel"
          handleClick={handleCancel}
          customCss="mt-4 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
        />
      </div>
    </section>
  );
};

export default ForgotPassword;