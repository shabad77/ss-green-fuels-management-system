"use client";

import { useEffect, useState } from "react";

import MainLayout from "../../components/layout/MainLayout";

export default function DashboardPage() {const [stats, setStats] = useState({
  todayPurchases: 0,
  todayQuantity: 0,
  currentStock: 0,
  todaySuppliers: 0,
  recentPurchases: [],
  materialStock: [],
});

useEffect(() => {
  loadDashboard();
}, []);

async function loadDashboard() {
  const res = await fetch("/api/dashboard");

  const data = await res.json();

  setStats(data);
}

function kgToMT(kg: number) {
  return (kg / 1000).toFixed(2);
}
  return (
    
    <MainLayout>
      
      <div>

        <h1 className="text-4xl font-bold text-gray-800">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

  <div className="bg-white rounded-xl shadow border p-6">
    <p className="text-gray-500 text-sm">
      Today's Purchases
    </p>

    <h2 className="text-4xl font-bold text-green-700 mt-2">
      {stats.todayPurchases}
    </h2>

    <p className="text-sm text-gray-400 mt-1">
      Purchase Entries
    </p>
  </div>

  <div className="bg-white rounded-xl shadow border p-6">
    <p className="text-gray-500 text-sm">
      Today's Quantity
    </p>

    <h2 className="text-4xl font-bold text-green-700 mt-2">
      {kgToMT(stats.todayQuantity)} MT
    </h2>

    <p className="text-sm text-gray-400 mt-1">
      Total Purchased Today
    </p>
  </div>

  <div className="bg-white rounded-xl shadow border p-6">
    <p className="text-gray-500 text-sm">
      Current Stock
    </p>

    <h2 className="text-4xl font-bold text-blue-700 mt-2">
      {kgToMT(stats.currentStock)} MT
    </h2>

    <p className="text-sm text-gray-400 mt-1">
      Available Stock
    </p>
  </div>

  <div className="bg-white rounded-xl shadow border p-6">
    <p className="text-gray-500 text-sm">
      Today's Suppliers
    </p>

    <h2 className="text-4xl font-bold text-purple-700 mt-2">
      {stats.todaySuppliers}
    </h2>

    <p className="text-sm text-gray-400 mt-1">
      Suppliers Delivered
    </p>
  </div>

 </div>

 <div className="bg-white rounded-xl shadow border mt-8 w-full">

  <div className="border-b px-6 py-4">
    <h2 className="text-xl font-semibold">
      Today's Deliveries
    </h2>
  </div>

  <div className="overflow-x-auto w-full">

    <table className="min-w-full table-auto">

      <thead className="bg-gray-50">

        <tr>

          <th className="px-5 py-3 text-left">Time</th>

          <th className="px-5 py-3 text-left">Supplier</th>

          <th className="px-5 py-3 text-left">Vehicle</th>

          <th className="px-5 py-3 text-left">Material</th>

          <th className="px-5 py-3 text-right">Quantity (kg)</th>

        </tr>

      </thead>

      <tbody>

        {stats.recentPurchases.map((purchase: any) => (

          <tr
            key={purchase.id}
            className="border-t hover:bg-gray-50"
          >

            <td className="px-5 py-3">
              {new Date(purchase.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>

            <td className="px-5 py-3">
              {purchase.supplier.name}
            </td>

            <td className="px-5 py-3">
              {purchase.vehicle.vehicleNumber}
            </td>

            <td className="px-5 py-3">
              {purchase.material}
            </td>

            <td className="px-5 py-3 text-right font-semibold">
              {purchase.quantity.toLocaleString()} Kg
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>

      </div>
      <div className="bg-white rounded-xl shadow border mt-8">

  <div className="border-b px-6 py-4">
    <h2 className="text-xl font-semibold">
      Current Raw Material Stock
    </h2>
  </div>

  <table className="w-full">

    <thead className="bg-gray-50">

      <tr>

        <th className="px-6 py-3 text-left">
          Material
        </th>

        <th className="px-6 py-3 text-right">
          Stock (Kg)
        </th>

      </tr>

    </thead>

    <tbody>

      {stats.materialStock.map((item: any) => (

        <tr
          key={item.material}
          className="border-t"
        >

          <td className="px-6 py-3">
            {item.material}
          </td>

          <td className="px-6 py-3 text-right font-semibold">
            {item._sum.quantity?.toLocaleString()} Kg
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>
    </MainLayout>
  );
}