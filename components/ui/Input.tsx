"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type InputProps = {
  type?: "text" | "password" | "email" | "number";
  placeholder?: string;
};

export default function Input({
  type = "text",
  placeholder = "",
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="relative">
     <input
  type={inputType}
  placeholder={placeholder}
  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
/>

      {type === "password" && (
        <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-green-600"
>
          {showPassword ? (
  <EyeOff size={20} className="text-gray-600" />
) : (
  <Eye size={20} className="text-gray-600" />
)}
        </button>
      )}
    </div>
  );
}