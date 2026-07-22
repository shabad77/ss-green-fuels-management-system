import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const buyers = await prisma.buyer.findMany({
      include: { sales: true },
      orderBy: { name: "asc" },
    });

    const rows = buyers.map((b) => ({
      "Name": b.name,
      "Mobile": b.mobile,
      "Address": b.address,
      "GST": b.gst || "",
      "Total Invoices": b.sales.length,
      "Total Quantity (Kg)": b.sales.reduce((sum, s) => sum + s.quantity, 0),
      "Total Business (₹)": b.sales.reduce((sum, s) => sum + s.total, 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 24 }, { wch: 14 }, { wch: 34 }, { wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Buyers");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Buyers-Report.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to generate report." }, { status: 500 });
  }
}
