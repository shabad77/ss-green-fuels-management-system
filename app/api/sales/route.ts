import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

console.log(prisma);
console.log(prisma.sale);

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
  const body = await request.json();

  const sale = await prisma.sale.create({
    data: {
      buyerId: Number(body.buyerId),

      invoiceNo: body.invoiceNo,

      invoiceDate: new Date(body.invoiceDate),

      vehicleNo: body.vehicleNo,

      ewayBillNo: body.ewayBillNo || null,

      shipToAddress: body.shipToAddress || null,

      quantity: Number(body.quantity),

      rate: Number(body.rate),

      amount: Number(body.amount),

      gstPercent: Number(body.gstPercent),

      gstAmount: Number(body.gstAmount),

      total: Number(body.total),
    },
  });

  return NextResponse.json(sale);
}

export async function PUT(request: Request) {
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