import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  const body = await request.json();

  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      vehicleNumber: body.vehicleNumber,
    },
  });

  if (existingVehicle) {
    return NextResponse.json(
      {
        error: `Vehicle number "${existingVehicle.vehicleNumber}" already exists.`,
      },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.create({
  data: {
    vehicleNumber: body.vehicleNumber,
    ownerName: body.ownerName,
    vehicleType: body.vehicleType ?? "",
    status: body.status ?? "Active",
  },
});

  return NextResponse.json(vehicle);
}

export async function PUT(request: Request) {
  const body = await request.json();

  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      vehicleNumber: body.vehicleNumber,
      NOT: {
        id: body.id,
      },
    },
  });

  if (existingVehicle) {
    return NextResponse.json(
      {
        error: `Vehicle number "${existingVehicle.vehicleNumber}" already exists.`,
      },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.update({
  where: {
    id: body.id,
  },
  data: {
    vehicleNumber: body.vehicleNumber,
    ownerName: body.ownerName,
    vehicleType: body.vehicleType ?? "",
    status: body.status ?? "Active",
  },
});

  return NextResponse.json(vehicle);
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    await prisma.vehicle.delete({
      where: {
        id: body.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}