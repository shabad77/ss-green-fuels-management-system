"use client";

import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import SearchDropdown from "@/components/ui/SearchDropdown";
import { Printer, Pencil, Trash2 } from "lucide-react";

type Buyer = {
  id: number;
  name: string;
  address: string;
  gst: string | null;
};

type Sale = {

  id: number;

  invoiceNo: string;

  invoiceDate: string;

  vehicleNo: string;

  ewayBillNo: string | null;

  shipToAddress: string | null;

  itemName: string | null;

  hsnCode: string | null;

  quantity: number;

  rate: number;

  amount: number;

  gstPercent: number;

  gstAmount: number;

  total: number;

  createdAt: string;

  buyer: {

    id: number;

    name: string;

    address: string;

    gst: string | null;

  };

};

export default function SalesPage() {

  function getToday() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().split("T")[0];
}

  const [buyerId, setBuyerId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: "ADMIN" | "OPERATOR" | "ACCOUNTANT" } | null>(null);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [itemName, setItemName] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [gstPercent, setGstPercent] = useState("5");
  const [sales, setSales] = useState<Sale[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(getToday());
  const invoiceDateRef = useRef<HTMLInputElement>(null);
  const buyerRef = useRef<HTMLInputElement>(null);
  const vehicleNoRef = useRef<HTMLInputElement>(null);
  const ewayBillNoRef = useRef<HTMLInputElement>(null);
  const itemNameRef = useRef<HTMLInputElement>(null);
  const hsnCodeRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);
  const gstPercentRef = useRef<HTMLInputElement>(null);

const [vehicleNo, setVehicleNo] = useState("");

const [ewayBillNo, setEwayBillNo] = useState("");

const [shipToAddress, setShipToAddress] = useState("");

const selectedBuyer =
  buyers.find((b) => b.id === buyerId);

  const amount =
    (Number(quantity) || 0) * (Number(rate) || 0);

  const gstAmount =
    amount * (Number(gstPercent) || 0) / 100;

  const total =
    amount + gstAmount;

  useEffect(() => {
  setInvoiceDate(getToday());
  loadBuyers();
  loadSales();

  fetch("/api/auth/me")
    .then((res) => (res.ok ? res.json() : null))
    .then(setCurrentUser)
    .catch(() => setCurrentUser(null));
}, []);

useEffect(() => {
  if (editingId) return;

  setInvoiceNo(getNextInvoiceNo(sales));
}, [sales, editingId]);

  async function loadBuyers() {
    const res = await fetch("/api/buyers");

    if (!res.ok) return;

    const data = await res.json();

    setBuyers(data);
  }

  async function loadSales() {

  const res = await fetch("/api/sales");

  if (!res.ok) return;

  const data = await res.json();

  setSales(data);

}

function getNextInvoiceNo(sales: Sale[]) {
  const year = new Date().getFullYear();
  const shortYear = String(year + 1).slice(-2);

  if (sales.length === 0) {
    return `${year}-${shortYear}/001`;
  }

  const highest = Math.max(
    ...sales.map((sale) => Number(sale.invoiceNo.split("/")[1]))
  );

  return `${year}-${shortYear}/${String(highest + 1).padStart(3, "0")}`;
}

function editSale(sale: Sale) {

  setEditingId(sale.id);

  setBuyerId(sale.buyer.id);

  setBuyerSearch(sale.buyer.name);

  setInvoiceNo(sale.invoiceNo);

  setInvoiceDate(sale.invoiceDate.split("T")[0]);

  setVehicleNo(sale.vehicleNo);

  setEwayBillNo(sale.ewayBillNo || "");

  setShipToAddress(
    sale.shipToAddress || sale.buyer.address
  );

  setQuantity(String(sale.quantity));

  setItemName(sale.itemName || "");

  setHsnCode(sale.hsnCode || "");

  setRate(String(sale.rate));

  setGstPercent(String(sale.gstPercent));

}

function cancelEdit() {
  setEditingId(null);

  setBuyerId(null);
  setBuyerSearch("");

  setInvoiceDate(getToday());

  setVehicleNo("");
  setEwayBillNo("");
  setShipToAddress("");

  setQuantity("");
  setItemName("");
  setHsnCode("");
  setRate("");
}

