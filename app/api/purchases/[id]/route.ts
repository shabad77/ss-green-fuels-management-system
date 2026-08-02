import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const OPERATOR_EDIT_WINDOW_MS = 3 * 60 * 1000; // 3 minutes

async function checkWriteAccess(id: number) {
  const actor = await getCurrentUser();

  if (!actor) {
    return { ok: false as const, response: NextResponse.json({ error: "Not logged in." }, { status: 401 }) };
  }

  if (actor.role === "ACCOUNTANT") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Accountants have view-only access to purchases." },
        { status: 403 }
      ),
    };
  }

  if (actor.role === "OPERATOR") {
    const purchase = await prisma.purchase.findUnique({ where: { id } });

    if (!purchase) {
      return { ok: false as const, response: NextResponse.json({ error: "Purchase not found." }, { status: 404 }) };
    }

    const ageMs = Date.now() - purchase.createdAt.getTime();

    if (ageMs > OPERATOR_EDIT_WINDOW_MS) {
      const windowMinutes = OPERATOR_EDIT_WINDOW_MS / 60000;
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: `This purchase can no longer be edited — the ${windowMinutes}-minute edit window has passed. Contact an Admin for changes.` },
          { status: 403 }
        ),
      };
    }
  }

  // ADMIN always allowed; OPERATOR allowed within the window.
  return { ok: true as const };
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const purchaseId = Number(id);

  const access = await checkWriteAccess(purchaseId);
  if (!access.ok) return access.response;

  const body = await request.json();

  const purchase = await prisma.purchase.update({
    where: {
      id: purchaseId,
    },
    data: {
      supplierId: body.supplierId,
      vehicleId: body.vehicleId,
      material: body.material,
      quantity: Number(body.quantity),
    },
  });

  return NextResponse.json(purchase);
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  const { id } = await params;
  const purchaseId = Number(id);

  const access = await checkWriteAccess(purchaseId);
  if (!access.ok) return access.response;

  await prisma.purchase.delete({
    where: {
      id: purchaseId,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
