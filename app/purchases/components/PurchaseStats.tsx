type Props = {
  totalPurchases: number;
  todayPurchases: number;
  todayQuantity: number;
  monthQuantity: number;
};

export default function PurchaseStats({
  totalPurchases,
  todayPurchases,
  todayQuantity,
  monthQuantity,
}: Props) {
  const cards = [
    {
      title: "Total Purchases",
      value: totalPurchases,
    },
    {
      title: "Today's Purchases",
      value: todayPurchases,
    },
    {
      title: "Today's Quantity",
      value: `${todayQuantity.toLocaleString()} Kg`,
    },
    {
      title: "This Month Qty",
      value: `${monthQuantity.toLocaleString()} Kg`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow border p-5"
        >
          <p className="text-gray-500 text-sm">
            {card.title}
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-700">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}