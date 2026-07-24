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

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        buyer: true,
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

    const sale = await prisma.sale.create({
      data: {
        buyerId: Number(body.buyerId),

        invoiceNo: body.invoiceNo,

        invoiceDate: new Date(body.invoiceDate),

        vehicleNo: body.vehicleNo,

        ewayBillNo: body.ewayBillNo || null,

        shipToAddress: body.shipToAddress || null,

        itemName: body.itemName || null,

        hsnCode: body.hsnCode || null,

        unit: body.unit || null,

        quantity: Number(body.quantity),

        rate: Number(body.rate),

        amount: Number(body.amount),

        gstPercent: Number(body.gstPercent),

        gstAmount: Number(body.gstAmount),

        total: Number(body.total),
      },
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

        itemName: body.itemName || null,

        hsnCode: body.hsnCode || null,

        unit: body.unit || null,

        quantity: Number(body.quantity),
        rate: Number(body.rate),
        amount: Number(body.amount),
        gstPercent: Number(body.gstPercent),
        gstAmount: Number(body.gstAmount),
        total: Number(body.total),
      },
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