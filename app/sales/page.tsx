"use client";

import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import SearchDropdown from "@/components/ui/SearchDropdown";
import { Printer, Pencil, Trash2, Plus, X } from "lucide-react";

type Buyer = {
  id: number;
  name: string;
  gst: string | null;
  address: string;
};

type SaleItem = {
  id?: number;
  itemName: string;
  hsnCode: string | null;
  quantity: number;
  rate: number;
  amount: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
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
  buyer: Buyer;
  items: SaleItem[];
};

// A single row in the item-entry table. Values are kept as strings while
// editing (controlled inputs), converted to numbers only when computing
// totals or building the save payload.
type LineItem = {
  itemName: string;
  hsnCode: string;
  quantity: string;
  rate: string;
  gstPercent: string;
};

const EMPTY_ITEM: LineItem = {
  itemName: "",
  hsnCode: "",
  quantity: "",
  rate: "",
  gstPercent: "5",
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getNextInvoiceNo(sales: Sale[]) {
  if (sales.length === 0) return "1";

  // sales are ordered desc by id from the API, so sales[0] is the most
  // recent invoice. Increment just its trailing numeric segment while
  // preserving everything before it (e.g. "2026-27/002" -> "2026-27/003"),
  // padding to keep the same digit count (002 -> 003, not 3).
  const latest = sales[0];
  const match = latest.invoiceNo.match(/^(.*?)(\d+)$/);

  if (match) {
    const prefix = match[1];
    const numStr = match[2];
    const nextNum = String(Number(numStr) + 1).padStart(numStr.length, "0");
    return prefix + nextNum;
  }

  return latest.invoiceNo;
}

export default function SalesPage() {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: "ADMIN" | "OPERATOR" | "ACCOUNTANT" } | null>(null);
  const [buyerId, setBuyerId] = useState<number | null>(null);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(getToday());
  const [vehicleNo, setVehicleNo] = useState("");
  const [ewayBillNo, setEwayBillNo] = useState("");
  const [shipToAddress, setShipToAddress] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const invoiceDateRef = useRef<HTMLInputElement>(null);
  const buyerRef = useRef<HTMLInputElement>(null);
  const vehicleNoRef = useRef<HTMLInputElement>(null);
  const ewayBillNoRef = useRef<HTMLInputElement>(null);

  const selectedBuyer = buyers.find((b) => b.id === buyerId);

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
    setBuyers(await res.json());
  }

  async function loadSales() {
    const res = await fetch("/api/sales");
    if (!res.ok) return;
    setSales(await res.json());
  }

  // ---------- item row helpers ----------

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
    setTimeout(() => {
      document.getElementById(`item-${items.length}-name`)?.focus();
    }, 50);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function computeItemTotals(item: LineItem) {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gstPercent = Number(item.gstPercent) || 0;
    const amount = quantity * rate;
    const gstAmount = (amount * gstPercent) / 100;
    return { amount, gstAmount, total: amount + gstAmount };
  }

  const aggregate = items.reduce(
    (acc, item) => {
      const { amount, gstAmount, total } = computeItemTotals(item);
      return {
        amount: acc.amount + amount,
        gstAmount: acc.gstAmount + gstAmount,
        total: acc.total + total,
      };
    },
    { amount: 0, gstAmount: 0, total: 0 }
  );

  // Enter key jumps to the next field within a row, or into the next
  // row / a fresh new row if it's the last field of the last row.
  function handleItemKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: keyof LineItem
  ) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const order: (keyof LineItem)[] = ["itemName", "hsnCode", "quantity", "rate", "gstPercent"];
    const fieldIndex = order.indexOf(field);

    if (fieldIndex < order.length - 1) {
      document.getElementById(`item-${index}-${order[fieldIndex + 1]}`)?.focus();
      return;
    }

    // last field in the row
    if (index < items.length - 1) {
      document.getElementById(`item-${index + 1}-itemName`)?.focus();
    } else {
      addItem();
    }
  }

  // ---------- edit / cancel / save ----------

  function editSale(sale: Sale) {
    setEditingId(sale.id);
    setBuyerId(sale.buyer.id);
    setBuyerSearch(sale.buyer.name);
    setInvoiceNo(sale.invoiceNo);
    setInvoiceDate(sale.invoiceDate.slice(0, 10));
    setVehicleNo(sale.vehicleNo);
    setEwayBillNo(sale.ewayBillNo || "");
    setShipToAddress(sale.shipToAddress || "");

    setItems(
      sale.items.length > 0
        ? sale.items.map((it) => ({
            itemName: it.itemName,
            hsnCode: it.hsnCode || "",
            quantity: String(it.quantity),
            rate: String(it.rate),
            gstPercent: String(it.gstPercent),
          }))
        : [{ ...EMPTY_ITEM }]
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setBuyerId(null);
    setBuyerSearch("");
    setVehicleNo("");
    setEwayBillNo("");
    setShipToAddress("");
    setItems([{ ...EMPTY_ITEM }]);
  }

  async function saveSale() {
    if (!buyerId) {
      alert("Select a buyer.");
      return;
    }

    if (!vehicleNo.trim()) {
      alert("Enter vehicle number.");
      return;
    }

    for (const item of items) {
      if (!item.itemName.trim()) {
        alert("Enter a name for every item.");
        return;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        alert(`Enter quantity for "${item.itemName || "an item"}".`);
        return;
      }
      if (!item.rate || Number(item.rate) <= 0) {
        alert(`Enter rate for "${item.itemName || "an item"}".`);
        return;
      }
    }

    const response = await fetch("/api/sales", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        buyerId,
        invoiceNo,
        invoiceDate,
        vehicleNo,
        ewayBillNo,
        shipToAddress,
        items: items.map((item) => ({
          itemName: item.itemName,
          hsnCode: item.hsnCode || null,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          gstPercent: Number(item.gstPercent),
        })),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Unable to save.");
      return;
    }

    await loadSales();
    cancelEdit();
  }

  async function deleteSale(id: number) {
    if (!confirm("Delete this sale?")) return;

    const response = await fetch(`/api/sales/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Unable to delete.");
      return;
    }

    await loadSales();
  }

  const inputClasses =
    "w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow";
  const labelClasses = "block mb-2 text-[13px] font-medium text-slate-600";

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Sales</h1>
        <p className="text-[13.5px] text-slate-500 mt-0.5">Create and manage sales invoices</p>
      </div>

      {currentUser?.role !== "ACCOUNTANT" && (
        <Card title={editingId ? "Edit Sale" : "Add Sale"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClasses}>Invoice No *</label>
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
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Invoice Date *</label>
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
                className={inputClasses}
              />
            </div>

            <div className="relative md:col-span-2">
              <SearchDropdown
                ref={buyerRef}
                label="Buyer *"
                placeholder="Search Buyer..."
                items={buyers}
                value={buyerSearch}
                onChange={setBuyerSearch}
                getLabel={(b) => b.name}
                nextRef={vehicleNoRef}
                onSelect={(b) => {
                  setBuyerId(b.id);
                  setBuyerSearch(b.name);
                  setShipToAddress(b.address);
                }}
              />
            </div>

            <div>
              <label className={labelClasses}>GST Number</label>
              <input readOnly value={selectedBuyer?.gst || ""} className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-500" />
            </div>

            <div>
              <label className={labelClasses}>Billing Address</label>
              <textarea readOnly rows={3} value={selectedBuyer?.address || ""} className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-500 resize-none" />
            </div>

            <div>
              <label className={labelClasses}>Vehicle No *</label>
              <input
                ref={vehicleNoRef}
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    ewayBillNoRef.current?.focus();
                  }
                }}
                placeholder="RJ14 GB 1178"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>E-Way Bill No.</label>
              <input
                ref={ewayBillNoRef}
                type="text"
                value={ewayBillNo}
                onChange={(e) => setEwayBillNo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    document.getElementById("item-0-itemName")?.focus();
                  }
                }}
                placeholder="Optional"
                className={inputClasses}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClasses}>Ship To Address</label>
              <textarea
                rows={2}
                value={shipToAddress}
                onChange={(e) => setShipToAddress(e.target.value)}
                placeholder="Leave blank to use the buyer's billing address"
                className={`${inputClasses} resize-none`}
              />
            </div>
          </div>

          {/* ================= ITEMS ================= */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-slate-800">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <Plus size={15} /> Add Item
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Item Name</th>
                    <th className="p-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 w-[110px]">HSN</th>
                    <th className="p-2.5 text-right text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 w-[110px]">Qty (Kg)</th>
                    <th className="p-2.5 text-right text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 w-[110px]">Rate</th>
                    <th className="p-2.5 text-right text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 w-[90px]">GST %</th>
                    <th className="p-2.5 text-right text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 w-[120px]">Amount</th>
                    <th className="p-2.5 w-[44px]" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const { total } = computeItemTotals(item);
                    return (
                      <tr key={index} className="border-b border-slate-100 last:border-b-0">
                        <td className="p-1.5">
                          <input
                            id={`item-${index}-itemName`}
                            value={item.itemName}
                            onChange={(e) => updateItem(index, "itemName", e.target.value)}
                            onKeyDown={(e) => handleItemKeyDown(e, index, "itemName")}
                            placeholder="e.g. Biomass Pellets"
                            className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`item-${index}-hsnCode`}
                            value={item.hsnCode}
                            onChange={(e) => updateItem(index, "hsnCode", e.target.value)}
                            onKeyDown={(e) => handleItemKeyDown(e, index, "hsnCode")}
                            placeholder="4401"
                            className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`item-${index}-quantity`}
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            onKeyDown={(e) => handleItemKeyDown(e, index, "quantity")}
                            className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-right text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`item-${index}-rate`}
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(index, "rate", e.target.value)}
                            onKeyDown={(e) => handleItemKeyDown(e, index, "rate")}
                            className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-right text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`item-${index}-gstPercent`}
                            type="number"
                            value={item.gstPercent}
                            onChange={(e) => updateItem(index, "gstPercent", e.target.value)}
                            onKeyDown={(e) => handleItemKeyDown(e, index, "gstPercent")}
                            className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-right text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          />
                        </td>
                        <td className="p-1.5 text-right pr-3 font-medium text-slate-700 tabular-nums">
                          ₹ {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                              title="Remove item"
                            >
                              <X size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-[13px] text-slate-500 mb-2">Amount</div>
              <div className="text-2xl font-bold text-slate-800">₹ {aggregate.amount.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-[13px] text-slate-500 mb-2">GST</div>
              <div className="text-2xl font-bold text-slate-800">₹ {aggregate.gstAmount.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="text-[13px] text-emerald-700/80 mb-2">Grand Total</div>
              <div className="text-3xl font-bold text-emerald-700">₹ {aggregate.total.toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button onClick={saveSale}>{editingId ? "Update Sale" : "Save Sale"}</Button>
            {editingId && (
              <Button variant="secondary" onClick={cancelEdit}>Cancel</Button>
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
                  <th className="p-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Items</th>
                  <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Qty (Kg)</th>
                  <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                  <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">GST</th>
                  <th className="p-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Grand Total</th>
                  <th className="p-3 text-center text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-10 text-slate-400 text-[13.5px]">No sales recorded yet</td>
                  </tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50/70 text-[13.5px] text-slate-700">
                      <td className="p-3 text-slate-400">{index + 1}</td>
                      <td className="p-3 font-medium text-slate-800">{sale.invoiceNo}</td>
                      <td className="p-3">{sale.buyer.name}</td>
                      <td className="p-3 text-slate-600">
                        {sale.items.length > 1 ? `${sale.items[0].itemName} +${sale.items.length - 1} more` : sale.itemName}
                      </td>
                      <td className="p-3 text-right tabular-nums">{sale.quantity.toLocaleString()}</td>
                      <td className="p-3 text-right tabular-nums">₹ {sale.amount.toLocaleString()}</td>
                      <td className="p-3 text-right tabular-nums">₹ {sale.gstAmount.toLocaleString()}</td>
                      <td className="p-3 text-right tabular-nums font-semibold text-emerald-700">₹ {sale.total.toLocaleString()}</td>
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
