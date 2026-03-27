import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SaveCardSchema } from "@/lib/schemas";
import { findDuplicateCandidate } from "@/lib/duplicate";
import { toCardCreateData } from "@/lib/db-card";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const query = request.nextUrl.searchParams.get("query")?.trim();

    const cards = await prisma.card.findMany({
      where: {
        userId,
        OR: query
          ? [
              { name: { contains: query, mode: "insensitive" } },
              { company: { contains: query, mode: "insensitive" } },
              { phones: { some: { value: { contains: query } } } },
              { emails: { some: { value: { contains: query, mode: "insensitive" } } } },
              { websites: { some: { value: { contains: query, mode: "insensitive" } } } }
            ]
          : undefined
      },
      include: {
        phones: true,
        emails: true,
        websites: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ cards });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch cards" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const parsed = SaveCardSchema.parse(body);

    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {}
    });

    const existingCards = await prisma.card.findMany({
      where: { userId },
      include: { phones: true, emails: true, websites: true }
    });

    const duplicate = findDuplicateCandidate(existingCards, parsed.card);
    if (duplicate && !parsed.saveAsNew) {
      return NextResponse.json(
        {
          duplicate: true,
          existingCard: duplicate,
          extractedCard: parsed.card,
          message: "Potential duplicate found. Merge or save as new."
        },
        { status: 409 }
      );
    }

    const created = await prisma.card.create({
      data: toCardCreateData(userId, parsed.card),
      include: { phones: true, emails: true, websites: true }
    });

    return NextResponse.json({ duplicate: false, card: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save card" },
      { status: 400 }
    );
  }
}
