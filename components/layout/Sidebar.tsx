"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Truck,
  BarChart3,
  UserCog,
  Building2,
  Settings,
  Leaf,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sales", href: "/sales", icon: Receipt },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Buyers", href: "/buyers", icon: Building2 },
  { name: "Suppliers", href: "/suppliers", icon: Building2 },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Users", href: "/users", icon: UserCog },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-[#0b2e1d] text-white min-h-screen flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
          <Leaf size={18} strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">SS Green Fuels</div>
          <div className="text-[11px] text-white/40">Business Console</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                active
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={17}
                strokeWidth={2}
                className={active ? "text-emerald-400" : "text-white/40 group-hover:text-white/70"}
              />
              {item.name}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings pinned to bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
            pathname?.startsWith("/settings")
              ? "bg-emerald-500/15 text-emerald-300"
              : "text-white/65 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Settings size={17} strokeWidth={2} className="text-white/40" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
