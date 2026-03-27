import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/export";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const format = (request.nextUrl.searchParams.get("format") || "csv").toLowerCase();
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
      include: { phones: true, emails: true, websites: true },
      orderBy: { createdAt: "desc" }
    });

    if (format === "json") {
      return NextResponse.json(cards, {
        headers: {
          "Content-Disposition": 'attachment; filename="business-cards.json"'
        }
      });
    }

    const csv = toCsv(cards);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="business-cards.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 401 }
    );
  }
}
