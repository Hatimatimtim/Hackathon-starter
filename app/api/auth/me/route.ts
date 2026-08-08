import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, clearSession } from "@/lib/userStore";

export async function GET() {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({ authenticated: true, user: session.user });
  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    clearSession();
    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.delete("kcai_auth_token");
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
