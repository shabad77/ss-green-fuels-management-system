"use client";

import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Pencil, Trash2, UserCog } from "lucide-react";

type Role = "ADMIN" | "OPERATOR" | "ACCOUNTANT";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  OPERATOR: "Operator",
  ACCOUNTANT: "Accountant",
};

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: "bg-emerald-50 text-emerald-700",
  OPERATOR: "bg-blue-50 text-blue-700",
  ACCOUNTANT: "bg-amber-50 text-amber-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("OPERATOR");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  async function loadUsers() {
    const res = await fetch("/api/users");
    if (!res.ok) return;
    setUsers(await res.json());
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function flash(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("OPERATOR");
  }

  async function saveUser() {
    if (!name.trim() || !email.trim()) {
      flash("❌ Name and email are required.");
      return;
    }

    if (!editingId && !password) {
      flash("❌ Password is required for a new user.");
      return;
    }

    const res = await fetch(editingId ? `/api/users/${editingId}` : "/api/users", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, ...(password ? { password } : {}) }),
    });

    const data = await res.json();

    if (!res.ok) {
      flash("❌ " + data.error);
      return;
    }

    flash(editingId ? "✅ User updated." : "✅ User created.");
    resetForm();
    await loadUsers();
    setTimeout(() => nameRef.current?.focus(), 100);
  }

  async function deleteUser(id: number) {
    if (!confirm("Delete this user? They will lose access immediately.")) return;

    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      flash("❌ " + data.error);
      return;
    }

    flash("✅ User deleted.");
    await loadUsers();
  }

  const inputClasses =
    "w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow";

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <UserCog size={24} className="text-emerald-600" />
          Users
        </h1>
        <p className="text-[13.5px] text-slate-500 mt-0.5">
          Manage staff accounts and what each role can access
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-[13.5px] font-medium border ${
            message.startsWith("❌")
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {message}
        </div>
      )}

      <Card title={editingId ? "Edit User" : "Add User"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-[13px] font-medium text-slate-600">Name *</label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block mb-2 text-[13px] font-medium text-slate-600">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@ssgreenfuels.in"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block mb-2 text-[13px] font-medium text-slate-600">
              {editingId ? "New Password (leave blank to keep current)" : "Password *"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block mb-2 text-[13px] font-medium text-slate-600">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className={inputClasses}
            >
              <option value="ADMIN">Admin — full access</option>
              <option value="OPERATOR">Operator — purchases, suppliers, vehicles</option>
              <option value="ACCOUNTANT">Accountant — sales, purchases, reports (view/export only)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={saveUser}>{editingId ? "Update User" : "Add User"}</Button>
          {editingId && (
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-6">
        <Card title="Team">
          <div className="overflow-x-auto">
  <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>
                <th className="p-3 text-center text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-10 text-slate-400 text-[13.5px]">
                    No users yet
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 text-[13.5px] text-slate-700"
                  >
                    <td className="p-3 font-medium text-slate-800">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_STYLES[u.role]}`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1.5">
                        <button
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                          title="Edit"
                          onClick={() => {
                            setEditingId(u.id);
                            setName(u.name);
                            setEmail(u.email);
                            setRole(u.role);
                            setPassword("");
                          }}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                          title="Delete"
                          onClick={() => deleteUser(u.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
