import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const buyer = await prisma.buyer.update({
    where: {
      id: Number(id),
    },
    data: {
      name: body.name,
      mobile: body.mobile,
      address: body.address,
      gst: body.gst || null,
    },
  });

  return NextResponse.json(buyer);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.buyer.delete({
    where: {
      id: Number(id),
    },
  });

  return NextResponse.json({
    success: true,
  });
}