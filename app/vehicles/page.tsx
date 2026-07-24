
"use client";

import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";

type Vehicle = {
  id: number;
  vehicleNumber: string;
  ownerName: string;
  createdAt: string;
};

export default function VehiclesPage() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const vehicleRef = useRef<HTMLInputElement>(null);
  const ownerRef = useRef<HTMLInputElement>(null);

  async function loadVehicles() {
    const res = await fetch("/api/vehicles");
    if (!res.ok) return;
    setVehicles(await res.json());
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  async function saveVehicle() {
    if (!vehicleNumber.trim() || !ownerName.trim()) {
      setMessage("❌ Please fill all required fields.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    const res = await fetch("/api/vehicles", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        vehicleNumber,
        ownerName,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage("❌ " + (data.error || "Something went wrong."));
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    setMessage(editingId ? "✅ Vehicle updated." : "✅ Vehicle added.");
    setTimeout(() => setMessage(""), 2500);

    setVehicleNumber("");
    setOwnerName("");
    setEditingId(null);

    await loadVehicles();
    vehicleRef.current?.focus();
  }

  async function deleteVehicle(id: number) {
    if (!confirm("Delete this vehicle?")) return;

    await fetch("/api/vehicles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadVehicles();
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
          Vehicles
        </h1>
        <p className="text-[13.5px] text-slate-500 mt-0.5">
          Manage vehicles used for deliveries and pickups
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

      <Card title={editingId ? "Edit Vehicle" : "Add Vehicle"}>
        <div className="grid md:grid-cols-2 gap-5">
          <TextInput
  ref={vehicleRef}
  label="Vehicle Number *"
  placeholder="RJ03GB1234"
  value={vehicleNumber}
  onChange={(value) => setVehicleNumber(value.toUpperCase())}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      ownerRef.current?.focus();
    }
  }}
/>

          <TextInput
            ref={ownerRef}
            label="Owner Name *"
            value={ownerName}
            onChange={setOwnerName}
            placeholder="Owner Name"
            onKeyDown={(e) => e.key === "Enter" && saveVehicle()}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={saveVehicle}>
            {editingId ? "Update Vehicle" : "Save Vehicle"}
          </Button>

          {editingId && (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setVehicleNumber("");
                setOwnerName("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-6">
        <Card
          title="Vehicle List"
          headerRight={
            <div className="w-full md:w-72">
              <TextInput
                placeholder="Search..."
                value={search}
                onChange={setSearch}
              />
            </div>
          }
        >
          <div className="overflow-x-auto">
  <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500 w-14">#</th>
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Vehicle Number</th>
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Owner</th>
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Time Added</th>
                <th className="p-3 text-center text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {(() => {
                const filtered = vehicles.filter((v) =>
                  (v.vehicleNumber + v.ownerName)
                    .toLowerCase()
                    .includes(search.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="text-center p-10 text-slate-400 text-[13.5px]">
                        No vehicles found
                      </td>
                    </tr>
                  );
                }

                return filtered.map((v, i) => (
                  <tr
                    key={v.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 text-[13.5px] text-slate-700"
                  >
                    <td className="p-3 text-slate-400">{i + 1}</td>
                    <td className="p-3 font-medium text-slate-800">{v.vehicleNumber}</td>
                    <td className="p-3">{v.ownerName}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(v.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1.5">
                        <button
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                          title="Edit"
                          onClick={() => {
                            setEditingId(v.id);
                            setVehicleNumber(v.vehicleNumber);
                            setOwnerName(v.ownerName);
                          }}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                          title="Delete"
                          onClick={() => deleteVehicle(v.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
