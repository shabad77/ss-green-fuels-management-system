import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET Company Settings
export async function GET() {
  try {
    let company = await prisma.company.findUnique({
      where: { id: 1 },
    });

    // Create default company if not exists
    if (!company) {
      company = await prisma.company.create({
        data: {
          id: 1,
          companyName: "SS GREEN FUELS",
          gstNumber: "08NMUPS9313F1Z3",
          address: "Kh. No. 3516,3522 Garhi Parsoliya Road",
          city: "Garhi",
          state: "Rajasthan",
          pincode: "327022",
        },
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

// Update Company Settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const company = await prisma.company.update({
      where: { id: 1 },
      data: body,
    });

    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}