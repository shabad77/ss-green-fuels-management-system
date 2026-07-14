import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
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