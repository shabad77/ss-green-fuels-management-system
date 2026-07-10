import Link from "next/link";

const menuItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Purchases", href: "/purchases" },
  { name: "Sales", href: "/sales" },
  { name: "Suppliers", href: "/suppliers" },
  { name: "Vehicles", href: "/vehicles" },
  { name: "Reports", href: "/reports" },
  { name: "Users", href: "/users" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-green-700 text-white min-h-screen">

      <div className="p-6 text-2xl font-bold border-b border-green-600">
        SS Green Fuels
      </div>

      <nav className="flex flex-col">

        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="px-6 py-4 hover:bg-green-800 transition"
          >
            {item.name}
          </Link>
        ))}

      </nav>

    </aside>
  );
}