import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { isValidUserId } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/;

const RegisterSchema = z.object({
  userId: z.string().trim().min(3).max(100),
  password: z
    .string()
    .min(7)
    .max(200)
    .regex(
      PASSWORD_REGEX,
      "Password must be at least 7 characters and include uppercase, lowercase, number, and special character."
    )
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.parse(body);
    const userId = parsed.userId.toLowerCase();

    if (!isValidUserId(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    const newHash = hashPassword(parsed.password);

    if (existing?.passwordHash && !verifyPassword(parsed.password, existing.passwordHash)) {
      return NextResponse.json({ error: "User already exists. Use login." }, { status: 409 });
    }

    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, passwordHash: newHash },
      update: { passwordHash: newHash }
    });

    const token = createSessionToken(userId);
    const response = NextResponse.json({ success: true, userId });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register" },
      { status: 400 }
    );
  }
}