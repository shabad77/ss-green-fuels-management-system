
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
      <h1 className="text-4xl font-bold mb-6">Vehicle Master</h1>

      {message && (
        <div className="mb-5 rounded-lg border px-4 py-3 bg-green-50">
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

      <div className="mt-8">
        <Card
          title="Vehicle List"
          headerRight={
            <div className="w-72">
              <TextInput
                placeholder="Search..."
                value={search}
                onChange={setSearch}
              />
            </div>
          }
        >
          <table className="w-full">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="p-3">#</th>
                <th className="p-3">Vehicle Number</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Time Added</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {vehicles
                .filter((v) =>
                  (v.vehicleNumber + v.ownerName)
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((v, i) => (
                  <tr
                    key={v.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 text-center">{i + 1}</td>
                    <td className="p-3 text-center">{v.vehicleNumber}</td>
                    <td className="p-3 text-center">{v.ownerName}</td>
                    <td className="p-3 text-center">
                      {new Date(v.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 rounded bg-blue-100"
                          onClick={() => {
                            setEditingId(v.id);
                            setVehicleNumber(v.vehicleNumber);
                            setOwnerName(v.ownerName);
                          }}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="p-2 rounded bg-red-100"
                          onClick={() => deleteVehicle(v.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      </div>
    </MainLayout>
  );
}
