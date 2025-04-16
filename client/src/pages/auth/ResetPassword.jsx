import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Input, Logo } from "../../components";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isStrongPassword = (password) => {
    const pattern = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;
    return pattern.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isStrongPassword(form.password)) {
      toast.error(
        "Password must be at least 6 characters long and include at least one letter and one number"
      );
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: form.password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully");
        navigate("/auth/signin");
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <section className="flex w-full h-screen">
      <div className="basis-1/4 m-auto flex flex-col">
        <Logo customCss={"mx-auto md:mx-0"} />
        <h2 className="text-2xl font-bold my-6">Create a New Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="password"
            name="password"
            label="New Password"
            placeholder="Enter new password"
            value={form.password}
            handleChange={handleChange}
          />
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            handleChange={handleChange}
          />
          <Button
            content="Reset Password"
            type="submit"
            customCss="rounded-lg mt-4"
          />
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
