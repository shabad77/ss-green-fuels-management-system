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

    const sales = await prisma.sale.findMany({
      where: {
        invoiceDate: {
          gte: start,
          lt: end,
        },
      },
      include: { buyer: true },
      orderBy: { invoiceDate: "asc" },
    });

    const rows = sales.map((s) => ({
      "Invoice No": s.invoiceNo,
      "Date": s.invoiceDate.toLocaleDateString("en-GB"),
      "Buyer": s.buyer.name,
      "Qty": s.quantity,
      "Rate": s.rate,
      "Taxable Amount": s.amount,
      "GST %": s.gstPercent,
      "GST Amount": s.gstAmount,
      "Total": s.total,
    }));

    const totalsRow = {
      "Invoice No": "",
      "Date": "",
      "Buyer": "",
      "Item": "",
      "HSN": "TOTAL",
      "Qty": sales.reduce((sum, s) => sum + s.quantity, 0),
      "Rate": "",
      "Taxable Amount": sales.reduce((sum, s) => sum + s.amount, 0),
      "GST %": "",
      "GST Amount": sales.reduce((sum, s) => sum + s.gstAmount, 0),
      "Total": sales.reduce((sum, s) => sum + s.total, 0),
    };

    const worksheet = XLSX.utils.json_to_sheet(rows.length ? [...rows, totalsRow] : []);
    worksheet["!cols"] = [
      { wch: 16 }, { wch: 12 }, { wch: 24 }, { wch: 20 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 12 }, { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `Sales-Report-${label.replace(/\s+/g, "-")}.xlsx`;

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
