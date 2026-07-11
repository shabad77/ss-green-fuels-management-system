import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const purchase = await prisma.purchase.update({
    where: {
      id: Number(id),
    },
    data: {
      supplierId: body.supplierId,
      vehicleId: body.vehicleId,
      material: body.material,
      quantity: Number(body.quantity),
    },
  });

  return NextResponse.json(purchase);
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  const { id } = await params;

  await prisma.purchase.delete({
    where: {
      id: Number(id),
    },
  });

  return NextResponse.json({
    success: true,
  });
}