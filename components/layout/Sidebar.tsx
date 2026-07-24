"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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
  LogOut,
} from "lucide-react";

type Role = "ADMIN" | "OPERATOR" | "ACCOUNTANT";

type CurrentUser = {
  name: string;
  role: Role;
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  OPERATOR: "Operator",
  ACCOUNTANT: "Accountant",
};

// Mirrors the access rules enforced server-side in middleware.ts — this
// only controls which links are shown, not actual access (that's the
// middleware's job), so a mismatch here is a UX bug, not a security hole.
const menuItems: { name: string; href: string; icon: any; roles: Role[] }[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "OPERATOR", "ACCOUNTANT"] },
  { name: "Sales", href: "/sales", icon: Receipt, roles: ["ADMIN", "ACCOUNTANT"] },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart, roles: ["ADMIN", "OPERATOR", "ACCOUNTANT"] },
  { name: "Buyers", href: "/buyers", icon: Building2, roles: ["ADMIN"] },
  { name: "Suppliers", href: "/suppliers", icon: Building2, roles: ["ADMIN", "OPERATOR"] },
  { name: "Vehicles", href: "/vehicles", icon: Truck, roles: ["ADMIN", "OPERATOR"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "ACCOUNTANT"] },
  { name: "Users", href: "/users", icon: UserCog, roles: ["ADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  // Close the mobile drawer automatically whenever the route changes
  // (tapping a nav link should close the menu, not leave it open).
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const visibleItems = user
    ? menuItems.filter((item) => item.roles.includes(user.role))
    : [];

  return (
    <>
      {/* Mobile top bar — fixed, only visible below the lg breakpoint */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-[#0b2e1d] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Leaf size={20} className="text-emerald-400" />
          <span className="font-semibold text-white">SS Green Fuels</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-white hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Backdrop behind the mobile drawer — tap it to dismiss */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar — slides in as a drawer on mobile, permanently docked on lg+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-[#0b2e1d] text-white flex flex-col overflow-y-auto transition-transform duration-200 ease-in-out
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Leaf size={18} strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight">SS Green Fuels</div>
              <div className="text-[11px] text-white/40">Business Console</div>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
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

        {/* Settings (admin only) */}
        {user?.role === "ADMIN" && (
          <div className="px-3 pt-4 border-t border-white/10">
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
        )}

        {/* Current user + logout */}
        {user && (
          <div className="flex items-center gap-2.5 px-4 py-4 border-t border-white/10">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-[12px] font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-[12.5px] font-medium text-white truncate">{user.name}</div>
              <div className="text-[10.5px] text-white/40">{ROLE_LABELS[user.role]}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
