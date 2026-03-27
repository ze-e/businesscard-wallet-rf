import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { isValidUserId } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

const LoginSchema = z.object({
  userId: z.string().trim().min(3).max(100),
  password: z.string().min(8).max(200)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.parse(body);
    const userId = parsed.userId.toLowerCase();

    if (!isValidUserId(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash || !verifyPassword(parsed.password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid user ID or password" }, { status: 401 });
    }

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
      { error: error instanceof Error ? error.message : "Failed to login" },
      { status: 400 }
    );
  }
}