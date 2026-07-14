type CardProps = {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
};

export default function Card({
  title,
  children,
  headerRight,
}: CardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">

        <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
          {title}
        </h2>

        {headerRight}

      </div>

      <div className="p-6">
        {children}
      </div>

    </div>
  );
}
