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
    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex items-center justify-between mb-5">

        <h2 className="text-xl font-semibold text-gray-800">
          {title}
        </h2>

        {headerRight}

      </div>

      {children}

    </div>
  );
}