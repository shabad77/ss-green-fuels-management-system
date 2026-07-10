"use client";

type TextInputProps = {
  label: string;
  placeholder?: string;
  type?: "text" | "number";
};

export default function TextInput({
  label,
  placeholder,
  type = "text",
}: TextInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-green-600 focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>
  );
}