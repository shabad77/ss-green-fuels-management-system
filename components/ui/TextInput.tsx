"use client";

import {
  forwardRef,
  KeyboardEvent,
} from "react";

type TextInputProps = {
  label?: string;
  placeholder?: string;
  type?: "text" | "number";
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      placeholder,
      type = "text",
      value,
      onChange,
      onKeyDown,
    },
    ref
  ) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:border-green-600 focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;