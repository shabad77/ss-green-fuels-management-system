import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // "Today" must always mean the IST calendar day, regardless of what
    // timezone the server process itself runs in — locally that's IST
    // (so this happened to work by accident), but Vercel's servers run
    // in UTC, where "midnight" is 5.5 hours behind real IST midnight.
    // Using getFullYear()/getMonth()/getDate() ties the boundary to the
    // server's own timezone; computing it via a fixed UTC+5:30 offset
    // makes it correct everywhere.
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(Date.now() + IST_OFFSET_MS);

    const startOfDay = new Date(
      Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()) - IST_OFFSET_MS
    );

    const endOfDay = new Date(
      Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + 1) - IST_OFFSET_MS
    );

    const [
      todayPurchases,
      todayQuantity,
      currentStock,
      todaySuppliers,
      recentPurchases,
      materialStock,
    ] = await Promise.all([

      prisma.purchase.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),

      prisma.purchase.aggregate({
        _sum: {
          quantity: true,
        },
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),

      prisma.purchase.aggregate({
        _sum: {
          quantity: true,
        },
      }),

      prisma.purchase.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        distinct: ["supplierId"],
        select: {
          supplierId: true,
        },
      }),

      prisma.purchase.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: {
          supplier: true,
          vehicle: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.purchase.groupBy({
  by: ["material"],
  _sum: {
    quantity: true,
  },
  orderBy: {
    _sum: {
      quantity: "desc",
    },
  },
})

    ]);

    return NextResponse.json({
      todayPurchases,
      todayQuantity: todayQuantity._sum.quantity ?? 0,
      currentStock: currentStock._sum.quantity ?? 0,
      todaySuppliers: todaySuppliers.length,
      recentPurchases,
      materialStock,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}