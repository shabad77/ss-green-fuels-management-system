import MainLayout from "../../components/layout/MainLayout";

export default function DashboardPage() {
  return (
    <MainLayout>
      <div>

        <h1 className="text-4xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome back, Shabad 👋
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500">Today's Purchase</h2>
            <p className="text-3xl font-bold text-green-700 mt-2">
              0.00 MT
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500">Today's Sales</h2>
            <p className="text-3xl font-bold text-blue-700 mt-2">
              0.00 MT
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500">Vehicles Today</h2>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              0
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500">Active Suppliers</h2>
            <p className="text-3xl font-bold text-purple-700 mt-2">
              0
            </p>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}