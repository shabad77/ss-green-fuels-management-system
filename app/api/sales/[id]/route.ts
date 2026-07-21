import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const body = await request.json();
  const { id } = await params;

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
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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