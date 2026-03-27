import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { extractCardWithOpenAI } from "@/lib/openai";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const settings = await prisma.userSettings.findUnique({ where: { userId } });

    if (!settings?.encryptedApiKey) {
      return NextResponse.json({ error: "No OpenAI API key configured." }, { status: 400 });
    }

    const formData = await request.formData();
    const image = formData.get("image");
    if (!(image instanceof File)) {
      return NextResponse.json({ error: "image file is required" }, { status: 400 });
    }

    if (image.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Image too large (max 10MB)." }, { status: 400 });
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString("base64");
    const extracted = await extractCardWithOpenAI(
      decryptSecret(settings.encryptedApiKey),
      imageBase64,
      image.type
    );

    return NextResponse.json({ extractedCard: extracted });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract card" },
      { status: 500 }
    );
  }
}