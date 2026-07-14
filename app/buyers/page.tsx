"use client";

import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";


type Buyer= {
  id: number;
  name: string;
  gst: string | null;
  mobile: string;
  address: string;
};

export default function BuyersPage() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [gst, setGst] = useState("");
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const gstRef = useRef<HTMLInputElement>(null);
  
        async function loadBuyers() {
      const response = await fetch("/api/buyers")   

  if (!response.ok) {
    console.error("Failed to load buyers");
    return;
  }

  const data = await response.json();
  setBuyers(data);
}

async function saveBuyer() {
  if (!name || !mobile || !address) {
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

  const response = await fetch(
  editingId
    ? `/api/buyers/${editingId}`
    : "/api/buyers",
  {
    method: editingId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mobile,
      address,
      gst,
    }),
  }
);

  if (response.ok) {

    setMessage(
      editingId
        ? "✅ Buyer updated successfully."
        : "✅ Buyer saved successfully."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);

    setName("");
    setMobile("");
    setAddress("");
    setGst("");
    setEditingId(null);

    await loadBuyers();

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
  loadBuyers();
}, []);

async function deleteBuyer(id: number) {
  if (!confirm("Are you sure you want to delete this buyer?")) {
    return;
  }

  const response = await fetch(`/api/buyers/${id}`, {
    method: "DELETE",
  });

  if (response.ok) {
    await loadBuyers();

    setMessage("✅ Buyer deleted successfully.");

    setTimeout(() => {
      setMessage("");
    }, 2500);
  } else {
    const data = await response.json();

    setMessage("❌ " + data.error);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }
}

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold mb-6">
        Buyer
 Master
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
      <Card title="Add Buyer
">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <TextInput
            ref={nameRef}
            label="Buyer Name *"
            placeholder="Buyer Name"
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
      addressRef.current?.focus();
    }
  }}
          
          />

          <TextInput
            label="Address *"
            ref={addressRef}
            placeholder="Address"
            value={address}
            onChange={setAddress}
            onKeyDown={(e) => {
    if (e.key === "Enter") {
      gstRef.current?.focus();
    }
  }}
            
          />

          <TextInput
            label="GST Number *"
            ref={gstRef}
            placeholder="GST Number"
            value={gst}
            onChange={setGst}
            onKeyDown={(e) => {
    if (e.key === "Enter") {
      saveBuyer
();
    }
  }}
            
          />

        </div>

        <div className="mt-6 flex gap-3">

  <Button onClick={saveBuyer
}>
    {editingId ? "Update Buyer" : "Save Buyer"}
  </Button>

  {editingId && (
    <Button
      variant="secondary"
      onClick={() => {
        setEditingId(null);
        setName("");
        setMobile("");
        setAddress("");
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
  title="Buyer
 List"
  headerRight={
    <div className="w-70">
      <TextInput
        placeholder="🔍 Search by Name/Mobile/GST
..."
        value={search}
        onChange={setSearch}
      />
    </div>
  }
>

          <table className="w-full">

            <thead className="sticky top-0">

              <tr className="bg-green-700 text-white uppercase text-sm tracking-wide">

                <th className="px-4 py-4 w-16">#</th>
                <th className="px-4 py-3 text-center">Name</th>
                <th className="px-4 py-3 text-center">Mobile</th>
                <th className="px-4 py-3 text-center">Address</th>
                <th className="px-4 py-3 text-center">GST</th>
                <th className="px-4 py-4 text-center">Action</th>

              </tr>

            </thead>

            <tbody>

              {buyers
              .filter((buyer
) =>
    (
      buyer
.name +
      buyer
.mobile +
      buyer
.address +
      (buyer
.gst || "")
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  )
      .map((buyer
, index) => (
        
        
        
                  <tr
  key={buyer
.id}
  className={`${
  index % 2 === 0 ? "bg-white" : "bg-gray-50"
} hover:bg-green-100 transition-all duration-200`}
>
                  <td className="px-4 py-4 text-center">
  {index + 1}
</td>

  <td className="border-b border-gray-200 px-4 py-4 text-center">{buyer
.name}</td>
  <td className="border-b border-gray-200 px-4 py-4 text-center">{buyer
.mobile}</td>
  <td className="px-4 py-3 w-64 max-w-64 whitespace-normal break-words text-center">
  {buyer.address}
</td>
  <td className="border-b border-gray-200 px-4 py-4 text-center">{buyer
.gst || "-"}</td>

  <td className="border-b border-gray-200 px-4 py-4 text-center">

  <div className="flex justify-center gap-2">

    <button
  className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition"
  onClick={() => {
    setEditingId(buyer
.id);
    setName(buyer
.name);
    setMobile(buyer
.mobile);
    setAddress(buyer
.address);
    setGst(buyer
.gst || "");
  }}
>
  <Pencil size={18} className="text-blue-700" />
</button>

    <button
  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
  onClick={async () => {
    if (!confirm("Delete this buyer?")) return;

    const response = await fetch(`/api/buyers/${buyer.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await loadBuyers();
    } else {
      alert("Failed to delete buyer");
    }
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

        </Card>

      </div>

    </MainLayout>
  );
}