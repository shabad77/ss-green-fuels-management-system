import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const buyers = await prisma.buyer.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(buyers);
}

export async function POST(request: Request) {
  const body = await request.json();

  const buyer = await prisma.buyer.create({
    data: {
      name: body.name,
      mobile: body.mobile,
      address: body.address,
      gst: body.gst || null,
    },
  });

  return NextResponse.json(buyer);
}
