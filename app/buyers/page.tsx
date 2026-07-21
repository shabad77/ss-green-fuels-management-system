"use client";

import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";

type Buyer = {
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
  const nameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const gstRef = useRef<HTMLInputElement>(null);

  async function loadBuyers() {
    const response = await fetch("/api/buyers");

    if (!response.ok) {
      console.error("Failed to load buyers");
      return;
    }

    const data = await response.json();
    setBuyers(data);
  }

  useEffect(() => {
    loadBuyers();
  }, []);

  async function saveBuyer() {
    if (!name || !mobile || !address) {
      setMessage("❌ Please fill all required fields.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setMessage("❌ Mobile number must contain exactly 10 digits.");

      setTimeout(() => {
        setMessage("");
      }, 2500);

      mobileRef.current?.focus();
      return;
    }

    const response = await fetch(
      editingId ? `/api/buyers/${editingId}` : "/api/buyers",
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

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setMobile("");
    setAddress("");
    setGst("");
  }

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

  const filteredBuyers = buyers.filter((buyer) =>
    (buyer.name + buyer.mobile + buyer.address + (buyer.gst || ""))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
          Buyers
        </h1>
        <p className="text-[13.5px] text-slate-500 mt-0.5">
          Manage buyer accounts and contact details
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

      <Card title={editingId ? "Edit Buyer" : "Add Buyer"}>
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
            label="GST Number"
            ref={gstRef}
            placeholder="GST Number"
            value={gst}
            onChange={setGst}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveBuyer();
              }
            }}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={saveBuyer}>
            {editingId ? "Update Buyer" : "Save Buyer"}
          </Button>

          {editingId && (
            <Button variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-6">
        <Card
          title="Buyer List"
          headerRight={
            <div className="w-72">
              <TextInput
                placeholder="Search by name / mobile / GST..."
                value={search}
                onChange={setSearch}
              />
            </div>
          }
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500 w-14">
                  #
                </th>
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
                  Mobile
                </th>
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </th>
                <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
                  GST
                </th>
                <th className="p-3 text-center text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBuyers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-10 text-slate-400 text-[13.5px]">
                    No buyers found
                  </td>
                </tr>
              ) : (
                filteredBuyers.map((buyer, index) => (
                  <tr
                    key={buyer.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 text-[13.5px] text-slate-700"
                  >
                    <td className="p-3 text-slate-400">{index + 1}</td>

                    <td className="p-3 font-medium text-slate-800">
                      {buyer.name}
                    </td>

                    <td className="p-3 tabular-nums">{buyer.mobile}</td>

                    <td className="p-3 max-w-xs whitespace-normal break-words text-slate-600">
                      {buyer.address}
                    </td>

                    <td className="p-3">{buyer.gst || "-"}</td>

                    <td className="p-3">
                      <div className="flex justify-center gap-1.5">
                        <button
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                          title="Edit"
                          onClick={() => {
                            setEditingId(buyer.id);
                            setName(buyer.name);
                            setMobile(buyer.mobile);
                            setAddress(buyer.address);
                            setGst(buyer.gst || "");
                          }}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                          title="Delete"
                          onClick={() => deleteBuyer(buyer.id)}
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
        </Card>
      </div>
    </MainLayout>
  );
}
