import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

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
    purchases.map((purchase) => ({
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
  const actor = await getCurrentUser();

  // Middleware gates by URL path only, not HTTP method — an Accountant can
  // reach /api/purchases (they need GET for viewing/exporting), so writes
  // must be explicitly re-checked here or a read-only role could POST.
  if (!actor || (actor.role !== "ADMIN" && actor.role !== "OPERATOR")) {
    return NextResponse.json(
      { error: "You don't have permission to add purchases." },
      { status: 403 }
    );
  }

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