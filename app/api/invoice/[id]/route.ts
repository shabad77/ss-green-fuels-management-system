import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
   const sale = await prisma.sale.findUnique({
  where: {
    id: Number(id),
  },
  include: {
    buyer: true,
    items: true,
  },
});

    const company = await prisma.company.findFirst();

    if (!sale) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
  sale,
  company,
});

  } catch (error) {
  console.error(error);

  return NextResponse.json(
    { error: String(error) },
    { status: 500 }
  );
}
}
