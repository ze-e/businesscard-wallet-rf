import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    return NextResponse.json({ authenticated: true, userId });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}