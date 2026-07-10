import Link from "next/link";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-10">

        <h1 className="text-3xl font-bold text-green-700 text-center">
          SS Green Fuels
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Management System
        </p>

        <div className="space-y-4">

          <Input placeholder="Username" />

          <Input
            type="password"
            placeholder="Password"
          />

          <Link href="/dashboard">
            <Button>
              Login
            </Button>
          </Link>

        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          SS Green Fuels © 2026
          <br />
          Version 0.2
        </p>

      </div>
    </main>
  );
}