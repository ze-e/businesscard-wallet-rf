import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiKeySchema } from "@/lib/schemas";
import { encryptSecret } from "@/lib/crypto";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    return NextResponse.json({ hasApiKey: !!settings?.encryptedApiKey });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get settings" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const parsed = ApiKeySchema.parse(body);

    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {}
    });

    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        encryptedApiKey: encryptSecret(parsed.apiKey)
      },
      update: {
        encryptedApiKey: encryptSecret(parsed.apiKey)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to store API key" },
      { status: 400 }
    );
  }
}