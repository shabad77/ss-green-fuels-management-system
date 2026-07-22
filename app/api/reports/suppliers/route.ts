import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: { purchases: true },
      orderBy: { name: "asc" },
    });

    const rows = suppliers.map((s) => ({
      "Name": s.name,
      "Mobile": s.mobile,
      "Village": s.village,
      "GST": s.gst || "",
      "Total Deliveries": s.purchases.length,
      "Total Quantity (Kg)": s.purchases.reduce((sum, p) => sum + p.quantity, 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 24 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Suppliers-Report.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to generate report." }, { status: 500 });
  }
}
