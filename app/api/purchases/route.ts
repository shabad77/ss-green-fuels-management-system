import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type PurchaseWithRelations = {
  id: number;
  material: string;
  quantity: number;
  createdAt: Date;
  supplier: {
    name: string;
  };
  vehicle: {
    vehicleNumber: string;
  };
};

export async function GET() {
  const purchases = await prisma.purchase.findMany({
    include: {
      supplier: true,
      vehicle: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(
    purchases.map((purchase: PurchaseWithRelations) => ({
      id: purchase.id,
      supplierName: purchase.supplier.name,
      vehicleNumber: purchase.vehicle.vehicleNumber,
      material: purchase.material,
      quantity: purchase.quantity,
      createdAt: purchase.createdAt,
    }))
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  const purchase = await prisma.purchase.create({
    data: {
      supplierId: body.supplierId,
      vehicleId: body.vehicleId,
      material: body.material,
      quantity: Number(body.quantity),
    },
  });

  return NextResponse.json(purchase);
}
