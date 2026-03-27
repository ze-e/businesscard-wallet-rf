import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCardInputSchema } from "@/lib/schemas";
import { toCardUpdateData } from "@/lib/db-card";

const UpdateCardSchema = z.object({
  card: CreateCardInputSchema
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id: cardId } = await context.params;

    const existing = await prisma.card.findFirst({
      where: { id: cardId, userId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = UpdateCardSchema.parse(body);

    const updated = await prisma.card.update({
      where: { id: cardId },
      data: toCardUpdateData(parsed.card),
      include: { phones: true, emails: true, websites: true }
    });

    return NextResponse.json({ card: updated, updated: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update card" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id: cardId } = await context.params;

    const existing = await prisma.card.findFirst({
      where: { id: cardId, userId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    await prisma.card.delete({ where: { id: cardId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete card" },
      { status: 400 }
    );
  }
}