async function deleteSale(id: number) {

  if (!confirm("Delete this sale?")) return;

  await fetch(`/api/sales/${id}`, {

    method: "DELETE",

  });

  loadSales();

}

  async function saveSale() {

  if (!buyerId) {
    alert("Please select buyer.");
    return;
  }

  if (!invoiceNo) {
    alert("Invoice number required.");
    return;
  }

  if (!invoiceDate) {
    alert("Invoice date required.");
    return;
  }

  if (!vehicleNo) {
    alert("Vehicle number required.");
    return;
  }

  if (!itemName.trim()) {
    alert("Enter item name.");
    return;
  }

  if (!quantity || Number(quantity) <= 0) {
    alert("Enter quantity.");
    return;
  }

  if (!rate || Number(rate) <= 0) {
    alert("Enter rate.");
    return;
  }

  const response = await fetch("/api/sales", {

    method: editingId ? "PUT" : "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({

      id: editingId,

      buyerId,

      invoiceNo,

      invoiceDate,

      vehicleNo,

      ewayBillNo,

      shipToAddress,

      itemName,

      hsnCode,

      quantity,

      rate,

      amount,

      gstPercent,

      gstAmount,

      total,

    }),

  });

  if (!response.ok) {

    const data = await response.json();

    alert(data.error || "Unable to save.");

    return;
  }

  await loadSales();

  setBuyerId(null);
  setBuyerSearch("");
  setVehicleNo("");
  setEwayBillNo("");
  setShipToAddress("");
  setItemName("");
  setHsnCode("");
  setQuantity("");
  setRate("");
  setEditingId(null);

}

  return (
  <MainLayout>
    <div className="mb-6">
      <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
        Sales
      </h1>
      <p className="text-[13.5px] text-slate-500 mt-0.5">
        Create and manage sales invoices
      </p>
    </div>

    {currentUser?.role !== "ACCOUNTANT" && (
    <Card title={editingId ? "Edit Sale" : "Add Sale"}>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Invoice No */}

        <div>
          <label className="block mb-2 text-[13px] font-medium text-slate-600">
            Invoice No *
          </label>

          <input
            type="text"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                invoiceDateRef.current?.focus();
              }
            }}
            placeholder="2026-27/001"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
          />
        </div>

        {/* Invoice Date */}

        <div>
          <label className="block mb-2 text-[13px] font-medium text-slate-600">
            Invoice Date *
          </label>

         <input
  ref={invoiceDateRef}
  type="date"
  value={invoiceDate}
  onChange={(e) => setInvoiceDate(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buyerRef.current?.focus();
    }
  }}
  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
/>
        </div>

        {/* Buyer */}

<div className="relative md:col-span-2">
  <SearchDropdown
    ref={buyerRef}
    label="Buyer *"
    placeholder="Search Buyer..."
    items={buyers}
    value={buyerSearch}
    onChange={setBuyerSearch}
    getLabel={(buyer) => buyer.name}
    nextRef={vehicleNoRef}
    onSelect={(buyer) => {
      setBuyerId(buyer.id);
      setBuyerSearch(buyer.name);
      setShipToAddress(buyer.address);
    }}
  />
</div>

{/* Buyer Details */}

<div>

  <label className="block mb-2 text-[13px] font-medium text-slate-600">
    GST Number
  </label>

  <input
    value={selectedBuyer?.gst || ""}
    readOnly
    className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-500"
  />

</div>

<div>

  <label className="block mb-2 text-[13px] font-medium text-slate-600">
    Billing Address
  </label>

  <textarea
    rows={3}
    readOnly
    value={selectedBuyer?.address || ""}
    className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-500 resize-none"
  />

</div>

        {/* Vehicle */}

        <div>

          <label className="block mb-2 text-[13px] font-medium text-slate-600">
            Vehicle Number *
          </label>

          <input
  ref={vehicleNoRef}
  type="text"
  value={vehicleNo}
  onChange={(e) =>
    setVehicleNo(e.target.value.toUpperCase())
  }
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ewayBillNoRef.current?.focus();
    }
  }}
  placeholder="RJ14 GB 1178"
  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
/>

        </div>

        {/* E Way */}

        <div>

          <label className="block mb-2 text-[13px] font-medium text-slate-600">
            E-Way Bill No.
          </label>

          <input
  ref={ewayBillNoRef}
  type="text"
  value={ewayBillNo}
  onChange={(e) =>
    setEwayBillNo(e.target.value)
  }
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      itemNameRef.current?.focus();
    }
  }}
  placeholder="Optional"
  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
/>

        </div>

        {/* Ship To */}

        <div>

          <label className="block mb-2 text-[13px] font-medium text-slate-600">
            Ship To Address
          </label>

          <textarea
  rows={3}
  value={shipToAddress}
  onChange={(e) =>
    setShipToAddress(e.target.value)
  }
  placeholder="Delivery Address"
  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 resize-none outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
/>

        </div>

        {/* Product */}

<div>

  <label className="block mb-2 text-[13px] font-medium text-slate-600">
    Product *
  </label>

  <input
    ref={itemNameRef}
    value={itemName}
    onChange={(e) => setItemName(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        hsnCodeRef.current?.focus();
      }
    }}
    placeholder="e.g. Biomass Pellets"
    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
  />

