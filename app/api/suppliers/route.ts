import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(suppliers);
}

export async function POST(request: Request) {
  const body = await request.json();

  const existingSupplier = await prisma.supplier.findFirst({
    where: {
      mobile: body.mobile,
    },
  });

  if (existingSupplier) {
    return NextResponse.json(
      {
        error: `Mobile number already belongs to "${existingSupplier.name}".`,
      },
      { status: 400 }
    );
  }

  const supplier = await prisma.supplier.create({
    data: {
      name: body.name,
      mobile: body.mobile,
      village: body.village,
      gst: body.gst || null,
    },
  });

  return NextResponse.json(supplier);
}

export async function PUT(request: Request) {
  const body = await request.json();

  const existingSupplier = await prisma.supplier.findFirst({
    where: {
      mobile: body.mobile,
      NOT: {
        id: body.id,
      },
    },
  });

  if (existingSupplier) {
    return NextResponse.json(
      {
        error: `Mobile number already belongs to "${existingSupplier.name}".`,
      },
      { status: 400 }
    );
  }

  const supplier = await prisma.supplier.update({
    where: {
      id: body.id,
    },
    data: {
      name: body.name,
      mobile: body.mobile,
      village: body.village,
      gst: body.gst || null,
    },
  });

  return NextResponse.json(supplier);
}

export async function DELETE(request: Request) {
  const body = await request.json();

  await prisma.supplier.delete({
    where: {
      id: body.id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}