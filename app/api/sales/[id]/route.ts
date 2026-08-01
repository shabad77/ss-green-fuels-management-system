import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const actor = await getCurrentUser();

  if (!actor || actor.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Accountants have view-only access to sales." },
      { status: 403 }
    );
  }

  return null;
}

type ItemInput = {
  itemName: string;
  hsnCode?: string | null;
  unit?: string | null;
  quantity: number | string;
  rate: number | string;
  gstPercent: number | string;
};

function buildItemsAndAggregates(rawItems: ItemInput[]) {
  const items = rawItems.map((item) => {
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    const gstPercent = Number(item.gstPercent);
    const amount = quantity * rate;
    const gstAmount = (amount * gstPercent) / 100;
    const total = amount + gstAmount;

    return {
      itemName: item.itemName,
      hsnCode: item.hsnCode || null,
      unit: item.unit || null,
      quantity,
      rate,
      amount,
      gstPercent,
      gstAmount,
      total,
    };
  });

  const aggregate = items.reduce(
    (acc, item) => ({
      quantity: acc.quantity + item.quantity,
      amount: acc.amount + item.amount,
      gstAmount: acc.gstAmount + item.gstAmount,
      total: acc.total + item.total,
    }),
    { quantity: 0, amount: 0, gstAmount: 0, total: 0 }
  );

  const first = items[0];
  const itemNameLabel =
    items.length > 1 ? `${first.itemName} +${items.length - 1} more` : first.itemName;

  return {
    items,
    itemName: itemNameLabel,
    hsnCode: first.hsnCode,
    unit: first.unit,
    rate: items.length === 1 ? first.rate : 0,
    gstPercent: items.length === 1 ? first.gstPercent : 0,
    ...aggregate,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      buyer: true,
      items: true,
    },
  });

  if (!sale) {
    return NextResponse.json(
      { error: "Sale not found" },
      { status: 404 }
    );
  }

  const company = await prisma.company.findFirst();

  return NextResponse.json({
    sale,
    company,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { id } = await params;

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "At least one item is required." },
      { status: 400 }
    );
  }

  const built = buildItemsAndAggregates(body.items);

  const sale = await prisma.sale.update({
    where: {
      id: Number(id),
    },
    data: {
      buyerId: Number(body.buyerId),
      invoiceNo: body.invoiceNo,
      invoiceDate: new Date(body.invoiceDate),
      vehicleNo: body.vehicleNo,
      ewayBillNo: body.ewayBillNo || null,
      shipToAddress: body.shipToAddress || null,

      itemName: built.itemName,
      hsnCode: built.hsnCode,
      unit: built.unit,
      quantity: built.quantity,
      rate: built.rate,
      amount: built.amount,
      gstPercent: built.gstPercent,
      gstAmount: built.gstAmount,
      total: built.total,

      items: {
        deleteMany: {},
        create: built.items,
      },
    },
    include: { items: true },
  });

  return NextResponse.json(sale);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  await prisma.sale.delete({
    where: {
      id: Number(id),
    },
  });

  return NextResponse.json({
    success: true,
  });
}