</div>

{/* HSN */}

<div>

  <label className="block mb-2 text-[13px] font-medium text-slate-600">
    HSN Code
  </label>

  <input
    ref={hsnCodeRef}
    value={hsnCode}
    onChange={(e) => setHsnCode(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        quantityRef.current?.focus();
      }
    }}
    placeholder="4401"
    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
  />

</div>

        {/* Quantity */}

        <div>

          <label className="block mb-2 text-[13px] font-medium text-slate-600">
            Quantity (Kg) *
          </label>

          <input
            ref={quantityRef}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                rateRef.current?.focus();
              }
            }}
            placeholder="18000"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
          />

        </div>

        {/* Rate */}

        <div>

          <label className="block mb-2 text-[13px] font-medium text-slate-600">
            Rate (₹ / Kg) *
          </label>

          <input
            ref={rateRef}
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                gstPercentRef.current?.focus();
              }
            }}
            placeholder="8.25"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
          />

        </div>

        {/* GST */}

        <div>

          <label className="block mb-2 text-[13px] font-medium text-slate-600">
            GST %
          </label>

          <input
            ref={gstPercentRef}
            type="number"
            value={gstPercent}
            onChange={(e) => setGstPercent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveSale();
              }
            }}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-500"
          />

        </div>

      </div>

      {/* Totals */}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

          <div className="text-[13px] text-slate-500 mb-2">
            Amount
          </div>

          <div className="text-2xl font-bold text-slate-800">
            ₹ {amount.toLocaleString()}
          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

          <div className="text-[13px] text-slate-500 mb-2">
            GST
          </div>

          <div className="text-2xl font-bold text-slate-800">
            ₹ {gstAmount.toLocaleString()}
          </div>

        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">

          <div className="text-[13px] text-emerald-700/80 mb-2">
            Grand Total
          </div>

          <div className="text-3xl font-bold text-emerald-700">
            ₹ {total.toLocaleString()}
          </div>

        </div>

      </div>

      <div className="mt-8 flex gap-3">
        <Button onClick={saveSale}>
          {editingId ? "Update Sale" : "Save Sale"}
        </Button>

        {editingId && (
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel
          </Button>
        )}
      </div>

    </Card>
    )}

    <div className="mt-6">

<Card title="Sales List">

  <div className="overflow-x-auto">

    <table className="w-full border-collapse">

      <thead>

        <tr className="bg-slate-50 border-b border-slate-200">

          <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">#</th>
          <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Invoice</th>
          <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Buyer</th>
          <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Qty (Kg)</th>
          <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Rate</th>
          <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">GST %</th>
          <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Amount</th>
          <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">GST</th>
          <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Grand Total</th>
          <th className="p-3 text-center text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Action</th>

        </tr>

      </thead>

      <tbody>

        {sales.length === 0 ? (

          <tr>

            <td
              colSpan={10}
              className="text-center p-10 text-slate-400 text-[13.5px]"
            >
              No sales recorded yet
            </td>

          </tr>

        ) : (

          sales.map((sale, index) => (

            <tr
              key={sale.id}
              className="border-b border-slate-100 hover:bg-slate-50/70 text-[13.5px] text-slate-700"
            >

              <td className="p-3 text-slate-400">
                {index + 1}
              </td>

              <td className="p-3 font-medium text-slate-800">
                {sale.invoiceNo}
              </td>

              <td className="p-3">
                {sale.buyer.name}
              </td>

              <td className="p-3 text-right tabular-nums">
                {sale.quantity.toLocaleString()}
              </td>

              <td className="p-3 text-right tabular-nums">
                ₹ {sale.rate}
              </td>

              <td className="p-3 text-right tabular-nums">
                {sale.gstPercent}%
              </td>

              <td className="p-3 text-right tabular-nums">
                ₹ {sale.amount.toLocaleString()}
              </td>

              <td className="p-3 text-right tabular-nums">
                ₹ {sale.gstAmount.toLocaleString()}
              </td>

              <td className="p-3 text-right tabular-nums font-semibold text-emerald-700">
                ₹ {sale.total.toLocaleString()}
              </td>

              <td className="p-3">

                <div className="flex justify-center gap-1.5">

                  <button
  onClick={() => window.open(`/invoice/${sale.id}`, "_blank")}
  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-colors"
  title="Print Invoice"
>
  <Printer size={15} />
</button>

                  {currentUser?.role !== "ACCOUNTANT" && (
                  <>
                  <button
                    onClick={() => editSale(sale)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => deleteSale(sale.id)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                  </>
                  )}

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