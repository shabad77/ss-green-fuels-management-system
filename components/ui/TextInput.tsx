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
          <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
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
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-shadow"
        />
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
