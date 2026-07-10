import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        mobile: body.mobile,
        village: body.village,
        gst: body.gst || null,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save supplier" },
      { status: 500 }
    );
  }
}