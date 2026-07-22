import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPeriodRange, PeriodType } from "@/lib/reportDates";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = (searchParams.get("type") || "monthly") as PeriodType;
    const year = Number(searchParams.get("year")) || new Date().getFullYear();
    const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;
    const quarter = searchParams.get("quarter") ? Number(searchParams.get("quarter")) : undefined;

    const { start, end, label } = getPeriodRange(type, year, month, quarter);

    const purchases = await prisma.purchase.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      include: { supplier: true, vehicle: true },
      orderBy: { createdAt: "asc" },
    });

    const rows = purchases.map((p) => ({
      "Date": p.createdAt.toLocaleDateString("en-GB"),
      "Time": p.createdAt.toLocaleTimeString("en-GB"),
      "Supplier": p.supplier.name,
      "Vehicle": p.vehicle.vehicleNumber,
      "Material": p.material,
      "Quantity (Kg)": p.quantity,
    }));

    const totalsRow = {
      "Date": "",
      "Time": "",
      "Supplier": "",
      "Vehicle": "",
      "Material": "TOTAL",
      "Quantity (Kg)": purchases.reduce((sum, p) => sum + p.quantity, 0),
    };

    const worksheet = XLSX.utils.json_to_sheet(rows.length ? [...rows, totalsRow] : []);
    worksheet["!cols"] = [
      { wch: 12 }, { wch: 10 }, { wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `Purchases-Report-${label.replace(/\s+/g, "-")}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to generate report." }, { status: 500 });
  }
}
