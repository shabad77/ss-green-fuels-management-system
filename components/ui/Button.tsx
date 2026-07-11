type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
}: ButtonProps) {

  const styles = {
    primary:
      "bg-green-600 hover:bg-green-700 text-white",

    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800",

    danger:
      "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold transition ${styles[variant]}`}
    >
      {children}
    </button>
  );
}