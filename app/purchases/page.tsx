"use client";

import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import PurchaseStats from "./components/PurchaseStats";
import toast from "react-hot-toast";
import SearchDropdown from "@/components/ui/SearchDropdown";

type Supplier = {
  id: number;
  name: string;
};

type Vehicle = {
  id: number;
  vehicleNumber: string;
};

type Purchase = {
  id: number;
  supplierName: string;
  vehicleNumber: string;
  material: string;
  quantity: number;
  createdAt: string;
};

export default function PurchasesPage() {
const [supplierId, setSupplierId] = useState<number | null>(null);
const [vehicleId, setVehicleId] = useState<number | null>(null);
const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
const [supplierSearch, setSupplierSearch] = useState("");
const [vehicleSearch, setVehicleSearch] = useState("");

const [material, setMaterial] = useState("");

const [quantity, setQuantity] = useState("");
const [selectedDate, setSelectedDate] = useState("");

const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [vehicles, setVehicles] = useState<Vehicle[]>([]);
const [purchases, setPurchases] = useState<Purchase[]>([]);

const [message, setMessage] = useState("");
const [editingId, setEditingId] = useState<number | null>(null);
const [search, setSearch] = useState("");

const [dateFilter, setDateFilter] = useState<
  "all" | "today" | "yesterday" | "month" | "custom"
>("all");

const qtyRef = useRef<HTMLInputElement>(null);
const vehicleRef = useRef<HTMLInputElement>(null);
const materialRef = useRef<HTMLInputElement>(null);
const saveButtonRef = useRef<HTMLButtonElement>(null);
const supplierRef = useRef<HTMLInputElement>(null);

const materials = [
  "Sawdust",
  "Eucalyptus",
  "Babool",
  "Siras",
  "Mahua",
  "Kanjadi",
  "Semal",
  "Neem",
  "Firewood",
];

useEffect(() => {
  loadSuppliers();
  loadVehicles();
  loadPurchases();
}, []);
const materialItems = materials.map((item) => ({
  id: item,
  name: item,
}));

async function loadSuppliers() {
  const res = await fetch("/api/suppliers");

  if (!res.ok) return;

  const data = await res.json();
  setSuppliers(data);
}

async function loadVehicles() {
  const res = await fetch("/api/vehicles");

  if (!res.ok) return;

  const data = await res.json();
  setVehicles(data);
}

async function loadPurchases() {
  const res = await fetch("/api/purchases");

  if (!res.ok) return;

  const data = await res.json();
  setPurchases(data);
}
const filteredSuppliers = suppliers.filter((supplier) =>
  supplier.name.toLowerCase().includes(supplierSearch.toLowerCase())
);

const filteredVehicles = vehicles.filter((vehicle) =>
  vehicle.vehicleNumber
    .toLowerCase()
    .includes(vehicleSearch.toLowerCase())
);
const today = new Date();

const todayPurchases = purchases.filter((purchase) => {
  const date = new Date(purchase.createdAt);
  

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
});

const todayQuantity = todayPurchases.reduce(
  (sum, purchase) => sum + purchase.quantity,
  0
);

const monthQuantity = purchases
  .filter((purchase) => {
    const date = new Date(purchase.createdAt);

    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  })
  .reduce((sum, purchase) => sum + purchase.quantity, 0);
function editPurchase(purchase: Purchase) {
  
  setEditingId(purchase.id);

  setSupplierSearch(purchase.supplierName);
  setVehicleSearch(purchase.vehicleNumber);

  setMaterial(purchase.material);
  setQuantity(String(purchase.quantity));

  const supplier = suppliers.find(
    (s) => s.name === purchase.supplierName
  );

  if (supplier) {
    setSupplierId(supplier.id);
  }

  const vehicle = vehicles.find(
    (v) => v.vehicleNumber === purchase.vehicleNumber
  );

  if (vehicle) {
    setVehicleId(vehicle.id);
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
function cancelEdit() {
  setEditingId(null);

  setSupplierId(null);
  setVehicleId(null);

  setSupplierSearch("");
  setVehicleSearch("");
  setMaterial("");
  setQuantity("");

  setTimeout(() => {
    supplierRef.current?.focus();
  }, 100);
}

async function deletePurchase(id: number) {
  if (!confirm("Delete this purchase?")) return;

  await fetch(`/api/purchases/${id}`, {
    method: "DELETE",
  });

  loadPurchases();
}
async function savePurchase() {
  if (!supplierId) {
     toast.error("Please select a supplier.");
    return;
  }

  if (!vehicleId) {
     toast.error("Please select a vehicle.");
    return;
  }

  if (!material) {
  toast.error("Please select a raw material");
  return;
}

  if (!quantity) {
     toast.error("Please enter quantity.");
    qtyRef.current?.focus();
    return;
  }

 const res = await fetch(
  editingId
    ? `/api/purchases/${editingId}`
    : "/api/purchases",
  {
    method: editingId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      supplierId,
      vehicleId,
      material,
      quantity,
    }),
  }
);
 
  if (!res.ok) {
     toast.error("Failed to save purchase.");
    return;
  }

  await loadPurchases();
  toast.success(
  editingId
    ? "Purchase updated successfully"
    : "Purchase saved successfully"
);

  setSupplierId(null);
setVehicleId(null);

setSupplierSearch("");
setVehicleSearch("");

setMaterial("");
setQuantity("");

setEditingId(null);
setTimeout(() => {
  const input = document.querySelector(
    'input[placeholder="Search Supplier"]'
  ) as HTMLInputElement | null;

  input?.focus();
}, 100);

qtyRef.current?.focus();
}
const filteredPurchases = purchases.filter((purchase) => {
  const keyword = search.toLowerCase();

  const matchesSearch =
    purchase.supplierName.toLowerCase().includes(keyword) ||
    purchase.vehicleNumber.toLowerCase().includes(keyword) ||
    purchase.material.toLowerCase().includes(keyword) ||
    purchase.quantity.toString().includes(keyword);

  const purchaseDate = new Date(purchase.createdAt);

const purchaseDateString =
  purchaseDate.getFullYear() +
  "-" +
  String(purchaseDate.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(purchaseDate.getDate()).padStart(2, "0");

const today = new Date();

const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

let matchesDate = true;

if (dateFilter === "today") {
  matchesDate =
    purchaseDateString ===
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

else if (dateFilter === "yesterday") {
  matchesDate =
    purchaseDateString ===
    `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
}

else if (dateFilter === "month") {
  matchesDate =
    purchaseDate.getMonth() === today.getMonth() &&
    purchaseDate.getFullYear() === today.getFullYear();
}

else if (dateFilter === "custom") {
  matchesDate =
    !selectedDate || purchaseDateString === selectedDate;
}
  return matchesSearch && matchesDate;
});
return (
  <MainLayout>

<h1 className="text-4xl font-bold mb-6">
  Purchase Entry
</h1>

<PurchaseStats
  totalPurchases={purchases.length}
  todayPurchases={todayPurchases.length}
  todayQuantity={todayQuantity}
  monthQuantity={monthQuantity}
/>

<Card title="Add Purchase">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

  <div className="relative">

  <SearchDropdown
  ref={supplierRef}
  label="Supplier *"
  placeholder="Search Supplier"
  items={suppliers}
  value={supplierSearch}
  onChange={setSupplierSearch}
  getLabel={(supplier) => supplier.name}
  nextRef={vehicleRef}
  onSelect={(supplier) => {
    setSupplierSearch(supplier.name);
    setSupplierId(supplier.id);
  }}
/>

  {showSupplierDropdown && supplierSearch.length > 0 && (
    <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">

      {filteredSuppliers.length === 0 ? (

        <div className="px-4 py-2 text-gray-500">
          No supplier found
        </div>

      ) : (

        filteredSuppliers.map((supplier) => (

          <div
            key={supplier.id}
            className="px-4 py-2 cursor-pointer hover:bg-green-100"
            onClick={() => {
  setSupplierSearch(supplier.name);
  setSupplierId(supplier.id);
  setShowSupplierDropdown(false);
  vehicleRef.current?.focus();
  setTimeout(() => {
    setSupplierSearch(supplier.name);
  }, 50);
}}
          >
            {supplier.name}
          </div>

        ))

      )}

    </div>
  )}

</div>

  <SearchDropdown
  ref={vehicleRef}
  label="Vehicle Number *"
  placeholder="Search Vehicle"
  items={vehicles}
  value={vehicleSearch}
  onChange={(value) => setVehicleSearch(value.toUpperCase())}
  getLabel={(vehicle) => vehicle.vehicleNumber}
  nextRef={materialRef}
  onSelect={(vehicle) => {
    setVehicleSearch(vehicle.vehicleNumber);
    setVehicleId(vehicle.id);
  }}
/>

  <SearchDropdown
  ref={materialRef}
  label="Raw Material *"
  placeholder="Search Material"
  items={materialItems}
  value={material}
  onChange={setMaterial}
  getLabel={(item) => item.name}
  nextRef={qtyRef}
  onSelect={(item) => {
    setMaterial(item.name);
  }}
/>

  <TextInput
    ref={qtyRef}
    label="Net Quantity (Kg) *"
    placeholder="18000"
    value={quantity}
    onChange={setQuantity}
    onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    savePurchase();
  }
}}
  />

</div>

<div className="mt-6">
  <div className="flex gap-3">

  <Button onClick={savePurchase}>
    {editingId ? "Update Purchase" : "Save Purchase"}
  </Button>

  {editingId && (
    <Button
      variant="secondary"
      onClick={cancelEdit}
    >
      Cancel
    </Button>
  )}

</div>
</div>
</Card>
<div className="mt-8">
  <div className="mb-4">
  <div className="mb-5 flex items-end gap-3">

  <div className="flex-1">
    <TextInput
      placeholder="Search Supplier / Vehicle / Material / Quantity..."
      value={search}
      onChange={setSearch}
    />
  </div>

  <div className="flex gap-2 flex-wrap">

  <button
  

  onClick={() => setDateFilter("all")}

  className={`rounded-lg px-4 py-2 ${

    dateFilter === "all"

      ? "bg-green-600 text-white"

      : "bg-gray-200 hover:bg-gray-300"

  }`}

>

  All

</button>

  <button
  onClick={() => setDateFilter("today")}
  className={`rounded-lg px-4 py-2 ${
    dateFilter === "today"
      ? "bg-green-600 text-white"
      : "bg-gray-200 hover:bg-gray-300"
  }`}
>
  Today
</button>

  <button

  onClick={() => setDateFilter("yesterday")}

  className={`rounded-lg px-4 py-2 ${

    dateFilter === "yesterday"

      ? "bg-green-600 text-white"

      : "bg-gray-200 hover:bg-gray-300"

  }`}

>

  Yesterday

</button>

  <button

  onClick={() => setDateFilter("month")}

  className={`rounded-lg px-4 py-2 ${

    dateFilter === "month"

      ? "bg-green-600 text-white"

      : "bg-gray-200 hover:bg-gray-300"

  }`}

>

  This Month

</button>

  <button

  onClick={() => setDateFilter("custom")}

  className={`rounded-lg px-4 py-2 ${

    dateFilter === "custom"

      ? "bg-green-600 text-white"

      : "bg-gray-200 hover:bg-gray-300"

  }`}

>

  Custom Date

</button>

</div>

  {dateFilter === "custom" && (
  <div>
    <label className="block mb-2 text-sm font-medium">
      Date
    </label>

    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:ring-2 focus:ring-green-500 outline-none"
    />
  </div>
)}


</div>
</div>
  <Card title="Purchase List">

    <table className="w-full">

      <thead>
  <tr className="bg-green-700 text-white">
    <th className="p-3 text-center">#</th>
    <th className="p-3 text-center">Supplier</th>
    <th className="p-3 text-center">Vehicle</th>
    <th className="p-3 text-center">Material</th>
    <th className="p-3 text-center">Qty (Kg)</th>
    <th className="p-3 text-center">Time</th>
    <th className="p-3 text-center">Action</th>
  </tr>
</thead>

      <tbody>

        {filteredPurchases.length === 0 ? (

          <tr>
            <td colSpan={7} className="text-center p-8 text-gray-500">
              No Purchase Found
            </td>
            <td className="p-3 text-center">
  <div className="flex justify-center gap-2">

    <button className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200">
      ✏️
    </button>

    <button className="px-2 py-1 rounded bg-red-100 hover:bg-red-200">
      🗑️
    </button>

  </div>
</td>
          </tr>

        ) : (

          filteredPurchases.map((purchase, index) => (

            <tr
              key={purchase.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="p-3">{index + 1}</td>

              <td className="text-center p-3">
                {purchase.supplierName}
              </td>

              <td className="text-center p-3">
                {purchase.vehicleNumber}
              </td>

              <td className="text-center p-3">
                {purchase.material}
              </td>

              <td className="text-center p-3">
                {purchase.quantity}
              </td>

              <td className="p-3 text-center">
  {new Date(purchase.createdAt).toLocaleString()}
</td>

<td className="p-3 text-center">
  <div className="flex justify-center gap-2">

    <button
  className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
  onClick={() => editPurchase(purchase)}
>
  ✏️
</button>

    <button
  className="px-2 py-1 rounded bg-red-100 hover:bg-red-200"
  onClick={() => deletePurchase(purchase.id)}
>
  🗑️
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
