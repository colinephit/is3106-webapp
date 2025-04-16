import React, { useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";

const Input = ({
  icon,
  handleChange,
  label,
  id,
  name,
  type,
  value,
  placeholder,
  pattern,
  errorMessage,
  required = true
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleFocus = () => setFocused(true);

  return (
    <div className="flex flex-col w-full">
      {/* Label */}
      <label htmlFor={id} className="text-sm font-semibold mb-1">
        {label}
      </label>

      {/* Icon + Input wrapper */}
      <div className="flex items-center bg-gray-100 border rounded-lg px-3 py-2 relative">
        <span className="text-primary text-lg mr-2">{icon}</span>
        <input
          type={type === "password" && showPassword ? "text" : type}
          onChange={handleChange}
          value={value}
          id={id}
          name={name}
          onBlur={handleFocus}
          required={required}
          aria-required="true"
          aria-describedby={`${id}-error`}
          placeholder={placeholder}
          pattern={pattern}
          className="flex-1 bg-transparent focus:outline-none text-sm"
        />

        {/* Password toggle */}
        {type === "password" && (
          <>
            {showPassword ? (
              <AiOutlineEyeInvisible
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-gray-600 text-lg"
              />
            ) : (
              <AiOutlineEye
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-gray-600 text-lg"
              />
            )}
          </>
        )}
      </div>

      {/* Error message */}
      <span
        id={`${id}-error`}
        className="hidden text-red-500 pl-2 text-sm mt-1"
      >
        {errorMessage}
      </span>
    </div>
  );
};

export default Input;
