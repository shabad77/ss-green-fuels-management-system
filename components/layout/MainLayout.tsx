import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex">

      <Sidebar />

      <main className="flex-1 bg-slate-50 min-h-screen p-8 text-slate-800">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>

    </div>
  );
}