import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MergeCardSchema } from "@/lib/schemas";
import { toCardUpdateData } from "@/lib/db-card";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const parsed = MergeCardSchema.parse(body);

    const existing = await prisma.card.findFirst({
      where: { id: parsed.existingCardId, userId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const updated = await prisma.card.update({
      where: { id: parsed.existingCardId },
      data: toCardUpdateData(parsed.mergedCard),
      include: { phones: true, emails: true, websites: true }
    });

    return NextResponse.json({ card: updated, merged: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to merge card" },
      { status: 400 }
    );
  }
}