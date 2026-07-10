export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">

        <h1 className="text-3xl font-bold text-green-700">
          SS GREEN FUELS
        </h1>

        <p className="text-gray-600 mt-2">
          Management System
        </p>

        <div className="mt-10">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition">
            Login
          </button>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          Version 0.1
        </p>

      </div>
    </main>
  );
}