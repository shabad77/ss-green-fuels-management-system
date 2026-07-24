"use client";

import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";


type Supplier = {
  id: number;
  name: string;
  mobile: string;
  village: string;
  gst: string | null;
};

export default function SuppliersPage() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState("");
  const [gst, setGst] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const villageRef = useRef<HTMLInputElement>(null);
  const gstRef = useRef<HTMLInputElement>(null);
  
  async function loadSuppliers() {
  const response = await fetch("/api/suppliers");

  if (!response.ok) {
    console.error("Failed to load suppliers");
    return;
  }

  const data = await response.json();
  setSuppliers(data);
}

async function saveSupplier() {
  if (!name || !mobile || !village) {
    setMessage("❌ Please fill all required fields.");

    setTimeout(() => {
      setMessage("");
    }, 2500);
      return;
  }
  {  


    if (!/^\d{10}$/.test(mobile)) {
  setMessage("❌ Mobile number must contain exactly 10 digits.");

  setTimeout(() => {
    setMessage("");
  }, 2500);

  mobileRef.current?.focus();
  return;
}
    
  }

  const response = await fetch("/api/suppliers", {
    method: editingId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: editingId,
      name,
      mobile,
      village,
      gst,
    }),
  });

  if (response.ok) {

    setMessage(
      editingId
        ? "✅ Supplier updated successfully."
        : "✅ Supplier saved successfully."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);

    setName("");
    setMobile("");
    setVillage("");
    setGst("");
    setEditingId(null);

    await loadSuppliers();

setTimeout(() => {
  nameRef.current?.focus();
}, 100);

  } else {
  const data = await response.json();

  setMessage("❌ " + data.error);

  setTimeout(() => {
    setMessage("");
  }, 2500);
}
}
  useEffect(() => {
  loadSuppliers();
}, []);

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold mb-6">
        Supplier Master
      </h1>
    {message && (
  <div
    className={`mb-6 rounded-lg px-4 py-3 font-medium border ${
      message.startsWith("❌")
        ? "bg-red-100 border-red-300 text-red-800"
        : "bg-green-100 border-green-300 text-green-800"
    }`}
  >
    {message}
  </div>
)}
      <Card title="Add Supplier">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <TextInput
            ref={nameRef}
            label="Supplier Name *"
            placeholder="Supplier Name"
            value={name}
            onChange={setName}
            onKeyDown={(e) => {
    if (e.key === "Enter") {
      mobileRef.current?.focus();
    }
  }}
          />

          <TextInput
            label="Mobile Number *"
            ref={mobileRef}
            placeholder="Mobile Number"
            value={mobile}
            onChange={(value) => {
  const numbersOnly = value.replace(/\D/g, "");
  setMobile(numbersOnly.slice(0, 10));
}}
             onKeyDown={(e) => {
    if (e.key === "Enter") {
      villageRef.current?.focus();
    }
  }}
          
          />

          <TextInput
            label="Village / City *"
            ref={villageRef}
            placeholder="Village / City"
            value={village}
            onChange={setVillage}
            onKeyDown={(e) => {
    if (e.key === "Enter") {
      gstRef.current?.focus();
    }
  }}
            
          />

          <TextInput
            label="GST Number (Optional)"
            ref={gstRef}
            placeholder="GST Number"
            value={gst}
            onChange={setGst}
            onKeyDown={(e) => {
    if (e.key === "Enter") {
      saveSupplier();
    }
  }}
            
          />

        </div>

        <div className="mt-6 flex gap-3">

  <Button onClick={saveSupplier}>
    {editingId ? "Update Supplier" : "Save Supplier"}
  </Button>

  {editingId && (
    <Button
      variant="secondary"
      onClick={() => {
        setEditingId(null);
        setName("");
        setMobile("");
        setVillage("");
        setGst("");
      }}
    >
      Cancel
    </Button>
  )}

</div>

           </Card>

      <div className="mt-8">
      

        <Card
  title="Supplier List"
  headerRight={
    <div className="w-full md:w-72">
      <TextInput
        placeholder="🔍 Search supplier..."
        value={search}
        onChange={setSearch}
      />
    </div>
  }
>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse">

            <thead className="sticky top-0">

              <tr className="bg-green-700 text-white uppercase text-sm tracking-wide">

                <th className="px-4 py-4 w-16">#</th>
                <th className="px-4 py-3 text-center">Name</th>
                <th className="px-4 py-3 text-center">Mobile</th>
                <th className="px-4 py-3 text-center">Village</th>
                <th className="px-4 py-3 text-center">GST</th>
                <th className="px-4 py-4 text-center">Action</th>

              </tr>

            </thead>

            <tbody>

              {suppliers
  .filter((supplier) =>
    (
      supplier.name +
      supplier.mobile +
      supplier.village +
      (supplier.gst || "")
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  )
      .map((supplier, index) => (
        
        
        
                  <tr
  key={supplier.id}
  className={`${
  index % 2 === 0 ? "bg-white" : "bg-gray-50"
} hover:bg-green-100 transition-all duration-200`}
>
                  <td className="px-4 py-4 text-center">
  {index + 1}
</td>

  <td className="border-b border-gray-200 px-4 py-4 text-center">{supplier.name}</td>
  <td className="border-b border-gray-200 px-4 py-4 text-center">{supplier.mobile}</td>
  <td className="border-b border-gray-200 px-4 py-4 text-center">{supplier.village}</td>
  <td className="border-b border-gray-200 px-4 py-4 text-center">{supplier.gst || "-"}</td>

  <td className="border-b border-gray-200 px-4 py-4 text-center">

  <div className="flex justify-center gap-2">

    <button
  className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition"
  onClick={() => {
    setEditingId(supplier.id);
    setName(supplier.name);
    setMobile(supplier.mobile);
    setVillage(supplier.village);
    setGst(supplier.gst || "");
  }}
>
  <Pencil size={18} className="text-blue-700" />
</button>

    <button
  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
  onClick={async () => {

    if (!confirm("Delete this supplier?")) return;

    await fetch("/api/suppliers", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: supplier.id,
      }),
    });

    loadSuppliers();

  }}
>
  <Trash2 size={18} className="text-red-700" />
</button>

  </div>

</td>
</tr>

              ))}

            </tbody>

          </table>
        </div>

        </Card>

      </div>

    </MainLayout>
  );
}