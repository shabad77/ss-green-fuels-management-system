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
      include: { buyer: true, items: true },
      orderBy: { invoiceDate: "asc" },
    });

    // One row per item — a multi-item sale produces multiple report
    // rows, one per line item, rather than a single confusing aggregate
    // row. Older sales with no items rows fall back to a single row
    // built from the legacy scalar fields on Sale itself.
    const rows = sales.flatMap((s) => {
      const lineItems =
        s.items.length > 0
          ? s.items
          : [
              {
                itemName: s.itemName ?? "Item",
                hsnCode: s.hsnCode,
                quantity: s.quantity,
                rate: s.rate,
                amount: s.amount,
                gstPercent: s.gstPercent,
                gstAmount: s.gstAmount,
                total: s.total,
              },
            ];

      return lineItems.map((item) => ({
        "Invoice No": s.invoiceNo,
        "Date": s.invoiceDate.toLocaleDateString("en-GB"),
        "Buyer": s.buyer.name,
        "Item": item.itemName,
        "HSN": item.hsnCode || "",
        "Qty": item.quantity,
        "Rate": item.rate,
        "Taxable Amount": item.amount,
        "GST %": item.gstPercent,
        "GST Amount": item.gstAmount,
        "Total": item.total,
      }));
    });

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
