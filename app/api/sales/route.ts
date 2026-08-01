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

// Computes each item's amount/gstAmount/total server-side, plus the
// sale-level aggregates (sum across all items) — the single source of
// truth for these numbers, rather than trusting client-side math.
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

  // Legacy scalar fields on Sale (itemName/hsnCode/unit/rate/gstPercent)
  // don't have a single well-defined value once there's more than one
  // item — fall back to the first item's values, which keeps any
  // single-item sale (still the common case) looking exactly as before.
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

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        buyer: true,
        items: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required." },
        { status: 400 }
      );
    }

    const built = buildItemsAndAggregates(body.items);

    const sale = await prisma.sale.create({
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
          create: built.items,
        },
      },
      include: { items: true },
    });

    return NextResponse.json(sale);
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("invoiceNo")) {
      return NextResponse.json(
        { error: "This invoice number is already in use. Please use a different one." },
        { status: 409 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Unable to save sale. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required." },
        { status: 400 }
      );
    }

    const built = buildItemsAndAggregates(body.items);

    const sale = await prisma.sale.update({
      where: {
        id: Number(body.id),
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

        // Replace the whole item set on every edit — simplest correct
        // semantics for a form that resubmits the full item list.
        items: {
          deleteMany: {},
          create: built.items,
        },
      },
      include: { items: true },
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
